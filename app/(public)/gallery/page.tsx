import { galleryItems } from "@/lib/mock-data";

export default function GalleryPage() {
  return (
    <div className="container-base py-12">
      <header className="mb-8">
        <p className="text-sm font-semibold text-[#8d694f]">갤러리</p>
        <h1 className="section-title mt-2">학교 활동 기록</h1>
        <p className="mt-3 text-sm leading-7 subtle-text">
          학교의 활동 사진과 영상 기록을 모아 공개합니다. 실제 업로드와 파일
          저장은 다음 단계에서 연동 예정이며, 현재는 UI placeholder 상태입니다.
        </p>
      </header>

      <section className="surface-card mb-8 flex flex-wrap items-center gap-2 p-4">
        <button className="btn-secondary py-2">전체</button>
        <button className="btn-secondary py-2">사진</button>
        <button className="btn-secondary py-2">영상</button>
        <button className="btn-secondary py-2">최신순</button>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {galleryItems.map((item) => (
          <article key={item.id} className="surface-card overflow-hidden">
            <div
              className={`grid h-44 place-items-center ${
                item.type === "video"
                  ? "bg-gradient-to-br from-[#cfe5ff] to-[#e8f3ff]"
                  : "bg-gradient-to-br from-[#ffe2cc] to-[#fff1e5]"
              }`}
            >
              <p className="text-sm font-bold text-[#5f4b3c]">
                {item.type === "video" ? "영상" : "사진"} 미리보기
              </p>
            </div>
            <div className="p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full bg-[#f7ecdf] px-3 py-1 text-xs font-semibold text-[#855839]">
                  {item.type === "video" ? "VIDEO" : "IMAGE"}
                </span>
                <span className="text-xs subtle-text">{item.createdAt}</span>
              </div>
              <h2 className="text-base font-bold text-[#2e221a]">{item.title}</h2>
              <p className="mt-1 text-xs subtle-text">파일 라벨: {item.fileLabel}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
