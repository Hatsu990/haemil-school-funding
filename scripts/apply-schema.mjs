import { executeSqlScript, readSqlFile, runWithClient } from "./db-utils.mjs";

async function main() {
  const schemaSql = await readSqlFile("lib/db/schema.sql");
  await runWithClient(async (client) => {
    await executeSqlScript(client, schemaSql, "Schema");
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
