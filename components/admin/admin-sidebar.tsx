"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/admin/dashboard", label: "대시보드" },
  { href: "/admin/sponsorships", label: "결연 신청 관리" },
  { href: "/admin/messages", label: "발송 관리" },
  { href: "/admin/students", label: "학생 관리" },
  { href: "/admin/scholarships", label: "장학금 지급관리" },
  { href: "/admin/gallery", label: "갤러리 관리" },
  { href: "/admin/settings", label: "설정" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-4 h-[calc(100dvh-2rem)] overflow-y-auto rounded-[18px] border border-[#d8d2c5] bg-[#fffefa] p-3 shadow-[0_12px_28px_rgba(40,54,47,0.08)]">
      <div className="mb-3 rounded-xl border border-[#ead7c3] bg-[#f6e3cf] p-4">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#8b5b38]">
          Admin
        </p>
        <h2 className="mt-2 text-[17px] font-black leading-tight text-[#2e221b]">
          해밀학교 운영관리
        </h2>
      </div>

      <nav className="space-y-1" aria-label="관리자 메뉴">
        {adminLinks.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "block rounded-xl bg-[#385f4a] px-4 py-3 text-sm font-black text-white shadow-[0_10px_20px_rgba(56,95,74,0.15)]"
                  : "block rounded-xl px-4 py-3 text-sm font-bold text-[#314039] transition-[background-color,color] hover:bg-[#f1ece2] hover:text-[#18211d]"
              }
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
