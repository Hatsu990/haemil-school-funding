import Link from "next/link";
import { notFound } from "next/navigation";
import { SponsorshipRequestForm } from "@/components/public/sponsorship-request-form";
import { StudentProfileImage } from "@/components/ui/student-profile-image";
import { buildScholarshipViews } from "@/lib/repositories/scholarships";
import { getStudentById, getStudents } from "@/lib/repositories/students";
import {
  getScholarshipTypeLabel,
  SCHOLARSHIP_AMOUNT_BY_TYPE,
} from "@/lib/scholarships";
import {
  getSponsorshipBlockedReason,
  isSponsorshipRequestable,
} from "@/lib/sponsorship/policy";
import { getPublicStudentName } from "@/lib/students/display";
import {
  initialSponsorshipRequestState,
  SponsorshipRequestState,
  THREE_YEAR_SPONSORSHIP_PERIOD,
} from "@/lib/sponsorship/request-form";
import { withStudentUiFallback } from "@/lib/students/ui";
import { submitSponsorshipRequest } from "./actions";

interface SponsorshipPageProps {
  params: Promise<{ studentId: string }>;
  searchParams?: Promise<{ submitted?: string | string[] }>;
}

function isSubmitted(value?: string | string[]): boolean {
  if (!value) return false;
  if (Array.isArray(value)) return value.includes("1");
  return value === "1";
}

function getInitialStateForStudent(studentId: string): SponsorshipRequestState {
  return {
    ...initialSponsorshipRequestState,
    values: {
      ...initialSponsorshipRequestState.values,
      studentId,
      sponsorshipType: "정기후원",
      sponsorshipPeriodOption: THREE_YEAR_SPONSORSHIP_PERIOD,
    },
  };
}

export default async function SponsorshipPage({
  params,
  searchParams,
}: SponsorshipPageProps) {
  const { studentId } = await params;

  let selectedStudent;
  try {
    const loadedStudent = await getStudentById(studentId);
    selectedStudent = loadedStudent ? withStudentUiFallback(loadedStudent) : null;
  } catch (error) {
    console.error(
      "[sponsorship page] failed to load student from repository",
      error,
    );

    return (
      <div className="container-base py-12">
        <section className="surface-card mx-auto max-w-3xl space-y-3 p-7 text-sm leading-7 text-[#314039]">
          <p className="font-bold text-[#c66f4a]">데이터 연결 안내</p>
          <p>
            학생 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요. 문제가
            계속되면 관리자에게 문의해 주세요.
          </p>
          <div>
            <Link href="/students" className="btn-secondary">
              학생 목록으로 돌아가기
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (!selectedStudent) {
    notFound();
  }

  const currentStatus = selectedStudent.sponsorshipStatus;
  const publicStudentName = getPublicStudentName(selectedStudent);
  const scholarshipViews = await buildScholarshipViews(await getStudents());
  const scholarshipView = scholarshipViews.find(
    (view) => view.student.id === selectedStudent.id,
  );
  const scholarshipType = scholarshipView?.scholarshipType ?? "부분장학금";
  const scholarshipAmount =
    scholarshipView?.scholarshipAmount ??
    SCHOLARSHIP_AMOUNT_BY_TYPE[scholarshipType];
  const submitted = isSubmitted(
    searchParams ? (await searchParams).submitted : undefined,
  );
  const initialState = getInitialStateForStudent(selectedStudent.id);

  if (submitted) {
    return (
      <div className="container-base py-12">
        <div className="surface-card mx-auto max-w-3xl space-y-5 p-7">
          <h1 className="section-title">결연 신청이 접수되었습니다.</h1>
          <p className="text-sm leading-7 subtle-text">
            해밀학교에서 내용을 확인한 후, 결연 후원 안내를 위해 직접
            연락드릴 예정입니다.
          </p>
          <div className="rounded-2xl border border-[var(--border)] bg-[#f7f3ea] p-4 text-sm leading-6 text-[#314039]">
            <p>
              해밀학교의 결연 후원은 한 학생과 후원자가 오랜 시간 따뜻한
              연결을 이어가는 방식으로 운영되고 있습니다.
            </p>
            <p className="mt-2">
              자세한 안내와 후원 절차는 연락을 통해 차근차근 설명드리겠습니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/students" className="btn-primary">
              학생 목록으로 돌아가기
            </Link>
            <Link href="/project" className="btn-secondary">
              후원 프로젝트 안내 보기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-base py-12">
      <section className="surface-card mx-auto mb-6 grid w-fit max-w-full grid-cols-[56px_auto] items-center gap-3 px-4 py-3 sm:grid-cols-[64px_auto]">
        <StudentProfileImage
          src={selectedStudent.profileImageUrl}
          alt={`${publicStudentName} 학생 프로필 이미지`}
          className="w-14 sm:w-16"
          priority
        />
        <h1 className="text-left text-xl font-black leading-tight tracking-[-0.02em] text-[#18211d] text-balance sm:text-2xl">
          {publicStudentName} 학생 결연 신청서
        </h1>
      </section>

      {!isSponsorshipRequestable(currentStatus) ? (
        <section className="surface-card mx-auto max-w-3xl space-y-4 p-7">
          <h2 className="text-2xl font-black text-[#18211d]">
            현재는 신청할 수 없습니다.
          </h2>
          <p className="text-sm leading-7 subtle-text">
            {getSponsorshipBlockedReason(currentStatus)}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/students" className="btn-secondary">
              학생 목록으로 돌아가기
            </Link>
            <Link href="/project" className="btn-primary">
              결연 정책 다시 보기
            </Link>
          </div>
        </section>
      ) : (
        <section className="surface-card mx-auto max-w-3xl p-6">
          <SponsorshipRequestForm
            student={selectedStudent}
            action={submitSponsorshipRequest}
            initialState={initialState}
            scholarshipTypeLabel={getScholarshipTypeLabel(scholarshipType)}
            scholarshipAmount={scholarshipAmount}
          />
        </section>
      )}
    </div>
  );
}
