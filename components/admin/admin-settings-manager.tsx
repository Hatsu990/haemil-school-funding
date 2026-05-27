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

  const formResetKey = [
    initialValues.representativeContactPhone,
    initialValues.sponsorshipContactPhone,
    initialValues.smsSenderPhoneDisplay,
    initialValues.autoSmsSendTime,
  ].join("|");

  const contactSummary = [
    {
      label: "대표 연락",
      value: initialValues.representativeContactPhone,
    },
    {
      label: "장학금 결연 상담",
      value: initialValues.sponsorshipContactPhone,
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
    <form key={formResetKey} onSubmit={handleSubmit} className="space-y-5">
      <article className="surface-card p-4 md:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-[#4f3d31]">현재 적용 중인 연락/문자 설정</h3>
          </div>
          <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-xs font-medium text-[#34507a]">
            현재 설정값
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {contactSummary.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-[var(--border)] bg-white p-4"
            >
              <p className="text-xs font-medium text-[#7c6658]">{item.label}</p>
              <p className="mt-1 text-lg font-bold text-[#2f241d]">{item.value}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="surface-card p-4">
        <h3 className="font-semibold text-[#4f3d31]">연락/문자 설정</h3>
        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            <span
              className="mb-2 block font-medium text-[#5f4a3c]"
              id="representative-phone-label"
            >
              대표 연락 전화번호
            </span>
            <input
              id="representative-contact-phone"
              name="representativeContactPhone"
              defaultValue={initialValues.representativeContactPhone}
              disabled={isSaving}
              maxLength={20}
              aria-labelledby="representative-phone-label"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span
              className="mb-2 block font-medium text-[#5f4a3c]"
              id="sponsorship-phone-label"
            >
              장학금 결연 상담 전화번호
            </span>
            <input
              id="sponsorship-contact-phone"
              name="sponsorshipContactPhone"
              defaultValue={initialValues.sponsorshipContactPhone}
              disabled={isSaving}
              maxLength={20}
              aria-labelledby="sponsorship-phone-label"
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

        <button
          type="submit"
          disabled={isSaving}
          className="btn-primary mt-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "설정 저장 중…" : "설정 저장"}
        </button>
      </article>

      {feedback ? (
        <FeedbackToast
          type={feedback.type}
          message={feedback.message}
          className="surface-card"
        />
      ) : null}
    </form>
  );
}
