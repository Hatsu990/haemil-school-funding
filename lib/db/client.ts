import { createClient } from "@libsql/client";

export type DbValue = string | number | boolean | null;

export type DbArgs = DbValue[] | Record<string, DbValue>;

export interface DbQueryResult<
  TRow extends object = Record<string, unknown>,
> {
  rows: TRow[];
  rowsAffected: number;
  lastInsertRowid: string | number | null;
}

export interface DbClient {
  execute<TRow extends object = Record<string, unknown>>(
    sql: string,
    args?: DbArgs,
  ): Promise<DbQueryResult<TRow>>;
  transaction<TResult>(
    callback: (tx: DbTransaction) => Promise<TResult>,
  ): Promise<TResult>;
}

export interface DbTransaction {
  execute<TRow extends object = Record<string, unknown>>(
    sql: string,
    args?: DbArgs,
  ): Promise<DbQueryResult<TRow>>;
}

export interface TursoConfig {
  url: string;
  authToken: string;
}

let cachedClient: DbClient | null = null;

export function getTursoConfig(): TursoConfig | null {
  const url = process.env.TURSO_DATABASE_URL?.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (!url || !authToken) {
    return null;
  }

  return { url, authToken };
}

export function isTursoConfigured(): boolean {
  return getTursoConfig() !== null;
}

function normalizeArgValue(value: DbValue): DbValue {
  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  return value;
}

function normalizeArgs(args?: DbArgs): DbArgs | undefined {
  if (!args) {
    return undefined;
  }

  if (Array.isArray(args)) {
    return args.map((value) => normalizeArgValue(value));
  }

  const normalized: Record<string, DbValue> = {};
  for (const [key, value] of Object.entries(args)) {
    normalized[key] = normalizeArgValue(value);
  }
  return normalized;
}

function normalizeLastInsertRowid(
  value: string | number | bigint | null | undefined,
): string | number | null {
  if (typeof value === "bigint") {
    return Number(value);
  }

  return value ?? null;
}

function assertConfigured(config: TursoConfig | null): TursoConfig {
  if (!config) {
    const missing: string[] = [];
    if (!process.env.TURSO_DATABASE_URL?.trim()) {
      missing.push("TURSO_DATABASE_URL");
    }
    if (!process.env.TURSO_AUTH_TOKEN?.trim()) {
      missing.push("TURSO_AUTH_TOKEN");
    }

    throw new Error(
      `[DB] Turso configuration is missing. Set ${missing.join(" and ")} in your environment.`,
    );
  }
  return config;
}

export async function getDbClient(): Promise<DbClient> {
  if (cachedClient) {
    return cachedClient;
  }

  const config = assertConfigured(getTursoConfig());
  const rawClient = createClient({
    url: config.url,
    authToken: config.authToken,
  });

  cachedClient = {
    async execute<TRow extends object>(
      sql: string,
      args?: DbArgs,
    ): Promise<DbQueryResult<TRow>> {
      const result = await rawClient.execute({
        sql,
        args: normalizeArgs(args),
      });

      return {
        rows: (result.rows ?? []) as unknown as TRow[],
        rowsAffected: result.rowsAffected ?? 0,
        lastInsertRowid: normalizeLastInsertRowid(result.lastInsertRowid),
      };
    },
    async transaction<TResult>(
      callback: (tx: DbTransaction) => Promise<TResult>,
    ): Promise<TResult> {
      const rawTransaction = await rawClient.transaction("write");
      const tx: DbTransaction = {
        async execute<TRow extends object>(
          sql: string,
          args?: DbArgs,
        ): Promise<DbQueryResult<TRow>> {
          const result = await rawTransaction.execute({
            sql,
            args: normalizeArgs(args),
          });

          return {
            rows: (result.rows ?? []) as unknown as TRow[],
            rowsAffected: result.rowsAffected ?? 0,
            lastInsertRowid: normalizeLastInsertRowid(result.lastInsertRowid),
          };
        },
      };

      try {
        const output = await callback(tx);
        await rawTransaction.commit();
        return output;
      } catch (error) {
        if (!rawTransaction.closed) {
          try {
            await rawTransaction.rollback();
          } catch {
            // Ignore rollback errors and rethrow the original failure.
          }
        }
        throw error;
      } finally {
        if (!rawTransaction.closed) {
          rawTransaction.close();
        }
      }
    },
  };

  return cachedClient;
}

export function resetDbClientForTests(): void {
  cachedClient = null;
}
