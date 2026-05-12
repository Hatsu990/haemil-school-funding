import { smsLogs } from "@/lib/mock-data";

export default function AdminMessagesPage() {
  return (
    <div className="space-y-5 pb-8">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="surface-card p-5">
          <p className="text-sm font-medium text-[#6b5444]">오늘 발송 성공</p>
          <p className="mt-2 text-3xl font-bold text-[#2f241d]">28건</p>
        </article>
        <article className="surface-card p-5">
          <p className="text-sm font-medium text-[#6b5444]">발송 실패</p>
          <p className="mt-2 text-3xl font-bold text-[#2f241d]">1건</p>
        </article>
        <article className="surface-card p-5">
          <p className="text-sm font-medium text-[#6b5444]">자동 발송 예정</p>
          <p className="mt-2 text-3xl font-bold text-[#2f241d]">9건</p>
        </article>
      </section>

      <section className="surface-card p-5">
        <h2 className="text-lg font-bold text-[#2f241d]">문자 템플릿 관리</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-[#fff9f3] p-4">
            <p className="font-semibold text-[#4f3d31]">신청 완료 안내</p>
            <p className="mt-2 text-xs leading-6 subtle-text">
              {"{이름}"}님, 해밀학교 후원 신청이 접수되었습니다. 관리자가 곧 연락드립니다.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[#fff9f3] p-4">
            <p className="font-semibold text-[#4f3d31]">입금 완료 안내</p>
            <p className="mt-2 text-xs leading-6 subtle-text">
              {"{이름}"}님, 입금 확인이 완료되어 결연이 확정되었습니다. 감사합니다.
            </p>
          </div>
        </div>
      </section>

      <section className="surface-card overflow-hidden">
        <header className="border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-lg font-bold text-[#2f241d]">최근 문자 발송 이력</h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-[#fff5ea] text-left text-[#6d5545]">
              <tr>
                <th className="px-4 py-3">시간</th>
                <th className="px-4 py-3">수신번호</th>
                <th className="px-4 py-3">템플릿</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">응답</th>
              </tr>
            </thead>
            <tbody>
              {smsLogs.map((item) => (
                <tr key={item.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3">{item.createdAt}</td>
                  <td className="px-4 py-3">{item.phone}</td>
                  <td className="px-4 py-3">{item.templateName}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === "성공"
                          ? "bg-[#e8f5eb] text-[#256f43]"
                          : item.status === "실패"
                            ? "bg-[#fdf0eb] text-[#ab4d2f]"
                            : "bg-[#eef2ff] text-[#3f4f9f]"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.responseMessage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
