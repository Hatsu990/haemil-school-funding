import type { Metadata } from "next";
import Image from "next/image";
import { unstable_noStore as noStore } from "next/cache";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { buildDbErrorMessage, logDbLoadError } from "@/lib/db/debug";
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

export const dynamic = "force-dynamic";

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
  noStore();

  let galleryItems: GalleryItem[] = [];
  let dbErrorMessage: string | null = null;

  try {
    galleryItems = await getGalleryItems();
  } catch (error) {
    logDbLoadError("gallery page", error);
    dbErrorMessage = buildDbErrorMessage(
      "갤러리 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    );
  }

  return (
    <div className="container-base pb-16 pt-10 sm:pt-12">
      <header className="relative mb-8 overflow-hidden rounded-[30px] border border-[#e8d6c8] shadow-[0_18px_42px_rgba(121,84,53,0.16)] sm:mb-10">
        <Image
          src="/images/haemil/people-activity-5.jpg"
          alt="해밀학교 활동 현장"
          fill
          priority
          className="object-cover object-[center_28%] sm:object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#191717]/82 via-[#3d3027]/68 to-[#c87f47]/44" />
        <div className="relative z-10 px-7 py-11 sm:px-9 sm:py-14">
          <p className="text-sm font-semibold text-[#f0d8c2]">갤러리</p>
          <h1 className="mt-2 font-serif text-3xl font-bold leading-tight text-[#fff8f2] sm:text-4xl">
            학교 활동 기록
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#f8eade] sm:text-base sm:leading-8">
            교실과 기숙사, 다양한 활동 현장에서 이어지는 해밀학교의 하루를
            사진과 영상으로 전합니다.
          </p>

        </div>
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
