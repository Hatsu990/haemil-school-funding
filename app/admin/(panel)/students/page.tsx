import { StatusPill } from "@/components/ui/status-pill";
import { students } from "@/lib/mock-data";
import { getStudentStatusClass, getStudentStatusLabel } from "@/lib/utils";

export default function AdminStudentsPage() {
  return (
    <div className="space-y-5 pb-8">
      <section className="surface-card p-5">
        <h2 className="text-lg font-bold text-[#2f241d]">학생 관리</h2>
        <p className="mt-2 text-sm subtle-text">
          학생 실명 비공개, AI 카툰 이미지 사용 정책을 유지한 상태로 정보를
          수정합니다.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {students.map((student) => (
          <article key={student.id} className="surface-card overflow-hidden">
            <div className={`h-20 bg-gradient-to-r ${student.profileTheme}`} />
            <div className="space-y-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-[#2f241d]">
                  {student.nickname} ({student.grade})
                </h3>
                <StatusPill
                  label={getStudentStatusLabel(student.sponsorshipStatus)}
                  className={getStudentStatusClass(student.sponsorshipStatus)}
                />
              </div>
              <p className="text-sm subtle-text">{student.description}</p>
              <div className="grid gap-2 sm:grid-cols-3">
                <button className="btn-secondary py-2 text-xs">기본정보 수정</button>
                <button className="btn-secondary py-2 text-xs">AI 이미지 교체</button>
                <button className="btn-secondary py-2 text-xs">손편지 업로드</button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
