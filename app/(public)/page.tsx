import type { Metadata } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { StudentCard } from "@/components/public/student-card";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { buildDbErrorMessage, logDbLoadError } from "@/lib/db/debug";
import { getSettings } from "@/lib/repositories/settings";
import { getSponsorships } from "@/lib/repositories/sponsorships";
import { getStudents } from "@/lib/repositories/students";
import { ADMIN_SETTINGS_KEYS } from "@/lib/settings/admin-settings";
import { withStudentUiFallbackList } from "@/lib/students/ui";
import { SponsorshipRecord, StudentProfile } from "@/types";

const DEFAULT_TARGET_STUDENT_COUNT = 60;

export const metadata: Metadata = {
  title: "해밀학교 생활관비 1:1 결연 후원",
  description:
    "해밀학교 다문화학교 학생들의 생활관비를 위한 1:1 결연 교육 후원. 결연 현황과 후원 절차를 확인하고 참여할 수 있습니다.",
  keywords: [
    "해밀학교",
    "다문화학교",
    "생활관비 후원",
    "1:1 결연",
    "교육 후원",
  ],
  openGraph: {
    title: "해밀학교 생활관비 1:1 결연 후원",
    description:
      "다문화학교 학생들의 생활관비를 함께 지원하는 해밀학교 교육 후원 프로젝트",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "해밀학교 생활관비 1:1 결연 후원",
    description:
      "학생 1명당 후원자 1명 결연 원칙으로 운영되는 해밀학교 생활관비 후원 서비스",
  },
};

export const dynamic = "force-dynamic";

function resolveTargetStudentCount(settings: Array<{ settingKey: string; settingValue: string }>): number {
  const value = settings.find(
    (setting) => setting.settingKey === ADMIN_SETTINGS_KEYS.targetStudentCount,
  )?.settingValue;

  if (!value) {
    return DEFAULT_TARGET_STUDENT_COUNT;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_TARGET_STUDENT_COUNT;
  }

  return parsed;
}

function getPublicSponsorMessages(sponsorships: SponsorshipRecord[]) {
  return sponsorships
    .filter((item) => item.sponsorPublic && item.sponsorMessage?.trim())
    .map((item) => ({
      id: item.id,
      sponsorName: item.sponsorName,
      message: item.sponsorMessage?.trim() ?? "",
    }));
}

export default async function HomePage() {
  noStore();

  let students: StudentProfile[] = [];
  let sponsorships: SponsorshipRecord[] = [];
  let targetStudentCount = DEFAULT_TARGET_STUDENT_COUNT;
  let dbErrorMessage: string | null = null;

  try {
    const [loadedStudents, loadedSponsorships, loadedSettings] = await Promise.all([
      getStudents(),
      getSponsorships(),
      getSettings(),
    ]);

    students = withStudentUiFallbackList(loadedStudents);
    sponsorships = loadedSponsorships;
    targetStudentCount = resolveTargetStudentCount(loadedSettings);
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
  const progressBase =
    totalStudentCount > 0
      ? totalStudentCount
      : targetStudentCount > 0
        ? targetStudentCount
        : DEFAULT_TARGET_STUDENT_COUNT;
  const progressRate =
    progressBase > 0 ? Math.round((matchedCount / progressBase) * 100) : 0;

  const representativeStudents = students.slice(0, 3);
  const publicSponsorMessages = getPublicSponsorMessages(sponsorships).slice(0, 3);

  return (
    <div className="pb-16">
      <section className="container-base grid gap-8 pt-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div className="space-y-6">
          <p className="inline-flex rounded-full bg-[#fce5d1] px-4 py-1 text-xs font-bold tracking-[0.1em] text-[#915831]">
            해밀학교 생활관비 1:1 결연 후원
          </p>
          <h1 className="font-serif text-4xl leading-tight font-extrabold text-[#2f2017] md:text-5xl">
            학생들이 생활의 걱정보다
            <br />
            꿈에 집중할 수 있도록 함께해주세요
          </h1>
          <div className="max-w-2xl space-y-4 text-base leading-7 text-[#5e4a3d]">
            <p>
              해밀학교의 학생들은 다문화·중도입국 가정이라는 다양한 환경
              속에서도 자신의 꿈을 포기하지 않고 배움을 이어가기 위해 학교와
              기숙사에서 함께 생활하고 있습니다.
            </p>
            <p>
              하지만 아이들이 안정된 환경에서 공부를 계속하기 위해서는 매달
              필요한 생활관비 지원이 꼭 필요합니다. 생활의 부담이 커질수록
              아이들은 배움보다 현실을 먼저 걱정해야 하기 때문입니다.
            </p>
            <p>
              여러분의 결연 후원은 단순한 생활비 지원이 아니라, 아이들이 걱정
              대신 꿈을 이야기하고, 오늘보다 더 나은 내일을 준비할 수 있도록
              지켜주는 따뜻한 응원입니다.
            </p>
            <p>
              특히 다문화·중도입국 학생들에게 해밀학교는 단순한 학교를 넘어,
              안전하게 머물고 다시 자신의 가능성을 믿어볼 수 있는 소중한 삶의
              터전이 되고 있습니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/students" className="btn-primary">
              학생 만나기
            </Link>
            <Link href="/project" className="btn-secondary">
              후원 절차 보기
            </Link>
          </div>
        </div>

        <aside className="surface-card p-6 md:justify-self-end md:p-7">
          <h2 className="text-xl font-bold text-[#2f221a]">결연 현황</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-[#fff2e6] p-5">
              <p className="text-xs font-medium text-[#7b5a46]">
                결연 대기 수
              </p>
              <p className="mt-1 text-2xl font-bold">{unmatchedCount}명</p>
            </div>
            <div className="rounded-xl bg-[#fff8df] p-5">
              <p className="text-xs font-medium text-[#7b5a46]">결연 완료 수</p>
              <p className="mt-1 text-2xl font-bold">{matchedCount}명</p>
            </div>
            <div className="rounded-xl bg-[#ebf3ff] p-5 sm:col-span-2">
              <p className="mt-1 text-2xl font-bold text-[#2e3b57]">
                <span className="rounded-md bg-[#ffe7d4] px-2 py-0.5 text-[var(--brand-strong)]">
                  {matchedCount}
                </span>{" "}
                /{progressBase}명 결연 완료
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#d9e5f8]">
                <div
                  className="h-full rounded-full bg-[#5f82c8]"
                  style={{ width: `${progressRate}%` }}
                />
              </div>
            </div>
          </div>
          {dbErrorMessage ? (
            <p className="mt-4 rounded-xl border border-[#f0dfca] bg-[#fff8ef] px-3 py-2 text-xs text-[#7a563f]">
              {dbErrorMessage}
            </p>
          ) : null}
        </aside>
      </section>

      <section className="container-base mt-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-[#8f6f5a]">대표 학생 카드</p>
            <h2 className="section-title mt-2">함께 만나볼 학생들</h2>
          </div>
          <Link href="/students" className="text-sm font-semibold text-[#9f592b]">
            전체 학생 보기
          </Link>
        </div>
        {representativeStudents.length === 0 ? (
          <EmptyStateCard
            title="표시할 학생 정보가 없습니다."
            description="학생 정보가 등록되면 대표 학생 카드가 표시됩니다."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {representativeStudents.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        )}
      </section>

      <section className="container-base mt-14">
        <article className="surface-card p-6">
          <h2 className="text-xl font-bold text-[#2f231b]">후원자 응원 메시지</h2>
          <div className="mt-4 space-y-3">
            {publicSponsorMessages.length === 0 ? (
              <p className="rounded-xl border border-[var(--border)] bg-[#fff8f1] px-4 py-3 text-sm text-[#6f594b]">
                현재 공개된 후원자 응원 메시지가 없습니다.
              </p>
            ) : (
              publicSponsorMessages.map((item) => (
                <blockquote
                  key={item.id}
                  className="rounded-xl border border-[var(--border)] bg-[#fff8f1] p-4"
                >
                  <p className="text-sm leading-6 text-[#5b473a]">{item.message}</p>
                  <footer className="mt-2 text-xs font-semibold text-[#8f6f5a]">
                    후원자 {item.sponsorName}
                  </footer>
                </blockquote>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="container-base mt-14">
        <div className="surface-card grid gap-4 bg-gradient-to-r from-[#fce6d3] to-[#f9eddc] p-7 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="font-serif text-3xl leading-tight font-bold text-[#2f2118] md:text-4xl">
              한 번의 후원이 학생의 한 학기를 지탱합니다
            </h2>
          </div>
          <Link href="/students" className="btn-primary">
            지금 결연 신청하기
          </Link>
        </div>
      </section>
    </div>
  );
}
