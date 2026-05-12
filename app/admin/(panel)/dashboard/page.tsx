import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { sponsorships, totalStudentCount } from "@/lib/mock-data";
import { getSponsorshipStatusClass } from "@/lib/utils";
import { StatusPill } from "@/components/ui/status-pill";

const metrics = [
  { label: "전체 학생 수", value: `${totalStudentCount}명`, helper: "학생 DB 기준" },
  { label: "결연 완료", value: "24명", helper: "입금완료 기준" },
  { label: "결연 대기", value: "6명", helper: "입금대기 상태" },
  { label: "입금 대기", value: "5건", helper: "전화 후 입금 확인 필요" },
  { label: "일시후원", value: "14건", helper: "누적 신청 기준" },
  { label: "정기후원", value: "16건", helper: "활성 신청 기준" },
];

const todayCalls = [
  { sponsor: "김민서", phone: "010-1245-9981", student: "바다" },
  { sponsor: "최도윤", phone: "010-9910-2208", student: "도담" },
  { sponsor: "이하늘", phone: "010-5528-6610", student: "시온" },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-5 pb-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <AdminMetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            helper={metric.helper}
          />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="surface-card overflow-hidden">
          <header className="border-b border-[var(--border)] px-5 py-4">
            <h2 className="text-lg font-bold text-[#2f241d]">최근 후원 신청</h2>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="bg-[#fff5ea] text-left text-[#6d5545]">
                <tr>
                  <th className="px-4 py-3">신청번호</th>
                  <th className="px-4 py-3">후원자</th>
                  <th className="px-4 py-3">후원방식</th>
                  <th className="px-4 py-3">상태</th>
                  <th className="px-4 py-3">신청일</th>
                </tr>
              </thead>
              <tbody>
                {sponsorships.map((item) => (
                  <tr key={item.id} className="border-t border-[var(--border)]">
                    <td className="px-4 py-3">{item.id}</td>
                    <td className="px-4 py-3">{item.sponsorName}</td>
                    <td className="px-4 py-3">
                      {item.sponsorshipType} ({item.sponsorshipPeriod})
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill
                        label={item.status}
                        className={getSponsorshipStatusClass(item.status)}
                      />
                    </td>
                    <td className="px-4 py-3">{item.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="surface-card p-5">
          <h2 className="text-lg font-bold text-[#2f241d]">오늘 전화할 후원자</h2>
          <ul className="mt-4 space-y-3">
            {todayCalls.map((call) => (
              <li
                key={call.phone}
                className="rounded-xl border border-[var(--border)] bg-[#fff9f3] p-4"
              >
                <p className="font-semibold text-[#4f3d31]">{call.sponsor}</p>
                <p className="mt-1 text-sm subtle-text">{call.phone}</p>
                <p className="mt-1 text-xs text-[#7c6658]">
                  대상 학생: {call.student}
                </p>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
