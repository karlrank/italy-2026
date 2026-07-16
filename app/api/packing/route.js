// Managing packing-list items within the CMS content.
// Reading returns the categories; POST adds/removes items and saves to KV.
// Protected by the middleware (requires login). Writing requires KV.

import {
  getContent,
  saveContent,
  editorFrom,
  contentConfigured,
} from "@/lib/content";

export const dynamic = "force-dynamic";

const rid = () =>
  "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export async function GET() {
  const content = await getContent();
  return Response.json({
    configured: contentConfigured,
    categories: content.packingCategories || [],
  });
}

export async function POST(request) {
  if (!contentConfigured) {
    return Response.json({ ok: false, configured: false }, { status: 400 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const { action, catId, itemId, label, icon } = body || {};
  const content = await getContent();
  let cats = (content.packingCategories || []).map((c) => ({
    ...c,
    items: [...(c.items || [])],
  }));
  const cat = cats.find((c) => c.id === catId);

  if (action === "add") {
    if (!cat || !label?.trim()) {
      return Response.json({ ok: false }, { status: 400 });
    }
    cat.items.push({ id: rid(), label: label.trim() });
  } else if (action === "remove") {
    if (!cat) return Response.json({ ok: false }, { status: 400 });
    cat.items = cat.items.filter((it) => it.id !== itemId);
  } else if (action === "addCategory") {
    if (!label?.trim()) return Response.json({ ok: false }, { status: 400 });
    cats.push({
      id: "cat" + rid(),
      title: label.trim(),
      icon: icon || "pin",
      items: [],
    });
  } else if (action === "removeCategory") {
    if (!cat) return Response.json({ ok: false }, { status: 400 });
    cats = cats.filter((c) => c.id !== catId);
  } else {
    return Response.json({ ok: false, error: "bad action" }, { status: 400 });
  }

  try {
    await saveContent(
      { ...content, packingCategories: cats },
      editorFrom(request, "packing")
    );
    return Response.json({ ok: true, categories: cats });
  } catch {
    return Response.json({ ok: false, error: "write failed" }, { status: 502 });
  }
}
