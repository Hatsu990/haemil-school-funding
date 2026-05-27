"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useRef, useState, useTransition } from "react";
import {
  createStudentAction,
  deleteStudentAction,
  deleteStudentLetterImageAction,
  updateStudentProfileAction,
  uploadStudentLetterImageAction,
} from "@/app/admin/(panel)/students/actions";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { FeedbackToast } from "@/components/ui/feedback-toast";
import { StudentProfileImage } from "@/components/ui/student-profile-image";
import { StatusPill } from "@/components/ui/status-pill";
import { getScholarshipTypeWithAmountLabel } from "@/lib/scholarships";
import { maskStudentRealName } from "@/lib/students/display";
import {
  getScholarshipSortWeight,
  getStudentStatusSortWeight,
} from "@/lib/students/sort";
import { withStudentUiFallback } from "@/lib/students/ui";
import { getStudentStatusClass, getStudentStatusLabel } from "@/lib/utils";
import { StudentProfile } from "@/types";

interface AdminStudentsManagerProps {
  initialStudents: StudentProfile[];
}

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

interface StudentEditFormState {
  id: string;
  realName: string;
  gender: string;
  grade: string;
  description: string;
}

function normalizeKeyword(value: string): string {
  return value.trim().toLowerCase();
}

function hasLetterImage(letterImageUrl: string | null | undefined): boolean {
  return Boolean(letterImageUrl && letterImageUrl.trim().length > 0);
}

function compareStudentDisplayOrder(
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

export function AdminStudentsManager({
  initialStudents,
}: AdminStudentsManagerProps) {
  const router = useRouter();
  const [students, setStudents] = useState<StudentProfile[]>(initialStudents);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [keyword, setKeyword] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingLetterStudentId, setUploadingLetterStudentId] = useState<string | null>(
    null,
  );
  const [deletingLetterStudentId, setDeletingLetterStudentId] = useState<string | null>(
    null,
  );
  const [editingStudent, setEditingStudent] = useState<StudentEditFormState | null>(
    null,
  );
  const [isCreating, startCreating] = useTransition();
  const [isUpdatingProfile, startUpdatingProfile] = useTransition();
  const formRef = useRef<HTMLFormElement | null>(null);

  const isMutating =
    isCreating ||
    deletingId !== null ||
    isUpdatingProfile ||
    uploadingLetterStudentId !== null ||
    deletingLetterStudentId !== null;

  const filteredStudents = useMemo(() => {
    const normalizedKeyword = normalizeKeyword(keyword);
    return students
      .map((student, index) => ({ student, index }))
      .filter(({ student }) => {
        if (!normalizedKeyword) return true;
        const scholarshipLabel = student.scholarshipType
          ? getScholarshipTypeWithAmountLabel(student.scholarshipType)
          : "";
        const searchable = [
          maskStudentRealName(student.realName) || student.publicName,
          student.realName ?? "",
          student.gender,
          student.grade,
          student.description,
          scholarshipLabel,
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(normalizedKeyword);
      })
      .sort(compareStudentDisplayOrder)
      .map((entry) => entry.student);
  }, [keyword, students]);

  const updateStudentItem = (
    studentId: string,
    updater: (student: StudentProfile) => StudentProfile,
  ) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) => {
        if (student.id !== studentId) {
          return student;
        }
        return updater(student);
      }),
    );
  };

  const handleCreateStudent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isMutating) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    setFeedback(null);

    startCreating(async () => {
      const result = await createStudentAction(formData);
      if (!result.ok || !result.student) {
        setFeedback({
          type: "error",
          message: result.message,
        });
        return;
      }

      const nextStudent = withStudentUiFallback(result.student);
      setStudents((prev) =>
        [...prev, nextStudent].sort((a, b) => a.id.localeCompare(b.id)),
      );

      formRef.current?.reset();
      setFeedback({
        type: "success",
        message: result.message,
      });
      router.refresh();
    });
  };

  const handleDeleteStudent = async (id: string, studentName: string) => {
    if (isMutating) {
      return;
    }

    const shouldDelete = window.confirm(
      `${studentName} 학생을 삭제하시겠습니까?`,
    );
    if (!shouldDelete) {
      return;
    }

    setFeedback(null);
    setDeletingId(id);
    try {
      const result = await deleteStudentAction(id);
      if (!result.ok) {
        setFeedback({
          type: "error",
          message: result.message,
        });
        return;
      }

      setStudents((prev) => prev.filter((student) => student.id !== id));
      setFeedback({
        type: "success",
        message: result.message,
      });
      router.refresh();
    } catch (error) {
      console.error("[admin students manager] failed to delete student", error);
      setFeedback({
        type: "error",
        message: "학생 삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const openEditStudentModal = (student: StudentProfile) => {
    if (isMutating) {
      return;
    }

    setFeedback(null);
    setEditingStudent({
      id: student.id,
      realName: student.realName ?? "",
      gender: student.gender,
      grade: student.grade,
      description: student.description,
    });
  };

  const closeEditStudentModal = () => {
    if (isUpdatingProfile) {
      return;
    }
    setEditingStudent(null);
  };

  const handleUpdateStudentProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingStudent || isMutating) {
      return;
    }

    const targetId = editingStudent.id;
    setFeedback(null);

    startUpdatingProfile(async () => {
      const result = await updateStudentProfileAction(editingStudent);
      if (!result.ok || !result.student) {
        setFeedback({
          type: "error",
          message: result.message,
        });
        return;
      }

      const updatedStudent = withStudentUiFallback(result.student);
      updateStudentItem(targetId, () => updatedStudent);
      setEditingStudent(null);
      setFeedback({
        type: "success",
        message: result.message,
      });
      router.refresh();
    });
  };

  const handleUploadLetterImage = async (
    event: FormEvent<HTMLFormElement>,
    studentId: string,
  ) => {
    event.preventDefault();
    if (isMutating) {
      return;
    }

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    formData.set("studentId", studentId);

    setFeedback(null);
    setUploadingLetterStudentId(studentId);
    try {
      const result = await uploadStudentLetterImageAction(formData);
      if (!result.ok) {
        setFeedback({
          type: "error",
          message: result.message,
        });
        return;
      }

      updateStudentItem(studentId, (student) => ({
        ...student,
        letterImageUrl: result.letterImageUrl ?? null,
      }));
      formElement.reset();
      setFeedback({
        type: "success",
        message: result.message,
      });
      router.refresh();
    } catch (error) {
      console.error("[admin students manager] failed to upload letter image", error);
      setFeedback({
        type: "error",
        message: "꿈편지 업로드 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      });
    } finally {
      setUploadingLetterStudentId(null);
    }
  };

  const handleDeleteLetterImage = async (studentId: string) => {
    if (isMutating) {
      return;
    }

    const shouldDelete = window.confirm("해당 학생의 꿈편지 이미지를 삭제하시겠습니까?");
    if (!shouldDelete) {
      return;
    }

    setFeedback(null);
    setDeletingLetterStudentId(studentId);
    try {
      const result = await deleteStudentLetterImageAction(studentId);
      if (!result.ok) {
        setFeedback({
          type: "error",
          message: result.message,
        });
        return;
      }

      updateStudentItem(studentId, (student) => ({
        ...student,
        letterImageUrl: null,
      }));
      setFeedback({
        type: "success",
        message: result.message,
      });
      router.refresh();
    } catch (error) {
      console.error("[admin students manager] failed to delete letter image", error);
      setFeedback({
        type: "error",
        message: "꿈편지 삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      });
    } finally {
      setDeletingLetterStudentId(null);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      <section className="surface-card p-5">
        <div>
          <h2 className="text-lg font-bold text-[#2f241d]">학생 추가</h2>
        </div>
        <form
          ref={formRef}
          onSubmit={handleCreateStudent}
          className="mt-4 grid gap-3 md:grid-cols-2"
        >
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-[#5f4a3c]">
              학생 실명 *
            </span>
            <input
              name="realName"
              required
              maxLength={40}
              disabled={isMutating}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
              placeholder="예: 홍길동…"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-[#5f4a3c]">성별 *</span>
            <select
              name="gender"
              defaultValue="남"
              disabled={isMutating}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
            >
              <option value="남">남</option>
              <option value="여">여</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-[#5f4a3c]">학년 *</span>
            <input
              name="grade"
              required
              maxLength={20}
              disabled={isMutating}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
              placeholder="예: 중2…"
            />
          </label>
          <label className="text-sm md:col-span-2">
            <span className="mb-1 block font-semibold text-[#5f4a3c]">
              소개 문구 *
            </span>
            <textarea
              name="description"
              required
              rows={3}
              maxLength={220}
              disabled={isMutating}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
              placeholder="학생 소개 문구를 입력해 주세요…"
            />
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isMutating}
              className="btn-primary px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? "추가 중…" : "학생 추가"}
            </button>
          </div>
        </form>
        {feedback ? (
          <FeedbackToast type={feedback.type} message={feedback.message} className="mt-3" />
        ) : null}
      </section>

      <section className="surface-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="실명, 공개 표시명, 학년 검색…"
            aria-label="학생 검색"
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
            {filteredStudents.length} / {students.length}명
          </span>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {filteredStudents.length === 0 ? (
          <EmptyStateCard
            className="col-span-full"
            title="조건에 맞는 학생이 없습니다."
            description="검색어를 지우거나 학생을 새로 등록해 주세요."
          />
        ) : (
          filteredStudents.map((student) => {
            const letterExists = hasLetterImage(student.letterImageUrl);
            const profileTheme = student.profileTheme ?? "from-[#f3e3d6] to-[#fff4ea]";
            const realName = student.realName?.trim() || "미등록";
            const publicName = maskStudentRealName(student.realName) || student.publicName;
            const scholarshipLabel = student.scholarshipType
              ? getScholarshipTypeWithAmountLabel(student.scholarshipType)
              : null;
            return (
              <article key={student.id} className="surface-card overflow-hidden">
                  <div className={`bg-gradient-to-r p-3 ${profileTheme}`}>
                  <StudentProfileImage
                    src={student.profileImageUrl}
                    alt={`${publicName} 학생 프로필 이미지`}
                    className="w-20"
                  />
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-bold text-[#2f241d]">
                      {realName}
                    </h3>
                    <StatusPill
                      label={getStudentStatusLabel(student.sponsorshipStatus)}
                      className={getStudentStatusClass(student.sponsorshipStatus)}
                    />
                  </div>
                  <p className="text-sm font-semibold text-[#1f2b25]">
                    {student.gender} · {student.grade}
                  </p>
                  <p className="text-sm font-semibold text-[#1f2b25]">
                    공개 표시명: {publicName}
                  </p>
                  {scholarshipLabel ? (
                    <p className="inline-flex rounded-full border border-[#486f5b]/18 bg-[#eef4eb] px-3 py-1 text-xs font-black text-[#24372c]">
                      {scholarshipLabel}
                    </p>
                  ) : null}
                  <p className="text-sm leading-6 text-[#1f2b25]">
                    {student.description}
                  </p>
                  <div className="rounded-xl border border-[var(--border)] bg-[#fffaf4] p-3">
                    <p className="text-xs font-semibold text-[#6d5545]">꿈편지 이미지</p>
                    <div className="mt-2 grid gap-3 sm:grid-cols-[120px_1fr]">
                      <div className="relative aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-[#f6ebe0]">
                        {letterExists ? (
                          <Image
                            src={student.letterImageUrl as string}
                            alt={`${publicName} 꿈편지 이미지`}
                            fill
                            unoptimized
                            className="object-cover object-center"
                            sizes="120px"
                          />
                        ) : (
                          <div className="grid h-full place-items-center px-2 text-center text-xs text-[#8a6a56]">
                            꿈편지 없음
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <form
                          onSubmit={(event) => handleUploadLetterImage(event, student.id)}
                          className="space-y-2"
                        >
                          <input type="hidden" name="studentId" value={student.id} />
                          <input
                            type="file"
                            name="letterImage"
                            accept="image/*"
                            required
                            disabled={isMutating}
                            className="block w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs"
                          />
                          <button
                            type="submit"
                            disabled={isMutating}
                            className="btn-secondary px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {uploadingLetterStudentId === student.id
                              ? "업로드 중…"
                              : letterExists
                                ? "꿈편지 교체"
                                : "꿈편지 업로드"}
                          </button>
                        </form>

                        {letterExists ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <a
                              href={student.letterImageUrl as string}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-[#8b552f] underline underline-offset-2"
                            >
                              원본 보기
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteLetterImage(student.id)}
                              disabled={isMutating}
                              className="rounded-lg border border-[#e5c6c0] bg-[#fff4f2] px-3 py-2 text-xs font-semibold text-[#974542] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deletingLetterStudentId === student.id
                                ? "삭제 중…"
                                : "꿈편지 삭제"}
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-[#7f5f4b]">
                            아직 꿈편지 이미지가 등록되지 않았습니다.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditStudentModal(student)}
                      disabled={isMutating}
                      className="btn-secondary px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      학생 수정
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteStudent(student.id, realName)}
                      disabled={isMutating}
                      className="rounded-lg border border-[#e5c6c0] bg-[#fff4f2] px-3 py-2 text-xs font-semibold text-[#974542] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === student.id ? "삭제 중…" : "학생 삭제"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      {editingStudent ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
          role="dialog"
          aria-modal="true"
          aria-label="학생 정보 수정"
          onClick={closeEditStudentModal}
        >
          <div
            className="surface-card w-full max-w-2xl p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-[#2f241d]">
                학생 정보 수정
              </h3>
              <button
                type="button"
                onClick={closeEditStudentModal}
                disabled={isUpdatingProfile}
                className="btn-secondary px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
              >
                닫기
              </button>
            </div>

            <form
              onSubmit={handleUpdateStudentProfile}
              className="mt-4 grid gap-3 md:grid-cols-2"
            >
              <label className="text-sm">
                <span className="mb-1 block font-semibold text-[#5f4a3c]">
                  학생 실명 *
                </span>
                <input
                  required
                  maxLength={40}
                  disabled={isUpdatingProfile}
                  value={editingStudent.realName}
                  onChange={(event) =>
                    setEditingStudent((prev) =>
                      prev
                        ? {
                            ...prev,
                            realName: event.target.value,
                          }
                        : prev,
                    )
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
                  placeholder="예: 홍길동…"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-semibold text-[#5f4a3c]">성별 *</span>
                <select
                  disabled={isUpdatingProfile}
                  value={editingStudent.gender}
                  onChange={(event) =>
                    setEditingStudent((prev) =>
                      prev
                        ? {
                            ...prev,
                            gender: event.target.value,
                          }
                        : prev,
                    )
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
                >
                  <option value="남">남</option>
                  <option value="여">여</option>
                </select>
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-semibold text-[#5f4a3c]">학년 *</span>
                <input
                  required
                  maxLength={20}
                  disabled={isUpdatingProfile}
                  value={editingStudent.grade}
                  onChange={(event) =>
                    setEditingStudent((prev) =>
                      prev
                        ? {
                            ...prev,
                            grade: event.target.value,
                          }
                        : prev,
                    )
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
                />
              </label>

              <label className="text-sm md:col-span-2">
                <span className="mb-1 block font-semibold text-[#5f4a3c]">
                  소개 문구 *
                </span>
                <textarea
                  required
                  rows={4}
                  maxLength={220}
                  disabled={isUpdatingProfile}
                  value={editingStudent.description}
                  onChange={(event) =>
                    setEditingStudent((prev) =>
                      prev
                        ? {
                            ...prev,
                            description: event.target.value,
                          }
                        : prev,
                    )
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
                />
              </label>

              <div className="md:col-span-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="btn-primary px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUpdatingProfile ? "수정 중…" : "수정 저장"}
                </button>
                <button
                  type="button"
                  onClick={closeEditStudentModal}
                  disabled={isUpdatingProfile}
                  className="btn-secondary px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
