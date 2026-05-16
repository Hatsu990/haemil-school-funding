import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@libsql/client";
import { config as loadDotenv } from "dotenv";

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

export interface DbConnectionDebugInfo {
  runtime: string;
  envSource: string;
  envFilePathHint: string | null;
  maskedDatabaseUrl: string;
  hasAuthToken: boolean;
}

const LOCAL_ENV_FILE_PATH = resolve(process.cwd(), ".env.local");

let cachedClient: DbClient | null = null;
let hasLoadedLocalEnvFile = false;
let hasLoggedDbConnectionTarget = false;

function resolveRuntime(): string {
  const vercelEnv = process.env.VERCEL_ENV?.trim();
  if (vercelEnv === "production") {
    return "vercel-production";
  }
  if (vercelEnv === "preview") {
    return "vercel-preview";
  }
  if (vercelEnv === "development") {
    return "vercel-development";
  }
  if (process.env.NODE_ENV === "production") {
    return "self-hosted-production";
  }
  if (process.env.NODE_ENV === "test") {
    return "test";
  }
  return "localhost-development";
}

function isVercelRuntime(): boolean {
  return Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
}

function loadLocalEnvFileIfNeeded(): void {
  if (hasLoadedLocalEnvFile) {
    return;
  }
  hasLoadedLocalEnvFile = true;

  if (isVercelRuntime()) {
    return;
  }

  if (!existsSync(LOCAL_ENV_FILE_PATH)) {
    return;
  }

  const loadResult = loadDotenv({
    path: LOCAL_ENV_FILE_PATH,
    override: false,
  });

  if (loadResult.error) {
    console.error("[DB] .env.local 로딩 실패", loadResult.error);
  }
}

function maskToken(token: string | null | undefined): string {
  const value = token?.trim() ?? "";
  if (!value) {
    return "(missing)";
  }

  if (value.length <= 8) {
    return `${value.slice(0, 2)}***`;
  }

  return `${value.slice(0, 4)}***${value.slice(-3)}`;
}

function maskDatabaseUrl(url: string | null | undefined): string {
  const value = url?.trim() ?? "";
  if (!value) {
    return "(missing)";
  }

  const separator = "://";
  const separatorIndex = value.indexOf(separator);
  const protocol =
    separatorIndex >= 0 ? value.slice(0, separatorIndex + separator.length) : "";
  const rest = separatorIndex >= 0 ? value.slice(separatorIndex + separator.length) : value;

  if (rest.length <= 18) {
    return `${protocol}${rest}`;
  }

  return `${protocol}${rest.slice(0, 10)}***${rest.slice(-6)}`;
}

function resolveEnvSource(): string {
  if (isVercelRuntime()) {
    return "Vercel Environment Variables";
  }

  if (existsSync(LOCAL_ENV_FILE_PATH)) {
    return ".env.local (local file)";
  }

  return "OS process environment";
}

export function getDbConnectionDebugInfo(): DbConnectionDebugInfo {
  loadLocalEnvFileIfNeeded();

  return {
    runtime: resolveRuntime(),
    envSource: resolveEnvSource(),
    envFilePathHint: isVercelRuntime() ? null : LOCAL_ENV_FILE_PATH,
    maskedDatabaseUrl: maskDatabaseUrl(process.env.TURSO_DATABASE_URL),
    hasAuthToken: Boolean(process.env.TURSO_AUTH_TOKEN?.trim()),
  };
}

function logDbConnectionTargetIfNeeded(): void {
  if (hasLoggedDbConnectionTarget) {
    return;
  }
  hasLoggedDbConnectionTarget = true;

  const debug = getDbConnectionDebugInfo();
  console.info(
    `[DB] runtime=${debug.runtime}, source=${debug.envSource}, url=${debug.maskedDatabaseUrl}, token=${maskToken(process.env.TURSO_AUTH_TOKEN)}`,
  );

  if (debug.envFilePathHint) {
    console.info(`[DB] local env path=${debug.envFilePathHint}`);
  }
}

export function getTursoConfig(): TursoConfig | null {
  loadLocalEnvFileIfNeeded();

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

    const debug = getDbConnectionDebugInfo();
    throw new Error(
      `[DB] Turso 설정이 누락되었습니다. missing=${missing.join(", ") || "(unknown)"} runtime=${debug.runtime} source=${debug.envSource} url=${debug.maskedDatabaseUrl} localEnvPath=${debug.envFilePathHint ?? "(vercel-env)"}`,
    );
  }
  return config;
}

export async function getDbClient(): Promise<DbClient> {
  if (cachedClient) {
    return cachedClient;
  }

  const config = assertConfigured(getTursoConfig());
  logDbConnectionTargetIfNeeded();

  const rawClient = createClient({
    url: config.url,
    authToken: config.authToken,
  });

  cachedClient = {
    async execute<TRow extends object>(
      sql: string,
      args?: DbArgs,
    ): Promise<DbQueryResult<TRow>> {
      try {
        const result = await rawClient.execute({
          sql,
          args: normalizeArgs(args),
        });

        return {
          rows: (result.rows ?? []) as unknown as TRow[],
          rowsAffected: result.rowsAffected ?? 0,
          lastInsertRowid: normalizeLastInsertRowid(result.lastInsertRowid),
        };
      } catch (error) {
        const debug = getDbConnectionDebugInfo();
        console.error("[DB] query execution failed", {
          runtime: debug.runtime,
          source: debug.envSource,
          url: debug.maskedDatabaseUrl,
          error,
        });
        throw error;
      }
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

        const debug = getDbConnectionDebugInfo();
        console.error("[DB] transaction failed", {
          runtime: debug.runtime,
          source: debug.envSource,
          url: debug.maskedDatabaseUrl,
          error,
        });
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
  hasLoggedDbConnectionTarget = false;
}
