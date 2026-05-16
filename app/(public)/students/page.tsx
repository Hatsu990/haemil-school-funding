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
      </header>

      <section className="surface-card mb-5 space-y-4 p-5 text-sm leading-7 text-[#4f3d32]">
        <p>
          해밀학교는 한 학생과 한 후원자가 따뜻하게 연결되는 1:1 결연 방식을
          지향하고 있습니다. 보다 안정적이고 책임감 있는 후원 운영을 위해, 한
          학생에게는 한 분의 후원자만 연결됩니다.
        </p>
        <p>
          후원 신청이 접수되면 해당 학생은 일시적으로 결연 대기 상태로
          전환되며, 중복 신청은 제한됩니다. 이는 꼭 필요한 학생에게 후원이
          정확하게 연결될 수 있도록 하기 위한 운영 원칙입니다.
        </p>
        <p>
          또한 해밀학교는 모든 후원 과정을 직접 확인하며 운영하고 있습니다.
          후원금 입금이 확인되면 결연이 최종 확정되며, 이후 학생의 생활관비와
          안정적인 학교생활 지원에 사용됩니다.
        </p>
      </section>

      <StudentsListClient students={students} dbErrorMessage={dbErrorMessage} />
    </div>
  );
}
