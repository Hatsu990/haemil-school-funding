import type { Metadata } from "next";
import Image from "next/image";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { getGalleryItems } from "@/lib/repositories/gallery";
import { formatDateKorean } from "@/lib/utils";
import { GalleryItem } from "@/types";

export const metadata: Metadata = {
  title: "갤러리",
  description:
    "해밀학교 교육 활동 사진과 영상 기록을 확인할 수 있는 갤러리 페이지입니다.",
  keywords: [
    "해밀학교 갤러리",
    "다문화학교 활동",
    "교육 후원 현장",
    "학교 활동 기록",
  ],
  openGraph: {
    title: "갤러리 | 해밀학교 후원 프로젝트",
    description: "학교 활동 기록을 통해 해밀학교 교육 현장을 살펴보세요.",
    url: "/gallery",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "갤러리 | 해밀학교 후원 프로젝트",
    description: "해밀학교의 사진/영상 활동 기록을 확인해 보세요.",
  },
};

function GalleryCard({ item }: { item: GalleryItem }) {
  return (
    <article className="surface-card hover-lift overflow-hidden">
      <div className="relative aspect-video bg-[#fff9f1]">
        {item.fileUrl ? (
          item.type === "video" ? (
            <video
              src={item.fileUrl}
              controls
              preload="metadata"
              className="h-full w-full bg-black object-cover"
            />
          ) : (
            <Image
              src={item.fileUrl}
              alt={item.title}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          )
        ) : (
          <p className="grid h-full place-items-center text-sm font-semibold text-[#5f4b3c]">
            미리보기가 없습니다.
          </p>
        )}
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="rounded-full bg-[#f7ecdf] px-3 py-1 text-xs font-semibold text-[#855839]">
            {item.type === "video" ? "VIDEO" : "IMAGE"}
          </span>
          <span className="text-xs subtle-text">{formatDateKorean(item.createdAt)}</span>
        </div>
        <h2 className="text-base font-bold text-[#2e221a]">{item.title}</h2>
      </div>
    </article>
  );
}

export default async function GalleryPage() {
  let galleryItems: GalleryItem[] = [];
  let dbErrorMessage: string | null = null;

  try {
    galleryItems = await getGalleryItems();
  } catch (error) {
    console.error("[gallery page] failed to load gallery items", error);
    dbErrorMessage =
      "갤러리 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
  }

  return (
    <div className="container-base pb-16 pt-10 sm:pt-12">
      <header className="mb-8">
        <p className="text-sm font-semibold text-[#8d694f]">갤러리</p>
        <h1 className="section-title mt-2">학교 활동 기록</h1>
        <p className="mt-3 text-sm leading-7 subtle-text">
          학교의 주요 활동 사진과 영상을 모아 공개합니다.
        </p>
      </header>

      {dbErrorMessage ? (
        <section className="surface-card p-6 text-sm leading-7 text-[#5b473b]">
          <p className="font-semibold text-[#8c4f2d]">데이터 연결 안내</p>
          <p className="mt-2">{dbErrorMessage}</p>
        </section>
      ) : galleryItems.length === 0 ? (
        <EmptyStateCard
          title="등록된 갤러리 항목이 없습니다."
          description="활동 사진/영상이 등록되면 이 영역에 자동으로 표시됩니다."
        />
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {galleryItems.map((item) => (
            <GalleryCard key={item.id} item={item} />
          ))}
        </section>
      )}
    </div>
  );
}
