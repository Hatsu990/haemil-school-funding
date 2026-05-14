"use client";

import { useEffect, useMemo, useState } from "react";
import { updateSponsorshipStatusAction } from "@/app/admin/(panel)/sponsorships/actions";
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

  return `${message.slice(0, 24)}...`;
}

export function AdminSponsorshipsManager({
  initialSponsorships,
  students,
}: AdminSponsorshipsManagerProps) {
  const [items, setItems] = useState<SponsorshipRecord[]>(initialSponsorships);
  const [feedback, setFeedback] = useState<ActionFeedback | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
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

      const studentNickname = studentById.get(item.studentId)?.nickname ?? "";
      const searchTargets = [
        item.sponsorName,
        item.sponsorPhone,
        item.sponsorEmail,
        studentNickname,
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

  const handleApplyStatus = async (id: string) => {
    if (isUpdating) {
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

  return (
    <div className="space-y-5 pb-8">
      <section className="surface-card p-5">
        <h2 className="text-lg font-bold text-[#2f241d]">결연 신청 검색/필터</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-[1.6fr_1fr_auto_auto]">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            aria-label="결연 신청 검색"
            className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
            placeholder="이름 / 전화번호 / 이메일 / 학생 닉네임 검색"
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
          <div className="inline-flex items-center rounded-xl border border-[var(--border)] bg-[#fff8f0] px-3 py-2 text-xs font-semibold text-[#7f5f4b]">
            {filteredItems.length} / {items.length}건
          </div>
        </div>
        {feedback ? (
          <FeedbackToast type={feedback.type} message={feedback.message} className="mt-3" />
        ) : null}
      </section>

      <section className="surface-card overflow-hidden">
        <header className="border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-lg font-bold text-[#2f241d]">결연 신청 목록</h2>
        </header>
        {filteredItems.length === 0 ? (
          <EmptyStateCard
            className="m-5"
            title="조건에 맞는 결연 신청이 없습니다."
            description="검색어 또는 상태 필터를 조정해 주세요."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table min-w-[1680px]">
              <thead className="bg-[#fff5ea] text-left text-[#6d5545]">
                <tr>
                  <th>신청일</th>
                  <th>후원자 이름</th>
                  <th>전화번호</th>
                  <th>이메일</th>
                  <th>학생 닉네임</th>
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
                  const canApply = !isUpdating && draftStatus !== item.status;

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
                            {student?.nickname ?? "알 수 없음"}
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
                        <div className="max-w-[220px] space-y-2">
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
                        <div className="flex min-w-[180px] items-center gap-2">
                          <select
                            value={draftStatus}
                            onChange={(event) =>
                              setDraftStatusById((prev) => ({
                                ...prev,
                                [item.id]: event.target
                                  .value as SponsorshipProgressStatus,
                              }))
                            }
                            disabled={isUpdating}
                            aria-label={`${item.sponsorName} 상태 변경 선택`}
                            className="w-full rounded-lg border border-[var(--border)] bg-white px-2 py-2 text-xs"
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
                            className="btn-secondary px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label={`${item.sponsorName} 상태 저장`}
                          >
                            {updatingId === item.id ? "저장 중..." : "적용"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
            className="surface-card w-full max-w-xl p-6"
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
                  학생: {openedStudent?.nickname ?? "알 수 없음"}
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
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[#fffaf4] p-4 text-sm leading-7 text-[#4f3b30]">
              {openedItem.sponsorMessage?.trim() || "등록된 응원 메시지가 없습니다."}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
