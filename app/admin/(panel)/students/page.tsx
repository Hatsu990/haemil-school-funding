import { AdminStudentsManager } from "@/components/admin/admin-students-manager";
import { buildDbErrorMessage, logDbLoadError } from "@/lib/db/debug";
import { buildScholarshipViews } from "@/lib/repositories/scholarships";
import { getStudents } from "@/lib/repositories/students";
import { withStudentUiFallbackList } from "@/lib/students/ui";
import { StudentProfile } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  let students: StudentProfile[] = [];
  let dbErrorMessage: string | null = null;

  try {
    const loadedStudents = await getStudents();
    const scholarshipViews = await buildScholarshipViews(
      withStudentUiFallbackList(loadedStudents),
    );
    students = scholarshipViews.map((view) => ({
      ...view.student,
      scholarshipType: view.scholarshipType,
      scholarshipAmount: view.scholarshipAmount,
    }));
  } catch (error) {
    logDbLoadError("admin students page", error);
    dbErrorMessage = buildDbErrorMessage(
      "학생 데이터를 불러오지 못했습니다. DB 연결 상태를 확인한 뒤 다시 시도해 주세요.",
    );
  }

  return (
    <div className="pb-6">
      {dbErrorMessage ? (
        <section className="surface-card p-6 text-sm leading-7 text-[#5b473b]">
          <p className="font-semibold text-[#8c4f2d]">데이터 연결 안내</p>
          <p className="mt-2">{dbErrorMessage}</p>
        </section>
      ) : (
        <AdminStudentsManager initialStudents={students} />
      )}
    </div>
  );
}
