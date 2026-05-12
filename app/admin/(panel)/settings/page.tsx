import { adminContacts } from "@/lib/mock-data";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-5 pb-8">
      <section className="surface-card p-5">
        <h2 className="text-lg font-bold text-[#2f241d]">운영 설정</h2>
        <p className="mt-2 text-sm subtle-text">
          문자 수신자, 자동 발송 시간, 관리자 연락처를 설정하는 UI입니다.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <article className="surface-card p-5">
          <h3 className="font-semibold text-[#4f3d31]">문자 수신자 설정</h3>
          <div className="mt-4 space-y-2">
            {adminContacts.map((phone) => (
              <div
                key={phone}
                className="rounded-lg border border-[var(--border)] bg-[#fff9f3] px-3 py-2 text-sm"
              >
                {phone}
              </div>
            ))}
          </div>
          <button className="btn-secondary mt-4 py-2">수신자 추가</button>
        </article>

        <article className="surface-card p-5">
          <h3 className="font-semibold text-[#4f3d31]">자동 발송 시간 설정</h3>
          <div className="mt-4 space-y-3">
            <label className="block text-sm">
              <span className="mb-2 block font-medium text-[#5f4a3c]">
                일일 알림 시간
              </span>
              <input
                type="time"
                defaultValue="19:00"
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block font-medium text-[#5f4a3c]">
                관리자 대표 연락처
              </span>
              <input
                type="text"
                defaultValue="010-3024-1188"
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
              />
            </label>
          </div>
          <button className="btn-primary mt-4 py-2">설정 저장 (Mock)</button>
        </article>
      </section>
    </div>
  );
}
