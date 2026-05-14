"use server";

import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { createGalleryItems } from "@/lib/repositories/gallery";
import { CreateGalleryItemInput, GalleryItemType } from "@/types";

const MAX_FILE_SIZE_MB = 100;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface UploadGalleryItemsActionResult {
  ok: boolean;
  message: string;
  createdCount?: number;
}

function isFileEntry(value: FormDataEntryValue): value is File {
  return value instanceof File;
}

function normalizeFileName(name: string): string {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "upload";
}

function resolveGalleryType(file: File): GalleryItemType | null {
  const mimeType = file.type.toLowerCase();
  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (mimeType.startsWith("video/")) {
    return "video";
  }

  return null;
}

function buildItemTitle(baseTitle: string, index: number, total: number): string {
  if (total <= 1) {
    return baseTitle;
  }

  return `${baseTitle} (${index + 1}/${total})`;
}

function isBlobPayloadTooLargeError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();

  return (
    normalized.includes("too large") ||
    normalized.includes("payload") ||
    normalized.includes("entity too large") ||
    normalized.includes("size limit")
  );
}

function getUploadPath(fileName: string, index: number): string {
  const extension = fileName.split(".").pop()?.toLowerCase();
  const baseName = normalizeFileName(fileName.replace(/\.[^.]+$/, ""));
  const extensionSuffix = extension ? `.${extension}` : "";

  return `gallery/${Date.now()}-${index + 1}-${baseName}${extensionSuffix}`;
}

async function rollbackUploadedFiles(urls: string[], token: string): Promise<void> {
  if (urls.length === 0) {
    return;
  }

  try {
    await del(urls, { token });
  } catch (rollbackError) {
    console.error(
      "[admin gallery action] failed to rollback uploaded blob files",
      rollbackError,
    );
  }
}

export async function uploadGalleryItemsAction(
  formData: FormData,
): Promise<UploadGalleryItemsActionResult> {
  const title = String(formData.get("title") ?? "").trim();
  const rawFileEntries = formData.getAll("files");
  const files = rawFileEntries.filter(isFileEntry).filter((file) => file.size > 0);

  if (!title) {
    return {
      ok: false,
      message: "제목을 입력해 주세요.",
    };
  }

  if (files.length === 0) {
    return {
      ok: false,
      message: "업로드할 사진 또는 영상을 1개 이상 선택해 주세요.",
    };
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!blobToken) {
    console.error("[admin gallery action] missing BLOB_READ_WRITE_TOKEN");
    return {
      ok: false,
      message:
        "파일 저장소 설정이 없습니다. BLOB_READ_WRITE_TOKEN 환경변수를 확인해 주세요.",
    };
  }

  const validatedFiles: Array<{ file: File; type: GalleryItemType }> = [];
  for (const file of files) {
    const itemType = resolveGalleryType(file);
    if (!itemType) {
      return {
        ok: false,
        message: `${file.name} 파일은 지원되지 않는 형식입니다. 이미지/영상 파일만 업로드할 수 있습니다.`,
      };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        ok: false,
        message: `파일 용량이 너무 큽니다. 파일당 최대 ${MAX_FILE_SIZE_MB}MB까지 업로드할 수 있습니다.`,
      };
    }

    validatedFiles.push({ file, type: itemType });
  }

  const uploadedUrls: string[] = [];
  let stage: "upload" | "db" = "upload";

  try {
    const itemsForInsert: CreateGalleryItemInput[] = [];

    for (let index = 0; index < validatedFiles.length; index += 1) {
      const { file, type } = validatedFiles[index];

      const uploadedBlob = await put(getUploadPath(file.name, index), file, {
        access: "public",
        addRandomSuffix: true,
        token: blobToken,
        contentType: file.type || undefined,
      });

      uploadedUrls.push(uploadedBlob.url);
      itemsForInsert.push({
        title: buildItemTitle(title, index, validatedFiles.length),
        type,
        fileUrl: uploadedBlob.url,
      });
    }

    stage = "db";
    await createGalleryItems(itemsForInsert);
    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");

    return {
      ok: true,
      message: `${itemsForInsert.length}개의 파일이 업로드되었습니다.`,
      createdCount: itemsForInsert.length,
    };
  } catch (error) {
    await rollbackUploadedFiles(uploadedUrls, blobToken);

    if (isBlobPayloadTooLargeError(error)) {
      return {
        ok: false,
        message: `파일 용량이 너무 큽니다. 파일당 최대 ${MAX_FILE_SIZE_MB}MB까지 업로드할 수 있습니다.`,
      };
    }

    if (stage === "db") {
      console.error(
        "[admin gallery action] failed to save uploaded file metadata to DB",
        error,
      );
      return {
        ok: false,
        message:
          "업로드된 파일 정보를 DB에 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      };
    }

    console.error("[admin gallery action] failed to upload gallery items", error);
    return {
      ok: false,
      message: "업로드 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}
