// Reading and saving content (CMS). Protected by the middleware (requires
// login). Writing requires a configured KV database.

import {
  getContent,
  saveContent,
  resetContent,
  listBackups,
  contentConfigured,
} from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET(request) {
  // ?backups=1 → list snapshot timestamps (newest first), for verifying
  // that the pre-save backups exist. Restoring goes via Upstash Data Browser.
  if (new URL(request.url).searchParams.get("backups") === "1") {
    const stamps = await listBackups();
    return Response.json({
      configured: contentConfigured,
      count: stamps.length,
      backups: stamps.map((ts) => ({
        key: `content:backup:${ts}`,
        savedAt: new Date(ts).toISOString(),
      })),
    });
  }
  const content = await getContent();
  return Response.json({ configured: contentConfigured, content });
}

export async function PUT(request) {
  if (!contentConfigured) {
    return Response.json({ ok: false, configured: false }, { status: 400 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "bad body" }, { status: 400 });
  }
  if (!body?.content || typeof body.content !== "object") {
    return Response.json({ ok: false, error: "bad content" }, { status: 400 });
  }
  try {
    await saveContent(body.content);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "write failed" }, { status: 502 });
  }
}

export async function DELETE() {
  if (!contentConfigured) {
    return Response.json({ ok: false, configured: false }, { status: 400 });
  }
  try {
    await resetContent();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "reset failed" }, { status: 502 });
  }
}
