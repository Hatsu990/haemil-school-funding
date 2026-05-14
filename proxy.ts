import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_AUTH_COOKIE_NAME,
  isAdminSessionValue,
} from "@/lib/auth/admin-auth";

const protectedAdminRoutes = [
  "/admin/dashboard",
  "/admin/sponsorships",
  "/admin/messages",
  "/admin/students",
  "/admin/gallery",
  "/admin/settings",
];

function isProtectedAdminRoute(pathname: string): boolean {
  return protectedAdminRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedAdminRoute(pathname)) {
    return NextResponse.next();
  }

  const sessionValue = request.cookies.get(ADMIN_AUTH_COOKIE_NAME)?.value;
  if (isAdminSessionValue(sessionValue)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("redirected", "1");
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/admin/sponsorships/:path*",
    "/admin/messages/:path*",
    "/admin/students/:path*",
    "/admin/gallery/:path*",
    "/admin/settings/:path*",
  ],
};
