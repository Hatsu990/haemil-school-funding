import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SponsorshipRequestForm } from "@/components/public/sponsorship-request-form";
import { StudentProfileImage } from "@/components/ui/student-profile-image";
import { buildScholarshipViews } from "@/lib/repositories/scholarships";
import { getStudentById, getStudents } from "@/lib/repositories/students";
import {
  getScholarshipSupportTierLabel,
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

function formatWon(amount: number): string {
  return new Intl.NumberFormat("ko-KR").format(amount);
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
        <section className="mx-auto max-w-3xl rounded-lg border border-[#d8d3c8] bg-[#fffdf8] p-7 text-sm leading-7 text-[#314039] shadow-[0_18px_44px_rgba(32,41,38,0.08)]">
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
      <div className="container-home py-12">
        <div className="mx-auto max-w-3xl rounded-lg border border-[#d8d3c8] bg-[#fffdf8] p-7 shadow-[0_22px_58px_rgba(32,41,38,0.1)] sm:p-9">
          <h1 className="font-serif text-3xl font-black leading-tight text-[#18211d] text-balance">
            결연 신청이 접수되었습니다.
          </h1>
          <p className="mt-4 text-sm font-semibold leading-7 text-[#314039]">
            해밀학교에서 내용을 확인한 후, 결연 후원 안내를 위해 직접
            연락드릴 예정입니다.
          </p>
          <div className="mt-6 rounded-lg border border-[#d8d3c8] bg-[#f7f3ea] p-5 text-sm font-semibold leading-7 text-[#314039]">
            <p>
              해밀학교의 결연 후원은 한 학생과 후원자가 오랜 시간 따뜻한
              연결을 이어가는 방식으로 운영되고 있습니다.
            </p>
            <p className="mt-2">
              자세한 안내와 후원 절차는 연락을 통해 차근차근 설명드리겠습니다.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
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
    <div className="bg-[#f7f5ef]">
      <div className="container-home py-10 sm:py-12">
        <Link href="/students" className="btn-secondary mb-5">
          학생 목록으로 돌아가기
        </Link>

        <section className="relative mb-8 max-w-full overflow-hidden rounded-lg border border-[#d8d3c8] bg-[#fffdf8] shadow-[0_22px_58px_rgba(32,41,38,0.1)] [width:min(100%,358px)] sm:w-full">
          <Image
            src="/images/haemill/school-campus-3.jpg"
            alt=""
            fill
            aria-hidden
            className="object-cover opacity-[0.18]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#fffdf8_0%,rgba(255,253,248,0.96)_48%,rgba(255,253,248,0.70)_100%)]" />
          <div className="relative z-10 grid min-w-0 gap-8 p-6 sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
            <div className="min-w-0">
              <h1 className="font-serif text-3xl font-black leading-tight text-[#18211d] text-balance [word-break:keep-all] sm:text-5xl">
                {publicStudentName} 학생의 중학교 3년을 함께 지켜주세요
              </h1>
              <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-[#314039]">
                이 결연은 한 학생이 경제적인 걱정보다 배움과 꿈에 집중할 수
                있도록 이어지는 3년 장학금 신청입니다.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="min-w-0 rounded-lg border border-[#d8d3c8] bg-white/82 px-4 py-3">
                  <p className="text-xs font-black text-[#486f5b]">장학금 구분</p>
                  <p className="mt-1 text-lg font-black text-[#18211d]">
                    {getScholarshipSupportTierLabel(scholarshipType)}
                  </p>
                </div>
                <div className="min-w-0 rounded-lg border border-[#d8d3c8] bg-white/82 px-4 py-3">
                  <p className="text-xs font-black text-[#486f5b]">월 후원금</p>
                  <p className="mt-1 text-lg font-black text-[#18211d]">
                    {formatWon(scholarshipAmount)}원
                  </p>
                </div>
                <div className="min-w-0 rounded-lg border border-[#d8d3c8] bg-white/82 px-4 py-3">
                  <p className="text-xs font-black text-[#486f5b]">결연 기간</p>
                  <p className="mt-1 text-lg font-black text-[#18211d]">
                    {THREE_YEAR_SPONSORSHIP_PERIOD}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid min-w-0 gap-4 sm:grid-cols-[168px_1fr] sm:items-center">
              <StudentProfileImage
                src={selectedStudent.profileImageUrl}
                alt={`${publicStudentName} 학생 프로필 이미지`}
                className="w-36 shadow-[0_18px_44px_rgba(32,41,38,0.14)] sm:w-40"
                priority
              />
              <div className="min-w-0 rounded-lg border border-[#d8d3c8] bg-white/86 p-5 shadow-[0_16px_36px_rgba(32,41,38,0.08)]">
                <p className="text-2xl font-black text-[#18211d]">
                  {publicStudentName}
                </p>
                <p className="mt-1 text-sm font-black text-[#486f5b]">
                  {selectedStudent.gender} · {selectedStudent.grade}
                </p>
                <p className="mt-4 text-sm font-semibold leading-7 text-[#314039]">
                  {selectedStudent.description}
                </p>
              </div>
            </div>
          </div>
      </section>

      {!isSponsorshipRequestable(currentStatus) ? (
        <section className="mx-auto max-w-3xl rounded-lg border border-[#d8d3c8] bg-[#fffdf8] p-7 shadow-[0_18px_44px_rgba(32,41,38,0.08)] [width:min(100%,358px)] sm:w-full">
          <h2 className="text-2xl font-black text-[#18211d]">
            현재는 신청할 수 없습니다.
          </h2>
          <p className="mt-3 text-sm font-semibold leading-7 text-[#314039]">
            {getSponsorshipBlockedReason(currentStatus)}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/students" className="btn-secondary">
              학생 목록으로 돌아가기
            </Link>
            <Link href="/project" className="btn-primary">
              결연 정책 다시 보기
            </Link>
          </div>
        </section>
      ) : (
        <div className="grid min-w-0 gap-6 [width:min(100%,358px)] sm:w-full lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <aside className="rounded-lg border border-[#d8d3c8] bg-[#fffdf8] p-6 shadow-[0_18px_44px_rgba(32,41,38,0.08)] lg:sticky lg:top-28">
            <h2 className="font-serif text-2xl font-black leading-tight text-[#18211d]">
              신청 전 확인할 것
            </h2>
            <ol className="mt-5 space-y-4 text-sm font-semibold leading-7 text-[#314039]">
              <li className="border-l-2 border-[#486f5b] pl-4">
                한 학생에게는 한 분의 후원자만 연결됩니다.
              </li>
              <li className="border-l-2 border-[#d7a33f] pl-4">
                신청 후 해밀학교에서 직접 연락드려 절차를 안내합니다.
              </li>
              <li className="border-l-2 border-[#3e6ea8] pl-4">
                확정된 결연은 학생의 3년 학업과 학교생활 지원에 사용됩니다.
              </li>
            </ol>
          </aside>

          <section className="rounded-lg border border-[#d8d3c8] bg-[#fffdf8] p-5 shadow-[0_18px_44px_rgba(32,41,38,0.08)] sm:p-7">
            <SponsorshipRequestForm
              student={selectedStudent}
              action={submitSponsorshipRequest}
              initialState={initialState}
              scholarshipTypeLabel={getScholarshipSupportTierLabel(scholarshipType)}
              scholarshipAmount={scholarshipAmount}
            />
          </section>
        </div>
      )}
      </div>
    </div>
  );
}
