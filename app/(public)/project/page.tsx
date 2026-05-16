import type { Metadata } from "next";
import Image from "next/image";

const processSteps = [
  {
    title: "마음이 가는 학생을 선택하고 결연을 신청합니다",
    description:
      "학생들의 이야기와 편지를 읽어보고, 응원하고 싶은 학생에게 후원을 신청할 수 있습니다.",
  },
  {
    title: "해밀학교에서 직접 안내드립니다",
    description:
      "후원 신청이 접수되면 관리자가 직접 연락드려 후원 방법과 결연 절차를 안내해드립니다.",
  },
  {
    title: "결연이 완료되고 학생의 생활을 함께 응원합니다",
    description:
      "후원이 확인되면 해당 학생과의 결연이 확정되며, 후원은 학생들의 생활관비와 안정적인 학교생활 지원에 사용됩니다.",
  },
  {
    title: "학교의 이야기와 아이들의 성장을 함께 나눕니다",
    description:
      "해밀학교는 학교 소식과 아이들의 성장 이야기를 꾸준히 전하며, 후원자분들과 따뜻한 연결을 이어가고 있습니다.",
  },
];

export const metadata: Metadata = {
  title: "프로젝트 안내",
  description:
    "해밀학교 생활관비 1:1 결연 구조와 후원 절차를 확인할 수 있는 프로젝트 안내 페이지입니다.",
  keywords: [
    "해밀학교 프로젝트",
    "생활관비 후원 절차",
    "1:1 결연 운영",
    "교육 후원",
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
      "생활관비 후원 절차와 결연 원칙을 한눈에 확인할 수 있습니다.",
  },
};

export default function ProjectPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-10 sm:px-6 sm:pt-12">
      <header className="relative mb-8 overflow-hidden rounded-[32px] border border-[#e9d9cc] shadow-[0_18px_42px_rgba(121,84,53,0.16)] sm:mb-10">
        <Image
          src="/images/haemil/people-activity-6.jpg"
          alt="해밀학교 전경"
          fill
          priority
          className="object-cover object-[center_26%] sm:object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a1b12]/88 via-[#5a3d2b]/72 to-[#d78a4d]/45" />
        <div className="relative z-10 p-8 sm:p-10">
          <p className="text-sm font-semibold text-[#f0d7c0]">프로젝트 안내</p>
          <h1 className="mt-2 font-serif text-3xl font-bold leading-tight text-[#fff8f2] sm:text-4xl">
            생활관비 후원이 필요한 이유와 운영 방식
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[#f7e8db]">
            학생들이 배움을 포기하지 않도록 지키는 생활관비 결연. 후원자와
            학생이 신뢰로 연결되는 과정을 투명하게 안내드립니다.
          </p>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="surface-card relative overflow-hidden p-7 sm:p-8">
          <Image
            src="/images/haemil/school-campus-1.jpg"
            alt=""
            aria-hidden
            fill
            className="object-cover object-[center_34%] opacity-12 sm:object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-[#fffdfb]/94" />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-[#2f231b]">후원 필요성</h2>
            <div className="mt-4 space-y-4 text-sm leading-8 text-[#5a473a] sm:text-base">
              <p>
                학생 대부분은 다문화·중도입국 가정의 아이들로, 낯선 환경 속에서도
                학업을 이어가기 위해 해밀학교 기숙사에서 생활하고 있습니다.
                하지만 학생 한 명이 한 달 동안 안정적으로 생활하기 위해서는 약
                10만 원의 생활관비가 필요합니다.
              </p>
              <p>
                누군가에게는 크지 않은 금액일 수 있지만, 이 아이들에게는 “계속
                학교에 다닐 수 있는가”를 결정하는 매우 중요한 비용입니다. 결연
                후원은 단순한 생활비 지원이 아니라, 아이들이 생계 걱정 없이
                공부하고, 친구들과 어울리며, 자신의 미래를 포기하지 않도록
                지켜주는 연결입니다.
              </p>
              <p>
                특히 다문화·중도입국 학생들은 언어와 환경의 차이로 인해 교육의
                사각지대에 놓이기 쉽습니다. 해밀학교는 그런 아이들이 안전한
                공동체 안에서 다시 꿈을 이어갈 수 있도록 돕고 있으며, 여러분의
                후원은 그 아이들에게 “혼자가 아니다”라는 큰 힘이 됩니다.
              </p>
            </div>
          </div>
        </article>

        <article className="surface-card relative overflow-hidden p-7 sm:p-8">
          <Image
            src="/images/haemil/people-activity-4.jpg"
            alt=""
            aria-hidden
            fill
            className="object-cover object-[center_32%] opacity-10 sm:object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-[#fffdfb]/94" />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-[#2f231b]">
              해밀학교 결연 후원 운영 원칙
            </h2>
            <div className="mt-4 space-y-5 text-sm leading-8 text-[#5a473a] sm:text-base">
              <div>
                <h3 className="text-lg font-bold text-[#2f231b]">
                  한 학생과 한 후원자를 연결합니다
                </h3>
                <p className="mt-2">
                  해밀학교는 학생 한 명과 후원자 한 분이 꾸준히 연결되는 1:1
                  결연 방식을 지향합니다. 단순한 후원이 아니라, 한 아이의
                  학교생활을 함께 응원하고 지켜주는 따뜻한 관계가 되기를 바라고
                  있습니다.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2f231b]">
                  모든 후원은 직접 확인 후 진행됩니다
                </h3>
                <p className="mt-2">
                  해밀학교는 자동 결제 시스템 대신, 후원 신청 후 관리자가 직접
                  연락드려 안내를 진행하고 있습니다. 조금 번거롭더라도 후원 과정
                  하나하나를 직접 확인함으로써, 보다 투명하고 책임감 있게
                  운영하기 위한 방식입니다.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2f231b]">
                  입금 완료 후 결연이 확정됩니다
                </h3>
                <p className="mt-2">
                  학생들의 생활관비 지원은 실제 입금 완료 기준으로 확정됩니다.
                  이를 통해 중복 결연이나 운영 혼선을 줄이고, 필요한 학생에게
                  안정적으로 후원이 연결될 수 있도록 관리하고 있습니다.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2f231b]">
                  학생의 개인정보와 초상권을 소중히 보호합니다
                </h3>
                <p className="mt-2">
                  해밀학교 학생들은 대부분 다문화·중도입국 배경을 가진
                  청소년들입니다. 학교는 아이들이 편견이나 불필요한 노출 없이
                  안전하게 성장할 수 있도록, 실명과 실제 사진을 공개하지 않고
                  있습니다.
                </p>
                <p className="mt-2">
                  현재 사이트에 사용되는 이미지는 학생을 대신한 AI 기반 프로필
                  이미지이며, 학생 소개 역시 개인정보 보호를 고려해 일부만
                  공개됩니다. 아이들의 존엄과 안전을 지키기 위한 해밀학교의
                  원칙에 따뜻한 이해를 부탁드립니다.
                </p>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-8">
        <article className="surface-card overflow-hidden p-6 sm:p-7">
          <div className="mb-5 grid gap-4 sm:grid-cols-3">
            <div className="relative min-h-[130px] overflow-hidden rounded-2xl border border-[var(--border)]">
              <Image
                src="/images/haemil/people-activity-3.png"
                alt="학생 활동 사진"
                fill
                className="object-cover object-[center_34%] sm:object-center"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2a1f17]/45 via-transparent to-transparent" />
            </div>
            <div className="relative min-h-[130px] overflow-hidden rounded-2xl border border-[var(--border)]">
              <Image
                src="/images/haemil/people-activity-5.jpg"
                alt="학교 활동 사진"
                fill
                className="object-cover object-[center_34%] sm:object-center"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2a1f17]/45 via-transparent to-transparent" />
            </div>
            <div className="relative min-h-[130px] overflow-hidden rounded-2xl border border-[var(--border)]">
              <Image
                src="/images/haemil/school-campus-3.jpg"
                alt="학교 전경 사진"
                fill
                className="object-cover object-[center_34%] sm:object-center"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2a1f17]/45 via-transparent to-transparent" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-[#2f231b] sm:text-2xl">후원 절차</h2>
          <ol className="mt-4 grid gap-4 md:grid-cols-2">
            {processSteps.map((step, index) => (
              <li
                key={step.title}
                className="rounded-2xl border border-[var(--border)] bg-[#fff8f1] p-5"
              >
                <p className="text-xs font-bold tracking-[0.08em] text-[#9f5f34]">
                  STEP {index + 1}
                </p>
                <h3 className="mt-2 text-base font-bold leading-7 text-[#2f231b]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#5d483a]">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </article>
      </section>
    </div>
  );
}
