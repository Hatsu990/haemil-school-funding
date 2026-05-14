"use client";

import { useEffect } from "react";

interface AdminPanelErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminPanelErrorPage({
  error,
  reset,
}: AdminPanelErrorPageProps) {
  useEffect(() => {
    console.error("[admin panel error] uncaught rendering error", error);
  }, [error]);

  return (
    <section className="surface-card p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9a745d]">
        Admin Error
      </p>
      <h2 className="mt-2 text-xl font-bold text-[#2f241d]">
        관리자 화면을 불러오지 못했습니다.
      </h2>
      <p className="mt-2 text-sm leading-7 subtle-text">
        DB 또는 네트워크 문제일 수 있습니다. 잠시 후 다시 시도해 주세요.
      </p>
      <button type="button" onClick={reset} className="btn-primary mt-4">
        다시 시도
      </button>
    </section>
  );
}
