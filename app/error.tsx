"use client";

import { useEffect } from "react";

interface GlobalErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  useEffect(() => {
    console.error("[global error] uncaught rendering error", error);
  }, [error]);

  return (
    <div className="container-base flex min-h-[70vh] items-center justify-center py-10">
      <section className="surface-card w-full max-w-2xl p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a745d]">
          Service Error
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-[#2d211a]">
          화면을 불러오는 중 문제가 발생했습니다.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 subtle-text">
          일시적인 오류일 수 있습니다. 잠시 후 다시 시도해 주세요. 문제가
          반복되면 관리자에게 문의해 주세요.
        </p>
        <div className="mt-6">
          <button type="button" onClick={reset} className="btn-primary">
            다시 시도
          </button>
        </div>
      </section>
    </div>
  );
}
