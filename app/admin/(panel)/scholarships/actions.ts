"use server";

import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import {
  getScholarshipRecordByStudentId,
  updateStudentScholarshipFileUrl,
  upsertStudentScholarshipRecord,
} from "@/lib/repositories/scholarships";
import { getStudentById } from "@/lib/repositories/students";
import { isScholarshipType } from "@/lib/scholarships";
import { ScholarshipType, StudentScholarshipRecord } from "@/types";

export interface SaveScholarshipRecordActionResult {
  ok: boolean;
  message: string;
  record?: StudentScholarshipRecord;
}

export interface UploadScholarshipFileActionResult {
  ok: boolean;
  message: string;
  fileUrl?: string | null;
}

const SCHOLARSHIP_FILE_MAX_SIZE_MB = 20;
const SCHOLARSHIP_FILE_MAX_SIZE_BYTES = SCHOLARSHIP_FILE_MAX_SIZE_MB * 1024 * 1024;

function isValidFile(entry: FormDataEntryValue | null): entry is File {
  return entry instanceof File && entry.size > 0;
}

function normalizeFileName(name: string): string {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "scholarship-file";
}

function buildScholarshipUploadPath(
  studentId: string,
  fileKind: "residentRegistration" | "bankbook",
  fileName: string,
): string {
  const extension = fileName.split(".").pop()?.toLowerCase();
  const baseName = normalizeFileName(fileName.replace(/\.[^.]+$/, ""));
  const extensionSuffix = extension ? `.${extension}` : "";

  return `students/scholarships/${studentId}-${fileKind}-${Date.now()}-${baseName}${extensionSuffix}`;
}

async function deleteBlobFileIfPossible(url: string, token: string): Promise<boolean> {
  try {
    await del(url, { token });
    return true;
  } catch (error) {
    console.error("[admin scholarships action] failed to delete blob file", {
      url,
      error,
    });
    return false;
  }
}

function revalidateScholarshipPaths() {
  revalidatePath("/admin/scholarships");
}

export async function saveScholarshipRecordAction(
  formData: FormData,
): Promise<SaveScholarshipRecordActionResult> {
  const studentId = String(formData.get("studentId") ?? "").trim();
  const scholarshipTypeRaw = String(formData.get("scholarshipType") ?? "").trim();
  const studentName = String(formData.get("studentName") ?? "").trim();
  const studentPhone = String(formData.get("studentPhone") ?? "").trim();
  const parentName = String(formData.get("parentName") ?? "").trim();
  const parentPhone = String(formData.get("parentPhone") ?? "").trim();
  const bankAccount = String(formData.get("bankAccount") ?? "").trim();

  if (!studentId) {
    return { ok: false, message: "학생 ID가 누락되었습니다." };
  }
  if (!isScholarshipType(scholarshipTypeRaw)) {
    return { ok: false, message: "장학금 구분을 선택해 주세요." };
  }
  if (!studentName) {
    return { ok: false, message: "학생 이름을 입력해 주세요." };
  }

  try {
    const student = await getStudentById(studentId);
    if (!student) {
      return { ok: false, message: "학생 정보를 찾을 수 없습니다." };
    }

    const record = await upsertStudentScholarshipRecord({
      studentId,
      scholarshipType: scholarshipTypeRaw as ScholarshipType,
      studentName,
      studentPhone,
      parentName,
      parentPhone,
      bankAccount,
    });

    revalidateScholarshipPaths();
    return {
      ok: true,
      message: "장학금 지급정보가 저장되었습니다.",
      record,
    };
  } catch (error) {
    console.error("[admin scholarships action] failed to save record", error);
    return {
      ok: false,
      message: "장학금 지급정보 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}

export async function uploadScholarshipFileAction(
  formData: FormData,
): Promise<UploadScholarshipFileActionResult> {
  const studentId = String(formData.get("studentId") ?? "").trim();
  const fileKindRaw = String(formData.get("fileKind") ?? "").trim();
  const fileEntry = formData.get("file");

  if (!studentId) {
    return { ok: false, message: "학생 ID가 누락되었습니다." };
  }
  if (fileKindRaw !== "residentRegistration" && fileKindRaw !== "bankbook") {
    return { ok: false, message: "파일 종류가 올바르지 않습니다." };
  }
  if (!isValidFile(fileEntry)) {
    return { ok: false, message: "업로드할 파일을 선택해 주세요." };
  }
  if (fileEntry.size > SCHOLARSHIP_FILE_MAX_SIZE_BYTES) {
    return {
      ok: false,
      message: `파일은 최대 ${SCHOLARSHIP_FILE_MAX_SIZE_MB}MB까지 업로드할 수 있습니다.`,
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

  const record = await getScholarshipRecordByStudentId(studentId);
  if (!record) {
    return {
      ok: false,
      message: "먼저 장학금 지급정보를 저장한 뒤 파일을 업로드해 주세요.",
    };
  }

  const fileKind = fileKindRaw;
  const previousUrl =
    fileKind === "residentRegistration"
      ? record.residentRegistrationFileUrl
      : record.bankbookFileUrl;

  let uploadedUrl: string | null = null;
  try {
    const uploaded = await put(
      buildScholarshipUploadPath(studentId, fileKind, fileEntry.name),
      fileEntry,
      {
        access: "public",
        addRandomSuffix: true,
        token: blobToken,
        contentType: fileEntry.type || undefined,
      },
    );
    uploadedUrl = uploaded.url;

    await updateStudentScholarshipFileUrl(studentId, fileKind, uploadedUrl);

    let oldFileDeleted = true;
    if (previousUrl && previousUrl !== uploadedUrl) {
      oldFileDeleted = await deleteBlobFileIfPossible(previousUrl, blobToken);
    }

    revalidateScholarshipPaths();
    return {
      ok: true,
      message: oldFileDeleted
        ? "파일이 업로드되었습니다."
        : "새 파일은 업로드되었지만 이전 파일 정리에 실패했습니다. 운영 로그를 확인해 주세요.",
      fileUrl: uploadedUrl,
    };
  } catch (error) {
    console.error("[admin scholarships action] failed to upload file", error);
    if (uploadedUrl) {
      await deleteBlobFileIfPossible(uploadedUrl, blobToken);
    }
    return {
      ok: false,
      message: "파일 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}
