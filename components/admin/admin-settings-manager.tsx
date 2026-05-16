"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  saveAdminSettingsAction,
  SaveAdminSettingsActionResult,
} from "@/app/admin/(panel)/settings/actions";
import { FeedbackToast } from "@/components/ui/feedback-toast";
import { AdminSettingsFormValues } from "@/lib/settings/admin-settings";

interface AdminSettingsManagerProps {
  initialValues: AdminSettingsFormValues;
}

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

function toToggleLabel(value: "true" | "false", enabled: string, disabled: string) {
  return value === "true" ? enabled : disabled;
}

function formatWon(value: string): string {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return `${value}원`;
  }

  return `${new Intl.NumberFormat("ko-KR").format(parsed)}원`;
}

export function AdminSettingsManager({ initialValues }: AdminSettingsManagerProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isSaving, startSaving] = useTransition();

  const formResetKey = [
    initialValues.adminContactPhone,
    initialValues.smsSenderPhoneDisplay,
    initialValues.autoSmsSendTime,
    initialValues.sitePublicEnabled,
    initialValues.sponsorshipRequestEnabled,
    initialValues.defaultSponsorshipAmount,
    initialValues.targetStudentCount,
  ].join("|");

  const contactSummary = [
    {
      label: "설정된 연락처",
      value: initialValues.adminContactPhone,
    },
    {
      label: "문자 발신 번호",
      value: initialValues.smsSenderPhoneDisplay,
    },
    {
      label: "자동 문자 발송 시각",
      value: initialValues.autoSmsSendTime,
    },
  ];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    setFeedback(null);

    startSaving(async () => {
      let result: SaveAdminSettingsActionResult;
      try {
        result = await saveAdminSettingsAction(formData);
      } catch (error) {
        console.error("[admin settings manager] failed to call save action", error);
        setFeedback({
          type: "error",
          message: "설정 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        });
        return;
      }

      if (!result.ok) {
        setFeedback({
          type: "error",
          message: result.message,
        });
        return;
      }

      setFeedback({
        type: "success",
        message: result.message,
      });
      router.refresh();
    });
  };

  return (
    <form key={formResetKey} onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
      <article className="surface-card p-5 md:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-[#4f3d31]">현재 적용 중인 연락/문자 설정</h3>
            <p className="mt-1 text-xs subtle-text">
              저장된 값 기준으로 실제 운영에 사용되는 연락 정보를 보여줍니다.
            </p>
          </div>
          <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-xs font-medium text-[#34507a]">
            현재 설정값
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {contactSummary.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-[var(--border)] bg-[#fff9f3] p-4"
            >
              <p className="text-xs font-medium text-[#7c6658]">{item.label}</p>
              <p className="mt-1 text-lg font-bold text-[#2f241d]">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-[var(--border)] bg-white p-3">
            <p className="text-xs font-medium text-[#7c6658]">사이트 공개</p>
            <p className="mt-1 text-sm font-semibold text-[#2f241d]">
              {toToggleLabel(initialValues.sitePublicEnabled, "공개", "비공개")}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-white p-3">
            <p className="text-xs font-medium text-[#7c6658]">후원 요청 접수</p>
            <p className="mt-1 text-sm font-semibold text-[#2f241d]">
              {toToggleLabel(initialValues.sponsorshipRequestEnabled, "가능", "중지")}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-white p-3">
            <p className="text-xs font-medium text-[#7c6658]">기본 후원 금액</p>
            <p className="mt-1 text-sm font-semibold text-[#2f241d]">
              {formatWon(initialValues.defaultSponsorshipAmount)}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-white p-3">
            <p className="text-xs font-medium text-[#7c6658]">목표 학생 수</p>
            <p className="mt-1 text-sm font-semibold text-[#2f241d]">
              {initialValues.targetStudentCount}명
            </p>
          </div>
        </div>
      </article>

      <article className="surface-card p-5">
        <h3 className="font-semibold text-[#4f3d31]">연락/문자 설정</h3>
        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="mb-2 block font-medium text-[#5f4a3c]" id="admin-phone-label">
              관리자 안내 전화번호
            </span>
            <input
              id="admin-contact-phone"
              name="adminContactPhone"
              defaultValue={initialValues.adminContactPhone}
              disabled={isSaving}
              maxLength={20}
              aria-labelledby="admin-phone-label"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block font-medium text-[#5f4a3c]" id="sms-phone-display-label">
              문자 발신 번호 표시
            </span>
            <input
              id="sms-sender-phone-display"
              name="smsSenderPhoneDisplay"
              defaultValue={initialValues.smsSenderPhoneDisplay}
              disabled={isSaving}
              maxLength={20}
              aria-labelledby="sms-phone-display-label"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block font-medium text-[#5f4a3c]" id="auto-time-label">
              일일 연락 알림 발송 시각
            </span>
            <input
              id="auto-sms-send-time"
              type="time"
              name="autoSmsSendTime"
              defaultValue={initialValues.autoSmsSendTime}
              disabled={isSaving}
              aria-labelledby="auto-time-label"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
            />
          </label>
        </div>
      </article>

      <article className="surface-card p-5">
        <h3 className="font-semibold text-[#4f3d31]">운영 정책 설정</h3>
        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="mb-2 block font-medium text-[#5f4a3c]">
              사이트 공개 여부
            </span>
            <select
              name="sitePublicEnabled"
              defaultValue={initialValues.sitePublicEnabled}
              disabled={isSaving}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
            >
              <option value="true">공개</option>
              <option value="false">비공개</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-2 block font-medium text-[#5f4a3c]">
              후원 요청 가능 여부
            </span>
            <select
              name="sponsorshipRequestEnabled"
              defaultValue={initialValues.sponsorshipRequestEnabled}
              disabled={isSaving}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
            >
              <option value="true">가능</option>
              <option value="false">중지</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-2 block font-medium text-[#5f4a3c]">
              기본 후원 금액 (원)
            </span>
            <input
              type="number"
              name="defaultSponsorshipAmount"
              defaultValue={initialValues.defaultSponsorshipAmount}
              disabled={isSaving}
              min={1}
              step={1}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block font-medium text-[#5f4a3c]">
              전체 목표 학생 수
            </span>
            <input
              type="number"
              name="targetStudentCount"
              defaultValue={initialValues.targetStudentCount}
              disabled={isSaving}
              min={1}
              step={1}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="btn-primary mt-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "설정 저장 중..." : "설정 저장"}
        </button>
      </article>

      {feedback ? (
        <FeedbackToast
          type={feedback.type}
          message={feedback.message}
          className="surface-card md:col-span-2"
        />
      ) : null}
    </form>
  );
}
