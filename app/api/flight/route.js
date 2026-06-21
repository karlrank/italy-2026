// Elav lennustaatus. Pärib lennuandmete API-st (AeroDataBox / RapidAPI)
// serveripoolselt, et API võti jääks salajaseks. Kaitstud middleware'iga.
//
//   FLIGHT_API_KEY   – RapidAPI võti (kohustuslik)
//   FLIGHT_API_HOST  – vaikimisi aerodatabox.p.rapidapi.com
//   FLIGHT_CACHE_TTL – edukate tulemuste vahemälu sekundites (vaikimisi 600)
//
// Tulemused vahemälustatakse KV-s (kui on) või protsessimälus, et hoida
// päringuid alla pakettide kiiruspiiri. 429/5xx korral korratakse viivitusega.

import { kvConfigured, kvGet, kvSetEx } from "@/lib/kv";

export const dynamic = "force-dynamic";

const KEY = process.env.FLIGHT_API_KEY || "";
const HOST = process.env.FLIGHT_API_HOST || "aerodatabox.p.rapidapi.com";
const OK_TTL = Number(process.env.FLIGHT_CACHE_TTL || 600); // 10 min
const FAIL_TTL = 60; // ajutiste vigade lühike vahemälu

const mem = new Map(); // varuvahemälu, kui KV puudub
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

// fetch korduskatsetega 429 / 5xx / võrguvea korral
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
    if ((resp.status === 429 || resp.status >= 500) && i < tries - 1) {
      await sleep(800 * (i + 1) + Math.floor(Math.random() * 400));
      continue;
    }
    return resp;
  }
  return resp;
}

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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const number = (searchParams.get("number") || "")
    .replace(/\s+/g, "")
    .toUpperCase();
  const date = searchParams.get("date") || "";

  if (!KEY) return Response.json({ configured: false });
  if (!/^[A-Z0-9]{2,8}$/.test(number) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ configured: true, error: "bad params" }, { status: 400 });
  }

  const cacheKey = `flight:${number}:${date}`;
  const cached = await getCached(cacheKey);
  if (cached) return Response.json({ ...cached, cached: true });

  let result;
  try {
    const url = `https://${HOST}/flights/number/${number}/${date}?withAircraftImage=false&withLocation=false`;
    const r = await fetchUpstream(url, {
      "X-RapidAPI-Key": KEY,
      "X-RapidAPI-Host": HOST,
    });

    const raw = r ? await r.text() : "";
    let data = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = null;
    }

    if (!r || !r.ok) {
      const message =
        (data && (data.message || data.error)) || raw.slice(0, 200) || "";
      console.error(`[flight] ${number} ${date} → ${r?.status}: ${message}`);
      result = {
        configured: true,
        found: false,
        upstreamStatus: r?.status || 0,
        message,
      };
      // 429 ei vahemälusta — lase järgmisel katsel uuesti proovida
      if (r?.status !== 429) await setCached(cacheKey, result, FAIL_TTL);
      return Response.json(result);
    }

    const leg = Array.isArray(data) ? data[0] : data?.flights?.[0] || null;
    if (!leg) {
      result = {
        configured: true,
        found: false,
        upstreamStatus: 200,
        message: "Selle numbri ja kuupäevaga lendu ei leitud.",
      };
      await setCached(cacheKey, result, FAIL_TTL);
      return Response.json(result);
    }

    result = {
      configured: true,
      found: true,
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
    };
    await setCached(cacheKey, result, OK_TTL);
    return Response.json(result);
  } catch (e) {
    console.error(`[flight] ${number} ${date} → exception: ${e?.message}`);
    return Response.json({ configured: true, found: false, error: "fetch failed" });
  }
}
