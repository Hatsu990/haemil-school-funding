import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="container-base flex min-h-[70vh] items-center justify-center py-10">
      <section className="surface-card w-full max-w-2xl p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a745d]">
          404 Not Found
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-[#2d211a]">
          요청하신 페이지를 찾을 수 없습니다.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 subtle-text">
          주소가 잘못되었거나 페이지가 이동되었을 수 있습니다. 홈 또는 학생 목록에서
          다시 이동해 주세요.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">
            홈으로 이동
          </Link>
          <Link href="/students" className="btn-secondary">
            학생 목록 보기
          </Link>
        </div>
      </section>
    </div>
  );
}
