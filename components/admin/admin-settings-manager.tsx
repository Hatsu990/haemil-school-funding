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

export function AdminSettingsManager({ initialValues }: AdminSettingsManagerProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isSaving, startSaving] = useTransition();

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
    <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
      <article className="surface-card p-5">
        <h3 className="font-semibold text-[#4f3d31]">연락/문자 설정</h3>
        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="mb-2 block font-medium text-[#5f4a3c]" id="admin-phone-label">
              관리자 알림 전화번호
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
              일일 연락 알림 발송 시간
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
              후원 신청 가능 여부
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
          {isSaving ? "저장 중..." : "설정 저장"}
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
