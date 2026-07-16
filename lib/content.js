// Trip content: defaults (data/trip.js) + edits stored in KV.
// If KV is configured and contains a saved document, that is used;
// otherwise the default content is returned. This way the page also works
// without a database.

import * as D from "@/data/trip";
import { kvConfigured, kvGet, kvSet, kvDel } from "@/lib/kv";

const CONTENT_KEY = "content:italy-2026";

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

export async function saveContent(doc) {
  if (!kvConfigured) return false;
  await kvSet(CONTENT_KEY, doc);
  return true;
}

export async function resetContent() {
  if (!kvConfigured) return false;
  await kvDel(CONTENT_KEY);
  return true;
}
