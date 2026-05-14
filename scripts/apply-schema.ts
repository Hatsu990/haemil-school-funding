import { executeSqlScript, readSqlFile, runWithClient } from "./db-utils.ts";

async function main(): Promise<void> {
  const schemaSql = await readSqlFile("lib/db/schema.sql");
  console.log("[DB] schema.sql 적용 시작");
  await runWithClient(async (client) => {
    await executeSqlScript(client, schemaSql, "Schema");
  });
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
