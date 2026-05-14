import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  ADMIN_AUTH_COOKIE_NAME,
  isAdminSessionValue,
} from "@/lib/auth/admin-auth";

export const metadata: Metadata = {
  title: "관리자",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminIndexPage() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(ADMIN_AUTH_COOKIE_NAME)?.value;

  if (isAdminSessionValue(sessionValue)) {
    redirect("/admin/dashboard");
  }

  redirect("/admin/login");
}
