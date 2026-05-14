import Link from "next/link";
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
  const letterSummary =
    studentUi.letterSummary ??
    "배움과 생활의 균형을 만들어가며 한 걸음씩 성장하고 있습니다.";

  return (
    <article className="surface-card overflow-hidden">
      <div className={`bg-gradient-to-br p-4 ${profileTheme}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <StudentProfileImage
              src={studentUi.profileImageUrl}
              alt={`${studentUi.nickname} 학생 프로필 이미지`}
              className="w-20 shrink-0"
            />
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-[#2f231b]">
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

      <div className="space-y-4 p-5">
        <p className="text-sm leading-6 text-[#4d3d31]">{studentUi.description}</p>
        <div className="rounded-xl bg-[#fff5ea] p-3 text-xs leading-5 text-[#6a5445]">
          손편지 요약: {letterSummary}
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex-1 py-2">손편지 보기</button>

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
  );
}
