import type { Metadata } from "next";

const processSteps = [
  "학생 선택 및 결연 신청",
  "관리자 확인 후 직접 연락",
  "수동 입금 안내 및 확인",
  "입금 완료 시 결연 완료 처리",
  "문자 안내 및 운영 기록",
];

const donationUsage = [
  { label: "생활관 운영비", value: 45 },
  { label: "학습 지원비", value: 25 },
  { label: "식비/생활 지원", value: 20 },
  { label: "긴급 지원 및 운영 예비비", value: 10 },
];

export const metadata: Metadata = {
  title: "프로젝트 안내",
  description:
    "해밀학교 생활관비 1:1 결연 구조, 후원 절차, 후원금 사용처를 확인할 수 있는 프로젝트 안내 페이지입니다.",
  keywords: [
    "해밀학교 프로젝트",
    "생활관비 후원 절차",
    "1:1 결연 운영",
    "교육 후원 사용처",
  ],
  openGraph: {
    title: "프로젝트 안내 | 해밀학교 후원 프로젝트",
    description:
      "생활관비 교육 후원이 어떻게 운영되는지 단계별로 확인해 보세요.",
    url: "/project",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "프로젝트 안내 | 해밀학교 후원 프로젝트",
    description:
      "후원 절차, 결연 원칙, 후원금 사용처를 한눈에 확인할 수 있습니다.",
  },
};

export default function ProjectPage() {
  return (
    <div className="container-base pb-16 pt-10 sm:pt-12">
      <header className="mb-8">
        <p className="text-sm font-semibold text-[#8d694f]">프로젝트 안내</p>
        <h1 className="section-title mt-2">
          생활관비 후원이 필요한 이유와 운영 방식
        </h1>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="surface-card hover-lift p-6">
          <h2 className="text-xl font-bold text-[#2f231b]">후원 필요성</h2>
          <p className="mt-3 text-sm leading-7 text-[#5a473a]">
            학생 대부분이 기숙사 생활을 하며, 월 약 10만 원의 생활관비가
            발생합니다. 결연 후원은 학생이 생계 걱정 없이 학습과 생활에 집중할
            수 있도록 지원합니다.
          </p>
        </article>
        <article className="surface-card hover-lift p-6">
          <h2 className="text-xl font-bold text-[#2f231b]">핵심 운영 원칙</h2>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-[#5a473a]">
            <li>학생 1명당 후원자 1명</li>
            <li>자동 결제 미사용, 관리자 직접 안내</li>
            <li>입금 완료 기준 결연 확정</li>
            <li>학생 실명/실제 사진 비공개</li>
          </ul>
        </article>
      </section>

      <section className="mt-8">
        <article className="surface-card p-6">
          <h2 className="text-xl font-bold text-[#2f231b]">후원 절차</h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {processSteps.map((step, index) => (
              <li key={step} className="rounded-xl bg-[#fff4e8] p-4">
                <p className="text-xs font-bold text-[#9f5f34]">STEP {index + 1}</p>
                <p className="mt-2 text-sm leading-6 text-[#5d483a]">{step}</p>
              </li>
            ))}
          </ol>
        </article>
      </section>

      <section className="mt-8">
        <article className="surface-card p-6">
          <h2 className="text-xl font-bold text-[#2f231b]">후원금 사용처</h2>
          <div className="mt-4 space-y-4">
            {donationUsage.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-semibold text-[#5a473a]">{item.label}</span>
                  <span className="text-[#7a6557]">{item.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#f2e3d5]">
                  <div
                    className="h-full rounded-full bg-[#d67f45]"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
