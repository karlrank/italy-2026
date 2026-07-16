// Live flight status. Queries the flight data API server-side so the API
// key stays secret. Protected by the middleware.
//
// Source order:
//   1. AeroDataBox via RapidAPI (primary)
//   2. AeroDataBox via api.market (same dataset, separate quota —
//      skipped if 1. already returned a substantive "no flight" answer)
//   3. AirLabs directly (airlabs.co, own key — the RapidAPI AirLabs listing is broken)
//
//   FLIGHT_API_KEY        – RapidAPI key for AeroDataBox
//   FLIGHT_API_HOST       – defaults to aerodatabox.p.rapidapi.com
//   FLIGHT_APIMARKET_KEY  – api.market key for AeroDataBox (optional)
//   AIRLABS_API_KEY       – airlabs.co key (optional)
//
// Results are cached in KV (global, shared across all visitors) or in
// process memory when KV is absent. Cache lifetime depends on how far
// away the flight is — the date's distance changes how much freshness matters:
//
//   > 48 h until departure → 24 h  (schedule won't change, don't burn quota)
//   48–24 h                → 2 h
//   24–6 h                 → 1 h
//   last 6 h + flight      → 15 min
//   long past              → 24 h
//
// The free plan allows ~600 requests per month, so every refresh is expensive.

import { kvConfigured, kvGet, kvSetEx } from "@/lib/kv";

export const dynamic = "force-dynamic";

const KEY = process.env.FLIGHT_API_KEY || "";
const HOST = process.env.FLIGHT_API_HOST || "aerodatabox.p.rapidapi.com";
const APIMARKET_KEY = process.env.FLIGHT_APIMARKET_KEY || "";
const AIRLABS_KEY = process.env.AIRLABS_API_KEY || "";

const HOUR = 3600;
const ERROR_TTL = 600; // 429/5xx — short pause so pollers don't hammer the quota

// Cache lifetime in seconds depending on how many hours remain until departure
function ttlSeconds(hoursUntilDeparture) {
  if (hoursUntilDeparture > 48) return 24 * HOUR;
  if (hoursUntilDeparture > 24) return 2 * HOUR;
  if (hoursUntilDeparture > 6) return 1 * HOUR;
  if (hoursUntilDeparture > -12) return 15 * 60; // flight window until arrival
  return 24 * HOUR; // flight long past, status frozen
}

// Vercel edge cache (CDN) lifetime — keeps repeat requests from hitting
// the function and KV at all; the middleware checks the password before
// the cache. Shorter than the KV tier so tier transitions take effect.
function cdnSeconds(hoursUntilDeparture) {
  if (hoursUntilDeparture > 48) return 3600;
  if (hoursUntilDeparture > 24) return 1800;
  if (hoursUntilDeparture > 6) return 600;
  if (hoursUntilDeparture > -12) return 120; // max 2 min on flight day
  return 3600;
}

// JSON response with edge-cache headers. Errors and ?refresh=1 get a
// short / no cache respectively.
function jsonCached(body, date, refresh) {
  let seconds = 0;
  if (!refresh) {
    if (body.found || body.upstreamStatus === 200) {
      seconds = cdnSeconds((departureMs(date, null) - Date.now()) / 3600000);
    } else {
      seconds = 60;
    }
  }
  // SWR as long as the lifetime: a stale response is served from the edge
  // immediately and revalidation runs in the background — only the window's
  // first visitor sees the MISS delay. Worst-case staleness is 2× the tier
  // (max 4 min on flight day).
  const headers = {
    "Cache-Control": seconds
      ? `public, max-age=0, s-maxage=${seconds}, stale-while-revalidate=${seconds}`
      : "no-store",
  };
  return Response.json(body, { headers });
}

// Departure time: prefer the API's exact UTC time, otherwise assume noon UTC.
// AeroDataBox gives "2026-07-24 12:35Z", AirLabs "2026-07-24 12:35".
function departureMs(dateStr, utcStr) {
  if (utcStr) {
    const iso = String(utcStr).replace(" ", "T").replace(/Z$/, "") + "Z";
    const d = new Date(iso);
    if (!isNaN(d)) return d.getTime();
  }
  return new Date(`${dateStr}T12:00:00Z`).getTime();
}

const mem = new Map(); // fallback cache when KV is absent
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getCached(key) {
  if (kvConfigured) {
    try {
      return await kvGet(key);
    } catch {
      return null;
    }
  }
  const e = mem.get(key);
  if (e && e.exp > Date.now()) return e.value;
  if (e) mem.delete(key);
  return null;
}

async function setCached(key, value, ttl) {
  if (kvConfigured) {
    try {
      await kvSetEx(key, value, ttl);
    } catch {}
  } else {
    mem.set(key, { value, exp: Date.now() + ttl * 1000 });
  }
}

// fetch with retries on 5xx / network errors.
// 429 is NOT retried — it's a quota signal; retrying only amplifies the cost.
async function fetchUpstream(url, headers) {
  const tries = 3;
  let resp = null;
  for (let i = 0; i < tries; i++) {
    try {
      resp = await fetch(url, { headers, cache: "no-store" });
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(600 * (i + 1));
      continue;
    }
    if (resp.status >= 500 && i < tries - 1) {
      await sleep(800 * (i + 1) + Math.floor(Math.random() * 400));
      continue;
    }
    return resp;
  }
  return resp;
}

async function fetchJson(url, headers = {}) {
  const r = await fetchUpstream(url, headers);
  const raw = r ? await r.text() : "";
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }
  return { r, raw, data };
}

const NOT_FOUND_MSG = "Selle numbri ja kuupäevaga lendu ei leitud.";

// ── Primary source: AeroDataBox ──────────────────────────────────

function seg(s) {
  if (!s) return null;
  return {
    airport: s.airport?.name || s.airport?.iata || s.airport?.icao || "",
    iata: s.airport?.iata || "",
    city: s.airport?.municipalityName || "",
    country: s.airport?.countryCode || "",
    scheduled: s.scheduledTime?.local || null,
    revised: s.revisedTime?.local || s.actualTime?.local || null,
    terminal: s.terminal || null,
    gate: s.gate || null,
    checkInDesk: s.checkInDesk || null,
    baggageBelt: s.baggageBelt || null,
  };
}

// AeroDataBox gateways — same API, different marketplaces with their own quotas
const ADB_GATEWAYS = {
  rapidapi: {
    name: "aerodatabox",
    base: () => `https://${HOST}`,
    headers: () => ({ "X-RapidAPI-Key": KEY, "X-RapidAPI-Host": HOST }),
  },
  apimarket: {
    name: "aerodatabox-apimarket",
    base: () => "https://prod.api.market/api/v1/aedbx/aerodatabox",
    headers: () => ({ "x-magicapi-key": APIMARKET_KEY }),
  },
};

async function queryAeroDataBox(number, date, gateway) {
  const url = `${gateway.base()}/flights/number/${number}/${date}?withAircraftImage=false&withLocation=false`;
  const { r, raw, data } = await fetchJson(url, gateway.headers());

  if (!r || !r.ok) {
    const message =
      (data && (data.message || data.error)) || raw.slice(0, 200) || "";
    console.error(`[flight] ${gateway.name} ${number} ${date} → ${r?.status}: ${message}`);
    return { configured: true, found: false, upstreamStatus: r?.status || 0, message };
  }

  const leg = Array.isArray(data) ? data[0] : data?.flights?.[0] || null;
  if (!leg) {
    return { configured: true, found: false, upstreamStatus: 200, message: NOT_FOUND_MSG };
  }

  return {
    configured: true,
    found: true,
    source: gateway.name,
    status: leg.status || "Unknown",
    number: leg.number || number,
    callSign: leg.callSign || null,
    airline: leg.airline?.name || null,
    aircraft: leg.aircraft?.model || null,
    reg: leg.aircraft?.reg || null,
    distanceKm: leg.greatCircleDistance?.km
      ? Math.round(leg.greatCircleDistance.km)
      : null,
    codeshare: leg.codeshareStatus || null,
    departure: seg(leg.departure),
    arrival: seg(leg.arrival),
    depUtc: leg.departure?.scheduledTime?.utc || null,
  };
}

// ── Fallback source: AirLabs ─────────────────────────────────────
// /flight returns the flight number's NEXT or in-progress occurrence,
// not one for an arbitrary date — so the date must be checked manually.

const AIRLABS_STATUS = {
  scheduled: "Scheduled",
  "en-route": "EnRoute",
  landed: "Arrived",
  cancelled: "Canceled",
};

function airlabsSeg(f, p) {
  return {
    airport: f[`${p}_name`] || f[`${p}_iata`] || "",
    iata: f[`${p}_iata`] || "",
    city: f[`${p}_city`] || "",
    country: f[`${p}_country`] || "",
    scheduled: f[`${p}_time`] || null,
    revised: f[`${p}_estimated`] || f[`${p}_actual`] || null,
    terminal: f[`${p}_terminal`] || null,
    gate: f[`${p}_gate`] || null,
    checkInDesk: null,
    baggageBelt: p === "arr" ? f.arr_baggage || null : null,
  };
}

async function queryAirlabs(number, date) {
  const url = `https://airlabs.co/api/v9/flight?flight_iata=${encodeURIComponent(
    number
  )}&api_key=${encodeURIComponent(AIRLABS_KEY)}`;
  let { r, raw, data } = await fetchJson(url);

  // 429 is a per-second limit (several flights queried at once) that
  // recovers immediately — unlike AeroDataBox's monthly quota, one
  // delayed retry is worthwhile
  if (r && r.status === 429) {
    await sleep(1500 + Math.floor(Math.random() * 500));
    ({ r, raw, data } = await fetchJson(url));
  }

  if (!r || !r.ok || data?.error) {
    const message =
      data?.error?.message || data?.message || raw.slice(0, 200) || "";
    console.error(`[flight] airlabs ${number} ${date} → ${r?.status}: ${message}`);
    return { configured: true, found: false, upstreamStatus: r?.status || 0, message };
  }

  const f = data?.response;
  const flightDates = [f?.dep_time, f?.dep_time_utc]
    .filter(Boolean)
    .map((t) => String(t).slice(0, 10));
  if (!f || !flightDates.includes(date)) {
    return { configured: true, found: false, upstreamStatus: 200, message: NOT_FOUND_MSG };
  }

  let status = AIRLABS_STATUS[f.status] || "Unknown";
  if (status === "Scheduled" && Number(f.dep_delayed || f.delayed) > 0) {
    status = "Delayed";
  }

  return {
    configured: true,
    found: true,
    source: "airlabs",
    status,
    number: f.flight_iata || number,
    callSign: f.flight_icao || null,
    airline: f.airline_name || f.airline_iata || null,
    aircraft: f.aircraft_icao || null,
    reg: f.reg_number || null,
    distanceKm: null,
    codeshare: null,
    departure: airlabsSeg(f, "dep"),
    arrival: airlabsSeg(f, "arr"),
    depUtc: f.dep_time_utc || null,
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const number = (searchParams.get("number") || "")
    .replace(/\s+/g, "")
    .toUpperCase();
  const date = searchParams.get("date") || "";

  if (!KEY && !APIMARKET_KEY && !AIRLABS_KEY) {
    return Response.json({ configured: false });
  }
  if (!/^[A-Z0-9]{2,8}$/.test(number) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ configured: true, error: "bad params" }, { status: 400 });
  }

  // ?refresh=1 forces a cache bypass (debugging / switching sources)
  const refresh = searchParams.get("refresh") === "1";
  const cacheKey = `flight:${number}:${date}`;
  if (!refresh) {
    const cached = await getCached(cacheKey);
    if (cached) return jsonCached({ ...cached, cached: true }, date, false);
  }

  try {
    let result = KEY
      ? await queryAeroDataBox(number, date, ADB_GATEWAYS.rapidapi)
      : { configured: true, found: false, upstreamStatus: 0, message: "" };

    // Same API via the other gateway — only makes sense when the first
    // did NOT get a substantive answer (quota/error); "no flight" (200)
    // holds identically for both gateways
    if (!result.found && result.upstreamStatus !== 200 && APIMARKET_KEY) {
      const alt = await queryAeroDataBox(number, date, ADB_GATEWAYS.apimarket);
      if (alt.found || alt.upstreamStatus === 200) result = alt;
    }

    // If AeroDataBox found nothing or is down, try AirLabs.
    // A fallback "not found" (200) is a better answer for the user than a quota error.
    if (!result.found && AIRLABS_KEY) {
      const fallback = await queryAirlabs(number, date);
      if (fallback.found || (result.upstreamStatus !== 200 && fallback.upstreamStatus === 200)) {
        result = fallback;
      }
    }

    const { depUtc, ...body } = result;
    if (body.found) {
      console.log(`[flight] ${number} ${date} ← ${body.source}: ${body.status}`);
    }
    const hoursUntil = (departureMs(date, depUtc) - Date.now()) / 3600000;
    // Found and "not found" (a stable state) live by the date-based tier;
    // errors (429/5xx) get a short pause so pollers don't hammer the quota
    const ttl =
      body.found || body.upstreamStatus === 200
        ? ttlSeconds(hoursUntil)
        : ERROR_TTL;
    await setCached(cacheKey, body, ttl);
    return jsonCached(body, date, refresh);
  } catch (e) {
    console.error(`[flight] ${number} ${date} → exception: ${e?.message}`);
    return Response.json({ configured: true, found: false, error: "fetch failed" });
  }
}
