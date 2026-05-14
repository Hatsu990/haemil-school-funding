"use client";

import Image from "next/image";
import { FormEvent, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadGalleryItemsAction } from "@/app/admin/(panel)/gallery/actions";
import { CopyButton } from "@/components/ui/copy-button";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { FeedbackToast } from "@/components/ui/feedback-toast";
import { formatDateTimeKorean } from "@/lib/utils";
import { GalleryItem } from "@/types";

interface AdminGalleryManagerProps {
  initialItems: GalleryItem[];
}

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

function GalleryPreview({ item }: { item: GalleryItem }) {
  if (!item.fileUrl) {
    return (
      <div className="grid aspect-video w-40 place-items-center rounded-lg border border-[var(--border)] bg-[#fff7ef] text-xs text-[#8a6a56]">
        파일 없음
      </div>
    );
  }

  if (item.type === "video") {
    return (
      <video
        src={item.fileUrl}
        controls
        preload="metadata"
        className="aspect-video w-40 rounded-lg border border-[var(--border)] bg-black object-cover"
      />
    );
  }

  return (
    <div className="relative aspect-video w-40 overflow-hidden rounded-lg border border-[var(--border)] bg-[#fff7ef]">
      <Image
        src={item.fileUrl}
        alt={item.title}
        fill
        unoptimized
        sizes="160px"
        className="object-cover"
      />
    </div>
  );
}

export function AdminGalleryManager({ initialItems }: AdminGalleryManagerProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isUploading, startUploading] = useTransition();

  const handleUpload = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isUploading) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    setFeedback(null);

    startUploading(async () => {
      const result = await uploadGalleryItemsAction(formData);

      if (!result.ok) {
        setFeedback({
          type: "error",
          message: result.message,
        });
        return;
      }

      formRef.current?.reset();
      setFeedback({
        type: "success",
        message: result.message,
      });
      router.refresh();
    });
  };

  return (
    <div className="space-y-5 pb-8">
      <section className="surface-card p-5">
        <h2 className="text-lg font-bold text-[#2f241d]">갤러리 업로드</h2>
        <p className="mt-2 text-sm subtle-text">
          사진(image/*)과 영상(video/*) 파일만 업로드할 수 있습니다. 파일당 최대
          100MB까지 업로드 가능합니다.
        </p>
        <form ref={formRef} onSubmit={handleUpload} className="mt-4 space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-[#5f4a3c]">제목 *</span>
            <input
              name="title"
              required
              maxLength={100}
              disabled={isUploading}
              placeholder="예: 2026 봄 학습활동"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-[#5f4a3c]">
              파일 선택 (여러 장/여러 개 가능) *
            </span>
            <input
              type="file"
              name="files"
              accept="image/*,video/*"
              multiple
              required
              disabled={isUploading}
              className="block w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isUploading}
              className="btn-primary px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? "업로드 중..." : "업로드 실행"}
            </button>
            <p className="text-xs subtle-text">
              업로드 후 DB 저장까지 완료되면 목록에 즉시 반영됩니다.
            </p>
          </div>
        </form>

        {feedback ? (
          <FeedbackToast type={feedback.type} message={feedback.message} className="mt-3" />
        ) : null}
      </section>

      <section className="surface-card overflow-hidden">
        <header className="border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-lg font-bold text-[#2f241d]">
            업로드된 갤러리 목록 ({initialItems.length}건)
          </h2>
        </header>

        {initialItems.length === 0 ? (
          <EmptyStateCard
            className="m-5"
            title="아직 업로드된 갤러리 항목이 없습니다."
            description="관리자 업로드가 완료되면 목록이 자동으로 표시됩니다."
          />
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {initialItems.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center gap-4 px-5 py-4"
              >
                <GalleryPreview item={item} />
                <div className="min-w-[220px] flex-1">
                  <p className="font-semibold text-[#4f3d31]">{item.title}</p>
                  <p className="mt-1 text-xs subtle-text">
                    타입: {item.type === "video" ? "영상" : "이미지"} · 업로드:
                    {" " + formatDateTimeKorean(item.createdAt)}
                  </p>
                  {item.fileUrl ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-[#8b552f] underline underline-offset-2"
                      >
                        원본 파일 열기
                      </a>
                      <CopyButton value={item.fileUrl} label="URL 복사" />
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
