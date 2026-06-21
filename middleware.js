import { NextResponse } from "next/server";
import { AUTH_COOKIE, expectedToken, timingSafeEqual } from "@/lib/auth";

// ───────────────────────────────────────────────────────────────
// Paroolikaitse kogu saidile (lehed JA /api), oma sisselogimislehega.
//
// Aktiveerub, kui keskkonnamuutuja SITE_PASSWORD on seatud.
// Ilma selleta on sait avatud (nt arenduseks).
//
// Reisiandmed renderdatakse ainult kaitstud "/" vastusesse — staatilistes
// JS-pakkides andmeid pole, seega _next/static võib jääda avalikuks
// (vajalik, et sisselogimisleht saaks ilusti laadida).
// ───────────────────────────────────────────────────────────────

const PASS = process.env.SITE_PASSWORD || "";

export async function middleware(request) {
  if (!PASS) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // Sisselogimisleht ja autentimise API peavad olema avatud
  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(AUTH_COOKIE)?.value || "";
  const valid = cookie && timingSafeEqual(cookie, await expectedToken(PASS));
  if (valid) return NextResponse.next();

  // API-d → 401 (mitte ümbersuunamine)
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Lehed → suuna sisselogimisele, jäta sihtkoht meelde
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("next", pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  // Jookse kõigil teedel peale data-vabade staatiliste varade
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
