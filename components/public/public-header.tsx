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
    ? "rounded-full bg-[#f6dfcb] px-4 py-2 text-sm font-semibold text-[#8b4a20]"
    : "rounded-full px-4 py-2 text-sm font-medium text-[#5d4a3e] transition hover:bg-[#fff1e5]";
}

export function PublicHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[#fff9f2]/92 backdrop-blur-md">
      <div className="mx-auto flex min-h-[68px] w-full max-w-[1360px] items-center justify-between px-5 py-1 sm:min-h-[78px] sm:px-7 sm:py-1.5 lg:max-w-[1480px] lg:px-10 xl:max-w-[1560px] xl:px-12">
        <Link href="/" className="flex items-center gap-3 sm:gap-5">
          <div className="relative -my-4 h-[108px] w-[108px] shrink-0 sm:-my-8 sm:h-[196px] sm:w-[196px]">
            <Image
              src="/images/haemil/haemil-school-logo.png"
              alt="해밀학교 로고"
              fill
              className="object-contain drop-shadow-[0_10px_16px_rgba(84,55,34,0.24)]"
              sizes="(max-width: 640px) 108px, 196px"
            />
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9f7e67] sm:text-[0.76rem]">
              Haemil School
            </p>
            <p className="font-serif text-[1.62rem] leading-none font-bold tracking-[-0.01em] text-[#2a1e17] sm:text-[2.05rem]">
              해밀학교
            </p>
            <p className="text-sm font-medium tracking-[0.01em] text-[#755d4d] sm:text-base">
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
            className="list-none rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold text-[#614d3e]"
          >
            메뉴
          </summary>
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--border)] bg-white p-2 shadow-lg">
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
