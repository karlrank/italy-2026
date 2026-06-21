// Pakkimisnimekirja esemete haldus CMS-i sisus.
// Lugemine annab kategooriad; POST lisab/eemaldab esemeid ja salvestab KV-sse.
// Kaitstud middleware'iga (vajab sisselogimist). Kirjutamine eeldab KV-d.

import {
  getContent,
  saveContent,
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

  const { action, catId, itemId, label } = body || {};
  const content = await getContent();
  const cats = (content.packingCategories || []).map((c) => ({
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
  } else {
    return Response.json({ ok: false, error: "bad action" }, { status: 400 });
  }

  try {
    await saveContent({ ...content, packingCategories: cats });
    return Response.json({ ok: true, categories: cats });
  } catch {
    return Response.json({ ok: false, error: "write failed" }, { status: 502 });
  }
}
