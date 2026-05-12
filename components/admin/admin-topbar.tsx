import Link from "next/link";

export function AdminTopbar() {
  return (
    <header className="surface-card mb-5 flex flex-wrap items-center justify-between gap-4 px-5 py-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#94715b]">
          관리자 모드
        </p>
        <h1 className="text-xl font-bold text-[#2f241c]">운영 대시보드</h1>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-xs font-medium text-[#34507a]">
          Mock 모드
        </span>
        <Link href="/" className="btn-secondary py-2">
          공개 페이지 보기
        </Link>
      </div>
    </header>
  );
}
