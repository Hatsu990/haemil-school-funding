import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import type { Metadata } from "next";

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
    <div className="admin-panel min-h-[100dvh] w-full px-3 py-3 sm:px-4 lg:px-5 lg:py-4">
      <div className="grid w-full gap-3 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[232px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>
        <div className="min-w-0">
          <AdminTopbar />
          <div className="lg:hidden">
            <AdminMobileNav />
          </div>
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
