"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_AUTH_COOKIE_NAME,
  ADMIN_AUTH_COOKIE_VALUE,
  verifyAdminCredentials,
} from "@/lib/auth/admin-auth";

export async function loginAdmin(formData: FormData): Promise<void> {
  const adminId = String(formData.get("adminId") ?? "");
  const adminPassword = String(formData.get("adminPassword") ?? "");

  if (!verifyAdminCredentials(adminId, adminPassword)) {
    redirect("/admin/login?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_AUTH_COOKIE_NAME, ADMIN_AUTH_COOKIE_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  redirect("/admin/dashboard");
}

