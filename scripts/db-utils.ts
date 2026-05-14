import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient, type Client } from "@libsql/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");
const envFilePath = resolve(projectRoot, ".env.local");

const REQUIRED_ENV_KEYS = ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN"] as const;

type RequiredEnvKey = (typeof REQUIRED_ENV_KEYS)[number];

function parseEnvLine(rawLine: string): [string, string] | null {
  const line = rawLine.trim();
  if (!line || line.startsWith("#")) {
    return null;
  }

  const separatorIndex = line.indexOf("=");
  if (separatorIndex <= 0) {
    return null;
  }

  const key = line.slice(0, separatorIndex).trim();
  let value = line.slice(separatorIndex + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return [key, value];
}

async function loadProjectEnvFile(): Promise<void> {
  let rawEnv = "";
  try {
    rawEnv = await readFile(envFilePath, "utf8");
  } catch (error) {
    const code =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as { code?: unknown }).code === "string"
        ? (error as { code: string }).code
        : null;

    if (code === "ENOENT") {
      return;
    }

    throw new Error(`[DB] .env.local 파일을 읽지 못했습니다: ${envFilePath}`);
  }

  for (const line of rawEnv.split(/\r?\n/)) {
    const parsed = parseEnvLine(line);
    if (!parsed) {
      continue;
    }

    const [key, value] = parsed;
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

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

export async function createTursoClient(): Promise<Client> {
  await loadProjectEnvFile();

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
  if (typeof client.executeMultiple !== "function") {
    throw new Error(
      "[DB] @libsql/client does not expose executeMultiple. Update the package version.",
    );
  }

  try {
    await client.executeMultiple(sql);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("SQLITE_BUSY")) {
      throw new Error(
        "[DB] 데이터베이스가 잠겨 있습니다(SQLITE_BUSY). 실행 중인 개발 서버를 종료한 뒤 다시 시도해 주세요.",
      );
    }

    throw error;
  }

  console.log(`[DB] ${label} 적용 완료`);
}

export async function runWithClient(
  task: (client: Client) => Promise<void>,
): Promise<void> {
  const client = await createTursoClient();
  try {
    await task(client);
  } finally {
    if (typeof client.close === "function") {
      client.close();
    }
  }
}
