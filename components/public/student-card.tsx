"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusPill } from "@/components/ui/status-pill";
import { StudentProfileImage } from "@/components/ui/student-profile-image";
import {
  getSponsorshipBlockedReason,
  isSponsorshipRequestable,
} from "@/lib/sponsorship/policy";
import { withStudentUiFallback } from "@/lib/students/ui";
import { getStudentStatusClass, getStudentStatusLabel } from "@/lib/utils";
import { StudentProfile } from "@/types";

interface StudentCardProps {
  student: StudentProfile;
}

export function StudentCard({ student }: StudentCardProps) {
  const studentUi = withStudentUiFallback(student);
  const requestable = isSponsorshipRequestable(studentUi.sponsorshipStatus);
  const blockedReason = requestable
    ? "학생 1명당 후원자 1명 결연 원칙으로 운영됩니다."
    : getSponsorshipBlockedReason(studentUi.sponsorshipStatus);
  const profileTheme = studentUi.profileTheme ?? "from-[#f3e3d6] to-[#fff4ea]";
  const letterImageUrl = useMemo(
    () => studentUi.letterImageUrl?.trim() ?? "",
    [studentUi.letterImageUrl],
  );
  const hasLetterImage = letterImageUrl.length > 0;

  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [hasLetterImageError, setHasLetterImageError] = useState(false);

  const letterStatusText = hasLetterImage
    ? studentUi.letterSummary ??
      "학생이 직접 전한 손편지 이미지를 확인할 수 있습니다."
    : "손편지 없음";

  return (
    <>
      <article className="surface-card overflow-hidden rounded-[24px] border-[#e8d9cd] shadow-[0_14px_34px_rgba(121,84,53,0.14)]">
        <div className={`bg-gradient-to-br p-5 ${profileTheme}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <StudentProfileImage
                src={studentUi.profileImageUrl}
                alt={`${studentUi.nickname} 학생 프로필 이미지`}
                className="w-24 shrink-0 border-white/70 shadow-lg"
              />
              <div className="min-w-0">
                <h3 className="truncate text-xl font-bold text-[#2f231b]">
                  {studentUi.nickname}
                </h3>
                <p className="mt-1 text-sm text-[#5f4a3c]">
                  {studentUi.gender} · {studentUi.grade}
                </p>
              </div>
            </div>
            <StatusPill
              label={getStudentStatusLabel(studentUi.sponsorshipStatus)}
              className={getStudentStatusClass(studentUi.sponsorshipStatus)}
            />
          </div>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <p className="text-sm leading-7 text-[#4d3d31]">{studentUi.description}</p>
          <div className="rounded-xl bg-[#fff5ea] p-3 text-xs leading-5 text-[#6a5445]">
            손편지 상태: {letterStatusText}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (hasLetterImage) {
                  setHasLetterImageError(false);
                  setIsLetterModalOpen(true);
                }
              }}
              disabled={!hasLetterImage}
              className="btn-secondary flex-1 py-2 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={
                hasLetterImage
                  ? `${studentUi.nickname} 학생 손편지 보기`
                  : `${studentUi.nickname} 학생 손편지 없음`
              }
            >
              {hasLetterImage ? "손편지 보기" : "손편지 없음"}
            </button>

            {requestable ? (
              <Link
                href={`/students/${studentUi.id}/sponsorship`}
                className="btn-primary flex-1 py-2 text-center"
              >
                결연 신청
              </Link>
            ) : (
              <button
                className="btn-primary flex-1 py-2 disabled:cursor-not-allowed disabled:opacity-60"
                disabled
              >
                신청 불가
              </button>
            )}
          </div>
          <p className="text-xs leading-5 text-[#826451]">{blockedReason}</p>
        </div>
      </article>

      {isLetterModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setIsLetterModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="손편지 이미지 보기"
        >
          <div
            className="surface-card w-full max-w-2xl p-4 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="text-base font-bold text-[#2f241d]">
                {studentUi.nickname} 학생 손편지
              </h4>
              <button
                type="button"
                onClick={() => setIsLetterModalOpen(false)}
                className="btn-secondary px-3 py-2 text-xs"
                aria-label="손편지 모달 닫기"
              >
                닫기
              </button>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-[var(--border)] bg-[#f7eadf]">
              {hasLetterImageError ? (
                <div className="grid h-full place-items-center px-6 text-center text-sm text-[#8b5e46]">
                  손편지 이미지를 불러오지 못했습니다.
                </div>
              ) : (
                <Image
                  src={letterImageUrl}
                  alt={`${studentUi.nickname} 학생 손편지 이미지`}
                  fill
                  unoptimized
                  className="object-contain object-center"
                  sizes="(max-width: 768px) 90vw, 700px"
                  onError={() => setHasLetterImageError(true)}
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
