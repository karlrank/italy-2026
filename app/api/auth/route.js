import { cookies } from "next/headers";
import { AUTH_COOKIE, expectedToken, timingSafeEqual } from "@/lib/auth";

export const dynamic = "force-dynamic";

const PASS = process.env.SITE_PASSWORD || "";

// Sisselogimine
export async function POST(request) {
  if (!PASS) return Response.json({ ok: true, open: true });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const password = body?.password || "";
  if (!timingSafeEqual(password, PASS)) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const token = await expectedToken(PASS);
  const jar = await cookies();
  jar.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 päeva
  });
  return Response.json({ ok: true });
}

// Väljalogimine
export async function DELETE() {
  const jar = await cookies();
  jar.delete(AUTH_COOKIE);
  return Response.json({ ok: true });
}
