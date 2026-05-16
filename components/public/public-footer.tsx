export function PublicFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--border)] bg-[#fffaf4]">
      <div className="container-base grid gap-8 py-10 md:grid-cols-2 md:items-start">
        <div>
          <h3 className="font-serif text-xl font-bold">해밀학교 후원 프로젝트</h3>
          <p className="mt-2 text-sm subtle-text">
            학생들의 생활관비를 함께 책임지는 1:1 결연 후원 플랫폼
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
      <div className="border-t border-[var(--border)] py-4 text-center text-xs subtle-text">
        © 2026 해밀학교 후원 프로젝트. All rights reserved.
      </div>
    </footer>
  );
}
