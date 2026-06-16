"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { StudentProfile } from "@/types";
import {
  SponsorshipRequestState,
  THREE_YEAR_SPONSORSHIP_PERIOD,
} from "@/lib/sponsorship/request-form";

interface SponsorshipRequestFormProps {
  student: StudentProfile;
  action: (
    prevState: SponsorshipRequestState,
    formData: FormData,
  ) => Promise<SponsorshipRequestState>;
  initialState: SponsorshipRequestState;
  scholarshipTypeLabel: string;
  scholarshipAmount: number;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "제출 중…" : "3년 결연 신청서 제출"}
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-[#a84a3f]">{message}</p>;
}

export function SponsorshipRequestForm({
  student,
  action,
  initialState,
  scholarshipTypeLabel,
  scholarshipAmount,
}: SponsorshipRequestFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const [dismissedErrorKey, setDismissedErrorKey] = useState("");
  const values = state.values;
  const errorMessages = useMemo(() => {
    const fieldMessages = Object.values(state.fieldErrors).filter(Boolean);
    return [...(state.formError ? [state.formError] : []), ...fieldMessages];
  }, [state.fieldErrors, state.formError]);
  const errorKey = errorMessages.join("|");
  const showErrorDialog = errorMessages.length > 0 && errorKey !== dismissedErrorKey;
  const amountLabel = new Intl.NumberFormat("ko-KR").format(scholarshipAmount);

  return (
    <>
      {showErrorDialog ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#18211d]/62 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sponsorship-error-title"
        >
          <div className="w-full max-w-md rounded-[28px] border border-[#f1c9c3] bg-[#fffdf8] p-6 text-center shadow-[0_30px_90px_rgba(24,33,29,0.28)]">
            <div
              aria-hidden
              className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#fff1ef] text-2xl font-black text-[#a84a3f]"
            >
              !
            </div>
            <h2
              id="sponsorship-error-title"
              className="mt-4 text-xl font-black text-[#18211d]"
            >
              신청서 확인이 필요합니다
            </h2>
            <div className="mt-4 rounded-2xl bg-[#fff1ef] px-4 py-3 text-left">
              <ul className="space-y-2 text-sm font-bold leading-6 text-[#8d3c34]">
                {errorMessages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setDismissedErrorKey(errorKey)}
              className="btn-primary mt-5 w-full !bg-[#a84a3f] !text-white hover:!bg-[#8d3c34]"
            >
              확인
            </button>
          </div>
        </div>
      ) : null}

      <form action={formAction} className="min-w-0 space-y-5">
        <div className="border-b border-[#d8d3c8] pb-5">
          <h2 className="font-serif text-3xl font-black leading-tight text-[#18211d]">
            결연 신청 정보
          </h2>
          <p className="mt-3 text-sm font-semibold leading-7 text-[#63706a]">
            작성해주신 정보는 결연 안내 연락과 후원 확인을 위해서만 사용됩니다.
          </p>
        </div>

      <input type="hidden" name="studentId" value={student.id} />
      <input type="hidden" name="sponsorshipType" value="정기후원" />
      <input
        type="hidden"
        name="sponsorshipPeriodOption"
        value={THREE_YEAR_SPONSORSHIP_PERIOD}
      />

      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <label className="min-w-0 text-sm">
          <span className="mb-2 block font-bold text-[#24372c]">
            후원자 이름 *
          </span>
          <input
            name="sponsorName"
            defaultValue={values.sponsorName}
            required
            className="w-full rounded-lg border border-[#d8d3c8] bg-white px-3 py-2.5 text-[#18211d] outline-none transition focus:border-[#486f5b] focus:ring-2 focus:ring-[#486f5b]/15"
            placeholder="홍길동"
          />
          <FieldError message={state.fieldErrors.sponsorName} />
        </label>

        <label className="min-w-0 text-sm">
          <span className="mb-2 block font-bold text-[#24372c]">
            휴대폰 번호 *
          </span>
          <input
            name="sponsorPhone"
            defaultValue={values.sponsorPhone}
            required
            className="w-full rounded-lg border border-[#d8d3c8] bg-white px-3 py-2.5 text-[#18211d] outline-none transition focus:border-[#486f5b] focus:ring-2 focus:ring-[#486f5b]/15"
            placeholder="010-1234-5678"
          />
          <FieldError message={state.fieldErrors.sponsorPhone} />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-2 block font-bold text-[#24372c]">이메일 *</span>
        <input
          name="sponsorEmail"
          type="email"
          defaultValue={values.sponsorEmail}
          required
          className="w-full rounded-lg border border-[#d8d3c8] bg-white px-3 py-2.5 text-[#18211d] outline-none transition focus:border-[#486f5b] focus:ring-2 focus:ring-[#486f5b]/15"
          placeholder="sponsor@example.com"
        />
        <FieldError message={state.fieldErrors.sponsorEmail} />
      </label>

      <section className="rounded-lg border border-[#d8d3c8] bg-[#f7f3ea] p-5 text-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-lg font-black text-[#18211d]">
              월 {amountLabel}원
            </p>
            <p className="mt-1 subtle-text">{scholarshipTypeLabel} 대상 학생</p>
          </div>
          <div className="text-right">
            <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-[#7a5d4a]">
              3년 결연
            </span>
          </div>
        </div>
        <FieldError message={state.fieldErrors.sponsorshipType} />
      </section>

      <fieldset className="rounded-lg border border-[#d8d3c8] bg-[#f7f3ea] p-5 text-sm">
        <legend className="px-1 text-sm font-bold text-[#24372c]">
          후원자 공개 여부
        </legend>
        <div className="mt-3 flex flex-wrap gap-3">
          <label className="inline-flex items-center gap-2 rounded-full border border-[#d8d3c8] bg-white px-4 py-2">
            <input
              type="radio"
              name="sponsorPublic"
              value="public"
              defaultChecked={values.sponsorPublic !== "private"}
            />
            <span>공개</span>
          </label>
          <label className="inline-flex items-center gap-2 rounded-full border border-[#d8d3c8] bg-white px-4 py-2">
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
        <span className="mb-2 block font-bold text-[#24372c]">
          응원 메시지
        </span>
        <textarea
          name="sponsorMessage"
          defaultValue={values.sponsorMessage}
          rows={4}
          className="w-full rounded-lg border border-[#d8d3c8] bg-white px-3 py-2.5 text-[#18211d] outline-none transition focus:border-[#486f5b] focus:ring-2 focus:ring-[#486f5b]/15"
          placeholder="학생에게 전하고 싶은 응원 메시지를 남겨주세요."
        />
      </label>

      <label className="flex items-start gap-2 rounded-lg border border-[#d8d3c8] bg-white px-4 py-3 text-sm font-semibold text-[#314039]">
        <input
          type="checkbox"
          name="receiptRequested"
          defaultChecked={values.receiptRequested}
          className="mt-1"
        />
        <span>기부금 영수증 발급을 희망합니다.</span>
      </label>

      <label className="flex items-start gap-2 rounded-lg border border-[#d8d3c8] bg-white px-4 py-3 text-sm font-semibold text-[#314039]">
        <input
          type="checkbox"
          name="privacyConsent"
          defaultChecked={values.privacyConsent}
          className="mt-1"
        />
        <span>[필수] 개인정보 수집 및 이용에 동의합니다.</span>
      </label>
      <FieldError message={state.fieldErrors.privacyConsent} />

        <SubmitButton />
      </form>
    </>
  );
}
