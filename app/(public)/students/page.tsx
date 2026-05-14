import type { Metadata } from "next";
import { StudentCard } from "@/components/public/student-card";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
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

export default async function StudentsPage() {
  let students: StudentProfile[] = [];
  let dbErrorMessage: string | null = null;

  try {
    const loadedStudents = await getStudents();
    students = withStudentUiFallbackList(loadedStudents);
  } catch (error) {
    console.error("[students page] failed to load students from repository", error);
    dbErrorMessage =
      "학생 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요. 문제가 계속되면 관리자에게 문의해 주세요.";
  }

  return (
    <div className="container-base pb-16 pt-10 sm:pt-12">
      <header className="mb-7 sm:mb-9">
        <p className="text-sm font-semibold text-[#8d694f]">학생 만나기</p>
        <h1 className="section-title mt-2">결연을 기다리는 학생들</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 subtle-text">
          학생 실명 대신 닉네임을 공개하며, 실제 사진 대신 AI 카툰 프로필 원칙을
          유지합니다. 결연은 학생 1명당 후원자 1명 기준으로 운영됩니다.
        </p>
      </header>

      <section className="surface-card mb-5 grid gap-2 p-5 text-sm leading-6 text-[#4f3d32]">
        <p>결연 정책: 학생 1명당 후원자 1명만 신청 가능합니다.</p>
        <p>입금 대기 상태에서는 다른 후원 신청이 불가합니다.</p>
        <p>결연 완료 기준은 입금 완료입니다.</p>
      </section>

      <section className="surface-card mb-8 grid gap-4 p-5 md:grid-cols-4">
        <label className="text-sm">
          <span className="mb-2 block font-semibold text-[#5f4a3c]">성별</span>
          <select
            aria-label="학생 성별 필터"
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
          >
            <option>전체</option>
            <option>남</option>
            <option>여</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-2 block font-semibold text-[#5f4a3c]">학년</span>
          <select
            aria-label="학생 학년 필터"
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
          >
            <option>전체</option>
            <option>중등</option>
            <option>고등</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-2 block font-semibold text-[#5f4a3c]">결연 상태</span>
          <select
            aria-label="학생 결연 상태 필터"
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
          >
            <option>전체</option>
            <option>신청 가능</option>
            <option>입금 대기</option>
            <option>결연 완료</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-2 block font-semibold text-[#5f4a3c]">정렬</span>
          <select
            aria-label="학생 정렬 기준"
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
          >
            <option>기본순</option>
            <option>신청 가능 우선</option>
            <option>최신 업데이트순</option>
          </select>
        </label>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {dbErrorMessage ? (
          <article className="surface-card col-span-full p-6 text-sm leading-7 text-[#5b473b]">
            <p className="font-semibold text-[#8c4f2d]">데이터 연결 안내</p>
            <p className="mt-2">{dbErrorMessage}</p>
          </article>
        ) : students.length === 0 ? (
          <EmptyStateCard
            className="col-span-full"
            title="등록된 학생 정보가 없습니다."
            description="관리자 페이지에서 학생 정보를 등록하면 이곳에 표시됩니다."
          />
        ) : (
          students.map((student) => <StudentCard key={student.id} student={student} />)
        )}
      </section>
    </div>
  );
}
