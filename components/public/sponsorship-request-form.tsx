"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { FeedbackToast } from "@/components/ui/feedback-toast";
import { StudentProfile } from "@/types";
import {
  DIRECT_PERIOD_OPTION,
  SponsorshipRequestState,
} from "@/lib/sponsorship/request-form";

interface SponsorshipRequestFormProps {
  student: StudentProfile;
  action: (
    prevState: SponsorshipRequestState,
    formData: FormData,
  ) => Promise<SponsorshipRequestState>;
  initialState: SponsorshipRequestState;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "제출 중..." : "결연 신청서 제출"}
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-[#9d3f3f]">{message}</p>;
}

export function SponsorshipRequestForm({
  student,
  action,
  initialState,
}: SponsorshipRequestFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const values = state.values;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="studentId" value={student.id} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          <span className="mb-2 block font-semibold text-[#5c4739]">
            후원자 이름 *
          </span>
          <input
            name="sponsorName"
            defaultValue={values.sponsorName}
            required
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
            placeholder="홍길동"
          />
          <FieldError message={state.fieldErrors.sponsorName} />
        </label>

        <label className="text-sm">
          <span className="mb-2 block font-semibold text-[#5c4739]">
            휴대폰 번호 *
          </span>
          <input
            name="sponsorPhone"
            defaultValue={values.sponsorPhone}
            required
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
            placeholder="010-1234-5678"
          />
          <FieldError message={state.fieldErrors.sponsorPhone} />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-2 block font-semibold text-[#5c4739]">이메일 *</span>
        <input
          name="sponsorEmail"
          type="email"
          defaultValue={values.sponsorEmail}
          required
          className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
          placeholder="sponsor@example.com"
        />
        <FieldError message={state.fieldErrors.sponsorEmail} />
      </label>

      <fieldset className="rounded-xl border border-[var(--border)] bg-[#fffdfa] p-4 text-sm">
        <legend className="px-1 text-sm font-semibold text-[#5c4739]">
          후원 방식 *
        </legend>
        <div className="mt-2 flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="sponsorshipType"
              value="일시후원"
              defaultChecked={values.sponsorshipType === "일시후원"}
            />
            <span>일시후원 (10만 원)</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="sponsorshipType"
              value="정기후원"
              defaultChecked={values.sponsorshipType === "정기후원"}
            />
            <span>정기후원 (월 10만 원)</span>
          </label>
        </div>
        <FieldError message={state.fieldErrors.sponsorshipType} />
      </fieldset>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          <span className="mb-2 block font-semibold text-[#5c4739]">
            후원 기간 (정기후원 시 필수)
          </span>
          <select
            name="sponsorshipPeriodOption"
            defaultValue={values.sponsorshipPeriodOption}
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
          >
            <option value="">선택</option>
            <option value="1개월">1개월</option>
            <option value="3개월">3개월</option>
            <option value="6개월">6개월</option>
            <option value="12개월">12개월</option>
            <option value={DIRECT_PERIOD_OPTION}>직접 입력</option>
          </select>
          <FieldError message={state.fieldErrors.sponsorshipPeriodOption} />
        </label>

        <label className="text-sm">
          <span className="mb-2 block font-semibold text-[#5c4739]">
            기간 직접 입력
          </span>
          <input
            name="sponsorshipPeriodCustom"
            defaultValue={values.sponsorshipPeriodCustom}
            placeholder="예: 18개월"
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
          />
          <FieldError message={state.fieldErrors.sponsorshipPeriodCustom} />
        </label>
      </div>

      <fieldset className="rounded-xl border border-[var(--border)] bg-[#fffdfa] p-4 text-sm">
        <legend className="px-1 text-sm font-semibold text-[#5c4739]">
          후원자 공개 여부
        </legend>
        <div className="mt-2 flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="sponsorPublic"
              value="public"
              defaultChecked={values.sponsorPublic !== "private"}
            />
            <span>공개</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="sponsorPublic"
              value="private"
              defaultChecked={values.sponsorPublic === "private"}
            />
            <span>비공개</span>
          </label>
        </div>
      </fieldset>

      <label className="block text-sm">
        <span className="mb-2 block font-semibold text-[#5c4739]">
          응원 메시지
        </span>
        <textarea
          name="sponsorMessage"
          defaultValue={values.sponsorMessage}
          rows={4}
          className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
          placeholder="학생에게 전하고 싶은 응원 메시지를 남겨주세요."
        />
      </label>

      <label className="flex items-start gap-2 text-sm text-[#4f3d32]">
        <input
          type="checkbox"
          name="receiptRequested"
          defaultChecked={values.receiptRequested}
          className="mt-1"
        />
        <span>기부금 영수증 발급을 희망합니다.</span>
      </label>

      <label className="flex items-start gap-2 text-sm text-[#4f3d32]">
        <input
          type="checkbox"
          name="privacyConsent"
          defaultChecked={values.privacyConsent}
          className="mt-1"
        />
        <span>[필수] 개인정보 수집 및 이용에 동의합니다.</span>
      </label>
      <FieldError message={state.fieldErrors.privacyConsent} />

      {state.formError ? (
        <FeedbackToast type="error" message={state.formError} />
      ) : null}

      <SubmitButton />
    </form>
  );
}
