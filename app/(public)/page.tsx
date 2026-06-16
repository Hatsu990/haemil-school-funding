import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import {
  SponsorMessageCarousel,
  type SponsorMessageCarouselItem,
} from "@/components/public/sponsor-message-carousel";
import { StatusPill } from "@/components/ui/status-pill";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { StudentProfileImage } from "@/components/ui/student-profile-image";
import { buildDbErrorMessage, logDbLoadError } from "@/lib/db/debug";
import { buildScholarshipViews } from "@/lib/repositories/scholarships";
import { getSponsorships } from "@/lib/repositories/sponsorships";
import { getStudents } from "@/lib/repositories/students";
import {
  SCHOLARSHIP_AMOUNT_BY_TYPE,
  formatScholarshipRatio,
  getScholarshipSupportTierLabel,
} from "@/lib/scholarships";
import {
  getSponsorshipBlockedReason,
  isSponsorshipRequestable,
} from "@/lib/sponsorship/policy";
import { getPublicStudentName } from "@/lib/students/display";
import { sortStudentsByRequestPriority } from "@/lib/students/sort";
import { withStudentUiFallbackList } from "@/lib/students/ui";
import { ScholarshipType, StudentProfile } from "@/types";
import { getStudentStatusClass, getStudentStatusLabel } from "@/lib/utils";

export const metadata: Metadata = {
  title: "해밀학교 3년 장학금 결연",
  description:
    "중학교 3년 동안 경제적인 걱정보다 배움과 꿈에 집중할 수 있도록, 한 학생과 한 후원자가 따뜻하게 이어집니다.",
  keywords: [
    "해밀학교",
    "3년 장학금 결연",
    "다문화학교 후원",
    "중학교 장학금",
    "1:1 결연",
  ],
  openGraph: {
    title: "해밀학교 3년 장학금 결연",
    description:
      "한 학생의 중학교 3년이 경제적인 걱정보다 배움과 꿈에 가까워지도록 이어지는 장학금 결연입니다.",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "해밀학교 3년 장학금 결연",
    description:
      "한 학생과 한 후원자가 3년 동안 따뜻하게 이어지는 해밀학교 장학금 결연입니다.",
  },
};

export const dynamic = "force-dynamic";

type SupportTier = {
  number: string;
  name: string;
  amountLabel: string;
  scholarshipType: ScholarshipType;
  visual: "sprout" | "growth" | "fruit";
  assetSrc: string;
  description: string;
  color: string;
};

const supportTiers: SupportTier[] = [
  {
    number: "3",
    name: "새싹후원",
    amountLabel: "월 30,000원",
    scholarshipType: "부분장학금",
    visual: "sprout",
    assetSrc: "/images/support/sprout-support.png",
    description: "작은 시작을 꾸준한 배움으로 이어 주는 후원군입니다.",
    color: "#78A96B",
  },
  {
    number: "5",
    name: "성장후원",
    amountLabel: "월 50,000원",
    scholarshipType: "반액장학금",
    visual: "growth",
    assetSrc: "/images/support/growth-support.png",
    description: "학교 생활의 부담을 덜고 관계와 배움에 집중하게 돕는 후원군입니다.",
    color: "#4C7DB8",
  },
  {
    number: "10",
    name: "열매후원",
    amountLabel: "월 100,000원",
    scholarshipType: "전액장학금",
    visual: "fruit",
    assetSrc: "/images/support/fruit-support.png",
    description: "3년의 배움 전체를 가장 든든하게 지지하는 후원군입니다.",
    color: "#C85D4C",
  },
];

const storySteps = [
  {
    year: "1학년",
    title: "걱정보다 적응에 마음을 씁니다",
    text: "처음 만나는 학교 생활 안에서 한 학생은 비용 걱정보다 친구, 수업, 기숙사 생활에 마음을 둘 수 있습니다.",
  },
  {
    year: "2학년",
    title: "배움과 관계가 오래 머뭅니다",
    text: "안정적인 지원 속에서 학생은 불안을 줄이고, 진로와 인간관계, 그리고 자신만의 가능성을 더 깊이 고민할 수 있습니다.",
  },
  {
    year: "3학년",
    title: "받은 연결을 축복으로 기억합니다",
    text: "마지막 학년에는 다음 길을 준비하며, 누군가 자신을 믿고 지켜 주었다는 사실을 힘으로 삼습니다.",
  },
] as const;

const fallbackSponsorMessages: SponsorMessageCarouselItem[] = [
  {
    id: "fallback-1",
    sponsorName: "박*은",
    message: "안전한 생활 속에서 마음껏 꿈을 키워가면 좋겠습니다.",
  },
  {
    id: "fallback-2",
    sponsorName: "최*우",
    message: "오늘의 노력이 내일의 좋은 기회로 이어지기를 바랍니다.",
  },
  {
    id: "fallback-3",
    sponsorName: "정*아",
    message: "멀리서도 따뜻한 마음으로 학생들의 성장을 함께 응원합니다.",
  },
  {
    id: "fallback-4",
    sponsorName: "한*준",
    message: "걱정보다 기대가 더 큰 하루를 보낼 수 있기를 바랍니다.",
  },
];

function formatWon(amount: number): string {
  return new Intl.NumberFormat("ko-KR").format(amount);
}

function getScholarshipCount(students: StudentProfile[], type: ScholarshipType): number {
  return students.filter((student) => student.scholarshipType === type).length;
}

function getPercentOfTotal(count: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((count / total) * 100);
}

function maskSponsorName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length <= 1) return trimmed || "익명";
  if (trimmed.length === 2) return `${trimmed[0]}*`;

  return `${trimmed[0]}*${trimmed.slice(-1)}`;
}

function TierIllustration({ tier }: { tier: SupportTier }) {
  return (
    <div className="relative h-32 overflow-hidden rounded-lg border border-black/5 bg-white shadow-inner">
      <Image
        src={tier.assetSrc}
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 30vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#fffdf8]/96 via-[#fffdf8]/62 to-transparent" />
      <div className="absolute left-4 top-4 text-[#202926]">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black leading-none">{tier.number}</span>
          <span className="text-base font-black">{tier.name}</span>
        </div>
        <p className="mt-1 text-xs font-black" style={{ color: tier.color }}>
          {tier.amountLabel}
        </p>
      </div>
    </div>
  );
}

function HeroDeskScene({ steps }: { steps: typeof storySteps }) {
  return (
    <div
      className="relative min-h-[440px] min-w-0 max-w-full overflow-hidden [width:min(100%,calc(100vw-2rem))] sm:min-h-[560px] sm:w-full lg:min-h-[620px] lg:overflow-visible"
      aria-label="학생의 3년을 상징하는 책상 장면"
    >
      <div className="absolute inset-x-0 bottom-[4%] top-[13%] rounded-lg bg-[linear-gradient(135deg,#E9D7AB,#D7B96F)] shadow-[0_46px_100px_rgba(31,41,37,0.16)]" />
      <div className="absolute bottom-[4%] left-[4%] right-[5%] z-[5] h-[30%] rotate-[1deg] overflow-hidden rounded-b-md border border-[#E3D0A9] bg-[#FFF9E8] shadow-[0_10px_26px_rgba(31,41,37,0.08)]">
        <div
          className="absolute inset-x-[-8%] top-[-34%] h-[80%] rounded-[0_0_50%_50%] border-b border-[#E3D0A9] bg-[#FFF9E8]"
          aria-hidden
        />
      </div>
      <div className="absolute left-[8%] right-[12%] top-[8%] z-10 h-[78%] -rotate-2 overflow-hidden rounded-md border border-[#D7CDBB] bg-[#FFFDF8] shadow-[0_26px_70px_rgba(31,41,37,0.16)]">
        <div className="absolute inset-x-7 bottom-0 top-[48px] bg-[repeating-linear-gradient(0deg,transparent_0,transparent_43px,#ECE2D1_44px)]" />
        <div className="absolute inset-x-0 bottom-0 h-[28%] bg-[linear-gradient(180deg,rgba(255,253,248,0),#FFFDF8_78%)]" />
        <div className="relative z-10 grid gap-3 px-7 py-10 sm:px-9 sm:py-12">
          {steps.map((step, index) => (
            <div key={step.year}>
              <span
                className={[
                  "inline-flex min-h-6 items-center rounded-full px-3 text-xs font-black",
                  index === 0
                    ? "bg-[#EDF5EF] text-[#2F6F5E]"
                    : index === 1
                      ? "bg-[#EDF3FB] text-[#3E6EA8]"
                      : "bg-[#FFF2D7] text-[#AA731B]",
                ].join(" ")}
              >
                {step.year}
              </span>
              <p className="mt-2 max-w-[26rem] text-lg font-black leading-snug text-[#202926] [word-break:keep-all]">
                {step.title}
              </p>
              <p className="mt-1 max-w-[25rem] text-xs font-bold leading-6 text-[#68736F] [word-break:keep-all] sm:text-sm">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute right-[3%] top-[20%] z-20 w-[34%] rotate-3 rounded-md border border-[#D7CDBB] bg-white p-3 shadow-[0_22px_54px_rgba(31,41,37,0.17)]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-[#F7F3EA]">
          <Image
            src="/images/haemill/people-activity-1.jpg"
            alt="해밀학교 학생들이 함께 찍은 사진"
            fill
            className="object-cover object-[center_36%]"
            sizes="(max-width: 1024px) 34vw, 240px"
          />
        </div>
        <div className="mt-2 h-2 rounded-full bg-[#F1E7D6]" />
      </div>
      <div className="absolute bottom-[4%] left-[4%] right-[5%] z-20 h-[20%] rotate-[1deg] overflow-hidden rounded-b-md border border-[#D7CDBB] bg-[#FFF1C8] shadow-[0_18px_42px_rgba(31,41,37,0.14)]" />
      <div className="absolute bottom-[9%] right-[11%] z-20 h-[18px] w-[31%] -rotate-[18deg] rounded-l-full bg-[#D86F5A] shadow-[0_12px_22px_rgba(31,41,37,0.18)]">
        <div
          className="absolute left-full top-0 h-[18px] w-[58px] bg-[linear-gradient(90deg,#F0C372_0%,#F8DFAA_64%,#F3D091_100%)]"
          style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }}
        />
        <div
          className="absolute left-[calc(100%+45px)] top-[5px] h-[8px] w-[9px] rounded-r-full bg-[#242923]"
          style={{ clipPath: "polygon(0 10%, 72% 20%, 100% 50%, 72% 80%, 0 90%)" }}
        />
      </div>
    </div>
  );
}

function HomeStudentPreviewCard({
  student,
  index,
}: {
  student: StudentProfile;
  index: number;
}) {
  const publicStudentName = getPublicStudentName(student);
  const requestable = isSponsorshipRequestable(student.sponsorshipStatus);
  const scholarshipLabel = student.scholarshipType
    ? getScholarshipSupportTierLabel(student.scholarshipType)
    : "후원군 준비 중";
  const letterImageUrl = student.letterImageUrl?.trim() ?? "";
  const hasLetterImage = letterImageUrl.length > 0;
  const blockedReason = requestable
    ? "학생 1명당 후원자 1명 결연 원칙으로 운영됩니다."
    : getSponsorshipBlockedReason(student.sponsorshipStatus);

  return (
    <article
      className={[
        "overflow-hidden rounded-lg border border-[#d8d3c8] bg-[#fffdf8] shadow-[0_16px_38px_rgba(32,41,38,0.08)]",
        index > 0 ? "hidden md:block" : "",
      ].join(" ")}
    >
      <div className="border-b border-[#e5dccb] bg-[#f6efe3] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <StudentProfileImage
              src={student.profileImageUrl}
              alt={`${publicStudentName} 학생 프로필 이미지`}
              className="w-20 shrink-0 rounded-lg border border-white/80 shadow-[0_12px_24px_rgba(32,41,38,0.10)]"
              priority
            />
            <div className="min-w-0">
              <h3 className="truncate text-xl font-black text-[#202926]">
                {publicStudentName}
              </h3>
              <p className="mt-1 text-sm font-bold text-[#3F4A46]">
                {student.gender} · {student.grade}
              </p>
            </div>
          </div>
          <StatusPill
            label={getStudentStatusLabel(student.sponsorshipStatus)}
            className={getStudentStatusClass(student.sponsorshipStatus)}
          />
        </div>
        <div className="mt-4 inline-flex rounded-full border border-[#2F6F5E]/15 bg-[#fffdf8] px-3 py-1.5 text-xs font-black text-[#204C3F] shadow-sm">
          {scholarshipLabel}
        </div>
      </div>

      <div className="space-y-4 p-4">
        <p className="line-clamp-3 text-sm font-semibold leading-7 text-[#3F4A46] [word-break:keep-all]">
          {student.description}
        </p>
        <div className="overflow-hidden rounded-lg border border-[#e3d8c4] bg-[#f7f3ea]">
          <div className="border-b border-[#e3d8c4] px-3 py-2 text-xs font-black text-[#6C5A43]">
            꿈편지
          </div>
          {hasLetterImage ? (
            <div className="relative aspect-[16/9] bg-[#fffdf8]">
              <Image
                src={letterImageUrl}
                alt={`${publicStudentName} 학생 꿈편지 이미지`}
                fill
                unoptimized
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 30vw"
              />
            </div>
          ) : (
            <div className="grid min-h-20 place-items-center px-4 py-5 text-center text-xs font-bold leading-5 text-[#786B5C]">
              꿈편지 준비 중
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {hasLetterImage ? (
            <a
              href={letterImageUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary flex-1 py-2 text-center"
            >
              꿈편지 보기
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="btn-secondary flex-1 py-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              꿈편지 준비 중
            </button>
          )}
          {requestable ? (
            <Link
              href={`/students/${student.id}/sponsorship`}
              className="btn-primary flex-1 py-2 text-center"
            >
              결연 신청
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="btn-primary flex-1 py-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              신청 불가
            </button>
          )}
        </div>
        <p className="text-xs font-semibold leading-5 text-[#52615C]">
          {blockedReason}
        </p>
      </div>
    </article>
  );
}

export default async function HomePage() {
  noStore();

  let students: StudentProfile[] = [];
  let sponsorMessages: SponsorMessageCarouselItem[] = [];
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
    logDbLoadError("home page", error);
    dbErrorMessage = buildDbErrorMessage(
      "일부 운영 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    );
  }

  try {
    const sponsorships = await getSponsorships();
    sponsorMessages = sponsorships
      .filter((item) => {
        return (
          item.status === "입금완료" &&
          item.sponsorPublic &&
          Boolean(item.sponsorMessage?.trim())
        );
      })
      .slice(0, 12)
      .map((item) => ({
        id: item.id,
        sponsorName: maskSponsorName(item.sponsorName),
        message: item.sponsorMessage?.trim() ?? "",
      }));
  } catch (error) {
    logDbLoadError("home sponsor messages", error);
  }

  const totalStudentCount = students.length;
  const matchedCount = students.filter(
    (student) => student.sponsorshipStatus === "matched",
  ).length;
  const waitingCount = students.filter(
    (student) => student.sponsorshipStatus !== "matched",
  ).length;
  const previewStudents = sortStudentsByRequestPriority(students).slice(0, 3);

  return (
    <div className="bg-[#F7F5EF] text-[#202926]">
      <section className="relative overflow-hidden border-b border-[#D8D3C8] bg-[#F6F2E8]">
        <div className="absolute inset-x-0 top-0 h-[82%] overflow-hidden">
          <Image
            src="/images/haemill/school-campus-2.png"
            alt=""
            fill
            aria-hidden
            priority
            className="scale-105 object-cover object-center opacity-45 blur-[2px] saturate-[0.95]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(246,242,232,0.86)_0%,rgba(246,242,232,0.72)_48%,rgba(246,242,232,0.58)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-b from-transparent via-[#F6F2E8]/68 to-[#F6F2E8]" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-b from-transparent via-[#F6F2E8]/62 to-[#F6F2E8]" />
        <div className="container-home relative z-10 grid min-h-[calc(100svh-112px)] gap-8 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:grid-rows-[auto_auto] lg:items-center lg:gap-x-12 lg:gap-y-0 lg:py-16">
          <div className="relative z-10 order-1 min-w-0 max-w-3xl [width:min(100%,calc(100vw-2rem))] sm:w-full lg:col-start-1 lg:row-start-1">
            <h1 className="max-w-[min(46rem,calc(100vw-2rem))] font-serif text-[2.5rem] font-black leading-[1.13] text-[#202926] [word-break:keep-all] sm:max-w-[46rem] sm:text-[3.25rem] lg:text-[3.65rem] xl:text-[3.9rem]">
              <span className="block">한 학생의</span>
              <span className="block">중학교 3년을,</span>
              <span className="block">한 후원자가 함께</span>
              <span className="block">걸어갑니다</span>
            </h1>
            <p className="mt-6 max-w-[min(42rem,calc(100vw-2rem))] text-lg font-semibold leading-9 text-[#3F4A46] [word-break:keep-all] sm:max-w-2xl">
              <span className="block">
                매달의 후원은 단순한 금액이 아니라 36번의 안심이 됩니다.
              </span>
              <span className="block">
                경제적인 걱정보다 배움과 꿈에 집중할 수 있도록,
              </span>
              <span className="block">
                한 학생과 한 후원자가 따뜻하게 이어집니다.
              </span>
            </p>
          </div>

          <div className="order-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <HeroDeskScene steps={storySteps} />
          </div>

          <div className="relative z-10 order-3 min-w-0 max-w-3xl [width:min(100%,calc(100vw-2rem))] sm:w-full lg:col-start-1 lg:row-start-2">
            <div className="mt-0 flex flex-wrap items-center gap-3 lg:mt-8">
              <Link href="/students" className="btn-primary">
                결연을 기다리는 학생 보기
              </Link>
              <Link href="#support-tiers" className="btn-secondary">
                후원군 살펴보기
              </Link>
            </div>
            <div className="mt-8 grid max-w-[min(36rem,calc(100vw-2rem))] grid-cols-1 gap-3 sm:max-w-xl sm:grid-cols-3 lg:max-w-[48rem] lg:gap-6">
              <div className="border-l-2 border-[#2F6F5E] pl-3 lg:border-l-[3px] lg:pl-4">
                <p className="text-2xl font-black lg:text-[2.1rem] lg:leading-none">
                  {totalStudentCount}명
                </p>
                <p className="mt-1 text-xs font-bold text-[#68736F] lg:mt-2 lg:text-[0.95rem]">
                  전체 학생
                </p>
              </div>
              <div className="border-l-2 border-[#D7A33F] pl-3 lg:border-l-[3px] lg:pl-4">
                <p className="text-2xl font-black lg:text-[2.1rem] lg:leading-none">
                  {waitingCount}명
                </p>
                <p className="mt-1 text-xs font-bold text-[#68736F] lg:mt-2 lg:text-[0.95rem]">
                  결연 대기
                </p>
              </div>
              <div className="border-l-2 border-[#3E6EA8] pl-3 lg:border-l-[3px] lg:pl-4">
                <p className="text-2xl font-black lg:text-[2.1rem] lg:leading-none">
                  {matchedCount}명
                </p>
                <p className="mt-1 text-xs font-bold text-[#68736F] lg:mt-2 lg:text-[0.95rem]">
                  결연 완료
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {dbErrorMessage ? (
        <section className="container-home mt-6">
          <p className="border border-[#EAC8B8] bg-[#FFF7F1] px-5 py-4 text-sm font-semibold text-[#8A4C3A]">
            {dbErrorMessage}
          </p>
        </section>
      ) : null}

      <section className="container-home py-14 lg:py-18">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <h2 className="font-serif text-3xl font-black leading-tight [word-break:keep-all] sm:text-4xl">
              <span className="block">후원은 금액보다 먼저,</span>
              <span className="block">한 학생의 3년을 지켜주는 약속입니다</span>
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {storySteps.map((step) => (
              <article
                key={step.year}
                className="rounded-lg border border-[#d8d3c8] bg-[#fffdf8] p-5 shadow-[0_14px_34px_rgba(32,41,38,0.06)]"
              >
                <p className="text-sm font-black text-[#2F6F5E]">{step.year}</p>
                <h3 className="mt-3 text-xl font-black leading-snug [word-break:keep-all]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm font-semibold leading-7 text-[#68736F] [word-break:keep-all]">
                  {step.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#D8D3C8] bg-[#f4f0e7]">
        <div className="container-home grid gap-8 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <h2 className="font-serif text-3xl font-black leading-tight [word-break:keep-all] sm:text-4xl">
              <span className="block">한 학생의 오늘과 내일을</span>
              <span className="block">함께 이어가는 36개월의 약속</span>
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
            {["학생 선택", "결연 연결", "3년 함께하기"].map((label, index) => (
              <div key={label} className="contents">
                <div className="rounded-lg border border-[#d8d3c8] bg-[#fffdf8] p-5 text-center shadow-[0_14px_34px_rgba(32,41,38,0.06)]">
                  <p className="text-xs font-black text-[#68736F]">STEP {index + 1}</p>
                  <p className="mt-2 text-2xl font-black">{label}</p>
                </div>
                {index < 2 ? (
                  <div className="hidden h-px w-12 bg-[#D8D3C8] sm:block" aria-hidden />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="support-tiers" className="container-home py-14 lg:py-18">
        <div className="mb-7 max-w-3xl">
          <h2 className="font-serif text-3xl font-black leading-tight [word-break:keep-all] sm:text-4xl">
            <span className="block">작은 후원이 모여</span>
            <span className="block">학생의 3년을 지켜줍니다</span>
          </h2>
          <p className="mt-4 text-base font-semibold leading-8 text-[#68736F] [word-break:keep-all]">
            <span className="block">
              3 새싹후원, 5 성장후원, 10 열매후원 중 원하는 방식으로
            </span>
            <span className="block">학생의 배움과 성장을 함께 응원할 수 있습니다.</span>
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {supportTiers.map((tier) => {
            const count = getScholarshipCount(students, tier.scholarshipType);
            const actualPercent = getPercentOfTotal(count, totalStudentCount);

            return (
              <article
                key={tier.name}
                className="rounded-lg border border-[#d8d3c8] bg-[#fffdf8] p-4 shadow-[0_14px_32px_rgba(32,41,38,0.07)]"
              >
                <TierIllustration tier={tier} />
                <div className="mt-4">
                  <p className="text-xl font-black">
                    {tier.number} {tier.name}
                  </p>
                  <p className="mt-1 text-sm font-black text-[#2F6F5E]">
                    {tier.amountLabel}
                  </p>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[#68736F]">
                    {tier.description}
                  </p>
                  <div className="mt-4 border-t border-[#D8D3C8] pt-4 text-sm font-bold leading-6 text-[#3F4A46]">
                    <p>후원군 {getScholarshipSupportTierLabel(tier.scholarshipType)}</p>
                    <p>월 {formatWon(SCHOLARSHIP_AMOUNT_BY_TYPE[tier.scholarshipType])}원</p>
                    <p>
                      학생 비율 {formatScholarshipRatio(tier.scholarshipType)}
                      {totalStudentCount > 0 ? `, 현재 ${actualPercent}%` : ""}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <div className="mt-7">
          <Link href="/students" className="btn-secondary">
            학생 목록에서 후원군 살펴보기
          </Link>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-[#D8D3C8] py-16 text-white lg:py-20">
        <Image
          src="/images/haemill/people-activity-5.jpg"
          alt=""
          fill
          aria-hidden
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#18211d_0%,rgba(24,33,29,0.88)_46%,rgba(70,58,44,0.64)_100%)]" />
        <div className="absolute inset-0 bg-[#fffdf8]/8" />
        <div className="container-home relative z-10">
          <div className="mx-auto mb-9 max-w-3xl text-center">
            <h2 className="font-serif text-3xl font-black leading-tight [word-break:keep-all] sm:text-4xl">
              <span className="block">아이들의 내일을</span>
              <span className="block">함께 만들어가는 마음</span>
            </h2>
            <p className="mt-4 text-base font-semibold leading-8 text-[#edf3ed] [word-break:keep-all]">
              <span className="block">
                후원자님들의 따뜻한 응원은 학생들이 학교와 기숙사에서
              </span>
              <span className="block">
                자신의 내일을 준비하는 데 든든한 힘이 됩니다.
              </span>
            </p>
          </div>
          <SponsorMessageCarousel
            messages={sponsorMessages.length > 0 ? sponsorMessages : fallbackSponsorMessages}
          />
        </div>
      </section>

      <section id="home-students-preview" className="container-home pb-16">
        <div className="border-t border-[#D8D3C8] pt-10">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-3xl font-black leading-tight [word-break:keep-all]">
                <span className="block">함께 만나볼 학생들</span>
              </h2>
              <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-[#68736F] [word-break:keep-all]">
                학생의 소개와 꿈편지 상태를 확인한 뒤, 마음이 닿는 학생에게
                3년 결연을 이어갈 수 있습니다.
              </p>
            </div>
            <Link href="/students" className="btn-secondary">
              전체 학생 보기
            </Link>
          </div>
          {previewStudents.length === 0 ? (
            <EmptyStateCard
              title="표시할 학생 정보가 없습니다."
              description="학생 정보가 등록되면 이 영역에 표시됩니다."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {previewStudents.map((student, index) => (
                <HomeStudentPreviewCard
                  key={student.id}
                  student={student}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
