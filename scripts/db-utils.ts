import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient, type Client } from "@libsql/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");

const REQUIRED_ENV_KEYS = ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN"] as const;

type RequiredEnvKey = (typeof REQUIRED_ENV_KEYS)[number];
type RawRow = Record<string, unknown>;

function getMissingRequiredEnvKeys(): RequiredEnvKey[] {
  return REQUIRED_ENV_KEYS.filter((key) => {
    const value = process.env[key]?.trim();
    return !value;
  });
}

function getRequiredEnvValue(key: RequiredEnvKey): string {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`[DB] 필수 환경변수가 없습니다: ${key}`);
  }

  return value;
}

function toSafeInteger(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return 0;
}

export function validateDbEnv(envFilePath: string): void {
  const missingKeys = getMissingRequiredEnvKeys();
  if (missingKeys.length > 0) {
    throw new Error(
      `[DB] 필수 환경변수가 없습니다: ${missingKeys.join(", ")}\n` +
        `[DB] 확인 경로: ${envFilePath}\n` +
        "[DB] 예시:\n" +
        "TURSO_DATABASE_URL=libsql://your-db-name.turso.io\n" +
        "TURSO_AUTH_TOKEN=your-token",
    );
  }
}

export function getDbTargetUrl(): string {
  return getRequiredEnvValue("TURSO_DATABASE_URL");
}

export function maskDbTargetUrl(url: string): string {
  const trimmed = url.trim();
  const separator = "://";
  const protocolIndex = trimmed.indexOf(separator);

  if (protocolIndex >= 0) {
    const protocol = trimmed.slice(0, protocolIndex + separator.length);
    const rest = trimmed.slice(protocolIndex + separator.length);
    if (rest.length <= 14) {
      return `${protocol}${rest}`;
    }
    return `${protocol}${rest.slice(0, 14)}...`;
  }

  if (trimmed.length <= 24) {
    return trimmed;
  }

  return `${trimmed.slice(0, 24)}...`;
}

export function createTursoClient(): Client {
  return createClient({
    url: getRequiredEnvValue("TURSO_DATABASE_URL"),
    authToken: getRequiredEnvValue("TURSO_AUTH_TOKEN"),
  });
}

export async function readSqlFile(relativePath: string): Promise<string> {
  const absolutePath = resolve(projectRoot, relativePath);
  return readFile(absolutePath, "utf8");
}

export async function executeSqlScript(
  client: Client,
  sql: string,
  label: string,
): Promise<void> {
  const statements = splitSqlStatements(sql).filter((statement) => {
    const normalized = statement.trim().toUpperCase();
    return normalized !== "BEGIN TRANSACTION;" && normalized !== "COMMIT;";
  });

  try {
    for (const statement of statements) {
      await client.execute(statement);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("SQLITE_BUSY")) {
      throw new Error(
        "[DB] 데이터베이스가 잠겨 있습니다(SQLITE_BUSY). 실행 중인 개발 서버를 종료한 뒤 다시 시도해 주세요.",
      );
    }
    throw error;
  }

  console.log(`[DB] ${label} 적용 완료 (${statements.length} statements)`);
}

export async function runWithClient(
  task: (client: Client) => Promise<void>,
): Promise<void> {
  const client = createTursoClient();
  try {
    await task(client);
  } finally {
    if (typeof client.close === "function") {
      client.close();
    }
  }
}

export async function printDbVerification(client: Client): Promise<void> {
  const tableResult = (await client.execute(
    `
      SELECT name
      FROM sqlite_master
      WHERE type = 'table'
        AND name NOT LIKE 'sqlite_%'
      ORDER BY name ASC
    `,
  )) as { rows: RawRow[] };

  const tableNames = tableResult.rows
    .map((row) => {
      const value = row.name;
      return typeof value === "string" ? value : "";
    })
    .filter((name) => name.length > 0);

  console.log(`[DB] tables: ${tableNames.join(", ") || "(none)"}`);

  const studentsCountResult = (await client.execute(
    "SELECT COUNT(*) AS count FROM students",
  )) as { rows: RawRow[] };
  const studentsCount = toSafeInteger(studentsCountResult.rows[0]?.count);
  console.log(`[DB] students count: ${studentsCount}`);
}

function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  const lines = sql.split(/\r?\n/);
  let buffer = "";
  let inTrigger = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("--")) {
      continue;
    }

    buffer += `${line}\n`;

    if (!inTrigger && /^CREATE\s+TRIGGER\b/i.test(trimmed)) {
      inTrigger = true;
      continue;
    }

    if (inTrigger) {
      if (/^END;$/i.test(trimmed)) {
        statements.push(buffer.trim());
        buffer = "";
        inTrigger = false;
      }
      continue;
    }

    if (trimmed.endsWith(";")) {
      statements.push(buffer.trim());
      buffer = "";
    }
  }

  if (buffer.trim()) {
    statements.push(buffer.trim());
  }

  return statements;
}
