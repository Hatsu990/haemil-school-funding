import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { CopyButton } from "@/components/ui/copy-button";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { buildDbErrorMessage, logDbLoadError } from "@/lib/db/debug";
import { getGalleryItems } from "@/lib/repositories/gallery";
import { getSmsLogs } from "@/lib/repositories/sms";
import { getSponsorships } from "@/lib/repositories/sponsorships";
import { getStudents } from "@/lib/repositories/students";
import { formatDateTimeKorean, getSponsorshipStatusClass } from "@/lib/utils";
import { StatusPill } from "@/components/ui/status-pill";
import { GalleryItem, SmsLog, SponsorshipRecord, StudentProfile } from "@/types";

const RECENT_REQUEST_LIMIT = 10;
const CONTACT_TARGET_LIMIT = 10;
const LAST_30_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;
const STATUS_CHANGE_TEMPLATE_NAME = "sponsorship_status_change";

export const dynamic = "force-dynamic";

function toTimestamp(value: string): number | null {
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const timestamp = Date.parse(normalized);
  if (!Number.isNaN(timestamp)) {
    return timestamp;
  }

  const utcTimestamp = Date.parse(`${normalized}Z`);
  if (!Number.isNaN(utcTimestamp)) {
    return utcTimestamp;
  }

  return null;
}

function isWithinRecent30Days(createdAt: string): boolean {
  const timestamp = toTimestamp(createdAt);
  if (timestamp === null) {
    return false;
  }

  const diff = Date.now() - timestamp;
  return diff >= 0 && diff <= LAST_30_DAYS_IN_MS;
}

function isDeliveryLog(log: SmsLog): boolean {
  return (
    log.templateName !== STATUS_CHANGE_TEMPLATE_NAME && log.phone.trim() !== "-"
  );
}

export default async function AdminDashboardPage() {
  let students: StudentProfile[] = [];
  let sponsorships: SponsorshipRecord[] = [];
  let smsLogs: SmsLog[] = [];
  let galleryItems: GalleryItem[] = [];
  let dbErrorMessage: string | null = null;

  try {
    [students, sponsorships, smsLogs, galleryItems] = await Promise.all([
      getStudents(),
      getSponsorships(),
      getSmsLogs(),
      getGalleryItems(),
    ]);
  } catch (error) {
    logDbLoadError("admin dashboard page", error);
    dbErrorMessage = buildDbErrorMessage(
      "대시보드 데이터를 불러오지 못했습니다. DB 연결 상태를 확인한 뒤 다시 시도해 주세요.",
    );
  }

  if (dbErrorMessage) {
    return (
      <section className="surface-card p-6 text-sm leading-7 text-[#5b473b]">
        <p className="font-semibold text-[#8c4f2d]">데이터 연결 안내</p>
        <p className="mt-2">{dbErrorMessage}</p>
      </section>
    );
  }

  const totalStudentCount = students.length;
  const matchedStudentCount = students.filter(
    (student) => student.sponsorshipStatus === "matched",
  ).length;
  const pendingStudentCount = students.filter(
    (student) => student.sponsorshipStatus === "pending",
  ).length;

  const pendingSponsorshipCount = sponsorships.filter(
    (item) => item.status === "입금대기",
  ).length;
  const completedSponsorshipCount = sponsorships.filter(
    (item) => item.status === "입금완료",
  ).length;
  const cancelledSponsorshipCount = sponsorships.filter(
    (item) => item.status === "취소",
  ).length;

  const oneTimeSponsorshipCount = sponsorships.filter(
    (item) => item.sponsorshipType === "일시후원",
  ).length;
  const recurringSponsorshipCount = sponsorships.filter(
    (item) => item.sponsorshipType === "정기후원",
  ).length;

  const recentDeliveryLogs = smsLogs.filter(
    (log) => isDeliveryLog(log) && isWithinRecent30Days(log.createdAt),
  );
  const recentSmsSentCount = recentDeliveryLogs.length;
  const recentSmsFailedCount = recentDeliveryLogs.filter(
    (log) => log.status === "실패",
  ).length;

  const galleryItemCount = galleryItems.length;

  const progressPercentage =
    totalStudentCount === 0
      ? 0
      : Math.round((matchedStudentCount / totalStudentCount) * 100);

  const studentById = new Map(students.map((student) => [student.id, student]));

  const recentRequests = sponsorships.slice(0, RECENT_REQUEST_LIMIT);
  const callTargets = sponsorships
    .filter((item) => item.status === "입금대기")
    .slice(0, CONTACT_TARGET_LIMIT);

  const hiddenCallTargetCount = Math.max(
    0,
    pendingSponsorshipCount - callTargets.length,
  );

  const metrics = [
    { label: "전체 학생 수", value: `${totalStudentCount}명`, helper: "students 기준" },
    { label: "결연 완료 학생 수", value: `${matchedStudentCount}명`, helper: "matched 상태" },
    { label: "결연 대기 학생 수", value: `${pendingStudentCount}명`, helper: "pending 상태" },
    { label: "입금 대기 신청 수", value: `${pendingSponsorshipCount}건`, helper: "입금대기 상태" },
    {
      label: "입금 완료 신청 수",
      value: `${completedSponsorshipCount}건`,
      helper: "입금완료 상태",
    },
    { label: "취소 신청 수", value: `${cancelledSponsorshipCount}건`, helper: "취소 상태" },
    { label: "일시후원 수", value: `${oneTimeSponsorshipCount}건`, helper: "sponsorship_type 기준" },
    { label: "정기후원 수", value: `${recurringSponsorshipCount}건`, helper: "sponsorship_type 기준" },
    {
      label: "최근 30일 문자 발송 수",
      value: `${recentSmsSentCount}건`,
      helper: "sms_logs(감사로그 제외)",
    },
    {
      label: "최근 30일 문자 실패 수",
      value: `${recentSmsFailedCount}건`,
      helper: "status=실패",
    },
    { label: "갤러리 등록 수", value: `${galleryItemCount}건`, helper: "gallery_items 기준" },
  ];

  return (
    <div className="space-y-5 pb-8">
      <section className="surface-card p-5">
        <h2 className="text-lg font-bold text-[#2f241d]">결연 진행률</h2>
        {totalStudentCount === 0 ? (
          <p className="mt-2 text-sm subtle-text">
            등록된 학생 데이터가 없어 진행률을 계산할 수 없습니다.
          </p>
        ) : (
          <p className="mt-2 text-sm text-[#5f4a3c]">
            <span className="font-semibold text-[#2f241d]">
              {matchedStudentCount} / {totalStudentCount}명 결연 완료
            </span>
            , {progressPercentage}% 달성
          </p>
        )}
      </section>

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
          {recentRequests.length === 0 ? (
            <EmptyStateCard
              className="m-5"
              title="최근 후원 신청이 없습니다."
              description="후원 신청이 접수되면 최근 신청 목록에 자동으로 표시됩니다."
            />
          ) : (
            <div className="overflow-x-auto">
            <table className="data-table min-w-[720px]">
              <thead className="bg-[#fff5ea] text-left text-[#6d5545]">
                <tr>
                  <th>후원자 이름</th>
                  <th>학생 닉네임</th>
                  <th>상태</th>
                  <th>신청일</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((item) => (
                  <tr key={item.id}>
                    <td className="whitespace-nowrap font-semibold text-[#4f3d31]">
                      {item.sponsorName}
                    </td>
                    <td className="whitespace-nowrap">
                      {studentById.get(item.studentId)?.nickname ?? "알 수 없음"}
                    </td>
                    <td className="whitespace-nowrap">
                      <StatusPill
                        label={item.status}
                        className={getSponsorshipStatusClass(item.status)}
                      />
                    </td>
                    <td className="whitespace-nowrap">
                      {formatDateTimeKorean(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </article>

        <article className="surface-card p-5">
          <h2 className="text-lg font-bold text-[#2f241d]">오늘 전화할 후원자</h2>
          <p className="mt-2 text-xs subtle-text">
            입금대기 상태 신청 {pendingSponsorshipCount}건 기준
          </p>

          {callTargets.length === 0 ? (
            <EmptyStateCard
              className="mt-4"
              title="오늘 연락이 필요한 신청이 없습니다."
              description="입금대기 상태 신청이 생기면 이 목록에 자동으로 표시됩니다."
            />
          ) : (
            <ul className="mt-4 space-y-3">
              {callTargets.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-[var(--border)] bg-[#fff9f3] p-4"
                >
                  <p className="font-semibold text-[#4f3d31]">{item.sponsorName}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="text-sm subtle-text">{item.sponsorPhone}</p>
                    <CopyButton value={item.sponsorPhone} label="전화번호 복사" />
                  </div>
                  <p className="mt-1 text-xs text-[#7c6658]">
                    대상 학생: {studentById.get(item.studentId)?.nickname ?? "알 수 없음"}
                  </p>
                  <p className="mt-1 text-xs text-[#7c6658]">
                    신청일: {formatDateTimeKorean(item.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {hiddenCallTargetCount > 0 ? (
            <p className="mt-3 text-xs subtle-text">
              외 {hiddenCallTargetCount}건은 결연 신청 관리에서 확인할 수 있습니다.
            </p>
          ) : null}
        </article>
      </section>
    </div>
  );
}
