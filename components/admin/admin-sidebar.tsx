"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/admin/dashboard", label: "대시보드" },
  { href: "/admin/sponsorships", label: "결연 신청 관리" },
  { href: "/admin/messages", label: "발송 관리" },
  { href: "/admin/students", label: "학생 관리" },
  { href: "/admin/gallery", label: "갤러리 관리" },
  { href: "/admin/settings", label: "설정" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="surface-card sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto p-4">
      <div className="mb-6 rounded-xl bg-[#f6dfca] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8b5b38]">
          Admin
        </p>
        <h2 className="mt-2 font-serif text-xl font-bold text-[#2e221b]">
          해밀학교 운영관리
        </h2>
      </div>

      <nav className="space-y-1">
        {adminLinks.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                active
                  ? "block rounded-xl bg-[#f9e8db] px-4 py-3 text-sm font-semibold text-[#874a24]"
                  : "block rounded-xl px-4 py-3 text-sm font-medium text-[#5f4a3d] transition hover:bg-[#fff3e8]"
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
