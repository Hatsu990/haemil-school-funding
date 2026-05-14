import { executeSqlScript, readSqlFile, runWithClient } from "./db-utils.ts";

async function main(): Promise<void> {
  const seedSql = await readSqlFile("lib/db/seed.sql");
  console.log("[DB] seed.sql 적용 시작");
  await runWithClient(async (client) => {
    await executeSqlScript(client, seedSql, "Seed data");
  });
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
