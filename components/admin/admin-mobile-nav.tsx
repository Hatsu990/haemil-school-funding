"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const mobileLinks = [
  { href: "/admin/dashboard", label: "대시보드" },
  { href: "/admin/sponsorships", label: "결연관리" },
  { href: "/admin/messages", label: "발송" },
  { href: "/admin/students", label: "학생" },
  { href: "/admin/scholarships", label: "장학금" },
  { href: "/admin/gallery", label: "갤러리" },
  { href: "/admin/settings", label: "설정" },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="admin-mobile-nav lg:hidden"
      aria-label="관리자 모바일 메뉴"
    >
      {mobileLinks.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={active ? "is-active" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
