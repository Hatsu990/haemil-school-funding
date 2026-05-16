import type { Metadata } from "next";
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

  return (
    <div className="container-base pb-16 pt-10 sm:pt-12">
      <header className="mb-7 sm:mb-9">
        <p className="text-sm font-semibold text-[#8d694f]">학생 만나기</p>
        <h1 className="section-title mt-2">결연을 기다리는 학생들</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 subtle-text">
          학생 실명 대신 닉네임을 공개하며, 실제 사진 대신 AI 캐릭터 프로필을 사용합니다.
          결연은 학생 1명당 후원자 1명 기준으로 운영됩니다.
        </p>
      </header>

      <section className="surface-card mb-5 grid gap-2 p-5 text-sm leading-6 text-[#4f3d32]">
        <p>결연 원칙: 학생 1명당 후원자 1명만 신청 가능합니다.</p>
        <p>입금 대기 상태에서는 다른 후원 신청이 불가합니다.</p>
        <p>결연 완료 기준은 입금 완료입니다.</p>
      </section>

      <StudentsListClient students={students} dbErrorMessage={dbErrorMessage} />
    </div>
  );
}
