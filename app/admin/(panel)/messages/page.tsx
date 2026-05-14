import { CopyButton } from "@/components/ui/copy-button";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { getSmsLogs } from "@/lib/repositories/sms";
import { getSmsClientStatus } from "@/lib/sms/client";
import { listSmsTemplates } from "@/lib/sms/templates";
import { formatDateTimeKorean } from "@/lib/utils";
import { SmsLog } from "@/types";

function getStatusClass(status: SmsLog["status"]): string {
  if (status === "성공") {
    return "bg-[#e8f5eb] text-[#256f43]";
  }

  if (status === "실패") {
    return "bg-[#fdf0eb] text-[#ab4d2f]";
  }

  return "bg-[#eef2ff] text-[#3f4f9f]";
}

function summarizeLogs(logs: SmsLog[]) {
  return logs.reduce(
    (acc, log) => {
      if (log.status === "성공") acc.success += 1;
      if (log.status === "실패") acc.failed += 1;
      if (log.status === "대기") acc.pending += 1;
      return acc;
    },
    { success: 0, failed: 0, pending: 0 },
  );
}

export default async function AdminMessagesPage() {
  const templates = listSmsTemplates();
  const smsClientStatus = getSmsClientStatus();
  let logs: SmsLog[] = [];
  let dbErrorMessage: string | null = null;

  try {
    logs = await getSmsLogs();
  } catch (error) {
    console.error("[admin messages page] failed to load sms logs", error);
    dbErrorMessage =
      "문자 발송 이력을 불러오지 못했습니다. DB 연결 상태를 확인한 뒤 다시 시도해 주세요.";
  }

  const stats = summarizeLogs(logs);

  return (
    <div className="space-y-5 pb-8">
      <section className="surface-card p-5">
        <h2 className="text-lg font-bold text-[#2f241d]">문자 발송 연결 상태</h2>
        <div className="mt-3 space-y-2 text-sm">
          <p className="text-[#5f4a3c]">
            Solapi 구성:{" "}
            <span className="font-semibold">
              {smsClientStatus.configured ? "설정 완료" : "환경변수 누락"}
            </span>
          </p>
          {!smsClientStatus.configured ? (
            <p className="rounded-lg border border-[#f0d4d4] bg-[#fff5f5] px-3 py-2 text-[#9d3f3f]">
              누락 환경변수: {smsClientStatus.missingEnvKeys.join(", ")}
            </p>
          ) : null}
          <p className="text-xs subtle-text">
            환경변수가 없으면 실제 발송은 수행하지 않고, 개발 모드에서는 콘솔에
            발송 내용이 출력됩니다.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="surface-card p-5">
          <p className="text-sm font-medium text-[#6b5444]">최근 발송 성공</p>
          <p className="mt-2 text-3xl font-bold text-[#2f241d]">{stats.success}건</p>
        </article>
        <article className="surface-card p-5">
          <p className="text-sm font-medium text-[#6b5444]">최근 발송 실패</p>
          <p className="mt-2 text-3xl font-bold text-[#2f241d]">{stats.failed}건</p>
        </article>
        <article className="surface-card p-5">
          <p className="text-sm font-medium text-[#6b5444]">발송 대기/기타</p>
          <p className="mt-2 text-3xl font-bold text-[#2f241d]">{stats.pending}건</p>
        </article>
      </section>

      <section className="surface-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[#2f241d]">문자 템플릿 목록</h2>
          <button
            type="button"
            disabled
            className="btn-secondary py-2 text-xs opacity-70"
          >
            수동 발송 기능 (준비중)
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {templates.map((template) => (
            <div
              key={template.name}
              className="rounded-xl border border-[var(--border)] bg-[#fff9f3] p-4"
            >
              <p className="font-semibold text-[#4f3d31]">{template.title}</p>
              <p className="mt-1 text-xs text-[#8a6550]">{template.name}</p>
              <p className="mt-2 text-xs leading-6 subtle-text">{template.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-card overflow-hidden">
        <header className="border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-lg font-bold text-[#2f241d]">문자 발송 이력</h2>
        </header>

        {dbErrorMessage ? (
          <div className="px-5 py-6 text-sm text-[#9d3f3f]">{dbErrorMessage}</div>
        ) : logs.length === 0 ? (
          <EmptyStateCard
            className="m-5"
            title="저장된 문자 발송 이력이 없습니다."
            description="문자 발송이 시작되면 이력 목록이 자동으로 표시됩니다."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table min-w-[860px]">
              <thead className="bg-[#fff5ea] text-left text-[#6d5545]">
                <tr>
                  <th>시간</th>
                  <th>수신번호</th>
                  <th>템플릿</th>
                  <th>상태</th>
                  <th>응답/메모</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((item) => (
                  <tr key={item.id}>
                    <td className="whitespace-nowrap">
                      {formatDateTimeKorean(item.createdAt)}
                    </td>
                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{item.phone}</span>
                        {item.phone !== "-" ? (
                          <CopyButton value={item.phone} label="복사" />
                        ) : null}
                      </div>
                    </td>
                    <td className="whitespace-nowrap">{item.templateName}</td>
                    <td className="whitespace-nowrap">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <p className="max-w-[420px] break-all text-xs text-[#5d473b]">
                        {item.responseMessage || "-"}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
