import { getStudentStatusClass, getStudentStatusLabel } from "@/lib/utils";
import { StudentProfile } from "@/types";
import { StatusPill } from "@/components/ui/status-pill";

interface StudentCardProps {
  student: StudentProfile;
}

export function StudentCard({ student }: StudentCardProps) {
  return (
    <article className="surface-card overflow-hidden">
      <div className={`h-28 bg-gradient-to-br ${student.profileTheme}`} />
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-[#2f231b]">{student.nickname}</h3>
          <StatusPill
            label={getStudentStatusLabel(student.sponsorshipStatus)}
            className={getStudentStatusClass(student.sponsorshipStatus)}
          />
        </div>
        <p className="text-sm subtle-text">
          {student.gender} · {student.grade}
        </p>
        <p className="text-sm leading-6 text-[#4d3d31]">{student.description}</p>
        <div className="rounded-xl bg-[#fff5ea] p-3 text-xs leading-5 text-[#6a5445]">
          손편지 요약: {student.letterSummary}
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex-1 py-2">손편지 보기</button>
          <button
            className="btn-primary flex-1 py-2 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={student.sponsorshipStatus !== "available"}
          >
            결연 신청
          </button>
        </div>
      </div>
    </article>
  );
}
