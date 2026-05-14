import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  ADMIN_AUTH_COOKIE_NAME,
  isAdminSessionValue,
} from "@/lib/auth/admin-auth";
import { loginAdmin } from "./actions";

export const metadata: Metadata = {
  title: "관리자 로그인",
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminLoginPageProps {
  searchParams?: Promise<{
    error?: string | string[];
    redirected?: string | string[];
    next?: string | string[];
  }>;
}

function hasLoginError(errorValue?: string | string[]): boolean {
  if (!errorValue) return false;
  if (Array.isArray(errorValue)) {
    return errorValue.includes("1");
  }
  return errorValue === "1";
}

function hasRedirectReason(value?: string | string[]): boolean {
  if (!value) return false;
  if (Array.isArray(value)) {
    return value.includes("1");
  }
  return value === "1";
}

function resolveNextPath(value?: string | string[]): string {
  const first = Array.isArray(value) ? value[0] : value;
  if (!first || !first.startsWith("/admin")) {
    return "/admin/dashboard";
  }
  return first;
}

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(ADMIN_AUTH_COOKIE_NAME)?.value;
  if (isAdminSessionValue(sessionValue)) {
    redirect("/admin/dashboard");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const showError = hasLoginError(resolvedSearchParams.error);
  const showRedirectNotice = hasRedirectReason(resolvedSearchParams.redirected);
  const nextPath = resolveNextPath(resolvedSearchParams.next);

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
          관리자 계정으로 로그인하면 관리자 페이지에 접근할 수 있습니다.
        </p>
        {showRedirectNotice ? (
          <p className="mt-3 rounded-xl border border-[#f0dfca] bg-[#fff8ef] px-3 py-2 text-sm text-[#7a563f]">
            보호된 관리자 페이지 접근을 위해 로그인이 필요합니다.
            <span className="ml-1 text-xs subtle-text">({nextPath})</span>
          </p>
        ) : null}

        <form action={loginAdmin} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="mb-2 block font-semibold text-[#5c4739]">아이디</span>
            <input
              name="adminId"
              type="text"
              placeholder="admin"
              autoComplete="username"
              required
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block font-semibold text-[#5c4739]">
              비밀번호
            </span>
            <input
              name="adminPassword"
              type="password"
              placeholder="********"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2"
            />
          </label>
          {showError ? (
            <p className="rounded-xl border border-[#f0d4d4] bg-[#fff5f5] px-3 py-2 text-sm text-[#9d3f3f]">
              아이디 또는 비밀번호가 올바르지 않습니다.
            </p>
          ) : null}
          <button type="submit" className="btn-primary mt-2 w-full">
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
