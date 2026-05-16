import { AdminSponsorshipsManager } from "@/components/admin/admin-sponsorships-manager";
import { buildDbErrorMessage, logDbLoadError } from "@/lib/db/debug";
import { getSponsorships } from "@/lib/repositories/sponsorships";
import { getStudents } from "@/lib/repositories/students";
import { withStudentUiFallbackList } from "@/lib/students/ui";
import { SponsorshipRecord, StudentProfile } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminSponsorshipsPage() {
  let sponsorships: SponsorshipRecord[] = [];
  let students: StudentProfile[] = [];
  let dbErrorMessage: string | null = null;

  try {
    [sponsorships, students] = await Promise.all([
      getSponsorships(),
      getStudents(),
    ]);
  } catch (error) {
    logDbLoadError("admin sponsorships page", error);
    dbErrorMessage = buildDbErrorMessage(
      "결연 신청 데이터를 불러오지 못했습니다. DB 연결 상태를 확인한 뒤 다시 시도해 주세요.",
    );
  }

  if (dbErrorMessage) {
    return (
      <section className="surface-card p-6 text-sm leading-7 text-[#5b473b]">
        <p className="font-semibold text-[#8c4f2d]">데이터 연결 안내</p>
        <p className="mt-2">{dbErrorMessage}</p>
      </section>
    );
  }

  return (
    <AdminSponsorshipsManager
      initialSponsorships={sponsorships}
      students={withStudentUiFallbackList(students)}
    />
  );
}
