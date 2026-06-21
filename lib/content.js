// Reisi sisu: vaikeväärtused (data/trip.js) + KV-s hoitavad muudatused.
// Kui KV on seadistatud ja sisaldab salvestatud dokumenti, kasutatakse seda;
// muidu tagastatakse vaikesisu. Nii töötab leht ka ilma andmebaasita.

import * as D from "@/data/trip";
import { kvConfigured, kvGet, kvSet, kvDel } from "@/lib/kv";

const CONTENT_KEY = "content:italy-2026";

export const contentConfigured = kvConfigured;

// dayFocus: ajakava päev → kaardimärgi nimi (tuletatud vaikeväärtusest)
export const defaultContent = {
  trip: D.trip,
  flights: D.flights,
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

// Liida salvestatu vaikeväärtuste peale, et uued väljad ei kaoks
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
