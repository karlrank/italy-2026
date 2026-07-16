import { NextResponse } from "next/server";
import { AUTH_COOKIE, expectedToken, timingSafeEqual } from "@/lib/auth";

// ───────────────────────────────────────────────────────────────
// Password protection for the whole site (pages AND /api), with its own login page.
//
// Activates when the SITE_PASSWORD environment variable is set.
// Without it the site is open (e.g. for development).
//
// Trip data is rendered only into the protected "/" response — the static
// JS bundles contain no data, so _next/static can stay public
// (needed so the login page can load properly).
// ───────────────────────────────────────────────────────────────

const PASS = process.env.SITE_PASSWORD || "";

export async function middleware(request) {
  if (!PASS) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // The login page and the auth API must remain open
  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(AUTH_COOKIE)?.value || "";
  const valid = cookie && timingSafeEqual(cookie, await expectedToken(PASS));
  if (valid) return NextResponse.next();

  // APIs → 401 (not a redirect)
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Pages → redirect to login, remember the destination
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("next", pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  // Run on all paths except data-free static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
