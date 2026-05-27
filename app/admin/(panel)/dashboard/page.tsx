import Link from "next/link";
import { CopyButton } from "@/components/ui/copy-button";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { StatusPill } from "@/components/ui/status-pill";
import { buildDbErrorMessage, logDbLoadError } from "@/lib/db/debug";
import { getGalleryItems } from "@/lib/repositories/gallery";
import { getSmsLogs } from "@/lib/repositories/sms";
import { getSponsorships } from "@/lib/repositories/sponsorships";
import { getStudents } from "@/lib/repositories/students";
import { getPublicStudentName } from "@/lib/students/display";
import {
  formatDateTimeKorean,
  getSponsorshipStatusClass,
} from "@/lib/utils";
import { GalleryItem, SmsLog, SponsorshipRecord, StudentProfile } from "@/types";

const RECENT_REQUEST_LIMIT = 3;
const CONTACT_TARGET_LIMIT = 2;
const RECENT_GALLERY_LIMIT = 1;

export const dynamic = "force-dynamic";

function toTelHref(phone: string): string {
  const dialNumber = phone.replace(/[^\d+]/g, "");
  return `tel:${dialNumber}`;
}

function formatPercent(value: number): string {
  return `${new Intl.NumberFormat("ko-KR").format(value)}%`;
}

function formatCount(value: number, suffix: string): string {
  return `${new Intl.NumberFormat("ko-KR").format(value)}${suffix}`;
}

function getStudentName(
  studentById: Map<string, StudentProfile>,
  studentId: string,
): string {
  const student = studentById.get(studentId);
  return student ? getPublicStudentName(student) : "학생 정보 없음";
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
  const availableStudentCount = students.filter(
    (student) => student.sponsorshipStatus === "available",
  ).length;
  const pendingSponsorships = sponsorships.filter(
    (item) => item.status === "입금대기",
  );
  const pendingSponsorshipCount = pendingSponsorships.length;
  const completedSponsorshipCount = sponsorships.filter(
    (item) => item.status === "입금완료",
  ).length;
  const recentRequests = sponsorships.slice(0, RECENT_REQUEST_LIMIT);
  const callTargets = pendingSponsorships.slice(0, CONTACT_TARGET_LIMIT);
  const recentGalleryItems = galleryItems.slice(0, RECENT_GALLERY_LIMIT);
  const hiddenCallTargetCount = Math.max(
    0,
    pendingSponsorshipCount - callTargets.length,
  );
  const progressPercentage =
    totalStudentCount === 0
      ? 0
      : Math.round((matchedStudentCount / totalStudentCount) * 100);
  const studentById = new Map(students.map((student) => [student.id, student]));
  const latestSmsLog = smsLogs[0] ?? null;
  const needsContact = pendingSponsorshipCount > 0;

  return (
    <div className="grid items-start gap-4 pb-4 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.36fr)]">
      <section className="min-w-0 space-y-4">
        <article className="surface-card overflow-hidden p-5 sm:p-6 xl:p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black text-[#486f5b] xl:text-xs">
                현재 결연률
              </p>
              <h2 className="mt-2 text-4xl font-black leading-none text-[#18211d] sm:text-5xl xl:text-4xl">
                {formatPercent(progressPercentage)}
              </h2>
            </div>
            <div className="rounded-2xl bg-[#f7f3ea] px-4 py-3 text-right xl:px-3 xl:py-2">
              <p className="text-xs font-bold text-[#63706a]">결연 완료</p>
              <p className="mt-1 text-xl font-black text-[#18211d] xl:text-lg">
                {matchedStudentCount} / {totalStudentCount}명
              </p>
            </div>
          </div>

          <div className="mt-5 h-4 overflow-hidden rounded-full bg-[#e8dfcf] xl:mt-3 xl:h-2.5">
            <div
              className="h-full rounded-full bg-[#486f5b]"
              style={{ width: `${progressPercentage}%` }}
              aria-label={`현재 결연률 ${progressPercentage}%`}
            />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-4 xl:mt-3 xl:gap-2">
            <div className="rounded-2xl border border-[var(--border)] bg-white p-4 xl:p-3">
              <p className="text-xs font-bold text-[#63706a]">전체 학생</p>
              <p className="mt-1 text-2xl font-black text-[#18211d] xl:text-xl">
                {formatCount(totalStudentCount, "명")}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-white p-4 xl:p-3">
              <p className="text-xs font-bold text-[#63706a]">결연 완료</p>
              <p className="mt-1 text-2xl font-black text-[#18211d] xl:text-xl">
                {formatCount(matchedStudentCount, "명")}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-white p-4 xl:p-3">
              <p className="text-xs font-bold text-[#63706a]">결연 대기</p>
              <p className="mt-1 text-2xl font-black text-[#18211d] xl:text-xl">
                {formatCount(pendingStudentCount, "명")}
              </p>
            </div>
            <div className="rounded-2xl border border-[#e8c991] bg-[#fff8e7] p-4 xl:p-3">
              <p className="text-xs font-bold text-[#8a631d]">입금 대기</p>
              <p className="mt-1 text-2xl font-black text-[#7a5212] xl:text-xl">
                {formatCount(pendingSponsorshipCount, "건")}
              </p>
            </div>
          </div>
        </article>

        <article className="surface-card overflow-hidden">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4 xl:px-4 xl:py-3">
            <div>
              <h2 className="text-lg font-black text-[#18211d] xl:text-base">
                최근 신청 내역
              </h2>
              <p className="mt-1 text-xs font-semibold text-[#63706a] xl:hidden">
                새 신청과 상태 확인이 필요한 항목입니다.
              </p>
            </div>
            <Link href="/admin/sponsorships" className="btn-secondary min-h-9 px-4 py-2 text-xs">
              전체 보기
            </Link>
          </header>
          {recentRequests.length === 0 ? (
            <EmptyStateCard
              className="m-5"
              title="최근 결연 신청이 없습니다."
              description="신청이 접수되면 최근순으로 표시됩니다."
            />
          ) : (
            <>
            <ul className="space-y-3 p-4 sm:hidden">
              {recentRequests.map((item) => (
                <li
                  key={item.id}
                  className="rounded-2xl border border-[var(--border)] bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-black text-[#18211d]">
                        {item.sponsorName}
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#314039]">
                        {getStudentName(studentById, item.studentId)}
                      </p>
                    </div>
                    <StatusPill
                      label={item.status}
                      className={getSponsorshipStatusClass(item.status)}
                    />
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-[#314039]">
                    <p className="font-mono font-bold tabular-nums">
                      {item.sponsorPhone}
                    </p>
                    <p className="text-xs font-semibold text-[#63706a]">
                      {formatDateTimeKorean(item.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto sm:block">
              <table className="data-table min-w-full">
                <thead>
                  <tr>
                    <th>신청일</th>
                    <th>후원자</th>
                    <th>학생</th>
                    <th>연락처</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody className="xl:text-xs">
                  {recentRequests.map((item) => (
                    <tr key={item.id}>
                      <td className="whitespace-nowrap">
                        {formatDateTimeKorean(item.createdAt)}
                      </td>
                      <td className="whitespace-nowrap font-bold text-[#18211d]">
                        {item.sponsorName}
                      </td>
                      <td className="whitespace-nowrap">
                        {getStudentName(studentById, item.studentId)}
                      </td>
                      <td className="whitespace-nowrap font-mono text-xs font-bold tabular-nums">
                        {item.sponsorPhone}
                      </td>
                      <td className="whitespace-nowrap">
                        <StatusPill
                          label={item.status}
                          className={getSponsorshipStatusClass(item.status)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </article>
      </section>

      <aside className="min-w-0 space-y-4">
        <article className="surface-card p-5 sm:p-6 xl:p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black text-[#486f5b] xl:text-xs">
                오늘 연락 필요한 후원자
              </p>
              <h2 className="mt-2 text-4xl font-black leading-none text-[#18211d] xl:text-3xl">
                {formatCount(pendingSponsorshipCount, "건")}
              </h2>
            </div>
            <Link href="/admin/sponsorships" className="btn-secondary min-h-9 px-4 py-2 text-xs">
              결연 관리
            </Link>
          </div>

          {callTargets.length === 0 ? (
            <EmptyStateCard
              className="mt-5"
              title="오늘 연락할 후원자가 없습니다."
              description="입금 대기 신청이 생기면 이곳에 먼저 표시됩니다."
            />
          ) : (
            <ul className="mt-5 space-y-3 xl:mt-3 xl:space-y-2">
              {callTargets.map((item) => (
                <li
                  key={item.id}
                  className="rounded-2xl border border-[var(--border)] bg-white p-4 xl:p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-black text-[#18211d] xl:text-sm">
                        {item.sponsorName}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#314039] xl:text-xs">
                        {getStudentName(studentById, item.studentId)}
                      </p>
                    </div>
                    <StatusPill
                      label={item.status}
                      className={getSponsorshipStatusClass(item.status)}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 xl:mt-2">
                    <p className="font-mono text-sm font-bold text-[#18211d] tabular-nums xl:text-xs">
                      {item.sponsorPhone}
                    </p>
                    <CopyButton
                      value={item.sponsorPhone}
                      label="전화번호 복사"
                      className="hidden sm:inline-flex"
                    />
                    <a
                      href={toTelHref(item.sponsorPhone)}
                      aria-label={`전화 걸기: ${item.sponsorPhone}`}
                      className="inline-flex rounded-lg border border-[var(--border)] bg-white px-2 py-1 text-[11px] font-semibold text-[#7a5d4a] hover:bg-[#fff4e9] sm:hidden"
                    >
                      전화 걸기
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {hiddenCallTargetCount > 0 ? (
            <p className="mt-3 text-xs font-semibold text-[#63706a]">
              외 {hiddenCallTargetCount}건은 결연 신청 관리에서 확인할 수 있습니다.
            </p>
          ) : null}
        </article>

        <section className="surface-card p-5 xl:p-4">
          <h2 className="text-lg font-black text-[#18211d] xl:text-base">현재 운영 상태</h2>
          <div className="mt-4 space-y-3 xl:mt-3 xl:space-y-2">
            <div className="rounded-2xl bg-[#f7f3ea] p-4 xl:p-3">
              <p className="text-xs font-bold text-[#63706a]">우선 처리</p>
              <p className="mt-1 text-base font-black text-[#18211d] xl:text-sm">
                {needsContact
                  ? `입금 대기 ${pendingSponsorshipCount}건 확인 필요`
                  : "새로 연락할 입금 대기 신청 없음"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 xl:gap-2">
              <div className="rounded-2xl border border-[var(--border)] bg-white p-4 xl:p-3">
                <p className="text-xs font-bold text-[#63706a]">신청 가능</p>
                <p className="mt-1 text-xl font-black text-[#18211d] xl:text-lg">
                  {formatCount(availableStudentCount, "명")}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-white p-4 xl:p-3">
                <p className="text-xs font-bold text-[#63706a]">입금 완료 신청</p>
                <p className="mt-1 text-xl font-black text-[#18211d] xl:text-lg">
                  {formatCount(completedSponsorshipCount, "건")}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-white p-4 xl:p-3">
              <p className="text-xs font-bold text-[#63706a]">최근 문자 상태</p>
              <p className="mt-1 text-sm font-black text-[#18211d] xl:text-xs">
                {latestSmsLog
                  ? `${latestSmsLog.status} · ${formatDateTimeKorean(latestSmsLog.createdAt)}`
                  : "발송 이력 없음"}
              </p>
            </div>
          </div>
        </section>

        <section className="surface-card p-5 xl:p-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-black text-[#18211d] xl:text-base">
              최근 갤러리 업로드
            </h2>
            <Link href="/admin/gallery" className="btn-secondary min-h-9 px-4 py-2 text-xs">
              관리
            </Link>
          </div>
          {recentGalleryItems.length === 0 ? (
            <EmptyStateCard
              className="mt-4"
              title="최근 업로드가 없습니다."
              description="갤러리 관리에서 학교 활동 기록을 추가할 수 있습니다."
            />
          ) : (
            <ul className="mt-4 space-y-3 xl:mt-3 xl:space-y-2">
              {recentGalleryItems.map((item) => (
                <li
                  key={item.id}
                  className="rounded-2xl border border-[var(--border)] bg-white p-4 xl:p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-[#18211d]">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-[#63706a]">
                        {formatDateTimeKorean(item.createdAt)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#eef4eb] px-3 py-1 text-xs font-bold text-[#486f5b]">
                      {item.type === "video" ? "영상" : "사진"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>
    </div>
  );
}
