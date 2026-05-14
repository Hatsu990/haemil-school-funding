import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import Link from "next/link";
import type { Metadata } from "next";

const mobileLinks = [
  { href: "/admin/dashboard", label: "대시보드" },
  { href: "/admin/sponsorships", label: "결연관리" },
  { href: "/admin/messages", label: "발송" },
  { href: "/admin/students", label: "학생" },
  { href: "/admin/gallery", label: "갤러리" },
  { href: "/admin/settings", label: "설정" },
];

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default function AdminPanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="container-base grid gap-5 py-4 lg:grid-cols-[260px_1fr]">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>
      <div>
        <AdminTopbar />
        <nav className="surface-card mb-5 flex gap-2 overflow-x-auto p-3 lg:hidden">
          {mobileLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg bg-[#fff2e6] px-3 py-2 text-xs font-semibold text-[#7d4b2c]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}
