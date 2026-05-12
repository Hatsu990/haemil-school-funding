import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <div className="container-base flex min-h-[calc(100vh-6rem)] items-center justify-center py-10">
      <div className="surface-card w-full max-w-md p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a745d]">
          Admin Login
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-[#2d211a]">
          관리자 로그인
        </h1>
        <p className="mt-2 text-sm leading-6 subtle-text">
          현재는 UI 확인을 위한 mock 로그인 화면입니다. 실제 세션 인증은 다음
          단계에서 구현합니다.
        </p>

        <form className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="mb-2 block font-semibold text-[#5c4739]">아이디</span>
            <input
              type="text"
              placeholder="admin"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block font-semibold text-[#5c4739]">비밀번호</span>
            <input
              type="password"
              placeholder="********"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
            />
          </label>
          <Link href="/admin/dashboard" className="btn-primary mt-2 w-full">
            관리자 페이지 입장 (Mock)
          </Link>
        </form>
      </div>
    </div>
  );
}
