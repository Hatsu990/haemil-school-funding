"use client";

import { useMemo, useState } from "react";
import { StudentCard } from "@/components/public/student-card";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { StudentProfile } from "@/types";

type StatusFilter = "all" | "available" | "pending" | "matched";
type SortKey =
  | "default"
  | "grade-asc"
  | "grade-desc"
  | "available-first"
  | "matched-first";

interface StudentsListClientProps {
  students: StudentProfile[];
  dbErrorMessage: string | null;
}

function getGradeOrder(grade: string): number {
  const normalized = grade.trim();
  const numberMatch = normalized.match(/\d+/);
  const gradeNumber = numberMatch ? Number.parseInt(numberMatch[0], 10) : 0;
  const stage = normalized[0] ?? "";

  if (stage === "초") {
    return 100 + gradeNumber;
  }
  if (stage === "중") {
    return 200 + gradeNumber;
  }
  if (stage === "고") {
    return 300 + gradeNumber;
  }

  return 400 + gradeNumber;
}

function getAvailableFirstWeight(status: StudentProfile["sponsorshipStatus"]): number {
  if (status === "available") return 0;
  if (status === "pending") return 1;
  return 2;
}

function getMatchedFirstWeight(status: StudentProfile["sponsorshipStatus"]): number {
  if (status === "matched") return 0;
  if (status === "pending") return 1;
  return 2;
}

function getStatusLabel(status: StatusFilter): string {
  if (status === "available") return "요청 가능";
  if (status === "pending") return "입금 대기";
  if (status === "matched") return "결연 완료";
  return "전체";
}

export function StudentsListClient({
  students,
  dbErrorMessage,
}: StudentsListClientProps) {
  const [genderFilter, setGenderFilter] = useState<string>("전체");
  const [gradeFilter, setGradeFilter] = useState<string>("전체");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("default");

  const uniqueGrades = useMemo(() => {
    const gradeSet = new Set<string>();
    students.forEach((student) => gradeSet.add(student.grade));
    return Array.from(gradeSet).sort((a, b) => getGradeOrder(a) - getGradeOrder(b));
  }, [students]);

  const filteredAndSortedStudents = useMemo(() => {
    const withIndex = students.map((student, index) => ({
      student,
      index,
    }));

    const filtered = withIndex.filter(({ student }) => {
      if (genderFilter !== "전체" && student.gender !== genderFilter) {
        return false;
      }

      if (gradeFilter !== "전체" && student.grade !== gradeFilter) {
        return false;
      }

      if (statusFilter !== "all" && student.sponsorshipStatus !== statusFilter) {
        return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      if (sortKey === "default") {
        return a.index - b.index;
      }

      if (sortKey === "grade-asc") {
        const orderDiff =
          getGradeOrder(a.student.grade) - getGradeOrder(b.student.grade);
        return orderDiff !== 0 ? orderDiff : a.index - b.index;
      }

      if (sortKey === "grade-desc") {
        const orderDiff =
          getGradeOrder(b.student.grade) - getGradeOrder(a.student.grade);
        return orderDiff !== 0 ? orderDiff : a.index - b.index;
      }

      if (sortKey === "available-first") {
        const weightDiff =
          getAvailableFirstWeight(a.student.sponsorshipStatus) -
          getAvailableFirstWeight(b.student.sponsorshipStatus);
        return weightDiff !== 0 ? weightDiff : a.index - b.index;
      }

      const weightDiff =
        getMatchedFirstWeight(a.student.sponsorshipStatus) -
        getMatchedFirstWeight(b.student.sponsorshipStatus);
      return weightDiff !== 0 ? weightDiff : a.index - b.index;
    });

    return filtered.map((entry) => entry.student);
  }, [students, genderFilter, gradeFilter, statusFilter, sortKey]);

  const filteredSummary = useMemo(() => {
    const available = filteredAndSortedStudents.filter(
      (student) => student.sponsorshipStatus === "available",
    ).length;
    const pending = filteredAndSortedStudents.filter(
      (student) => student.sponsorshipStatus === "pending",
    ).length;
    const matched = filteredAndSortedStudents.filter(
      (student) => student.sponsorshipStatus === "matched",
    ).length;

    return {
      available,
      pending,
      matched,
    };
  }, [filteredAndSortedStudents]);

  return (
    <>
      <section className="surface-card relative mb-6 overflow-hidden p-5 md:p-6">
        <div className="absolute -left-12 -top-12 h-36 w-36 rounded-full bg-[#f5d3b3]/45 blur-2xl" />
        <div className="absolute -right-14 -bottom-14 h-44 w-44 rounded-full bg-[#cfe3d2]/40 blur-3xl" />

        <div className="relative z-10">
          <p className="text-xs font-semibold tracking-[0.08em] text-[#8d6d57]">
            학생 찾기 필터
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <label className="text-sm">
              <span className="mb-2 block font-semibold text-[#5f4a3c]">성별</span>
              <select
                value={genderFilter}
                onChange={(event) => setGenderFilter(event.target.value)}
                aria-label="학생 성별 필터"
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5"
              >
                <option value="전체">전체</option>
                <option value="남">남</option>
                <option value="여">여</option>
                <option value="미정">미정</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-2 block font-semibold text-[#5f4a3c]">학년</span>
              <select
                value={gradeFilter}
                onChange={(event) => setGradeFilter(event.target.value)}
                aria-label="학생 학년 필터"
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5"
              >
                <option value="전체">전체</option>
                {uniqueGrades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-2 block font-semibold text-[#5f4a3c]">결연 상태</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                aria-label="학생 결연 상태 필터"
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5"
              >
                <option value="all">전체</option>
                <option value="available">요청 가능</option>
                <option value="pending">입금 대기</option>
                <option value="matched">결연 완료</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-2 block font-semibold text-[#5f4a3c]">정렬</span>
              <select
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as SortKey)}
                aria-label="학생 정렬 기준"
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5"
              >
                <option value="default">기본순</option>
                <option value="grade-asc">학년 낮은 순</option>
                <option value="grade-desc">학년 높은 순</option>
                <option value="available-first">신청 가능 우선</option>
                <option value="matched-first">결연 완료 우선</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="mb-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[#fff9f3] px-4 py-3 text-xs leading-6 text-[#6a5547] sm:col-span-2 lg:col-span-1">
          현재 필터: 성별 {genderFilter} · 학년 {gradeFilter} · 상태{" "}
          {getStatusLabel(statusFilter)}
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[#f9f4ea] px-4 py-3 text-sm font-semibold text-[#5f4a3c]">
          요청 가능 {filteredSummary.available}명
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[#f8f2e4] px-4 py-3 text-sm font-semibold text-[#5f4a3c]">
          입금 대기 {filteredSummary.pending}명
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[#eef5ff] px-4 py-3 text-sm font-semibold text-[#4b5b79]">
          결연 완료 {filteredSummary.matched}명
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[28px] border border-[#eadbce] bg-gradient-to-b from-[#fffaf5] to-[#fff7ef] p-4 sm:p-6">
        <div className="absolute -left-10 top-0 h-36 w-36 rounded-full bg-[#f4dcc6]/60 blur-2xl" />
        <div className="absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-[#d9eadf]/45 blur-3xl" />

        <div className="relative z-10">
          {dbErrorMessage ? (
            <article className="surface-card p-6 text-sm leading-7 text-[#5b473b]">
              <p className="font-semibold text-[#8c4f2d]">데이터 연결 안내</p>
              <p className="mt-2">{dbErrorMessage}</p>
            </article>
          ) : students.length === 0 ? (
            <EmptyStateCard
              className="col-span-full"
              title="등록된 학생 정보가 없습니다."
              description="관리자 페이지에서 학생 정보를 등록하면 이곳에 표시됩니다."
            />
          ) : filteredAndSortedStudents.length === 0 ? (
            <EmptyStateCard
              className="col-span-full"
              title="필터 조건에 맞는 학생이 없습니다."
              description="필터를 조정하면 다른 학생 목록을 볼 수 있습니다."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredAndSortedStudents.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
