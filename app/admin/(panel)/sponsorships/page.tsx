import { StatusPill } from "@/components/ui/status-pill";
import { sponsorships, students } from "@/lib/mock-data";
import { getSponsorshipStatusClass } from "@/lib/utils";

export default function AdminSponsorshipsPage() {
  return (
    <div className="space-y-5 pb-8">
      <section className="surface-card p-5">
        <h2 className="text-lg font-bold text-[#2f241d]">결연 신청 필터</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <input
            className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
            placeholder="후원자명 / 연락처 검색"
          />
          <select className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm">
            <option>상태 전체</option>
            <option>입금대기</option>
            <option>입금완료</option>
            <option>취소</option>
          </select>
          <select className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm">
            <option>후원 방식 전체</option>
            <option>일시후원</option>
            <option>정기후원</option>
          </select>
          <button className="btn-secondary py-2">조건 적용</button>
        </div>
      </section>

      <section className="surface-card overflow-hidden">
        <header className="border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-lg font-bold text-[#2f241d]">결연 신청 목록</h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="bg-[#fff5ea] text-left text-[#6d5545]">
              <tr>
                <th className="px-4 py-3">신청번호</th>
                <th className="px-4 py-3">학생</th>
                <th className="px-4 py-3">후원자</th>
                <th className="px-4 py-3">후원조건</th>
                <th className="px-4 py-3">공개여부</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">작업</th>
              </tr>
            </thead>
            <tbody>
              {sponsorships.map((item) => {
                const student = students.find((student) => student.id === item.studentId);
                return (
                  <tr key={item.id} className="border-t border-[var(--border)]">
                    <td className="px-4 py-3">{item.id}</td>
                    <td className="px-4 py-3">
                      {student?.nickname} ({student?.grade})
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#4f3b30]">{item.sponsorName}</p>
                      <p className="text-xs subtle-text">{item.sponsorPhone}</p>
                    </td>
                    <td className="px-4 py-3">
                      {item.sponsorshipType} / {item.sponsorshipPeriod}
                    </td>
                    <td className="px-4 py-3">{item.sponsorPublic ? "공개" : "비공개"}</td>
                    <td className="px-4 py-3">
                      <StatusPill
                        label={item.status}
                        className={getSponsorshipStatusClass(item.status)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="btn-secondary py-2 text-xs">메시지</button>
                        <button className="btn-secondary py-2 text-xs">상태변경</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
