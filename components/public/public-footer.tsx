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

      <div className="relative z-10 mx-auto w-full max-w-[1360px] px-5 pt-8 pb-4 sm:px-7 sm:pt-9 sm:pb-4 lg:max-w-[1480px] lg:px-10 xl:max-w-[1560px] xl:px-12 md:grid md:grid-cols-[1.2fr_0.8fr] md:items-start">
        <div className="pl-2 sm:pl-3">
          <div className="inline-flex items-start gap-2.5 sm:gap-3">
            <Link
              href="/"
              className="relative -mt-4 h-[96px] w-[96px] shrink-0 self-start sm:-mt-6 sm:h-[126px] sm:w-[126px]"
              aria-label="해밀학교 홈"
            >
              <Image
                src="/images/haemil/haemil-school-logo.png"
                alt="해밀학교 로고"
                fill
                className="object-contain object-top drop-shadow-[0_10px_16px_rgba(84,55,34,0.24)]"
                sizes="(max-width: 640px) 96px, 126px"
              />
            </Link>

            <Link href="/" className="block">
              <p className="text-[0.68rem] leading-none font-semibold uppercase tracking-[0.12em] text-[#8c6953]">
                Haemil School
              </p>
              <h3 className="mt-0.5 font-serif text-xl leading-tight font-bold text-[#2c2018]">
                해밀학교 후원 프로젝트
              </h3>
            </Link>
          </div>
          <p className="-mt-12 max-w-xl text-sm leading-7 text-[#5f4b3f] sm:-mt-14">
            학생들의 생활관비를 함께 책임지는 1:1 결연 후원 플랫폼. 후원자와 학생이
            신뢰로 연결되는 과정을 투명하게 운영합니다.
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

      <div className="relative z-10 border-t border-[var(--border)] py-3 text-center text-xs subtle-text">
        © 2026 해밀학교 후원 프로젝트. All rights reserved.
      </div>
    </footer>
  );
}
