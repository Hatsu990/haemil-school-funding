"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAdmin } from "@/app/admin/actions";

const adminPageTitles = [
  { href: "/admin/dashboard", eyebrow: "관리자 모드", title: "운영 대시보드" },
  { href: "/admin/sponsorships", eyebrow: "결연 관리", title: "결연 신청 관리" },
  { href: "/admin/messages", eyebrow: "문자 발송", title: "발송 관리" },
  { href: "/admin/students", eyebrow: "학생 정보", title: "학생 관리" },
  { href: "/admin/scholarships", eyebrow: "장학금 운영", title: "장학금 지급관리" },
  { href: "/admin/gallery", eyebrow: "학교 기록", title: "갤러리 관리" },
  { href: "/admin/settings", eyebrow: "운영 설정", title: "설정" },
];

export function AdminTopbar() {
  const pathname = usePathname();
  const currentPage =
    adminPageTitles.find((item) => pathname === item.href) ??
    adminPageTitles[0];

  return (
    <header className="admin-topbar">
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#846a58]">
          {currentPage.eyebrow}
        </p>
        <h1 className="truncate text-[22px] font-black leading-tight text-[#1f2b25] sm:text-2xl">
          {currentPage.title}
        </h1>
      </div>
      <div className="grid w-full min-w-0 grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end">
        <span className="hidden min-h-9 items-center justify-center rounded-full bg-[#edf4ed] px-3 py-1 text-xs font-black text-[#385f4a] sm:inline-flex">
          관리자 접속
        </span>
        <Link href="/" className="btn-secondary min-h-9 px-4 py-2 text-xs">
          공개 페이지 보기
        </Link>
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="btn-secondary min-h-9 w-full px-4 py-2 text-xs sm:w-auto"
          >
            로그아웃
          </button>
        </form>
      </div>
    </header>
  );
}
