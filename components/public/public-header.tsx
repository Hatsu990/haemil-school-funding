"use client";

import Image from "next/image";
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
    ? "rounded-full bg-[#24372c] px-4 py-2 text-sm font-bold !text-white shadow-[0_10px_22px_rgba(36,55,44,0.16)]"
    : "rounded-full px-4 py-2 text-sm font-semibold text-[#4c5a52] transition-colors hover:bg-[#eef4eb] hover:text-[#18211d]";
}

export function PublicHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[#d9d2c5]/80 bg-[#fbf8f1]/88 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[72px] w-full max-w-[1360px] items-center justify-between px-4 py-2 sm:px-6 lg:max-w-[1480px] lg:px-10 xl:max-w-[1560px] xl:px-12">
        <Link href="/" className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="relative h-[76px] w-[76px] shrink-0 sm:h-[92px] sm:w-[92px]">
            <Image
              src="/images/haemill/haemill-school-logo.png"
              alt="해밀학교 로고"
              fill
              className="object-contain drop-shadow-[0_10px_18px_rgba(43,54,47,0.18)]"
              sizes="(max-width: 640px) 76px, 92px"
            />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="text-[0.63rem] font-bold uppercase tracking-[0.18em] text-[#728276] sm:text-[0.7rem]">
              Haemill School
            </p>
            <p className="truncate text-[1.45rem] leading-none font-black tracking-[-0.02em] text-[#18211d] sm:text-[1.75rem]">
              해밀학교
            </p>
            <p className="truncate text-xs font-semibold tracking-[0.01em] text-[#63706a] sm:text-sm">
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
            className="list-none rounded-full border border-[var(--border)] bg-[#fffdf8] px-4 py-2 text-sm font-bold text-[#24372c] shadow-[0_10px_20px_rgba(43,54,47,0.08)]"
          >
            메뉴
          </summary>
          <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[var(--border)] bg-[#fffdf8] p-2 shadow-[0_18px_44px_rgba(43,54,47,0.16)]">
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
