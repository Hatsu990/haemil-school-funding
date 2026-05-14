import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");

function getRequiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`[DB] Missing required environment variable: ${name}`);
  }
  return value;
}

export function createTursoClient() {
  const url = getRequiredEnv("TURSO_DATABASE_URL");
  const authToken = getRequiredEnv("TURSO_AUTH_TOKEN");

  return createClient({ url, authToken });
}

export async function readSqlFile(relativePath) {
  const absolutePath = resolve(projectRoot, relativePath);
  return readFile(absolutePath, "utf8");
}

export async function executeSqlScript(client, sql, label) {
  if (typeof client.executeMultiple !== "function") {
    throw new Error(
      "[DB] @libsql/client does not expose executeMultiple. Update the package version.",
    );
  }

  await client.executeMultiple(sql);
  console.log(`[DB] ${label} applied successfully.`);
}

export async function runWithClient(task) {
  const client = createTursoClient();
  try {
    await task(client);
  } finally {
    if (typeof client.close === "function") {
      client.close();
    }
  }
}
