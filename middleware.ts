import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";
import type { UserRole } from "@/types/database";

const PUBLIC_ROUTES = new Set(["/", "/login", "/register", "/reset-password"]);
const AUTH_ROUTES = new Set(["/login", "/register", "/reset-password"]);

const DASHBOARD_PATHS: Record<UserRole, string> = {
  student: "/student/dashboard",
  staff: "/staff/dashboard",
  lecturer: "/lecturer/dashboard",
  admin: "/admin/dashboard",
};

function needsRoleCheck(pathname: string): boolean {
  return (
    AUTH_ROUTES.has(pathname) ||
    pathname.startsWith("/student") ||
    pathname.startsWith("/staff") ||
    pathname.startsWith("/lecturer") ||
    pathname.startsWith("/admin")
  );
}

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

const METADATA_ROUTES = new Set(["/manifest.webmanifest", "/robots.txt", "/sitemap.xml"]);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (METADATA_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  // Public pages (except auth) — skip Supabase client entirely
  if (PUBLIC_ROUTES.has(pathname) && !AUTH_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  const { supabase, getResponse } = createMiddlewareClient(request);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    if (PUBLIC_ROUTES.has(pathname)) return getResponse();
    return redirectTo(request, "/login");
  }

  if (!needsRoleCheck(pathname)) {
    return getResponse();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role ?? "student") as UserRole;

  if (AUTH_ROUTES.has(pathname)) {
    return redirectTo(request, DASHBOARD_PATHS[role]);
  }

  if (pathname.startsWith("/student") && role !== "student") {
    return redirectTo(request, DASHBOARD_PATHS[role]);
  }
  if (pathname.startsWith("/staff") && role !== "staff" && role !== "admin") {
    return redirectTo(request, DASHBOARD_PATHS[role]);
  }
  if (pathname.startsWith("/lecturer") && role !== "lecturer" && role !== "admin") {
    return redirectTo(request, DASHBOARD_PATHS[role]);
  }
  if (pathname.startsWith("/admin") && role !== "admin") {
    return redirectTo(request, DASHBOARD_PATHS[role]);
  }

  return getResponse();
}

export const config = {
  matcher: [
    /*
     * Skip middleware for static assets, images, and API routes.
     * API routes handle their own auth — avoids double Supabase client work.
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
