"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteSponsorshipAction,
  updateSponsorshipStatusAction,
} from "@/app/admin/(panel)/sponsorships/actions";
import { CopyButton } from "@/components/ui/copy-button";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { FeedbackToast } from "@/components/ui/feedback-toast";
import { StatusPill } from "@/components/ui/status-pill";
import {
  formatDateTimeKorean,
  getSponsorshipStatusClass,
  getStudentStatusClass,
  getStudentStatusLabel,
} from "@/lib/utils";
import { maskStudentRealName } from "@/lib/students/display";
import {
  SponsorshipProgressStatus,
  SponsorshipRecord,
  StudentProfile,
  StudentSponsorshipStatus,
} from "@/types";

type StatusFilter = "전체" | SponsorshipProgressStatus;

const STATUS_FILTER_OPTIONS: StatusFilter[] = [
  "전체",
  "입금대기",
  "입금완료",
  "취소",
];

const STATUS_UPDATE_OPTIONS: SponsorshipProgressStatus[] = [
  "입금대기",
  "입금완료",
  "취소",
];

interface AdminSponsorshipsManagerProps {
  initialSponsorships: SponsorshipRecord[];
  students: StudentProfile[];
}

interface ActionFeedback {
  type: "success" | "error" | "info";
  message: string;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function toStudentStatus(
  status: SponsorshipProgressStatus,
): StudentSponsorshipStatus {
  if (status === "입금완료") {
    return "matched";
  }

  if (status === "취소") {
    return "available";
  }

  return "pending";
}

function getMessagePreview(message: string): string {
  if (message.length <= 24) {
    return message;
  }

  return `${message.slice(0, 24)}…`;
}

function getStudentDisplayName(student?: StudentProfile): string {
  if (!student) {
    return "학생 정보 없음";
  }

  const realName = student.realName?.trim();
  if (!realName) {
    return student.publicName;
  }

  return `${maskStudentRealName(realName)} (${realName})`;
}

function toTelHref(phone: string): string {
  const dialNumber = phone.replace(/[^\d+]/g, "");
  return `tel:${dialNumber}`;
}

export function AdminSponsorshipsManager({
  initialSponsorships,
  students,
}: AdminSponsorshipsManagerProps) {
  const router = useRouter();
  const [items, setItems] = useState<SponsorshipRecord[]>(initialSponsorships);
  const [feedback, setFeedback] = useState<ActionFeedback | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("전체");
  const [openedMessageId, setOpenedMessageId] = useState<string | null>(null);
  const [draftStatusById, setDraftStatusById] = useState<
    Record<string, SponsorshipProgressStatus>
  >(
    Object.fromEntries(
      initialSponsorships.map((item) => [item.id, item.status]),
    ) as Record<string, SponsorshipProgressStatus>,
  );

  useEffect(() => {
    if (!openedMessageId) {
      return;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenedMessageId(null);
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [openedMessageId]);

  const studentById = useMemo(
    () => new Map(students.map((student) => [student.id, student])),
    [students],
  );

  const filteredItems = useMemo(() => {
    const normalizedKeyword = normalize(keyword);

    return items.filter((item) => {
      if (statusFilter !== "전체" && item.status !== statusFilter) {
        return false;
      }

      if (!normalizedKeyword) {
        return true;
      }

      const student = studentById.get(item.studentId);
      const searchTargets = [
        item.sponsorName,
        item.sponsorPhone,
        item.sponsorEmail,
        student?.publicName ?? "",
        student?.realName ?? "",
      ].map((value) => normalize(value));

      return searchTargets.some((value) => value.includes(normalizedKeyword));
    });
  }, [items, keyword, statusFilter, studentById]);

  const openedItem = useMemo(
    () => items.find((item) => item.id === openedMessageId) ?? null,
    [items, openedMessageId],
  );

  const openedStudent = openedItem
    ? (studentById.get(openedItem.studentId) ?? null)
    : null;

  const isUpdating = updatingId !== null;
  const isDeleting = deletingId !== null;
  const isMutating = isUpdating || isDeleting;

  const handleApplyStatus = async (id: string) => {
    if (isMutating) {
      return;
    }

    const targetItem = items.find((item) => item.id === id);
    const nextStatus = draftStatusById[id];
    if (!targetItem || !nextStatus) {
      return;
    }

    if (targetItem.status === nextStatus) {
      setFeedback({
        type: "info",
        message: "변경할 상태가 없습니다.",
      });
      return;
    }

    const shouldUpdate = window.confirm(
      `${targetItem.sponsorName} 후원 신청 상태를 "${nextStatus}"로 변경하시겠습니까?`,
    );
    if (!shouldUpdate) {
      return;
    }

    setFeedback(null);
    setUpdatingId(id);

    try {
      const result = await updateSponsorshipStatusAction({
        id,
        status: nextStatus,
      });

      if (!result.ok || !result.status) {
        setFeedback({
          type: "error",
          message: result.message,
        });
        return;
      }
      const savedStatus = result.status;

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, status: savedStatus } : item,
        ),
      );

      setDraftStatusById((prev) => ({
        ...prev,
        [id]: savedStatus,
      }));

      setFeedback({
        type: "success",
        message: result.message,
      });
      router.refresh();
    } catch (error) {
      console.error(
        "[admin sponsorships manager] failed to apply sponsorship status",
        error,
      );
      setFeedback({
        type: "error",
        message: "상태 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteSponsorship = async (id: string) => {
    if (isMutating) {
      return;
    }

    const targetItem = items.find((item) => item.id === id);
    if (!targetItem) {
      return;
    }

    const shouldDelete = window.confirm(
      `${targetItem.sponsorName} 결연 신청을 삭제하시겠습니까?\n삭제 후에는 목록에서 사라집니다.`,
    );
    if (!shouldDelete) {
      return;
    }

    setFeedback(null);
    setDeletingId(id);

    try {
      const result = await deleteSponsorshipAction(id);

      if (!result.ok) {
        setFeedback({
          type: "error",
          message: result.message,
        });
        return;
      }

      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
      setDraftStatusById((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      if (openedMessageId === id) {
        setOpenedMessageId(null);
      }

      setFeedback({
        type: "success",
        message: result.message,
      });
      router.refresh();
    } catch (error) {
      console.error(
        "[admin sponsorships manager] failed to delete sponsorship",
        error,
      );
      setFeedback({
        type: "error",
        message: "결연 신청 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      <section className="surface-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[#2f241d]">결연 신청 검색/필터</h2>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-[1.6fr_0.8fr_auto_auto]">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            aria-label="결연 신청 검색"
            className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
            placeholder="이름 / 전화번호 / 이메일 / 학생 검색…"
          />
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
            aria-label="결연 신청 상태 필터"
            className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setKeyword("");
              setStatusFilter("전체");
            }}
            className="btn-secondary px-3 py-2 text-xs"
          >
            필터 초기화
          </button>
          <div className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[#f5f2eb] px-3 py-2 text-xs font-black text-[#4b5f53]">
            {filteredItems.length} / {items.length}건
          </div>
        </div>
        {feedback ? (
          <FeedbackToast type={feedback.type} message={feedback.message} className="mt-3" />
        ) : null}
      </section>

      <section className="surface-card overflow-hidden">
        <header className="border-b border-[var(--border)] px-4 py-2.5">
          <h2 className="text-lg font-bold text-[#2f241d]">결연 신청 목록</h2>
        </header>
        {filteredItems.length === 0 ? (
          <EmptyStateCard
            className="m-5"
            title="조건에 맞는 결연 신청이 없습니다."
            description="검색어 또는 상태 필터를 조정해 주세요."
          />
        ) : (
          <>
          <ul className="space-y-3 p-4 md:hidden">
            {filteredItems.map((item) => {
              const student = studentById.get(item.studentId);
              const studentStatus = toStudentStatus(item.status);
              const message = item.sponsorMessage?.trim() || "응원 메시지 없음";
              const draftStatus = draftStatusById[item.id] ?? item.status;
              const canApply = !isMutating && draftStatus !== item.status;

              return (
                <li
                  key={item.id}
                  className="rounded-2xl border border-[var(--border)] bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-base font-black text-[#18211d]">
                        {item.sponsorName}
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#314039]">
                        {getStudentDisplayName(student)}
                      </p>
                    </div>
                    <StatusPill
                      label={item.status}
                      className={getSponsorshipStatusClass(item.status)}
                    />
                  </div>

                  <dl className="mt-3 grid gap-2 text-sm text-[#314039]">
                    <div className="grid grid-cols-[4.5rem_1fr] gap-2">
                      <dt className="font-bold text-[#63706a]">신청일</dt>
                      <dd>{formatDateTimeKorean(item.createdAt)}</dd>
                    </div>
                    <div className="grid grid-cols-[4.5rem_1fr] gap-2">
                      <dt className="font-bold text-[#63706a]">전화</dt>
                      <dd className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold tabular-nums">
                          {item.sponsorPhone}
                        </span>
                        <a
                          href={toTelHref(item.sponsorPhone)}
                          aria-label={`전화 걸기: ${item.sponsorPhone}`}
                          className="rounded-lg border border-[var(--border)] bg-white px-2 py-1 text-[11px] font-bold text-[#7a5d4a]"
                        >
                          전화 걸기
                        </a>
                        <CopyButton value={item.sponsorPhone} label="복사" />
                      </dd>
                    </div>
                    <div className="grid grid-cols-[4.5rem_1fr] gap-2">
                      <dt className="font-bold text-[#63706a]">이메일</dt>
                      <dd className="min-w-0 break-all">{item.sponsorEmail}</dd>
                    </div>
                    <div className="grid grid-cols-[4.5rem_1fr] gap-2">
                      <dt className="font-bold text-[#63706a]">학생 상태</dt>
                      <dd>
                        <StatusPill
                          label={getStudentStatusLabel(studentStatus)}
                          className={getStudentStatusClass(studentStatus)}
                        />
                      </dd>
                    </div>
                    <div className="grid grid-cols-[4.5rem_1fr] gap-2">
                      <dt className="font-bold text-[#63706a]">메시지</dt>
                      <dd>
                        <p className="break-words">{getMessagePreview(message)}</p>
                        <button
                          type="button"
                          onClick={() => setOpenedMessageId(item.id)}
                          className="mt-1 text-xs font-bold text-[#8b552f] underline underline-offset-2"
                        >
                          상세 보기
                        </button>
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-2">
                    <select
                      value={draftStatus}
                      onChange={(event) =>
                        setDraftStatusById((prev) => ({
                          ...prev,
                          [item.id]: event.target
                            .value as SponsorshipProgressStatus,
                        }))
                      }
                      disabled={isMutating}
                      aria-label={`${item.sponsorName} 상태 변경 선택`}
                      className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
                    >
                      {STATUS_UPDATE_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleApplyStatus(item.id)}
                      disabled={!canApply}
                      className="btn-secondary px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label={`${item.sponsorName} 상태 저장`}
                    >
                      {updatingId === item.id ? "저장 중…" : "적용"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSponsorship(item.id)}
                      disabled={isMutating}
                      className="rounded-xl border border-[#ead3cf] bg-[#fff7f5] px-3 py-2 text-xs font-black text-[#a84a3f] transition hover:border-[#d9aaa2] hover:bg-[#fff0ed] disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label={`${item.sponsorName} 결연 신청 삭제`}
                    >
                      {deletingId === item.id ? "삭제 중" : "삭제"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="hidden overflow-x-auto md:block">
            <table className="data-table min-w-[1320px] text-[0.78rem]">
              <thead>
                <tr>
                  <th>신청일</th>
                  <th>후원자 이름</th>
                  <th>전화번호</th>
                  <th>이메일</th>
                  <th>학생</th>
                  <th>후원 방식</th>
                  <th>후원 기간</th>
                  <th>후원자 공개 여부</th>
                  <th>영수증 희망</th>
                  <th>응원 메시지</th>
                  <th>상태</th>
                  <th>상태 변경</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const student = studentById.get(item.studentId);
                  const studentStatus = toStudentStatus(item.status);
                  const message = item.sponsorMessage?.trim() || "응원 메시지 없음";
                  const draftStatus = draftStatusById[item.id] ?? item.status;
                  const canApply = !isMutating && draftStatus !== item.status;

                  return (
                    <tr key={item.id}>
                      <td className="whitespace-nowrap">
                        {formatDateTimeKorean(item.createdAt)}
                      </td>
                      <td className="whitespace-nowrap font-semibold text-[#4f3b30]">
                        {item.sponsorName}
                      </td>
                      <td className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{item.sponsorPhone}</span>
                          <CopyButton value={item.sponsorPhone} label="복사" />
                        </div>
                      </td>
                      <td className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{item.sponsorEmail}</span>
                          <CopyButton value={item.sponsorEmail} label="복사" />
                        </div>
                      </td>
                      <td className="whitespace-nowrap">
                        <div className="space-y-2">
                          <p className="font-semibold text-[#4f3b30]">
                            {getStudentDisplayName(student)}
                          </p>
                          <StatusPill
                            label={getStudentStatusLabel(studentStatus)}
                            className={getStudentStatusClass(studentStatus)}
                          />
                        </div>
                      </td>
                      <td className="whitespace-nowrap">{item.sponsorshipType}</td>
                      <td className="whitespace-nowrap">{item.sponsorshipPeriod}</td>
                      <td className="whitespace-nowrap">
                        {item.sponsorPublic ? "공개" : "비공개"}
                      </td>
                      <td className="whitespace-nowrap">
                        {item.receiptRequested ? "희망" : "미희망"}
                      </td>
                      <td>
                        <div className="max-w-[180px] space-y-1.5">
                          <p className="text-[#4f3b30]">{getMessagePreview(message)}</p>
                          <button
                            type="button"
                            onClick={() => setOpenedMessageId(item.id)}
                            className="text-xs font-semibold text-[#8b552f] underline underline-offset-2"
                            aria-label={`${item.sponsorName} 후원자 응원 메시지 상세 보기`}
                          >
                            상세 보기
                          </button>
                        </div>
                      </td>
                      <td className="whitespace-nowrap">
                        <StatusPill
                          label={item.status}
                          className={getSponsorshipStatusClass(item.status)}
                        />
                      </td>
                      <td>
                        <div className="flex min-w-[230px] items-center gap-1.5">
                          <select
                            value={draftStatus}
                            onChange={(event) =>
                              setDraftStatusById((prev) => ({
                                ...prev,
                                [item.id]: event.target
                                  .value as SponsorshipProgressStatus,
                              }))
                            }
                            disabled={isMutating}
                            aria-label={`${item.sponsorName} 상태 변경 선택`}
                            className="min-w-[108px] flex-1 rounded-lg border border-[var(--border)] bg-white px-2 py-1.5 text-xs"
                          >
                            {STATUS_UPDATE_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleApplyStatus(item.id)}
                            disabled={!canApply}
                            className="btn-secondary px-2.5 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label={`${item.sponsorName} 상태 저장`}
                          >
                            {updatingId === item.id ? "저장 중…" : "적용"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSponsorship(item.id)}
                            disabled={isMutating}
                            className="rounded-lg border border-[#ead3cf] bg-[#fff7f5] px-2.5 py-1.5 text-xs font-black text-[#a84a3f] transition hover:border-[#d9aaa2] hover:bg-[#fff0ed] disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label={`${item.sponsorName} 결연 신청 삭제`}
                          >
                            {deletingId === item.id ? "삭제 중" : "삭제"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
      </section>

      {openedItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
          role="dialog"
          aria-modal="true"
          aria-label="응원 메시지 상세"
          onClick={() => setOpenedMessageId(null)}
        >
          <div
            className="surface-card w-full max-w-xl p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#946b52]">
                  응원 메시지 상세
                </p>
                <h3 className="mt-2 text-xl font-bold text-[#2f241d]">
                  {openedItem.sponsorName} 후원자
                </h3>
                <p className="mt-1 text-sm subtle-text">
                  학생: {getStudentDisplayName(openedStudent ?? undefined)}
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary px-3 py-2 text-xs"
                onClick={() => setOpenedMessageId(null)}
                aria-label="응원 메시지 상세 닫기"
              >
                닫기
              </button>
            </div>
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-white p-4 text-sm leading-7 text-[#2f3d35]">
              {openedItem.sponsorMessage?.trim() || "등록된 응원 메시지가 없습니다."}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
