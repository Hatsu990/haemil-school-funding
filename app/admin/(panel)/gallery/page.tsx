import { AdminGalleryManager } from "@/components/admin/admin-gallery-manager";
import { buildDbErrorMessage, logDbLoadError } from "@/lib/db/debug";
import { getGalleryItems } from "@/lib/repositories/gallery";
import { GalleryItem } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  let galleryItems: GalleryItem[] = [];
  let dbErrorMessage: string | null = null;

  try {
    galleryItems = await getGalleryItems();
  } catch (error) {
    logDbLoadError("admin gallery page", error);
    dbErrorMessage = buildDbErrorMessage(
      "갤러리 데이터를 불러오지 못했습니다. DB 연결 상태를 확인한 뒤 다시 시도해 주세요.",
    );
  }

  if (dbErrorMessage) {
    return (
      <section className="surface-card p-6 text-sm leading-7 text-[#5b473b]">
        <p className="font-semibold text-[#8c4f2d]">데이터 연결 안내</p>
        <p className="mt-2">{dbErrorMessage}</p>
      </section>
    );
  }

  return <AdminGalleryManager initialItems={galleryItems} />;
}
