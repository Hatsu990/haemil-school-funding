import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import {
  SponsorMessageCarousel,
  SponsorMessageCarouselItem,
} from "@/components/public/sponsor-message-carousel";
import { StudentCard } from "@/components/public/student-card";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { buildDbErrorMessage, logDbLoadError } from "@/lib/db/debug";
import { buildScholarshipViews } from "@/lib/repositories/scholarships";
import { getSponsorships } from "@/lib/repositories/sponsorships";
import { getStudents } from "@/lib/repositories/students";
import { withStudentUiFallbackList } from "@/lib/students/ui";
import { maskStudentRealName } from "@/lib/students/display";
import { sortStudentsByRequestPriority } from "@/lib/students/sort";
import { SponsorshipRecord, StudentProfile } from "@/types";

const activityHighlights = [
  {
    imageSrc: "/images/haemill/people-activity-5.jpg",
    text: "함께 생활하며 배움과 관계를 동시에 키워가는 기숙사 교육",
  },
  {
    imageSrc: "/images/haemill/people-activity-6.jpg",
    text: "서로의 문화를 존중하며 미래를 준비하는 공동체 활동",
  },
] as const;

// TEST DUMMY DATA: 후원자 응원 메시지 노출/전환 효과 확인용입니다.
// 테스트가 끝나면 이 배열과 아래 publicSponsorMessages 병합 부분을 제거하세요.
const TEST_DUMMY_SPONSOR_MESSAGES: SponsorMessageCarouselItem[] = [
  {
    id: "test-sponsor-message-001",
    sponsorName: "김*정",
    message: "작은 응원이 학생의 하루에 든든한 힘이 되기를 바랍니다.",
  },
  {
    id: "test-sponsor-message-002",
    sponsorName: "이*호",
    message: "배움의 길을 포기하지 않고 한 걸음씩 나아가길 응원합니다.",
  },
  {
    id: "test-sponsor-message-003",
    sponsorName: "박*은",
    message: "안전한 생활 속에서 마음껏 꿈을 키워가면 좋겠습니다.",
  },
  {
    id: "test-sponsor-message-004",
    sponsorName: "최*우",
    message: "오늘의 노력이 내일의 좋은 기회로 이어지기를 바랍니다.",
  },
  {
    id: "test-sponsor-message-005",
    sponsorName: "정*아",
    message: "멀리서도 따뜻한 마음으로 학생들의 성장을 함께 응원합니다.",
  },
  {
    id: "test-sponsor-message-006",
    sponsorName: "한*준",
    message: "걱정보다 기대가 더 큰 하루를 보낼 수 있기를 바랍니다.",
  },
  {
    id: "test-sponsor-message-007",
    sponsorName: "윤*린",
    message: "새로운 환경에서도 자신을 믿고 씩씩하게 걸어가길 바랍니다.",
  },
  {
    id: "test-sponsor-message-008",
    sponsorName: "장*원",
    message: "학생들의 꿈이 학교 안에서 더 선명해지기를 응원합니다.",
  },
  {
    id: "test-sponsor-message-009",
    sponsorName: "임*우",
    message: "누군가 함께하고 있다는 마음이 작은 용기가 되면 좋겠습니다.",
  },
  {
    id: "test-sponsor-message-010",
    sponsorName: "강*나",
    message: "건강하게 배우고 생활하며 자신만의 길을 찾아가길 바랍니다.",
  },
];

export const metadata: Metadata = {
  title: "해밀학교 3년 장학금 1:1 결연 후원",
  description:
    "해밀학교 다문화학교 학생들의 학업과 꿈을 위한 3년 장학금 1:1 결연. 결연 현황과 절차를 확인하고 참여할 수 있습니다.",
  keywords: [
    "해밀학교",
    "다문화학교",
    "3년 학업 장학 결연",
    "1:1 결연",
    "장학금 결연",
  ],
  openGraph: {
    title: "해밀학교 3년 장학금 1:1 결연 후원",
    description:
      "다문화학교 학생들의 학업과 성장을 함께 응원하는 해밀학교 3년 장학금 결연 프로젝트",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "해밀학교 3년 장학금 1:1 결연 후원",
    description:
      "학생 1명당 후원자 1명 결연 원칙으로 운영되는 해밀학교 3년 장학금 결연 서비스",
  },
};

export const dynamic = "force-dynamic";

function getPublicSponsorMessages(sponsorships: SponsorshipRecord[]) {
  return sponsorships
    .filter((item) => item.sponsorPublic && item.sponsorMessage?.trim())
    .map((item) => ({
      id: item.id,
      sponsorName: maskStudentRealName(item.sponsorName),
      message: item.sponsorMessage?.trim() ?? "",
    }));
}

export default async function HomePage() {
  noStore();

  let students: StudentProfile[] = [];
  let sponsorships: SponsorshipRecord[] = [];
  let dbErrorMessage: string | null = null;

  try {
    const [loadedStudents, loadedSponsorships] = await Promise.all([
      getStudents(),
      getSponsorships(),
    ]);

    const scholarshipViews = await buildScholarshipViews(
      withStudentUiFallbackList(loadedStudents),
    );
    students = scholarshipViews.map((view) => ({
      ...view.student,
      scholarshipType: view.scholarshipType,
      scholarshipAmount: view.scholarshipAmount,
    }));
    sponsorships = loadedSponsorships;
  } catch (error) {
    logDbLoadError("home page", error);
    dbErrorMessage = buildDbErrorMessage(
      "일부 운영 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    );
  }

  const matchedCount = students.filter(
    (student) => student.sponsorshipStatus === "matched",
  ).length;
  const unmatchedCount = students.filter(
    (student) => student.sponsorshipStatus !== "matched",
  ).length;
  const totalStudentCount = students.length;
  const progressBase = totalStudentCount;
  const progressRate =
    progressBase > 0 ? Math.round((matchedCount / progressBase) * 100) : 0;

  const representativeStudents = sortStudentsByRequestPriority(students).slice(0, 3);
  const publicSponsorMessages = [
    ...TEST_DUMMY_SPONSOR_MESSAGES,
    ...getPublicSponsorMessages(sponsorships),
  ];

  return (
    <div className="relative overflow-hidden pb-16">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[720px] w-[1200px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(72,111,91,0.2)_0%,rgba(198,111,74,0.13)_36%,transparent_68%)] blur-3xl"
      />

      <section className="container-home grid gap-8 pt-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-stretch lg:pt-12 xl:gap-10">
        <article className="flex min-h-[620px] flex-col justify-between rounded-[34px] border border-[#d8d1c4] bg-[#fffdf8]/84 p-6 shadow-[0_26px_70px_rgba(43,54,47,0.13)] backdrop-blur sm:p-8 lg:p-10">
          <div>
            <h1 className="space-y-1 text-[2rem] font-black leading-[1.12] tracking-[-0.03em] text-[#18211d] sm:text-[2.45rem] xl:text-[3.15rem]">
              <span className="block">학생들이</span>
              <span className="block whitespace-nowrap">학업과 꿈에</span>
              <span className="block">
                집중할 수 있도록
                <span className="block sm:inline"> 함께해주세요</span>
              </span>
            </h1>
            <div className="mt-7 max-w-2xl space-y-4 text-base font-semibold leading-8 text-[#1f2b25]">
              <p>
                해밀학교의 학생들은 다문화·중도입국 가정이라는 다양한 환경
                속에서도 자신의 꿈을 포기하지 않고 배움을 이어가기 위해 학교와
                기숙사에서 함께 생활하고 있습니다.
              </p>
              <p>
                결연은 단순한 장학 지원을 넘어 아이들이 걱정 대신 꿈을
                이야기하고 오늘보다 더 나은 내일을 준비할 수 있도록 지켜주는
                따뜻한 응원입니다.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/students" className="btn-primary">
                학생 만나기
              </Link>
              <Link href="/project" className="btn-secondary">
                후원 절차 보기
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {activityHighlights.map((item) => (
              <div
                key={item.text}
                className="group grid grid-cols-[84px_1fr] items-center gap-3 rounded-[22px] border border-[#ded7ca] bg-white/82 p-3 shadow-[0_14px_34px_rgba(43,54,47,0.08)]"
              >
                <div className="relative h-20 overflow-hidden rounded-2xl bg-[#e9e1d2]">
                  <Image
                    src={item.imageSrc}
                    alt=""
                    aria-hidden
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="84px"
                  />
                </div>
                <p className="text-sm font-bold leading-6 text-[#29362f]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </article>

        <aside className="grid min-h-[620px] gap-4 md:grid-cols-[1fr_0.72fr] lg:grid-cols-[1fr_0.68fr]">
          <div className="relative min-h-[420px] overflow-hidden rounded-[34px] bg-[#18211d] shadow-[0_28px_76px_rgba(43,54,47,0.22)]">
            <Image
              src="/images/haemill/people-activity-4.jpg"
              alt="해밀학교 전경"
              fill
              priority
              className="object-cover object-[center_24%]"
              sizes="(max-width: 1024px) 100vw, 48vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#18211d]/74 via-[#18211d]/14 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <div className="max-w-md rounded-[26px] border border-white/16 bg-[#18211d]/62 p-5 text-white shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-md">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#dfe8d8]">
                  Haemill School
                </p>
                <p className="mt-3 text-lg font-bold leading-7">
                  해밀학교의 하루는 교실과 기숙사, 그리고 서로를 돌보는 시간으로
                  이어집니다.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <section className="rounded-[34px] border border-[#d8d1c4] bg-[#24372c] p-6 text-white shadow-[0_20px_58px_rgba(43,54,47,0.18)]">
              <h2 className="text-2xl font-black">결연 현황</h2>
              <div className="mt-7 space-y-5">
                <div>
                  <p className="text-sm font-semibold text-[#c7d4c6]">결연 대기 수</p>
                  <p className="mt-1 text-5xl font-black tracking-[-0.04em]">
                    {unmatchedCount}명
                  </p>
                </div>
                <div className="border-t border-white/16 pt-5">
                  <p className="text-sm font-semibold text-[#c7d4c6]">결연 완료 수</p>
                  <p className="mt-1 text-5xl font-black tracking-[-0.04em]">
                    {matchedCount}명
                  </p>
                </div>
                <div className="rounded-3xl bg-white/10 p-4">
                  <p className="text-lg font-black">
                    <span className="text-[#f1d6c4]">{matchedCount}</span> /
                    {progressBase}명 결연 완료
                  </p>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/18">
                    <div
                      className="h-full rounded-full bg-[#f1d6c4]"
                      style={{ width: `${progressRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="relative min-h-[220px] overflow-hidden rounded-[34px] border border-[#d8d1c4] bg-[#f1d6c4]">
              <Image
                src="/images/haemill/school-campus-3.jpg"
                alt=""
                aria-hidden
                fill
                className="object-cover object-[center_30%] mix-blend-multiply opacity-55"
                sizes="(max-width: 1024px) 100vw, 24vw"
              />
            </div>
          </div>
        </aside>
      </section>

      {dbErrorMessage ? (
        <section className="container-home mt-6">
          <p className="rounded-[24px] border border-[#ead7c9] bg-[#fff8ef] px-5 py-4 text-sm text-[#7a563f]">
            {dbErrorMessage}
          </p>
        </section>
      ) : null}

      <section className="container-home mt-16 xl:mt-20">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="section-title mt-2">함께 만나볼 학생들</h2>
          </div>
          <Link
            href="/students"
            className="w-fit rounded-full border border-[#cfdacb] px-4 py-2 text-sm font-bold text-[#284635] transition-colors hover:bg-[#eef4eb]"
          >
            전체 학생 보기
          </Link>
        </div>
        {representativeStudents.length === 0 ? (
          <EmptyStateCard
            title="표시할 학생 정보가 없습니다."
            description="학생 정보가 등록되면 이 영역에 표시됩니다."
          />
        ) : (
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(270px,1fr))] xl:gap-6 2xl:[grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
            {representativeStudents.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        )}
      </section>

      <section className="container-home mt-16 xl:mt-20">
        <article className="relative overflow-hidden rounded-[36px] border border-[#d8d1c4] bg-[#18211d] px-6 py-12 text-center shadow-[var(--shadow-strong)] sm:px-8 sm:py-14 lg:px-10 lg:py-16">
          <Image
            src="/images/haemill/school-campus-1.jpg"
            alt=""
            aria-hidden
            fill
            className="object-cover object-[center_40%] saturate-[0.62] brightness-[0.32]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[#18211d]/52" />
          <div className="relative z-10 mx-auto max-w-4xl">
            <h2 className="text-3xl font-black leading-tight tracking-[-0.02em] text-[#fffdf8] text-balance sm:text-4xl lg:text-5xl">
              아이들의 내일을 함께 만들어가는 마음
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base font-semibold leading-8 text-[#edf3ed] sm:text-lg">
              후원자님들의 따뜻한 응원은 학생들이 학교와 기숙사에서 자신의
              내일을 준비하는 데 든든한 힘이 됩니다.
            </p>
          </div>
          <div className="relative z-10 mt-10">
            <SponsorMessageCarousel messages={publicSponsorMessages} />
          </div>
        </article>
      </section>

      <section className="container-home mt-16 xl:mt-20">
        <div className="relative overflow-hidden rounded-[36px] border border-[#d8d1c4] bg-[#fffdf8] p-7 text-[#18211d] shadow-[var(--shadow-soft)] md:grid md:grid-cols-[1fr_auto] md:items-center md:p-9">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(198,111,74,0.16),transparent_34%),radial-gradient(circle_at_84%_18%,rgba(72,111,91,0.16),transparent_32%)]" />
          <div className="relative z-10">
            <h2 className="max-w-3xl text-3xl font-black leading-tight tracking-[-0.03em] text-balance md:text-4xl">
              한 번의 결연이 학생의 3년을 함께 지켜줍니다
            </h2>
          </div>
          <Link
            href="/students"
            className="relative z-10 mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#24372c] px-6 py-3 text-sm font-black !text-white shadow-[0_14px_28px_rgba(36,55,44,0.2)] transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-[#486f5b] active:translate-y-px md:mt-0"
          >
            지금 결연 신청하기
          </Link>
        </div>
      </section>
    </div>
  );
}
