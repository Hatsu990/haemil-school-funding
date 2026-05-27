import type { Metadata } from "next";
import Image from "next/image";
import { StudentsListClient } from "@/components/public/students-list-client";
import { buildDbErrorMessage, logDbLoadError } from "@/lib/db/debug";
import { getStudents } from "@/lib/repositories/students";
import { withStudentUiFallbackList } from "@/lib/students/ui";
import { StudentProfile } from "@/types";

export const metadata: Metadata = {
  title: "학생 만나기",
  description:
    "해밀학교 학생들의 닉네임, 학년, 결연 상태를 확인하고 생활관비 1:1 결연 후원을 신청할 수 있습니다.",
  keywords: [
    "해밀학교 학생",
    "다문화학교 후원",
    "1:1 결연 신청",
    "생활관비 지원",
  ],
  openGraph: {
    title: "학생 만나기 | 해밀학교 후원 프로젝트",
    description:
      "다문화학교 학생들의 결연 상태를 확인하고 생활관비 후원에 참여해 주세요.",
    url: "/students",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "학생 만나기 | 해밀학교 후원 프로젝트",
    description:
      "결연을 기다리는 해밀학교 학생 정보를 확인하고 후원 신청에 참여할 수 있습니다.",
  },
};

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  let students: StudentProfile[] = [];
  let dbErrorMessage: string | null = null;

  try {
    const loadedStudents = await getStudents();
    students = withStudentUiFallbackList(loadedStudents);
  } catch (error) {
    logDbLoadError("students page", error);
    dbErrorMessage = buildDbErrorMessage(
      "학생 데이터를 불러오지 못했습니다. DB 연결 상태를 확인한 뒤 다시 시도해 주세요.",
    );
  }

  const availableCount = students.filter(
    (student) => student.sponsorshipStatus === "available",
  ).length;
  const pendingCount = students.filter(
    (student) => student.sponsorshipStatus === "pending",
  ).length;
  const matchedCount = students.filter(
    (student) => student.sponsorshipStatus === "matched",
  ).length;

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-10 sm:px-6 sm:pt-12">
      <header className="relative mb-8 overflow-hidden rounded-[34px] border border-[#d8d1c4] shadow-[0_24px_64px_rgba(43,54,47,0.18)] sm:mb-10">
        <Image
          src="/images/haemil/school-campus-3.jpg"
          alt="해밀학교 기숙사와 학교 분위기"
          fill
          priority
          className="object-cover object-[center_28%] sm:object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#18211d]/88 via-[#24372c]/74 to-[#c66f4a]/42" />
        <div className="relative z-10 p-7 sm:p-9 lg:p-11">
          <h1 className="text-3xl font-black leading-tight tracking-[-0.02em] text-[#fffdf8] text-balance sm:text-5xl">
            결연을 기다리는 학생들
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#edf3ed] sm:text-base sm:leading-8">
            학생 한 명 한 명의 이야기를 확인하고, 마음이 닿는 학생과 3년
            결연으로 연결될 수 있습니다. 해밀학교는 후원자가 신뢰할 수 있는
            절차를 통해 결연을 운영합니다.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/18 bg-white/12 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs font-bold tracking-[0.08em] text-[#dfe8d8]">
                요청 가능
              </p>
              <p className="mt-1 text-2xl font-bold text-white">{availableCount}명</p>
            </div>
            <div className="rounded-3xl border border-white/18 bg-white/12 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs font-bold tracking-[0.08em] text-[#dfe8d8]">
                입금 대기
              </p>
              <p className="mt-1 text-2xl font-bold text-white">{pendingCount}명</p>
            </div>
            <div className="rounded-3xl border border-white/18 bg-white/12 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs font-bold tracking-[0.08em] text-[#dfe8d8]">
                결연 완료
              </p>
              <p className="mt-1 text-2xl font-bold text-white">{matchedCount}명</p>
            </div>
          </div>
        </div>
      </header>

      <section className="surface-card mb-7 overflow-hidden md:grid md:grid-cols-[1.15fr_0.85fr]">
        <div className="p-6 text-sm font-semibold leading-7 text-[#1f2b25] sm:p-7 sm:text-base sm:leading-8">
          <h2 className="text-xl font-black text-[#18211d]">후원 운영 안내</h2>
          <p className="mt-3">
            해밀학교는 한 학생과 한 후원자가 따뜻하게 연결되어 3년 동안 이어지는
            결연 방식을 지향합니다. 보다 안정적이고 책임감 있는 운영을 위해, 한
            학생에게는 한 분의 후원자만 연결됩니다.
          </p>
          <p className="mt-3">
            결연 신청이 접수되면 해당 학생은 일시적으로 결연 대기 상태로
            전환되며, 중복 신청은 제한됩니다. 이는 꼭 필요한 학생에게 장학금
            결연이 정확하게 연결될 수 있도록 하기 위한 운영 원칙입니다.
          </p>
          <p className="mt-3">
            또한 해밀학교는 모든 결연 과정을 직접 확인하며 운영하고 있습니다.
            결연이 확정되면 이후 3년 동안 학생의 생활관비와 안정적인 학교생활
            지원에 사용됩니다.
          </p>
        </div>
        <div className="relative min-h-[260px]">
          <Image
            src="/images/haemil/people-activity-1.jpg"
            alt="해밀학교 학생 공동체 활동"
            fill
            className="object-cover object-[center_22%] sm:object-center"
            sizes="(max-width: 768px) 100vw, 35vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2a1f17]/55 via-transparent to-transparent" />
        </div>
      </section>

      <StudentsListClient students={students} dbErrorMessage={dbErrorMessage} />
    </div>
  );
}
