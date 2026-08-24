// Human re-tiering of the gallery.
//
// GET  → the tier overrides (only photos someone moved) plus recent activity.
// POST → one of:
//   setTier   { stem, level }        move a photo to tier 1/2/3 or cut it (0)
//   swap      { a, b }               exchange two frames' tiers — the series
//                                    re-pick: the alternate takes the kept
//                                    frame's place and vice versa
//   separate  { stem, level }        lift an alternate out of its series so
//                                    both frames stand on their own
//   reset     { stems: [...] }       hand the photos back to the pipeline's
//                                    own verdict
//   setMany   { changes: [...] }     several photos at once — this is what
//                                    "Võta tagasi" uses to restore exactly the
//                                    levels that were in force before
//
// Everything routes through applyTierChanges, so a swap is one write and the
// activity log gets one entry per user action rather than per photo.

import { editorFrom } from "@/lib/content";
import {
  getOverrides,
  getLog,
  applyTierChanges,
  getManifest,
  curationConfigured,
  isLevel,
} from "@/lib/photos";

export const dynamic = "force-dynamic";

export async function GET() {
  const [overrides, log] = await Promise.all([getOverrides(), getLog()]);
  return Response.json({ configured: curationConfigured, overrides, log });
}

async function effectiveLevels(stems) {
  const manifest = await getManifest();
  const overrides = await getOverrides();
  const seed = new Map(manifest.photos.map((p) => [p.s, p.t]));
  return stems.map((s) =>
    seed.has(s) ? (overrides[s] ?? seed.get(s)) : null
  );
}

export async function POST(request) {
  if (!curationConfigured) {
    return Response.json({ ok: false, configured: false }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const { action } = body || {};
  let changes;

  try {
    if (action === "setTier" || action === "separate") {
      const { stem, level } = body;
      if (typeof stem !== "string" || !isLevel(level)) {
        return Response.json({ ok: false, error: "bad input" }, { status: 400 });
      }
      changes = [{ stem, level: Number(level) }];
    } else if (action === "swap") {
      const { a, b } = body;
      if (typeof a !== "string" || typeof b !== "string" || a === b) {
        return Response.json({ ok: false, error: "bad input" }, { status: 400 });
      }
      const [la, lb] = await effectiveLevels([a, b]);
      if (la == null || lb == null) {
        return Response.json({ ok: false, error: "unknown photo" }, { status: 400 });
      }
      // An exchange, not a promotion: reversible, and correct even when both
      // frames already sit in tiers.
      changes = [
        { stem: a, level: lb },
        { stem: b, level: la },
      ];
    } else if (action === "setMany") {
      const list = Array.isArray(body.changes) ? body.changes : [];
      if (!list.length || list.length > 500) {
        return Response.json({ ok: false, error: "bad input" }, { status: 400 });
      }
      if (list.some((c) => typeof c?.stem !== "string" || !isLevel(c.level))) {
        return Response.json({ ok: false, error: "bad input" }, { status: 400 });
      }
      changes = list.map((c) => ({ stem: c.stem, level: Number(c.level) }));
    } else if (action === "reset") {
      const stems = Array.isArray(body.stems) ? body.stems : [];
      if (!stems.length || stems.length > 500) {
        return Response.json({ ok: false, error: "bad input" }, { status: 400 });
      }
      const manifest = await getManifest();
      const seed = new Map(manifest.photos.map((p) => [p.s, p.t]));
      changes = stems
        .filter((s) => seed.has(s))
        .map((s) => ({ stem: s, level: seed.get(s) }));
    } else {
      return Response.json({ ok: false, error: "bad action" }, { status: 400 });
    }

    const { applied, overrides } = await applyTierChanges(
      changes,
      editorFrom(request, action)
    );
    return Response.json({ ok: true, applied, overrides });
  } catch (err) {
    return Response.json(
      { ok: false, error: err.message || "write failed" },
      { status: 502 }
    );
  }
}
