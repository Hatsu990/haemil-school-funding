import type { Metadata } from "next";

const values = [
  {
    title: "다문화 포용 교육",
    body: "해밀학교는 다문화 학생이 언어와 문화 차이를 넘어 안정적으로 적응할 수 있도록 공동체 중심 교육을 운영합니다.",
  },
  {
    title: "기숙사 기반 생활 교육",
    body: "학생들이 생활관에서 안전하게 생활하며 학습 리듬을 유지할 수 있도록 생활지도와 학습지도를 연계합니다.",
  },
  {
    title: "진로 연계 성장 지원",
    body: "예체능, 기술, 인문 분야의 맞춤 프로그램으로 학생이 스스로 진로를 탐색할 수 있게 돕습니다.",
  },
];

export const metadata: Metadata = {
  title: "학교 소개",
  description:
    "강원특별자치도 홍천군 해밀학교의 다문화 포용 교육, 기숙사 생활 교육, 진로 연계 지원 방향을 소개합니다.",
  keywords: [
    "해밀학교 소개",
    "다문화학교",
    "대안학교 교육",
    "기숙사 생활 교육",
  ],
  openGraph: {
    title: "학교 소개 | 해밀학교 후원 프로젝트",
    description:
      "해밀학교의 교육 철학과 다문화 학생 지원 방향을 확인해 보세요.",
    url: "/about",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "학교 소개 | 해밀학교 후원 프로젝트",
    description:
      "해밀학교의 교육 철학과 학생 성장 지원 방향을 소개합니다.",
  },
};

export default function AboutPage() {
  return (
    <div className="container-base pb-16 pt-10 sm:pt-12">
      <header className="surface-card overflow-hidden">
        <div className="bg-gradient-to-r from-[#f7d9bd] to-[#fcebd9] p-7 sm:p-8">
          <p className="text-sm font-semibold text-[#8f5a33]">학교 소개</p>
          <h1 className="mt-2 font-serif text-3xl font-bold leading-tight text-[#2f2119] sm:text-4xl">
            해밀학교는 함께 살아가는 힘을 가르칩니다
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#624d3f]">
            해밀학교는 강원특별자치도 홍천군에 위치한 다문화 대안학교입니다.
            학생들이 안전한 기숙사 환경에서 학업과 생활을 함께 성장시킬 수
            있도록 교육하고 있습니다.
          </p>
        </div>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {values.map((value) => (
          <article key={value.title} className="surface-card hover-lift p-6">
            <h2 className="font-serif text-xl font-bold text-[#2c211a]">
              {value.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#5a473a]">{value.body}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="surface-card hover-lift p-6">
          <h2 className="text-lg font-bold text-[#2f231b]">학교 생활</h2>
          <p className="mt-3 text-sm leading-7 text-[#5a473a]">
            학생들은 공동 생활을 통해 기본 생활 습관을 배우고, 방과 후에는
            보충학습과 동아리 활동에 참여합니다. 생활관비 후원은 이 생활의
            지속성을 지키는 핵심 기반입니다.
          </p>
        </article>
        <article className="surface-card hover-lift p-6">
          <h2 className="text-lg font-bold text-[#2f231b]">후원의 의미</h2>
          <p className="mt-3 text-sm leading-7 text-[#5a473a]">
            후원은 단순한 비용 지원을 넘어 학생이 학업을 포기하지 않도록
            지지하는 약속입니다. 1:1 결연 구조를 통해 투명하고 책임 있게 운영
            됩니다.
          </p>
        </article>
      </section>
    </div>
  );
}
