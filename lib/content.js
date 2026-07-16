// Trip content: defaults (data/trip.js) + edits stored in KV.
// If KV is configured and contains a saved document, that is used;
// otherwise the default content is returned. This way the page also works
// without a database.

import * as D from "@/data/trip";
import {
  kvConfigured,
  kvGet,
  kvGetRaw,
  kvSet,
  kvSetRawEx,
  kvScan,
  kvDel,
  kvHSet,
  kvHDel,
  kvHGetAll,
} from "@/lib/kv";

const CONTENT_KEY = "content:italy-2026";
const BACKUP_PREFIX = "content:backup:";
const BACKUP_META_KEY = "content:backup-meta"; // hash: <ts> → editor info JSON
const BACKUP_KEEP = 20;
const BACKUP_TTL = 30 * 24 * 60 * 60; // 30 days

// Rough device label from the user agent — the site has one shared
// password, so "who edited" can only be approximated by device + IP
function deviceLabel(ua) {
  const os = /iPhone/.test(ua)
    ? "iPhone"
    : /iPad/.test(ua)
      ? "iPad"
      : /Android/.test(ua)
        ? "Android"
        : /Mac/.test(ua)
          ? "Mac"
          : /Windows/.test(ua)
            ? "Windows"
            : /Linux/.test(ua)
              ? "Linux"
              : "";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Safari\//.test(ua)
            ? "Safari"
            : "";
  return [os, browser].filter(Boolean).join(" · ") || "tundmatu seade";
}

// Editor info from an incoming request, attached to the backup that the
// edit replaces. action: "save" | "restore" | "reset" | "packing"
export function editorFrom(request, action = "save") {
  const h = request.headers;
  const ip =
    (h.get("x-forwarded-for") || "").split(",")[0].trim() ||
    h.get("x-real-ip") ||
    "";
  return { ip, device: deviceLabel(h.get("user-agent") || ""), action };
}

export const contentConfigured = kvConfigured;

// dayFocus: itinerary day → map marker name (derived from the default)
export const defaultContent = {
  trip: D.trip,
  flights: D.flights,
  cars: D.cars,
  food: D.food,
  quickFacts: D.quickFacts,
  itinerary: D.itinerary,
  stays: D.stays,
  activityRegions: D.activityRegions,
  budget: {
    items: D.budgetActivities,
    total: D.budgetActivitiesTotal,
    note: D.budgetActivitiesNote,
  },
  ticketTips: D.ticketTips,
  ticketLinks: D.ticketLinks,
  practicalNotes: D.practicalNotes,
  mapStops: D.mapStops,
  routePath: D.routePath,
  climate: D.climate,
  packingCategories: D.packingCategories,
  photos: D.photos,
  dayFocus: D.dayFocus,
};

// Merge the stored document over the defaults so new fields aren't lost
function merge(stored) {
  if (!stored || typeof stored !== "object") return defaultContent;
  return {
    ...defaultContent,
    ...stored,
    budget: { ...defaultContent.budget, ...(stored.budget || {}) },
    photos: { ...defaultContent.photos, ...(stored.photos || {}) },
  };
}

export async function getContent() {
  if (!kvConfigured) return defaultContent;
  try {
    const stored = await kvGet(CONTENT_KEY);
    return merge(stored);
  } catch {
    return defaultContent;
  }
}

// Snapshot the CURRENT document before it gets overwritten or deleted,
// so any bad save can be rolled back. Editor info goes into a side hash
// (listing stays one HGETALL instead of fetching every ~100KB snapshot).
// Best-effort: a backup failure must never block the save itself.
// Backups expire after 30 days; only the newest BACKUP_KEEP are kept
// (ms timestamps sort lexically until 2286).
async function backupCurrent(editor) {
  try {
    const prev = await kvGetRaw(CONTENT_KEY);
    if (!prev) return;
    const ts = String(Date.now());
    await kvSetRawEx(BACKUP_PREFIX + ts, prev, BACKUP_TTL);
    try {
      await kvHSet(BACKUP_META_KEY, ts, JSON.stringify(editor || {}));
    } catch {}

    // Prune old snapshots + any meta whose snapshot is gone (pruned/expired)
    const live = new Set(
      (await kvScan(BACKUP_PREFIX + "*")).map((k) =>
        k.slice(BACKUP_PREFIX.length)
      )
    );
    const excess = [...live].sort().slice(0, Math.max(0, live.size - BACKUP_KEEP));
    for (const t of excess) {
      await kvDel(BACKUP_PREFIX + t);
      live.delete(t);
    }
    const meta = await kvHGetAll(BACKUP_META_KEY);
    for (const f of Object.keys(meta)) {
      if (!live.has(f)) await kvHDel(BACKUP_META_KEY, f);
    }
  } catch {}
}

// Newest first: [{ ts, by: {ip, device, action} | null }]
export async function listBackups() {
  if (!kvConfigured) return [];
  const keys = await kvScan(BACKUP_PREFIX + "*");
  let meta = {};
  try {
    meta = await kvHGetAll(BACKUP_META_KEY);
  } catch {}
  return keys
    .map((k) => Number(k.slice(BACKUP_PREFIX.length)))
    .filter(Boolean)
    .sort((a, b) => b - a)
    .map((ts) => {
      let by = null;
      try {
        by = meta[String(ts)] ? JSON.parse(meta[String(ts)]) : null;
      } catch {}
      return { ts, by };
    });
}

export async function getBackup(ts) {
  if (!kvConfigured) return null;
  return kvGet(BACKUP_PREFIX + ts);
}

export async function saveContent(doc, editor) {
  if (!kvConfigured) return false;
  await backupCurrent(editor);
  await kvSet(CONTENT_KEY, doc);
  return true;
}

export async function resetContent(editor) {
  if (!kvConfigured) return false;
  await backupCurrent(editor);
  await kvDel(CONTENT_KEY);
  return true;
}
