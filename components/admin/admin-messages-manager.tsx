"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendManualTemplateSmsAction } from "@/app/admin/(panel)/messages/actions";
import { CopyButton } from "@/components/ui/copy-button";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { FeedbackToast } from "@/components/ui/feedback-toast";
import { SmsClientStatus } from "@/lib/sms/client";
import { formatDateTimeKorean } from "@/lib/utils";
import { SmsLog } from "@/types";

interface SmsTemplateEntry {
  name: string;
  title: string;
  body: string;
}

interface AdminMessagesManagerProps {
  templates: SmsTemplateEntry[];
  smsClientStatus: SmsClientStatus;
  logs: SmsLog[];
  dbErrorMessage: string | null;
}

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

function getStatusClass(status: SmsLog["status"]): string {
  if (status === "성공") {
    return "bg-[#e8f5eb] text-[#256f43]";
  }

  if (status === "실패") {
    return "bg-[#fdf0eb] text-[#ab4d2f]";
  }

  return "bg-[#eef2ff] text-[#3f4f9f]";
}

export function AdminMessagesManager({
  templates,
  smsClientStatus,
  logs,
  dbErrorMessage,
}: AdminMessagesManagerProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [sendingTemplateName, setSendingTemplateName] = useState<string | null>(null);
  const [isSending, startSending] = useTransition();

  const stats = useMemo(() => {
    return logs.reduce(
      (acc, log) => {
        if (log.status === "성공") acc.success += 1;
        if (log.status === "실패") acc.failed += 1;
        if (log.status === "대기") acc.pending += 1;
        return acc;
      },
      { success: 0, failed: 0, pending: 0 },
    );
  }, [logs]);

  const handleManualSend = (
    event: FormEvent<HTMLFormElement>,
    templateName: string,
  ) => {
    event.preventDefault();
    if (isSending) {
      return;
    }

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    formData.set("templateName", templateName);
    setFeedback(null);
    setSendingTemplateName(templateName);

    startSending(async () => {
      try {
        const result = await sendManualTemplateSmsAction(formData);
        setFeedback({
          type: result.ok ? "success" : "error",
          message: result.responseMessage
            ? `${result.message} (${result.responseMessage})`
            : result.message,
        });

        if (result.ok) {
          formElement.reset();
        }
        router.refresh();
      } catch (error) {
        console.error("[admin messages manager] failed to send manual template sms", error);
        setFeedback({
          type: "error",
          message: "수동 발송 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        });
      } finally {
        setSendingTemplateName(null);
      }
    });
  };

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
            <div className="space-y-2 rounded-lg border border-[#f0d4d4] bg-[#fff5f5] px-3 py-3 text-[#9d3f3f]">
              <p className="font-semibold">
                누락 환경변수: SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_SENDER_PHONE
              </p>
              <p className="text-xs">
                실제 문자는 발송되지 않고 개발 모드에서 콘솔에만 출력됩니다.
              </p>
              {smsClientStatus.missingEnvKeys.length > 0 ? (
                <p className="text-xs">
                  현재 누락 항목: {smsClientStatus.missingEnvKeys.join(", ")}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-xs subtle-text">
              Solapi 환경변수가 모두 설정되어 실제 문자 발송이 가능합니다.
            </p>
          )}
        </div>
      </section>

      {feedback ? <FeedbackToast type={feedback.type} message={feedback.message} /> : null}

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
        <h2 className="text-lg font-bold text-[#2f241d]">문자 템플릿 수동 발송</h2>
        <p className="mt-2 text-sm subtle-text">
          템플릿별로 수신번호와 변수값을 입력해 테스트 또는 운영 발송을 직접 수행할 수
          있습니다.
        </p>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {templates.map((template) => (
            <article
              key={template.name}
              className="rounded-xl border border-[var(--border)] bg-[#fff9f3] p-4"
            >
              <p className="font-semibold text-[#4f3d31]">{template.title}</p>
              <p className="mt-1 text-xs text-[#8a6550]">{template.name}</p>
              <p className="mt-2 text-xs leading-6 subtle-text">{template.body}</p>

              <form
                onSubmit={(event) => handleManualSend(event, template.name)}
                className="mt-4 grid gap-2"
              >
                <input
                  name="phone"
                  required
                  disabled={isSending}
                  placeholder="수신번호 (예: 01012345678)"
                  className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                />
                <div className="grid gap-2 sm:grid-cols-3">
                  <input
                    name="name"
                    disabled={isSending}
                    placeholder="name"
                    className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs"
                  />
                  <input
                    name="studentNickname"
                    disabled={isSending}
                    placeholder="studentNickname"
                    className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs"
                  />
                  <input
                    name="amount"
                    disabled={isSending}
                    placeholder="amount"
                    className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs"
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <input
                    name="period"
                    disabled={isSending}
                    placeholder="period"
                    className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs"
                  />
                  <input
                    name="sponsorshipType"
                    disabled={isSending}
                    placeholder="sponsorshipType"
                    className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs"
                  />
                  <input
                    name="templatePhone"
                    disabled={isSending}
                    placeholder="phone(템플릿 변수)"
                    className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs"
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <input
                    name="contactPhone"
                    disabled={isSending}
                    placeholder="contactPhone"
                    className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs"
                  />
                  <input
                    name="date"
                    disabled={isSending}
                    placeholder="date"
                    className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs"
                  />
                  <input
                    name="count"
                    disabled={isSending}
                    placeholder="count"
                    className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs"
                  />
                </div>
                <input
                  name="items"
                  disabled={isSending}
                  placeholder="items"
                  className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  disabled={isSending}
                  className="btn-secondary mt-1 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSending && sendingTemplateName === template.name
                    ? "발송 중..."
                    : "수동 발송"}
                </button>
              </form>
            </article>
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
