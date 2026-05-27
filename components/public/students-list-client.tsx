"use client";

import { useMemo, useState } from "react";
import { StudentCard } from "@/components/public/student-card";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { SCHOLARSHIP_TYPES, getScholarshipTypeLabel } from "@/lib/scholarships";
import {
  getScholarshipSortWeight,
  getStudentStatusSortWeight,
} from "@/lib/students/sort";
import { ScholarshipType, StudentProfile } from "@/types";

type StatusFilter = "all" | "available" | "pending" | "matched";
type ScholarshipFilter = "all" | ScholarshipType;
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
  return getStudentStatusSortWeight(status);
}

function getMatchedFirstWeight(status: StudentProfile["sponsorshipStatus"]): number {
  if (status === "matched") return 0;
  if (status === "pending") return 1;
  return 2;
}

function compareDefaultStudentOrder(
  a: { student: StudentProfile; index: number },
  b: { student: StudentProfile; index: number },
): number {
  const statusDiff =
    getStudentStatusSortWeight(a.student.sponsorshipStatus) -
    getStudentStatusSortWeight(b.student.sponsorshipStatus);
  if (statusDiff !== 0) return statusDiff;

  const scholarshipDiff =
    getScholarshipSortWeight(a.student.scholarshipType) -
    getScholarshipSortWeight(b.student.scholarshipType);
  if (scholarshipDiff !== 0) return scholarshipDiff;

  return a.index - b.index;
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
  const [scholarshipFilter, setScholarshipFilter] =
    useState<ScholarshipFilter>("all");
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

      if (
        scholarshipFilter !== "all" &&
        student.scholarshipType !== scholarshipFilter
      ) {
        return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      if (sortKey === "default") {
        return compareDefaultStudentOrder(a, b);
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
  }, [students, genderFilter, gradeFilter, statusFilter, scholarshipFilter, sortKey]);

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
        <div className="absolute -left-12 -top-12 h-36 w-36 rounded-full bg-[#dfe8d8]/70 blur-2xl" />
        <div className="absolute -right-14 -bottom-14 h-44 w-44 rounded-full bg-[#f1d6c4]/60 blur-3xl" />

        <div className="relative z-10">
          <div className="grid gap-4 md:grid-cols-4">
            <label className="text-sm">
              <span className="mb-2 block font-bold text-[#24372c]">성별</span>
              <select
                value={genderFilter}
                onChange={(event) => setGenderFilter(event.target.value)}
                aria-label="학생 성별 필터"
                className="w-full rounded-2xl border border-[var(--border)] bg-[#fffdf8] px-3 py-2.5 text-[#18211d]"
              >
                <option value="전체">전체</option>
                <option value="남">남</option>
                <option value="여">여</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-2 block font-bold text-[#24372c]">학년</span>
              <select
                value={gradeFilter}
                onChange={(event) => setGradeFilter(event.target.value)}
                aria-label="학생 학년 필터"
                className="w-full rounded-2xl border border-[var(--border)] bg-[#fffdf8] px-3 py-2.5 text-[#18211d]"
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
              <span className="mb-2 block font-bold text-[#24372c]">결연 상태</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                aria-label="학생 결연 상태 필터"
                className="w-full rounded-2xl border border-[var(--border)] bg-[#fffdf8] px-3 py-2.5 text-[#18211d]"
              >
                <option value="all">전체</option>
                <option value="available">요청 가능</option>
                <option value="pending">입금 대기</option>
                <option value="matched">결연 완료</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-2 block font-bold text-[#24372c]">정렬</span>
              <select
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as SortKey)}
                aria-label="학생 정렬 기준"
                className="w-full rounded-2xl border border-[var(--border)] bg-[#fffdf8] px-3 py-2.5 text-[#18211d]"
              >
                <option value="default">기본순 (신청 가능 우선)</option>
                <option value="grade-asc">학년 낮은 순</option>
                <option value="grade-desc">학년 높은 순</option>
                <option value="available-first">신청 가능 우선</option>
                <option value="matched-first">결연 완료 우선</option>
              </select>
            </label>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setScholarshipFilter("all")}
              className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                scholarshipFilter === "all"
                  ? "border-[#24372c] bg-[#24372c] text-white"
                  : "border-[#d8d1c4] bg-[#fffdf8] text-[#314039] hover:border-[#486f5b]"
              }`}
            >
              전체
            </button>
            {SCHOLARSHIP_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setScholarshipFilter(type)}
                className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                  scholarshipFilter === type
                    ? "border-[#24372c] bg-[#24372c] text-white"
                    : "border-[#d8d1c4] bg-[#fffdf8] text-[#314039] hover:border-[#486f5b]"
                }`}
              >
                {getScholarshipTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[#fffdf8] px-4 py-3 text-xs font-semibold leading-6 text-[#314039] sm:col-span-2 lg:col-span-1">
          현재 필터: 성별 {genderFilter} · 학년 {gradeFilter} · 상태{" "}
          {getStatusLabel(statusFilter)}
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[#eef4eb] px-4 py-3 text-sm font-bold text-[#24372c]">
          요청 가능 {filteredSummary.available}명
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[#f7f3ea] px-4 py-3 text-sm font-bold text-[#24372c]">
          입금 대기 {filteredSummary.pending}명
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[#edf3f7] px-4 py-3 text-sm font-bold text-[#385366]">
          결연 완료 {filteredSummary.matched}명
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[32px] border border-[#d8d1c4] bg-gradient-to-b from-[#fffdf8] to-[#f7f3ea] p-4 shadow-[var(--shadow-soft)] sm:p-6">
        <div className="absolute -left-10 top-0 h-36 w-36 rounded-full bg-[#dfe8d8]/70 blur-2xl" />
        <div className="absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-[#f1d6c4]/55 blur-3xl" />

        <div className="relative z-10">
          {dbErrorMessage ? (
            <article className="surface-card p-6 text-sm font-semibold leading-7 text-[#1f2b25]">
              <p className="font-bold text-[#c66f4a]">데이터 연결 안내</p>
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
