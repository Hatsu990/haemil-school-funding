"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "홈" },
  { href: "/students", label: "학생 만나기" },
  { href: "/about", label: "학교 소개" },
  { href: "/project", label: "프로젝트 안내" },
  { href: "/gallery", label: "갤러리" },
];

function getLinkClass(pathname: string, href: string): string {
  const isActive = pathname === href;
  return isActive
    ? "rounded-lg bg-[#f8e6d7] px-3 py-2 text-sm font-semibold text-[#8b4a20]"
    : "rounded-lg px-3 py-2 text-sm font-medium text-[#5d4a3e] transition hover:bg-[#fff1e5]";
}

export function PublicHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[#fff9f2]/95 backdrop-blur">
      <div className="container-base flex h-18 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5d9be] text-lg font-bold text-[#8d4f28]">
            해
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9f7e67]">
              Haemil School
            </p>
            <p className="font-serif text-lg font-bold text-[#2c2018]">
              생활관비 결연 후원
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={getLinkClass(pathname, item.href)}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/admin/login" className="btn-secondary ml-2 py-2">
            관리자
          </Link>
        </nav>

        <details className="relative md:hidden">
          <summary
            aria-label="모바일 메뉴 열기"
            className="list-none rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[#614d3e]"
          >
            메뉴
          </summary>
          <div className="absolute right-0 mt-2 w-52 rounded-xl border border-[var(--border)] bg-white p-2 shadow-lg">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={getLinkClass(pathname, item.href)}
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/admin/login" className="btn-secondary mt-1 py-2">
                관리자
              </Link>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
