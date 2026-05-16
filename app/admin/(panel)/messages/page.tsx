import { AdminMessagesManager } from "@/components/admin/admin-messages-manager";
import { buildDbErrorMessage, logDbLoadError } from "@/lib/db/debug";
import { getSmsLogs } from "@/lib/repositories/sms";
import { getSmsClientStatus } from "@/lib/sms/client";
import { listSmsTemplates } from "@/lib/sms/templates";
import { SmsLog } from "@/types";

export default async function AdminMessagesPage() {
  const templates = listSmsTemplates();
  const smsClientStatus = getSmsClientStatus();

  let logs: SmsLog[] = [];
  let dbErrorMessage: string | null = null;

  try {
    logs = await getSmsLogs();
  } catch (error) {
    logDbLoadError("admin messages page", error);
    dbErrorMessage = buildDbErrorMessage(
      "문자 발송 이력을 불러오지 못했습니다. DB 연결 상태를 확인한 뒤 다시 시도해 주세요.",
    );
  }

  return (
    <AdminMessagesManager
      templates={templates}
      smsClientStatus={smsClientStatus}
      logs={logs}
      dbErrorMessage={dbErrorMessage}
    />
  );
}
