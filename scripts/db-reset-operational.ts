import { config as loadDotenv } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  getDbTargetUrl,
  maskDbTargetUrl,
  runWithClient,
  validateDbEnv,
} from "./db-utils.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envFilePath = resolve(__dirname, "..", ".env.local");

loadDotenv({ path: envFilePath, quiet: true });

function hasConfirmFlag(argv: string[]): boolean {
  return argv.includes("--confirm");
}

function toSafeCount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  return 0;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (!hasConfirmFlag(args)) {
    console.error(
      "[DB] 운영 초기화는 --confirm 플래그가 필요합니다.\n예: npm run db:reset-operational -- --confirm",
    );
    process.exit(1);
  }

  validateDbEnv(envFilePath);
  const targetUrl = getDbTargetUrl();
  console.log(`[DB] target: ${maskDbTargetUrl(targetUrl)}`);
  console.log("[DB] 운영 초기화 시작 (보존: gallery_items, settings, sms_logs)");

  await runWithClient(async (client) => {
    const deleteSponsorshipsResult = await client.execute(
      "DELETE FROM sponsorships",
    );
    const resetStudentsResult = await client.execute(
      "UPDATE students SET sponsorship_status = 'available', updated_at = CURRENT_TIMESTAMP",
    );

    console.log(
      `[DB] sponsorships 삭제: ${toSafeCount(deleteSponsorshipsResult.rowsAffected)}건`,
    );
    console.log(
      `[DB] students 상태 available 초기화: ${toSafeCount(resetStudentsResult.rowsAffected)}명`,
    );
  });

  console.log("[DB] 운영 초기화 완료");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
