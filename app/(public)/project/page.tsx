import type { Metadata } from "next";
import Image from "next/image";

const processSteps = [
  {
    title: "마음이 가는 학생을 선택하고 결연을 신청합니다",
    description:
      "학생들의 이야기와 꿈편지를 읽어보고, 응원하고 싶은 학생에게 3년 결연을 신청할 수 있습니다.",
  },
  {
    title: "해밀학교에서 직접 안내드립니다",
    description:
      "결연 신청이 접수되면 관리자가 직접 연락드려 3년 결연 방식과 절차를 안내해드립니다.",
  },
  {
    title: "3년 결연이 확정되고 학생의 생활을 함께 응원합니다",
    description:
      "확인 절차가 끝나면 해당 학생과의 3년 결연이 확정되며, 장학금은 학생들의 학업과 안정적인 학교생활 지원에 사용됩니다.",
  },
  {
    title: "학교의 이야기와 아이들의 성장을 함께 나눕니다",
    description:
      "해밀학교는 학교 소식과 아이들의 성장 이야기를 꾸준히 전하며, 후원자분들과 3년의 따뜻한 연결을 이어가고 있습니다.",
  },
];

export const metadata: Metadata = {
  title: "프로젝트 안내",
  description:
    "해밀학교 3년 장학금 1:1 결연 구조와 절차를 확인할 수 있는 프로젝트 안내 페이지입니다.",
  keywords: [
    "해밀학교 프로젝트",
    "3년 장학금 결연 절차",
    "1:1 결연 운영",
    "장학금 결연",
  ],
  openGraph: {
    title: "프로젝트 안내 | 해밀학교 후원 프로젝트",
    description:
      "3년 장학금 결연이 어떻게 운영되는지 단계별로 확인해 보세요.",
    url: "/project",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "프로젝트 안내 | 해밀학교 후원 프로젝트",
    description:
      "3년 장학금 결연 절차와 결연 원칙을 한눈에 확인할 수 있습니다.",
  },
};

export default function ProjectPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-10 sm:px-6 sm:pt-12">
      <header className="relative mb-8 overflow-hidden rounded-lg border border-[#d8d3c8] bg-[#fffdf8] shadow-[0_22px_58px_rgba(32,41,38,0.1)] sm:mb-10">
        <Image
          src="/images/haemill/people-activity-6.jpg"
          alt="해밀학교 전경"
          fill
          priority
          className="object-cover object-[center_26%] opacity-70 sm:object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#fffdf8_0%,rgba(255,253,248,0.96)_46%,rgba(255,253,248,0.28)_100%)]" />
        <div className="relative z-10 p-8 sm:p-10">
          <h1 className="text-balance font-serif text-3xl font-black leading-tight text-[#18211d] [word-break:keep-all] sm:text-5xl">
            3년 장학금 결연이 필요한 이유와 운영 방식
          </h1>
          <p className="mt-4 max-w-3xl text-base font-semibold leading-8 text-[#314039]">
            학생의 3년을 함께 응원하는 결연. 후원자와
            학생이 신뢰로 연결되는 과정을 투명하게 안내드립니다.
          </p>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="relative overflow-hidden rounded-lg border border-[#d8d3c8] bg-[#fffdf8] p-7 shadow-[0_18px_44px_rgba(32,41,38,0.08)] sm:p-8">
          <Image
            src="/images/haemill/school-campus-1.jpg"
            alt=""
            aria-hidden
            fill
            className="object-cover object-[center_34%] opacity-12 sm:object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-[#fffdfb]/94" />
          <div className="relative z-10">
            <h2 className="text-2xl font-black text-[#18211d]">후원 필요성</h2>
            <div className="mt-4 space-y-4 text-sm font-semibold leading-8 text-[#1f2b25] sm:text-base">
              <p>
                아이들이 경제적인 걱정 없이 학업과 자신의 꿈을 이어가기
                위해서는 지속적인 장학 지원이 꼭 필요합니다.
              </p>
              <p>
                누군가에게는 크지 않은 금액일 수 있지만, 이 아이들에게는 “계속
                학교에 다닐 수 있는가”를 결정하는 매우 중요한 비용입니다. 결연
                결연은 단순한 장학 지원을 넘어, 아이들이 경제적인 걱정 없이
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

        <article className="relative overflow-hidden rounded-lg border border-[#d8d3c8] bg-[#fffdf8] p-7 shadow-[0_18px_44px_rgba(32,41,38,0.08)] sm:p-8">
          <Image
            src="/images/haemill/people-activity-4.jpg"
            alt=""
            aria-hidden
            fill
            className="object-cover object-[center_32%] opacity-10 sm:object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-[#fffdfb]/94" />
          <div className="relative z-10">
            <h2 className="text-2xl font-black text-[#18211d]">
              해밀학교 결연 후원 운영 원칙
            </h2>
            <div className="mt-4 space-y-5 text-sm font-semibold leading-8 text-[#1f2b25] sm:text-base">
              <div>
                <h3 className="text-lg font-black text-[#18211d]">
                  한 학생과 한 후원자를 연결합니다
                </h3>
                <p className="mt-2">
                  해밀학교는 학생 한 명과 후원자 한 분이 3년 동안 꾸준히
                  연결되는 결연 방식을 지향합니다. 단순한 후원이 아니라, 한
                  아이의 학교생활을 함께 응원하고 지켜주는 따뜻한 관계가 되기를
                  바라고 있습니다.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-black text-[#18211d]">
                  모든 후원은 직접 확인 후 진행됩니다
                </h3>
                <p className="mt-2">
                  해밀학교는 결연 신청 후 관리자가 직접 연락드려 3년 결연
                  절차를 안내하고 있습니다. 조금 번거롭더라도 결연 과정
                  하나하나를 직접 확인함으로써, 보다 투명하고 책임감 있게
                  운영하기 위한 방식입니다.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-black text-[#18211d]">
                  확인 후 3년 결연이 확정됩니다
                </h3>
                <p className="mt-2">
                  학생들의 3년 장학금 결연은 관리자의 확인 절차를 거쳐 확정됩니다.
                  이를 통해 중복 결연이나 운영 혼선을 줄이고, 필요한 학생에게
                  안정적으로 3년 장학금 결연이 이어질 수 있도록 관리하고 있습니다.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-black text-[#18211d]">
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
        <article className="overflow-hidden rounded-lg border border-[#d8d3c8] bg-[#fffdf8] p-6 shadow-[0_18px_44px_rgba(32,41,38,0.08)] sm:p-7">
          <h2 className="text-xl font-black text-[#18211d] sm:text-2xl">후원 절차</h2>
          <ol className="mt-4 grid gap-0">
            {processSteps.flatMap((step, index) => {
              const isLast = index === processSteps.length - 1;

              return [
                <li
                  key={`step-${step.title}`}
                  className="rounded-lg border border-[#d8d3c8] bg-[#fffdf8] p-5 shadow-[0_14px_34px_rgba(43,54,47,0.06)]"
                >
                  <p className="text-xs font-black tracking-[0.12em] text-[#486f5b]">
                    STEP {index + 1}
                  </p>
                  <h3 className="mt-2 text-base font-black leading-7 text-[#18211d]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm font-semibold leading-7 text-[#1f2b25]">
                    {step.description}
                  </p>
                </li>,
                !isLast ? (
                  <li
                    key={`connector-${step.title}`}
                    aria-hidden
                    className="flex h-28 items-center justify-center py-6"
                  >
                    <svg
                      width="38"
                      height="44"
                      viewBox="0 0 38 44"
                      className="drop-shadow-[0_2px_3px_rgba(121,84,53,0.18)]"
                    >
                      <path
                        d="M19 5V36M7 24L19 36L31 24"
                        fill="none"
                        stroke="#486f5b"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </li>
                ) : null,
              ];
            })}
          </ol>
        </article>
      </section>
    </div>
  );
}
