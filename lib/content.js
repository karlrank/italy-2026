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
} from "@/lib/kv";

const CONTENT_KEY = "content:italy-2026";
const BACKUP_PREFIX = "content:backup:";
const BACKUP_KEEP = 20;
const BACKUP_TTL = 30 * 24 * 60 * 60; // 30 days

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
// so any bad save can be rolled back. Best-effort: a backup failure must
// never block the save itself. Backups expire after 30 days; only the
// newest BACKUP_KEEP are kept (ms timestamps sort lexically until 2286).
async function backupCurrent() {
  try {
    const prev = await kvGetRaw(CONTENT_KEY);
    if (!prev) return;
    await kvSetRawEx(BACKUP_PREFIX + Date.now(), prev, BACKUP_TTL);
    const keys = await kvScan(BACKUP_PREFIX + "*");
    if (keys.length > BACKUP_KEEP) {
      const excess = keys.sort().slice(0, keys.length - BACKUP_KEEP);
      for (const k of excess) await kvDel(k);
    }
  } catch {}
}

export async function listBackups() {
  if (!kvConfigured) return [];
  const keys = await kvScan(BACKUP_PREFIX + "*");
  return keys
    .map((k) => Number(k.slice(BACKUP_PREFIX.length)))
    .filter(Boolean)
    .sort((a, b) => b - a);
}

export async function saveContent(doc) {
  if (!kvConfigured) return false;
  await backupCurrent();
  await kvSet(CONTENT_KEY, doc);
  return true;
}

export async function resetContent() {
  if (!kvConfigured) return false;
  await backupCurrent();
  await kvDel(CONTENT_KEY);
  return true;
}
