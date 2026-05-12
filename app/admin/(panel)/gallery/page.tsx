import { galleryItems } from "@/lib/mock-data";

export default function AdminGalleryPage() {
  return (
    <div className="space-y-5 pb-8">
      <section className="surface-card p-5">
        <h2 className="text-lg font-bold text-[#2f241d]">갤러리 업로드</h2>
        <div className="mt-4 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[#fff9f3] p-8 text-center">
          <p className="text-sm font-semibold text-[#5f4b3c]">
            파일 업로드 Placeholder
          </p>
          <p className="mt-2 text-xs subtle-text">
            실제 업로드(Vercel Blob) 기능은 다음 단계에서 연동 예정입니다.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button className="btn-secondary py-2">사진 선택</button>
            <button className="btn-secondary py-2">영상 선택</button>
            <button className="btn-primary py-2">업로드 실행 (Mock)</button>
          </div>
        </div>
      </section>

      <section className="surface-card overflow-hidden">
        <header className="border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-lg font-bold text-[#2f241d]">갤러리 항목 관리</h2>
        </header>
        <ul className="divide-y divide-[var(--border)]">
          {galleryItems.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
              <span className="rounded-full bg-[#f3e6d7] px-3 py-1 text-xs font-semibold text-[#815635]">
                {item.type === "video" ? "VIDEO" : "IMAGE"}
              </span>
              <div className="min-w-[220px] flex-1">
                <p className="font-semibold text-[#4f3d31]">{item.title}</p>
                <p className="text-xs subtle-text">
                  {item.fileLabel} · {item.createdAt}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary py-2 text-xs">제목 수정</button>
                <button className="btn-secondary py-2 text-xs">삭제</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
