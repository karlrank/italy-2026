// Reading and saving content (CMS). Protected by the middleware (requires
// login). Writing requires a configured KV database.

import {
  getContent,
  saveContent,
  resetContent,
  listBackups,
  getBackup,
  editorFrom,
  contentConfigured,
} from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const params = new URL(request.url).searchParams;

  // ?backups=1 → snapshot list with editor info (newest first)
  if (params.get("backups") === "1") {
    const backups = await listBackups();
    return Response.json({
      configured: contentConfigured,
      count: backups.length,
      backups,
    });
  }

  // ?backup=<ts> → full document of one snapshot (for the diff view)
  const ts = Number(params.get("backup"));
  if (ts) {
    const doc = await getBackup(ts);
    if (!doc) {
      return Response.json({ ok: false, error: "not found" }, { status: 404 });
    }
    return Response.json({ ok: true, ts, doc });
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

  // { restore: <ts> } → roll the content back to that snapshot. The restore
  // itself snapshots the current state first, so it is undoable too.
  if (body?.restore) {
    const doc = await getBackup(Number(body.restore));
    if (!doc) {
      return Response.json({ ok: false, error: "backup not found" }, { status: 404 });
    }
    try {
      await saveContent(doc, editorFrom(request, "restore"));
      return Response.json({ ok: true, restored: Number(body.restore) });
    } catch {
      return Response.json({ ok: false, error: "restore failed" }, { status: 502 });
    }
  }

  if (!body?.content || typeof body.content !== "object") {
    return Response.json({ ok: false, error: "bad content" }, { status: 400 });
  }
  try {
    await saveContent(body.content, editorFrom(request, "save"));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "write failed" }, { status: 502 });
  }
}

export async function DELETE(request) {
  if (!contentConfigured) {
    return Response.json({ ok: false, configured: false }, { status: 400 });
  }
  try {
    await resetContent(editorFrom(request, "reset"));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "reset failed" }, { status: 502 });
  }
}
