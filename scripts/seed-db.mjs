import { executeSqlScript, readSqlFile, runWithClient } from "./db-utils.mjs";

async function main() {
  const seedSql = await readSqlFile("lib/db/seed.sql");
  await runWithClient(async (client) => {
    await executeSqlScript(client, seedSql, "Seed data");
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
