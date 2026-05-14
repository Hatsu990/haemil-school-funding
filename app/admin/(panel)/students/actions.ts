"use server";

import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import {
  createStudent,
  deleteStudent,
  getStudentById,
  isStudentDeleteBlockedError,
  isStudentNotFoundError,
  resetAllStudentStatusesToAvailable,
  updateStudentLetterImageUrl,
} from "@/lib/repositories/students";
import { StudentGender, StudentProfile, StudentSponsorshipStatus } from "@/types";

const VALID_GENDERS = new Set<StudentGender>(["남", "여", "미정"]);
const VALID_STATUSES = new Set<StudentSponsorshipStatus>([
  "available",
  "pending",
  "matched",
]);

export interface CreateStudentActionResult {
  ok: boolean;
  message: string;
  student?: StudentProfile;
}

export interface DeleteStudentActionResult {
  ok: boolean;
  message: string;
}

export interface ResetStudentStatusesActionResult {
  ok: boolean;
  message: string;
  updatedCount?: number;
}

export interface SaveStudentLetterImageActionResult {
  ok: boolean;
  message: string;
  letterImageUrl?: string | null;
}

const LETTER_IMAGE_MAX_SIZE_MB = 20;
const LETTER_IMAGE_MAX_SIZE_BYTES = LETTER_IMAGE_MAX_SIZE_MB * 1024 * 1024;

function isValidGender(value: string): value is StudentGender {
  return VALID_GENDERS.has(value as StudentGender);
}

function isValidStatus(value: string): value is StudentSponsorshipStatus {
  return VALID_STATUSES.has(value as StudentSponsorshipStatus);
}

function normalizeFileName(name: string): string {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "letter-image";
}

function buildLetterImageUploadPath(studentId: string, fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();
  const baseName = normalizeFileName(fileName.replace(/\.[^.]+$/, ""));
  const extensionSuffix = extension ? `.${extension}` : "";

  return `students/letters/${studentId}-${Date.now()}-${baseName}${extensionSuffix}`;
}

async function deleteBlobFileIfPossible(url: string, token: string): Promise<boolean> {
  try {
    await del(url, { token });
    return true;
  } catch (error) {
    console.error("[admin students action] failed to delete blob file", {
      url,
      error,
    });
    return false;
  }
}

function isImageFile(entry: FormDataEntryValue | null): entry is File {
  return entry instanceof File && entry.size > 0;
}

export async function createStudentAction(
  formData: FormData,
): Promise<CreateStudentActionResult> {
  const nickname = String(formData.get("nickname") ?? "").trim();
  const genderRaw = String(formData.get("gender") ?? "").trim();
  const grade = String(formData.get("grade") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const statusRaw = String(formData.get("sponsorshipStatus") ?? "").trim();

  if (!nickname) {
    return { ok: false, message: "학생 닉네임을 입력해 주세요." };
  }
  if (!isValidGender(genderRaw)) {
    return { ok: false, message: "학생 성별을 선택해 주세요." };
  }
  if (!grade) {
    return { ok: false, message: "학년을 입력해 주세요." };
  }
  if (!description) {
    return { ok: false, message: "소개 문구를 입력해 주세요." };
  }
  if (!isValidStatus(statusRaw)) {
    return { ok: false, message: "초기 결연 상태가 올바르지 않습니다." };
  }

  try {
    const student = await createStudent({
      nickname,
      gender: genderRaw,
      grade,
      description,
      sponsorshipStatus: statusRaw,
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/dashboard");
    revalidatePath("/students");
    revalidatePath("/");
    return {
      ok: true,
      message: "학생이 추가되었습니다.",
      student,
    };
  } catch (error) {
    console.error("[admin students action] failed to create student", error);
    return {
      ok: false,
      message: "학생 추가에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}

export async function deleteStudentAction(id: string): Promise<DeleteStudentActionResult> {
  const studentId = id.trim();
  if (!studentId) {
    return { ok: false, message: "삭제할 학생 ID가 누락되었습니다." };
  }

  try {
    await deleteStudent(studentId);
    revalidatePath("/admin/students");
    revalidatePath("/admin/dashboard");
    revalidatePath("/students");
    revalidatePath("/");
    return { ok: true, message: "학생이 삭제되었습니다." };
  } catch (error) {
    if (isStudentDeleteBlockedError(error)) {
      return {
        ok: false,
        message:
          "해당 학생은 후원 신청 이력이 있어 삭제할 수 없습니다. 상태 변경으로 관리해 주세요.",
      };
    }

    if (isStudentNotFoundError(error)) {
      return {
        ok: false,
        message: "학생 정보를 찾을 수 없습니다.",
      };
    }

    console.error("[admin students action] failed to delete student", error);
    return {
      ok: false,
      message: "학생 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}

export async function resetAllStudentsToAvailableAction(): Promise<ResetStudentStatusesActionResult> {
  try {
    const updatedCount = await resetAllStudentStatusesToAvailable();
    revalidatePath("/admin/students");
    revalidatePath("/admin/dashboard");
    revalidatePath("/students");
    revalidatePath("/");
    return {
      ok: true,
      message: "전체 학생 상태를 신청 가능으로 초기화했습니다.",
      updatedCount,
    };
  } catch (error) {
    console.error("[admin students action] failed to reset student statuses", error);
    return {
      ok: false,
      message: "학생 상태 초기화에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}

export async function uploadStudentLetterImageAction(
  formData: FormData,
): Promise<SaveStudentLetterImageActionResult> {
  const studentId = String(formData.get("studentId") ?? "").trim();
  const fileEntry = formData.get("letterImage");

  if (!studentId) {
    return {
      ok: false,
      message: "학생 ID가 누락되었습니다.",
    };
  }

  if (!isImageFile(fileEntry)) {
    return {
      ok: false,
      message: "업로드할 손편지 이미지 파일을 선택해 주세요.",
    };
  }

  if (!fileEntry.type.toLowerCase().startsWith("image/")) {
    return {
      ok: false,
      message: "이미지 파일만 업로드할 수 있습니다.",
    };
  }

  if (fileEntry.size > LETTER_IMAGE_MAX_SIZE_BYTES) {
    return {
      ok: false,
      message: `손편지 이미지는 최대 ${LETTER_IMAGE_MAX_SIZE_MB}MB까지 업로드할 수 있습니다.`,
    };
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!blobToken) {
    return {
      ok: false,
      message:
        "파일 저장소 설정이 없습니다. BLOB_READ_WRITE_TOKEN 환경변수를 확인해 주세요.",
    };
  }

  let student;
  try {
    student = await getStudentById(studentId);
  } catch (error) {
    console.error("[admin students action] failed to load student for letter upload", error);
    return {
      ok: false,
      message: "학생 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  if (!student) {
    return {
      ok: false,
      message: "학생 정보를 찾을 수 없습니다.",
    };
  }

  let uploadedLetterImageUrl: string | null = null;
  const previousLetterImageUrl = student.letterImageUrl?.trim() ?? "";

  try {
    const uploaded = await put(
      buildLetterImageUploadPath(studentId, fileEntry.name),
      fileEntry,
      {
        access: "public",
        addRandomSuffix: true,
        token: blobToken,
        contentType: fileEntry.type || undefined,
      },
    );
    uploadedLetterImageUrl = uploaded.url;

    await updateStudentLetterImageUrl(studentId, uploadedLetterImageUrl);

    let oldFileDeleted = true;
    if (previousLetterImageUrl && previousLetterImageUrl !== uploadedLetterImageUrl) {
      oldFileDeleted = await deleteBlobFileIfPossible(previousLetterImageUrl, blobToken);
    }

    revalidatePath("/admin/students");
    revalidatePath("/students");
    revalidatePath("/");

    return {
      ok: true,
      message: oldFileDeleted
        ? "손편지 이미지가 저장되었습니다."
        : "새 손편지는 저장되었지만 이전 이미지 정리에 실패했습니다. 운영 로그를 확인해 주세요.",
      letterImageUrl: uploadedLetterImageUrl,
    };
  } catch (error) {
    console.error("[admin students action] failed to upload student letter image", error);

    if (uploadedLetterImageUrl) {
      await deleteBlobFileIfPossible(uploadedLetterImageUrl, blobToken);
    }

    return {
      ok: false,
      message: "손편지 이미지 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}

export async function deleteStudentLetterImageAction(
  studentIdInput: string,
): Promise<SaveStudentLetterImageActionResult> {
  const studentId = studentIdInput.trim();
  if (!studentId) {
    return {
      ok: false,
      message: "학생 ID가 누락되었습니다.",
    };
  }

  let student;
  try {
    student = await getStudentById(studentId);
  } catch (error) {
    console.error("[admin students action] failed to load student for letter delete", error);
    return {
      ok: false,
      message: "학생 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  if (!student) {
    return {
      ok: false,
      message: "학생 정보를 찾을 수 없습니다.",
    };
  }

  const previousLetterImageUrl = student.letterImageUrl?.trim() ?? "";
  if (!previousLetterImageUrl) {
    return {
      ok: true,
      message: "삭제할 손편지 이미지가 없습니다.",
      letterImageUrl: null,
    };
  }

  try {
    await updateStudentLetterImageUrl(studentId, null);
  } catch (error) {
    console.error("[admin students action] failed to delete student letter image from DB", error);
    return {
      ok: false,
      message: "손편지 이미지 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  let blobDeleted = true;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!blobToken) {
    blobDeleted = false;
    console.error("[admin students action] missing BLOB_READ_WRITE_TOKEN for letter cleanup");
  } else {
    blobDeleted = await deleteBlobFileIfPossible(previousLetterImageUrl, blobToken);
  }

  revalidatePath("/admin/students");
  revalidatePath("/students");
  revalidatePath("/");

  return {
    ok: true,
    message: blobDeleted
      ? "손편지 이미지가 삭제되었습니다."
      : "DB에서는 삭제되었지만 Blob 파일 정리에 실패했습니다. 운영 로그를 확인해 주세요.",
    letterImageUrl: null,
  };
}
