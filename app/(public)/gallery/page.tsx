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
    <article className="hover-lift overflow-hidden rounded-lg border border-[#d8d3c8] bg-[#fffdf8] shadow-[0_18px_44px_rgba(32,41,38,0.08)]">
      <div className="relative aspect-video bg-[#f7f3ea]">
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
          <p className="grid h-full place-items-center text-sm font-bold text-[#63706a]">
            미리보기가 없습니다.
          </p>
        )}
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="rounded-full bg-[#eef4eb] px-3 py-1 text-xs font-bold text-[#486f5b]">
            {item.type === "video" ? "VIDEO" : "IMAGE"}
          </span>
          <span className="text-xs subtle-text">{formatDateKorean(item.createdAt)}</span>
        </div>
        <h2 className="text-base font-black text-[#18211d]">{item.title}</h2>
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
      <header className="relative mb-8 overflow-hidden rounded-lg border border-[#d8d3c8] bg-[#fffdf8] shadow-[0_22px_58px_rgba(32,41,38,0.1)] sm:mb-10">
        <Image
          src="/images/haemill/people-activity-5.jpg"
          alt="해밀학교 활동 현장"
          fill
          priority
          className="object-cover object-[center_28%] opacity-70 sm:object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#fffdf8_0%,rgba(255,253,248,0.96)_46%,rgba(255,253,248,0.28)_100%)]" />
        <div className="relative z-10 px-7 py-11 sm:px-9 sm:py-14">
          <h1 className="text-balance font-serif text-3xl font-black leading-tight text-[#18211d] [word-break:keep-all] sm:text-5xl">
            학교 활동 기록
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-[#314039] sm:text-base sm:leading-8">
            교실과 기숙사, 다양한 활동 현장에서 이어지는 해밀학교의 하루를
            사진과 영상으로 전합니다.
          </p>

        </div>
      </header>

      {dbErrorMessage ? (
        <section className="rounded-lg border border-[#d8d3c8] bg-[#fffdf8] p-6 text-sm leading-7 text-[#314039] shadow-[0_18px_44px_rgba(32,41,38,0.08)]">
          <p className="font-bold text-[#c66f4a]">데이터 연결 안내</p>
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
