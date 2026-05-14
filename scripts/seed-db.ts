import { config as loadDotenv } from "dotenv";
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

async function main(): Promise<void> {
  validateDbEnv(envFilePath);
  const targetUrl = getDbTargetUrl();
  console.log(`[DB] target: ${maskDbTargetUrl(targetUrl)}`);

  const seedSql = await readSqlFile("lib/db/seed.sql");
  console.log("[DB] seed.sql 적용 시작");

  await runWithClient(async (client) => {
    await executeSqlScript(client, seedSql, "Seed data");
    await printDbVerification(client);
  });
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
