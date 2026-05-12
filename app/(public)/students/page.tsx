import { StudentCard } from "@/components/public/student-card";
import { students } from "@/lib/mock-data";

export default function StudentsPage() {
  return (
    <div className="container-base py-12">
      <header className="mb-8">
        <p className="text-sm font-semibold text-[#8d694f]">학생 만나기</p>
        <h1 className="section-title mt-2">결연을 기다리는 학생들</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 subtle-text">
          학생 실명 대신 닉네임을 공개하며, 실제 학생 사진 대신 AI 카툰 프로필
          정책을 유지합니다. 결연은 학생 1명당 후원자 1명 기준으로 운영됩니다.
        </p>
      </header>

      <section className="surface-card mb-8 grid gap-4 p-5 md:grid-cols-4">
        <label className="text-sm">
          <span className="mb-2 block font-semibold text-[#5f4a3c]">성별</span>
          <select className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2">
            <option>전체</option>
            <option>남</option>
            <option>여</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-2 block font-semibold text-[#5f4a3c]">학년</span>
          <select className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2">
            <option>전체</option>
            <option>중등</option>
            <option>고등</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-2 block font-semibold text-[#5f4a3c]">결연 상태</span>
          <select className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2">
            <option>전체</option>
            <option>신청가능</option>
            <option>입금대기</option>
            <option>결연완료</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-2 block font-semibold text-[#5f4a3c]">정렬</span>
          <select className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2">
            <option>기본순</option>
            <option>신청가능 우선</option>
            <option>최근 업데이트순</option>
          </select>
        </label>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {students.map((student) => (
          <StudentCard key={student.id} student={student} />
        ))}
      </section>
    </div>
  );
}
