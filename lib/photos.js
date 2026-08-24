// Trip gallery: a machine-made seed plus whatever the humans changed since.
//
// The seed is the curation pipeline's verdict — which of the 3299 frames landed
// in tier 1 / 2 / 3 or got cut — and lives in a manifest in blob storage
// (PHOTO_MANIFEST_URL). It is regenerated wholesale whenever the curation is
// re-run, so nothing durable may be stored in it.
//
// Human re-tiering is therefore kept apart, in a KV hash holding ONLY the
// photos whose tier someone changed. Moving a photo back to where the pipeline
// had it deletes the entry rather than storing the same value again — that way
// a later re-seed reaches every photo nobody has an opinion about.

import {
  kvConfigured,
  kvHGetAll,
  kvHSetMany,
  kvHDelMany,
  kvLPush,
  kvLTrim,
  kvLRange,
} from "@/lib/kv";

const MANIFEST_URL = process.env.PHOTO_MANIFEST_URL || "";

const TIER_KEY = "photos:tier";
const LOG_KEY = "photos:log";
const LOG_KEEP = 300;
const MANIFEST_TTL = 120 * 1000;

export const galleryConfigured = Boolean(MANIFEST_URL);
export const curationConfigured = kvConfigured;

// Levels: 1 best-of, 2 album, 3 every decent frame, 0 cut. Nested by design —
// a tier-1 photo is also in the album, so the tabs filter by "level ≤ n".
export const LEVELS = [0, 1, 2, 3];
export const isLevel = (v) => LEVELS.includes(Number(v));

// One parse per instance per two minutes; the manifest is ~540 KB and a POST
// needs it only to look up seed tiers.
let cache = { at: 0, manifest: null, seed: null };

export async function getManifest() {
  if (!MANIFEST_URL) return null;
  if (cache.manifest && Date.now() - cache.at < MANIFEST_TTL) {
    return cache.manifest;
  }
  const res = await fetch(MANIFEST_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`manifest ${res.status}`);
  const manifest = await res.json();
  cache = {
    at: Date.now(),
    manifest,
    seed: new Map(manifest.photos.map((p) => [p.s, p.t])),
  };
  return manifest;
}

async function seedMap() {
  await getManifest();
  return cache.seed || new Map();
}

// { stem: level } for the photos a human has moved
export async function getOverrides() {
  if (!kvConfigured) return {};
  try {
    const raw = await kvHGetAll(TIER_KEY);
    const out = {};
    for (const [stem, v] of Object.entries(raw)) {
      const n = Number(v);
      if (isLevel(n)) out[stem] = n;
    }
    return out;
  } catch {
    return {};
  }
}

export async function getLog(limit = 60) {
  if (!kvConfigured) return [];
  try {
    return (await kvLRange(LOG_KEY, 0, limit - 1)).filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Applies tier moves and returns the resulting override entries.
 *
 * @param changes [{ stem, level }] — the intended level for each photo
 * @param editor  { ip, device } from editorFrom()
 * @returns { applied: [{stem, from, to}], overrides: { stem: level|null } }
 *          overrides values are null where the photo went back to its seed.
 */
export async function applyTierChanges(changes, editor) {
  if (!kvConfigured) throw new Error("kv not configured");

  const seed = await seedMap();
  const current = await getOverrides();

  const sets = [];
  const clears = [];
  const applied = [];
  const overrides = {};

  for (const { stem, level } of changes) {
    if (!seed.has(stem) || !isLevel(level)) continue;
    const from = current[stem] ?? seed.get(stem);
    if (from === level) continue;

    if (level === seed.get(stem)) {
      clears.push(stem);
      overrides[stem] = null;
    } else {
      sets.push([stem, level]);
      overrides[stem] = level;
    }
    applied.push({ stem, from, to: level });
  }

  if (!applied.length) return { applied, overrides };

  // Both calls are atomic in themselves; a swap that needs one of each leaves a
  // sub-millisecond window where one photo has moved and the other has not.
  // For a family photo album that is a fair trade for not shipping Lua.
  await kvHSetMany(TIER_KEY, sets);
  await kvHDelMany(TIER_KEY, clears);

  try {
    await kvLPush(LOG_KEY, {
      ts: Date.now(),
      by: editor || null,
      changes: applied,
    });
    await kvLTrim(LOG_KEY, 0, LOG_KEEP - 1);
  } catch {}

  return { applied, overrides };
}
