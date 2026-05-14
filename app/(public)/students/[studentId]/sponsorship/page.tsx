import Link from "next/link";
import { notFound } from "next/navigation";
import { SponsorshipRequestForm } from "@/components/public/sponsorship-request-form";
import { StudentProfileImage } from "@/components/ui/student-profile-image";
import { getStudentById } from "@/lib/repositories/students";
import {
  getSponsorshipBlockedReason,
  isSponsorshipRequestable,
} from "@/lib/sponsorship/policy";
import {
  initialSponsorshipRequestState,
  SponsorshipRequestState,
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
      sponsorshipType: "일시후원",
      sponsorshipPeriodOption: "1개월",
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
        <section className="surface-card mx-auto max-w-3xl space-y-3 p-7 text-sm leading-7 text-[#5b473b]">
          <p className="font-semibold text-[#8c4f2d]">데이터 연결 안내</p>
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
  const submitted = isSubmitted(
    searchParams ? (await searchParams).submitted : undefined,
  );
  const initialState = getInitialStateForStudent(selectedStudent.id);

  if (submitted) {
    return (
      <div className="container-base py-12">
        <div className="surface-card mx-auto max-w-3xl space-y-5 p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a745d]">
            신청 완료
          </p>
          <h1 className="section-title">결연 신청이 접수되었습니다.</h1>
          <p className="text-sm leading-7 subtle-text">
            신청이 접수되었습니다. 관리자가 확인 후 전화드릴 예정입니다.
          </p>
          <div className="rounded-xl border border-[var(--border)] bg-[#fff8ef] p-4 text-sm leading-6 text-[#5a4639]">
            결연 완료 기준은 입금 완료입니다. 입금이 확인되면 결연 완료 상태로
            전환됩니다.
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
      <header className="mb-8">
        <p className="text-sm font-semibold text-[#8d694f]">결연 신청</p>
        <h1 className="section-title mt-2">
          {selectedStudent.nickname} 학생 후원 신청서
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 subtle-text">
          학생 1명당 후원자 1명 결연 원칙으로 운영됩니다. 자동 결제는 제공하지
          않으며, 신청 접수 후 관리자가 직접 연락드립니다.
        </p>
      </header>

      <section className="surface-card mb-6 grid gap-4 p-5 md:grid-cols-[auto_1fr]">
        <StudentProfileImage
          src={selectedStudent.profileImageUrl}
          alt={`${selectedStudent.nickname} 학생 프로필 이미지`}
          className="w-24"
          priority
        />
        <div className="space-y-2 text-sm leading-6 text-[#4f3d32]">
          <p className="font-semibold text-[#3f3027]">
            현재 상태: {currentStatus === "available" ? "신청 가능" : "신청 불가"}
          </p>
          <p>입금 대기 상태에서는 다른 신청이 불가합니다.</p>
          <p>결연 완료 기준은 입금 완료입니다.</p>
        </div>
      </section>

      {!isSponsorshipRequestable(currentStatus) ? (
        <section className="surface-card mx-auto max-w-3xl space-y-4 p-7">
          <h2 className="font-serif text-2xl font-bold text-[#2d211a]">
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
          />
        </section>
      )}
    </div>
  );
}
