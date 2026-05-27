"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  saveScholarshipRecordAction,
  uploadScholarshipFileAction,
} from "@/app/admin/(panel)/scholarships/actions";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { FeedbackToast } from "@/components/ui/feedback-toast";
import { maskStudentRealName } from "@/lib/students/display";
import {
  formatScholarshipRatio,
  getScholarshipTypeLabel,
  getScholarshipTypeLimit,
  getScholarshipTypeWithAmountLabel,
  getScholarshipUsagePercent,
  SCHOLARSHIP_TYPES,
} from "@/lib/scholarships";
import { ScholarshipType, StudentScholarshipView } from "@/types";

interface AdminScholarshipsManagerProps {
  initialViews: StudentScholarshipView[];
}

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

interface PendingQuotaWarning {
  studentId: string;
  scholarshipType: ScholarshipType;
  nextCount: number;
  limit: number;
  percent: number;
  entries: [string, FormDataEntryValue][];
}

type ScholarshipFilter = "all" | ScholarshipType;

const SCHOLARSHIP_SORT_ORDER: Record<ScholarshipType, number> = {
  부분장학금: 0,
  반액장학금: 1,
  전액장학금: 2,
};

const SCHOLARSHIP_FILTERS: Array<{
  value: ScholarshipFilter;
  label: string;
}> = [
  { value: "all", label: "전체" },
  { value: "전액장학금", label: "전액 장학금" },
  { value: "반액장학금", label: "반액 장학금" },
  { value: "부분장학금", label: "부분 장학금" },
];

function formatWon(value: number): string {
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

function getRecordValue(
  value: string | null | undefined,
  fallback: string,
): string {
  return value?.trim() || fallback;
}

export function AdminScholarshipsManager({
  initialViews,
}: AdminScholarshipsManagerProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [keyword, setKeyword] = useState("");
  const [scholarshipFilter, setScholarshipFilter] =
    useState<ScholarshipFilter>("all");
  const [savingStudentId, setSavingStudentId] = useState<string | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [pendingQuotaWarning, setPendingQuotaWarning] =
    useState<PendingQuotaWarning | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredViews = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();

    return initialViews
      .filter(({ student, record, scholarshipType }) => {
        if (
          scholarshipFilter !== "all" &&
          scholarshipType !== scholarshipFilter
        ) {
          return false;
        }

        if (!normalized) return true;

        const text = [
          student.id,
          maskStudentRealName(student.realName) || student.publicName,
          student.realName ?? "",
          student.grade,
          record?.studentName ?? "",
          record?.parentName ?? "",
          scholarshipType,
        ]
          .join(" ")
          .toLowerCase();

        return text.includes(normalized);
      })
      .sort((a, b) => {
        const typeOrder =
          SCHOLARSHIP_SORT_ORDER[a.scholarshipType] -
          SCHOLARSHIP_SORT_ORDER[b.scholarshipType];
        if (typeOrder !== 0) return typeOrder;

        const aName = a.student.realName?.trim() || a.student.publicName;
        const bName = b.student.realName?.trim() || b.student.publicName;
        return aName.localeCompare(bName, "ko-KR");
      });
  }, [initialViews, keyword, scholarshipFilter]);

  const summary = useMemo(() => {
    return initialViews.reduce(
      (acc, view) => {
        acc[view.scholarshipType] += 1;
        return acc;
      },
      {
        전액장학금: 0,
        반액장학금: 0,
        부분장학금: 0,
      } satisfies Record<ScholarshipType, number>,
    );
  }, [initialViews]);

  const quotaSummary = useMemo(() => {
    const totalCount = initialViews.length;
    return SCHOLARSHIP_TYPES.map((type) => {
      const count = summary[type];
      const limit = getScholarshipTypeLimit(type, totalCount);
      return {
        type,
        count,
        limit,
        percent: getScholarshipUsagePercent(count, limit),
      };
    });
  }, [initialViews.length, summary]);

  const saveRecord = (
    entries: [string, FormDataEntryValue][],
    studentId: string,
  ) => {
    const formData = new FormData();
    entries.forEach(([key, value]) => formData.append(key, value));
    setFeedback(null);
    setSavingStudentId(studentId);

    startTransition(async () => {
      const result = await saveScholarshipRecordAction(formData);
      setSavingStudentId(null);
      if (!result.ok) {
        setFeedback({ type: "error", message: result.message });
        return;
      }

      setFeedback({ type: "success", message: result.message });
      router.refresh();
    });
  };

  const handleSave = (event: FormEvent<HTMLFormElement>, studentId: string) => {
    event.preventDefault();
    if (isPending || savingStudentId || uploadingKey) return;

    const formData = new FormData(event.currentTarget);
    const scholarshipType = String(formData.get("scholarshipType") ?? "");
    const currentType =
      initialViews.find((view) => view.student.id === studentId)?.scholarshipType ??
      "부분장학금";

    if (
      (scholarshipType === "전액장학금" || scholarshipType === "반액장학금") &&
      scholarshipType !== currentType
    ) {
      const nextCount = summary[scholarshipType] + 1;
      const limit = getScholarshipTypeLimit(scholarshipType, initialViews.length);

      if (nextCount > limit) {
        setPendingQuotaWarning({
          studentId,
          scholarshipType,
          nextCount,
          limit,
          percent: getScholarshipUsagePercent(nextCount, limit),
          entries: Array.from(formData.entries()),
        });
        return;
      }
    }

    saveRecord(Array.from(formData.entries()), studentId);
  };

  const confirmQuotaOverride = () => {
    if (!pendingQuotaWarning) return;
    const warning = pendingQuotaWarning;
    setPendingQuotaWarning(null);
    saveRecord(warning.entries, warning.studentId);
  };

  const handleUpload = (
    event: FormEvent<HTMLFormElement>,
    studentId: string,
    fileKind: "residentRegistration" | "bankbook",
  ) => {
    event.preventDefault();
    if (isPending || savingStudentId || uploadingKey) return;

    const formData = new FormData(event.currentTarget);
    setFeedback(null);
    setUploadingKey(`${studentId}:${fileKind}`);

    startTransition(async () => {
      const result = await uploadScholarshipFileAction(formData);
      setUploadingKey(null);
      if (!result.ok) {
        setFeedback({ type: "error", message: result.message });
        return;
      }

      setFeedback({ type: "success", message: result.message });
      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      {pendingQuotaWarning ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#18211d]/62 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="scholarship-quota-warning-title"
        >
          <div className="w-full max-w-lg rounded-[28px] border border-[#efc7ba] bg-[#fffdf8] p-6 text-center shadow-[0_30px_90px_rgba(24,33,29,0.28)]">
            <div
              aria-hidden
              className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#fff1ef] text-2xl font-black text-[#a84a3f]"
            >
              !
            </div>
            <h2
              id="scholarship-quota-warning-title"
              className="mt-4 text-xl font-black text-[#18211d]"
            >
              장학금 배정 기준을 초과합니다
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#314039]">
              현재 학생 {initialViews.length}명 기준{" "}
              {getScholarshipTypeLabel(pendingQuotaWarning.scholarshipType)} 권장
              배정은 최대 {pendingQuotaWarning.limit}명입니다. 저장하면{" "}
              {pendingQuotaWarning.nextCount}명으로 {pendingQuotaWarning.percent}%가
              되어 기준 비율({formatScholarshipRatio(
                pendingQuotaWarning.scholarshipType,
              )})을 초과합니다.
            </p>
            <p className="mt-3 rounded-2xl bg-[#fff1ef] px-4 py-3 text-sm font-bold text-[#8d3c34]">
              그래도 이 학생을 해당 장학금 군으로 설정하시겠습니까?
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={confirmQuotaOverride}
                className="btn-primary !bg-[#a84a3f] !text-white hover:!bg-[#8d3c34]"
              >
                무시하고 설정
              </button>
              <button
                type="button"
                onClick={() => setPendingQuotaWarning(null)}
                className="btn-secondary"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="surface-card p-4">
        <div className="grid gap-3 md:grid-cols-3">
          {quotaSummary.map(({ type, count, limit, percent }) => (
            <div
              key={type}
              className="rounded-2xl border border-[var(--border)] bg-white p-4"
            >
              <p className="text-sm font-bold text-[#24372c]">
                {getScholarshipTypeWithAmountLabel(type)}
              </p>
              <p className="mt-2 text-2xl font-black text-[#18211d]">
                {count}명
              </p>
              <div className="mt-3 rounded-xl bg-[#f7f3ea] px-3 py-2 text-xs leading-5 text-[#5f4a3c]">
                <p className="font-bold">
                  기준 인원 {limit}명 중 {count}명
                </p>
                <p className="font-semibold text-[#486f5b]">{percent}% 배정</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="실명, 공개 표시명, 학년, 보호자명 검색…"
            aria-label="장학금 지급관리 검색"
            className="min-w-[220px] flex-1 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => setKeyword("")}
            className="btn-secondary px-3 py-2 text-xs"
          >
            검색 초기화
          </button>
          <span className="inline-flex min-h-10 items-center rounded-lg bg-[#f5f2eb] px-3 py-2 text-xs font-black text-[#4b5f53]">
            {filteredViews.length} / {initialViews.length}명
          </span>
        </div>
        <div
          className="mt-3 flex flex-wrap items-center gap-2"
          aria-label="장학금 구분 필터"
        >
          {SCHOLARSHIP_FILTERS.map((filter) => {
            const isSelected = scholarshipFilter === filter.value;
            const count =
              filter.value === "all"
                ? initialViews.length
                : summary[filter.value];

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setScholarshipFilter(filter.value)}
                aria-pressed={isSelected}
                className={
                  isSelected
                    ? "rounded-xl border border-[#486f5b] bg-[#486f5b] px-4 py-2 text-sm font-black text-white shadow-[0_10px_22px_rgba(72,111,91,0.16)]"
                    : "rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-bold text-[#314039] transition hover:border-[#486f5b] hover:bg-[#f7f3ea]"
                }
              >
                {filter.label}
                <span className={isSelected ? "ml-2 text-white/80" : "ml-2 text-[#6d5545]"}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        {feedback ? (
          <FeedbackToast type={feedback.type} message={feedback.message} className="mt-3" />
        ) : null}
      </section>

      <section className="space-y-4">
        {filteredViews.length === 0 ? (
          <EmptyStateCard
            title="조건에 맞는 학생이 없습니다."
            description="검색어를 지우거나 학생 정보를 먼저 등록해 주세요."
          />
        ) : (
          filteredViews.map(({ student, scholarshipType, scholarshipAmount, record }) => {
            const residentKey = `${student.id}:residentRegistration`;
            const bankbookKey = `${student.id}:bankbook`;

            return (
              <article key={student.id} className="surface-card p-4">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#2f241d]">
                      {student.realName?.trim() || student.publicName}
                    </h3>
                    <p className="mt-1 text-sm subtle-text">
                      공개 표시명: {maskStudentRealName(student.realName) || student.publicName} · {student.grade}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#eef4eb] px-3 py-1 text-xs font-bold text-[#486f5b]">
                    {getScholarshipTypeWithAmountLabel(scholarshipType)}
                  </span>
                </div>

                <form
                  onSubmit={(event) => handleSave(event, student.id)}
                  className="grid gap-3 md:grid-cols-3"
                >
                  <input type="hidden" name="studentId" value={student.id} />
                  <label className="text-sm">
                    <span className="mb-1 block font-semibold text-[#5f4a3c]">
                      장학금 구분
                    </span>
                    <select
                      name="scholarshipType"
                      defaultValue={record?.scholarshipType ?? scholarshipType}
                      className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
                    >
                      {SCHOLARSHIP_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {getScholarshipTypeWithAmountLabel(type)}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs subtle-text">
                      현재 기준 월 {formatWon(scholarshipAmount)}
                    </p>
                  </label>

                  <label className="text-sm">
                    <span className="mb-1 block font-semibold text-[#5f4a3c]">
                      이름
                    </span>
                    <input
                      name="studentName"
                      defaultValue={getRecordValue(record?.studentName, student.realName ?? "")}
                      required
                      className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
                    />
                  </label>

                  <label className="text-sm">
                    <span className="mb-1 block font-semibold text-[#5f4a3c]">
                      연락처
                    </span>
                    <input
                      name="studentPhone"
                      defaultValue={record?.studentPhone ?? ""}
                      className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
                    />
                  </label>

                  <label className="text-sm">
                    <span className="mb-1 block font-semibold text-[#5f4a3c]">
                      학부모 이름
                    </span>
                    <input
                      name="parentName"
                      defaultValue={record?.parentName ?? ""}
                      className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
                    />
                  </label>

                  <label className="text-sm">
                    <span className="mb-1 block font-semibold text-[#5f4a3c]">
                      학부모 연락처
                    </span>
                    <input
                      name="parentPhone"
                      defaultValue={record?.parentPhone ?? ""}
                      className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
                    />
                  </label>

                  <label className="text-sm">
                    <span className="mb-1 block font-semibold text-[#5f4a3c]">
                      계좌번호
                    </span>
                    <input
                      name="bankAccount"
                      defaultValue={record?.bankAccount ?? ""}
                      className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
                    />
                  </label>

                  <div className="md:col-span-3">
                    <button
                      type="submit"
                      disabled={Boolean(isPending || savingStudentId || uploadingKey)}
                      className="btn-primary px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingStudentId === student.id ? "저장 중…" : "지급정보 저장"}
                    </button>
                  </div>
                </form>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <form
                    onSubmit={(event) =>
                      handleUpload(event, student.id, "residentRegistration")
                    }
                    className="rounded-2xl border border-[var(--border)] bg-white p-4"
                  >
                    <input type="hidden" name="studentId" value={student.id} />
                    <input
                      type="hidden"
                      name="fileKind"
                      value="residentRegistration"
                    />
                    <p className="text-sm font-bold text-[#2f241d]">
                      주민등록등본 파일
                    </p>
                    {record?.residentRegistrationFileUrl ? (
                      <a
                        href={record.residentRegistrationFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block text-xs font-semibold text-[#8b552f] underline underline-offset-2"
                      >
                        등록 파일 보기
                      </a>
                    ) : (
                      <p className="mt-1 text-xs subtle-text">등록된 파일 없음</p>
                    )}
                    <input
                      type="file"
                      name="file"
                      required
                      className="mt-3 block w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs"
                    />
                    <button
                      type="submit"
                      disabled={Boolean(isPending || savingStudentId || uploadingKey)}
                      className="btn-secondary mt-3 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {uploadingKey === residentKey ? "업로드 중…" : "파일 업로드"}
                    </button>
                  </form>

                  <form
                    onSubmit={(event) => handleUpload(event, student.id, "bankbook")}
                    className="rounded-2xl border border-[var(--border)] bg-white p-4"
                  >
                    <input type="hidden" name="studentId" value={student.id} />
                    <input type="hidden" name="fileKind" value="bankbook" />
                    <p className="text-sm font-bold text-[#2f241d]">통장 파일</p>
                    {record?.bankbookFileUrl ? (
                      <a
                        href={record.bankbookFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block text-xs font-semibold text-[#8b552f] underline underline-offset-2"
                      >
                        등록 파일 보기
                      </a>
                    ) : (
                      <p className="mt-1 text-xs subtle-text">등록된 파일 없음</p>
                    )}
                    <input
                      type="file"
                      name="file"
                      required
                      className="mt-3 block w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs"
                    />
                    <button
                      type="submit"
                      disabled={Boolean(isPending || savingStudentId || uploadingKey)}
                      className="btn-secondary mt-3 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {uploadingKey === bankbookKey ? "업로드 중…" : "파일 업로드"}
                    </button>
                  </form>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
