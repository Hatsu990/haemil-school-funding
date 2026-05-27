import { config as loadDotenv } from "dotenv";
import type { Client } from "@libsql/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  executeSqlScript,
  getDbTargetUrl,
  maskDbTargetUrl,
  printDbVerification,
  readSqlFile,
  runWithClient,
  validateDbEnv,
} from "./db-utils.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envFilePath = resolve(__dirname, "..", ".env.local");

loadDotenv({ path: envFilePath, quiet: true });

async function applyIncrementalMigrations(client: Client): Promise<void> {
  const studentColumns = await client.execute("PRAGMA table_info(students)");
  const studentColumnNames = new Set(
    studentColumns.rows.map((row) => String(row.name ?? "")),
  );

  if (!studentColumnNames.has("real_name")) {
    await client.execute("ALTER TABLE students ADD COLUMN real_name TEXT");
    console.log("[DB] migration applied: students.real_name");
  }
}

async function main(): Promise<void> {
  validateDbEnv(envFilePath);
  const targetUrl = getDbTargetUrl();
  console.log(`[DB] target: ${maskDbTargetUrl(targetUrl)}`);

  const schemaSql = await readSqlFile("lib/db/schema.sql");
  console.log("[DB] schema.sql 적용 시작");

  await runWithClient(async (client) => {
    await executeSqlScript(client, schemaSql, "Schema");
    await applyIncrementalMigrations(client);
    await printDbVerification(client);
  });
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
