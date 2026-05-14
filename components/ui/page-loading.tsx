interface PageLoadingProps {
  title?: string;
  description?: string;
  cardCount?: number;
}

export function PageLoading({
  title = "데이터를 불러오는 중입니다.",
  description = "잠시만 기다려 주세요.",
  cardCount = 3,
}: PageLoadingProps) {
  return (
    <section className="container-base py-10">
      <div className="surface-card p-5">
        <p className="text-sm font-semibold text-[#5f4a3c]">{title}</p>
        <p className="mt-2 text-sm subtle-text">{description}</p>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cardCount }).map((_, index) => (
          <article key={index} className="surface-card p-5">
            <div className="skeleton h-4 w-24" />
            <div className="mt-3 skeleton h-8 w-32" />
            <div className="mt-5 skeleton h-24 w-full" />
          </article>
        ))}
      </div>
    </section>
  );
}
