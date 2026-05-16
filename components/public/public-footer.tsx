import Image from "next/image";
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-[var(--border)] bg-[#fdf7f0]">
      <Image
        src="/images/haemil/school-campus-1.jpg"
        alt=""
        fill
        aria-hidden
        className="object-cover opacity-15"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#fff8f0]/95 to-[#fdf7f0]" />

      <div className="container-base relative z-10 grid gap-8 py-12 md:grid-cols-[1.2fr_0.8fr] md:items-start">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-[#e8d2bf] bg-white shadow-sm">
              <Image
                src="/images/haemil/haemil-school-logo.png"
                alt="해밀학교 로고"
                fill
                className="object-contain p-1"
                sizes="48px"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8c6953]">
                Haemil School
              </p>
              <h3 className="font-serif text-xl font-bold text-[#2c2018]">
                해밀학교 후원 프로젝트
              </h3>
            </div>
          </Link>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#5f4b3f]">
            학생들의 생활관비를 함께 책임지는 1:1 결연 후원 플랫폼.
            후원자와 학생이 신뢰로 연결되는 과정을 투명하게 운영합니다.
          </p>
        </div>

        <div className="md:justify-self-end md:text-right">
          <p className="text-sm font-semibold text-[#5a4639]">문의 안내</p>
          <ul className="mt-3 space-y-2 text-sm subtle-text">
            <li>대표 연락: 010-4330-3764</li>
            <li>후원 상담: 010-4330-3764</li>
            <li>평일 상담: 09:00 - 18:00</li>
          </ul>
        </div>
      </div>

      <div className="relative z-10 border-t border-[var(--border)] py-4 text-center text-xs subtle-text">
        © 2026 해밀학교 후원 프로젝트. All rights reserved.
      </div>
    </footer>
  );
}
