import { AdminScholarshipsManager } from "@/components/admin/admin-scholarships-manager";
import { buildDbErrorMessage, logDbLoadError } from "@/lib/db/debug";
import { buildScholarshipViews } from "@/lib/repositories/scholarships";
import { getStudents } from "@/lib/repositories/students";
import { withStudentUiFallbackList } from "@/lib/students/ui";
import { StudentScholarshipView } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminScholarshipsPage() {
  let views: StudentScholarshipView[] = [];
  let dbErrorMessage: string | null = null;

  try {
    const students = withStudentUiFallbackList(await getStudents());
    views = await buildScholarshipViews(students);
  } catch (error) {
    logDbLoadError("admin scholarships page", error);
    dbErrorMessage = buildDbErrorMessage(
      "장학금 지급관리 데이터를 불러오지 못했습니다. DB 연결 상태를 확인한 뒤 다시 시도해 주세요.",
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
        <AdminScholarshipsManager initialViews={views} />
      )}
    </div>
  );
}
