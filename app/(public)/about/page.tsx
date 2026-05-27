import type { Metadata } from "next";
import Image from "next/image";

const valueCards = [
  {
    title: "서로 다른 배경의 아이들이 함께 성장하는 교육",
    paragraphs: [
      "해밀학교는 다문화·중도입국 학생들이 낯선 환경 속에서도 위축되지 않고 친구들과 자연스럽게 어울리며 성장할 수 있도록 공동체 중심의 교육을 이어가고 있습니다.",
      "언어와 문화의 차이를 이해하고 존중하는 다양한 활동과 프로그램을 통해, 학생들이 서로의 다양성을 배우고 포용하는 마음을 키워가고 있습니다.",
      "모두가 존중받고, 누구나 소중한 존재로 인정받는 학교. 해밀학교는 아이들이 함께 꿈꾸고 함께 성장하는 마을과 같은 교육 공동체를 만들어가고 있습니다.",
    ],
    imageSrc: "/images/haemill/people-activity-2.jpg",
    imageAlt: "학생 활동 모습",
  },
  {
    title: "안정적인 생활과 배움을 함께 지켜주는 기숙사 생활",
    paragraphs: [
      "학생들은 학교와 기숙사 안에서 함께 생활하며 규칙적인 일상과 학습 습관을 만들어가고 있습니다.",
      "해밀학교는 안전하고 따뜻한 생활 환경을 제공하고, 전문 선생님들의 세심한 생활지도와 학습지도를 연계하여 아이들이 건강하게 자라고 배움이 끊이지 않도록 돕고 있습니다.",
      "기숙사 생활은 단순한 숙식 공간이 아닌, 아이들이 서로를 이해하고 배려하며 자립심과 책임감을 키워가는 성장의 터전이 되고 있습니다.",
    ],
    imageSrc: "/images/haemill/school-campus-2.png",
    imageAlt: "해밀학교 학교 시설",
  },
  {
    title: "아이들이 자신의 꿈을 발견하고 키워갈 수 있도록",
    paragraphs: [
      "해밀학교는 예체능, 기술, 인문 등 다양한 분야의 체험과 프로그램을 통해 학생들이 스스로 좋아하는 것을 찾고, 잘할 수 있는 일을 발견하도록 지원합니다.",
      "진로 탐색과 체험 활동, 멘토링, 프로젝트 수업 등을 통해 아이들이 자신의 가능성을 믿고 미래를 주도적으로 설계할 수 있도록 함께 고민하고 응원합니다.",
      "작은 관심과 경험이 아이들의 인생을 바꿀 수 있다는 믿음으로, 해밀학교는 학생 한 명 한 명의 꿈을 소중히 키워가고 있습니다.",
    ],
    imageSrc: "/images/haemill/people-activity-5.jpg",
    imageAlt: "학생 체험 활동",
  },
  {
    title: "아이들의 하루를 지켜주는 학교 생활",
    paragraphs: [
      "학생들은 공동 생활 속에서 서로를 배려하는 방법을 배우고, 규칙적인 생활 습관을 통해 건강한 일상을 만들어갑니다.",
      "방과 후에는 보충학습, 독서, 스포츠, 동아리 활동 등 다양한 프로그램에 참여하며 배움의 즐거움을 느끼고 자신감과 자존감을 키워가고 있습니다.",
      "3년 장학금 결연은 아이들이 학업과 성장의 시간을 포기하지 않도록 지켜주는 든든한 응원이 됩니다.",
      "후원자님의 따뜻한 마음 덕분에 아이들은 오늘도 안전한 환경에서 배우고 성장할 수 있습니다.",
    ],
    imageSrc: "/images/haemill/people-activity-6.jpg",
    imageAlt: "학생 생활 장면",
  },
  {
    title: "여러분의 후원이 아이들의 내일을 지켜줍니다",
    paragraphs: [
      "결연은 단순한 장학 지원을 넘어, 아이들이 환경과 현실의 어려움 속에서도 배움을 포기하지 않고 자신의 꿈을 이어갈 수 있도록 함께 응원해주는 따뜻한 약속입니다.",
      "해밀학교는 한 명의 학생과 한 명의 후원자가 연결되는 결연 구조를 통해, 투명하고 책임감 있게 후원을 운영하고 있습니다.",
      "여러분의 작은 관심이 한 아이의 오늘을 바꾸고, 더 나아가 밝은 미래를 만들어갑니다.",
      "해밀학교와 함께 아이들의 꿈을 지켜주세요.",
    ],
    imageSrc: "/images/haemill/school-campus-3.jpg",
    imageAlt: "해밀학교 전경",
  },
] as const;

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
    <div className="mx-auto w-full max-w-[1280px] px-4 pb-20 pt-10 sm:px-6 sm:pt-12">
      <header className="relative overflow-hidden rounded-[34px] border border-[#d8d1c4] shadow-[0_24px_64px_rgba(43,54,47,0.18)]">
        <Image
          src="/images/haemill/school-campus-1.jpg"
          alt="해밀학교 전경"
          fill
          priority
          className="object-cover object-[center_28%] sm:object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#18211d]/88 via-[#24372c]/72 to-[#c66f4a]/40" />
        <div className="relative z-10 p-8 sm:p-10">
          <h1 className="text-3xl font-black leading-tight tracking-[-0.02em] text-[#fffdf8] text-balance sm:text-5xl">
            해밀학교는 함께 살아가는 힘을 가르칩니다
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[#edf3ed]">
            해밀학교는 강원특별자치도 홍천군에 위치한 다문화 대안학교입니다.
            학생들이 안전한 기숙사 환경에서 학업과 생활을 함께 성장시킬 수
            있도록 교육하고 있습니다.
          </p>
        </div>
      </header>

      <section className="mt-12">
        <div className="mb-8 sm:mb-10">
          <h2 className="text-3xl font-black leading-tight tracking-[-0.02em] text-[#18211d] text-balance sm:text-4xl">
            해밀학교의 교육과 후원의 가치
          </h2>
          <p className="mt-4 max-w-4xl text-base font-semibold leading-8 text-[#1f2b25]">
            아이들의 오늘을 지키는 일상과, 내일을 열어주는 교육을 함께 이어가기
            위해 해밀학교는 후원자와 학생이 신뢰로 연결되는 구조를 만들어가고
            있습니다.
          </p>
        </div>

        <div className="grid gap-7 md:grid-cols-2 md:gap-8 lg:gap-10">
          {valueCards.map((card, index) => (
            <article
              key={card.title}
              className={`surface-card overflow-hidden rounded-[34px] p-8 shadow-[0_22px_58px_rgba(43,54,47,0.1)] sm:p-10 lg:p-11 ${
                index < 3 ? "md:col-span-2" : ""
              }`}
            >
              <div className={index < 3 ? "grid gap-8 lg:grid-cols-[1.2fr_0.8fr]" : ""}>
                <div>
                  <h3 className="text-2xl font-black leading-tight tracking-[-0.02em] text-[#18211d] text-balance sm:text-[2rem]">
                    {card.title}
                  </h3>
                  <div className="mt-6 space-y-5 text-base font-semibold leading-8 text-[#1f2b25] sm:text-[1.03rem]">
                    {card.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                <div className="relative mt-7 min-h-[220px] overflow-hidden rounded-[26px] border border-[var(--border)] lg:mt-0">
                  <Image
                    src={card.imageSrc}
                    alt={card.imageAlt}
                    fill
                    className="object-cover object-[center_30%] sm:object-center"
                    sizes={index < 3 ? "(max-width: 1024px) 100vw, 32vw" : "(max-width: 768px) 100vw, 38vw"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2a1f17]/52 via-transparent to-transparent" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
