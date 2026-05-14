import { AdminStudentsManager } from "@/components/admin/admin-students-manager";
import { getStudents } from "@/lib/repositories/students";
import { withStudentUiFallbackList } from "@/lib/students/ui";
import { StudentProfile } from "@/types";

export default async function AdminStudentsPage() {
  let students: StudentProfile[] = [];
  let dbErrorMessage: string | null = null;

  try {
    const loadedStudents = await getStudents();
    students = withStudentUiFallbackList(loadedStudents);
  } catch (error) {
    console.error(
      "[admin students page] failed to load students from repository",
      error,
    );
    dbErrorMessage =
      "학생 데이터를 불러오지 못했습니다. DB 연결 상태를 확인한 뒤 다시 시도해 주세요.";
  }

  return (
    <div className="space-y-5 pb-8">
      <section className="surface-card p-5">
        <h2 className="text-lg font-bold text-[#2f241d]">학생 관리</h2>
        <p className="mt-2 text-sm subtle-text">
          학생 실명은 공개하지 않고, 닉네임 기반으로 상태와 소개 정보를 관리합니다.
        </p>
      </section>

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
