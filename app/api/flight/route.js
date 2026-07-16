// Elav lennustaatus. Pärib lennuandmete API-st serveripoolselt, et API
// võti jääks salajaseks. Kaitstud middleware'iga.
//
// Allikate järjekord:
//   1. AeroDataBox RapidAPI kaudu (peamine)
//   2. AeroDataBox api.market kaudu (sama andmestik, eraldi kvoot —
//      jäetakse vahele, kui 1. juba vastas sisuga "lendu pole")
//   3. AirLabs otse (airlabs.co, oma võti — RapidAPI AirLabsi list on katki)
//
//   FLIGHT_API_KEY        – RapidAPI võti AeroDataBoxile
//   FLIGHT_API_HOST       – vaikimisi aerodatabox.p.rapidapi.com
//   FLIGHT_APIMARKET_KEY  – api.market võti AeroDataBoxile (valikuline)
//   AIRLABS_API_KEY       – airlabs.co võti (valikuline)
//
// Tulemused vahemälustatakse KV-s (globaalne, jagatud kõigi külastajate
// vahel) või protsessimälus, kui KV puudub. Vahemälu eluiga sõltub sellest,
// kui kaugel lend on — kuupäeva kaugus muudab värskuse tähtsust:
//
//   > 48 h väljumiseni   → 24 h  (graafik ei muutu, ära kuluta kvooti)
//   48–24 h              → 2 h
//   24–6 h               → 1 h
//   viimased 6 h + lend  → 15 min
//   ammu möödas          → 24 h
//
// Tasuta plaan lubab ~600 päringut kuus, seega iga uuendus on kallis.

import { kvConfigured, kvGet, kvSetEx } from "@/lib/kv";

export const dynamic = "force-dynamic";

const KEY = process.env.FLIGHT_API_KEY || "";
const HOST = process.env.FLIGHT_API_HOST || "aerodatabox.p.rapidapi.com";
const APIMARKET_KEY = process.env.FLIGHT_APIMARKET_KEY || "";
const AIRLABS_KEY = process.env.AIRLABS_API_KEY || "";

const HOUR = 3600;
const ERROR_TTL = 600; // 429/5xx — lühike paus, et pollijad ei taguks kvooti

// Vahemälu eluiga sekundites olenevalt sellest, mitu tundi on väljumiseni
function ttlSeconds(hoursUntilDeparture) {
  if (hoursUntilDeparture > 48) return 24 * HOUR;
  if (hoursUntilDeparture > 24) return 2 * HOUR;
  if (hoursUntilDeparture > 6) return 1 * HOUR;
  if (hoursUntilDeparture > -12) return 15 * 60; // lennu aken kuni saabumiseni
  return 24 * HOUR; // lend ammu möödas, staatus külmunud
}

// Väljumisaeg: eelista API täpset UTC-aega, muidu eelda keskpäeva UTC-s.
// AeroDataBox annab "2026-07-24 12:35Z", AirLabs "2026-07-24 12:35".
function departureMs(dateStr, utcStr) {
  if (utcStr) {
    const iso = String(utcStr).replace(" ", "T").replace(/Z$/, "") + "Z";
    const d = new Date(iso);
    if (!isNaN(d)) return d.getTime();
  }
  return new Date(`${dateStr}T12:00:00Z`).getTime();
}

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

// fetch korduskatsetega 5xx / võrguvea korral.
// 429 EI korrata — see on kvoodisignaal, kordamine ainult võimendab kulu.
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

// ── Peamine allikas: AeroDataBox ─────────────────────────────────

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

// AeroDataBoxi väravad — sama API, eri turuplatsid oma kvootidega
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

// ── Varuallikas: AirLabs ─────────────────────────────────────────
// /flight tagastab lennunumbri JÄRGMISE või käimasoleva toimumise,
// mitte suvalise kuupäeva oma — seega kuupäeva peab ise kontrollima.

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

  // 429 on sekundipiirang (mitu lendu päritakse korraga), mis taastub
  // kohe — erinevalt AeroDataBoxi kuukvoodist tasub üks viivitusega kordus
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

  // ?refresh=1 sunnib vahemälust mööda (silumine / allika vahetus)
  const refresh = searchParams.get("refresh") === "1";
  const cacheKey = `flight:${number}:${date}`;
  if (!refresh) {
    const cached = await getCached(cacheKey);
    if (cached) return Response.json({ ...cached, cached: true });
  }

  try {
    let result = KEY
      ? await queryAeroDataBox(number, date, ADB_GATEWAYS.rapidapi)
      : { configured: true, found: false, upstreamStatus: 0, message: "" };

    // Sama API teise värava kaudu — mõttekas ainult siis, kui esimene
    // EI saanud sisulist vastust (kvoot/viga); "lendu pole" (200) kehtib
    // mõlemas väravas ühtmoodi
    if (!result.found && result.upstreamStatus !== 200 && APIMARKET_KEY) {
      const alt = await queryAeroDataBox(number, date, ADB_GATEWAYS.apimarket);
      if (alt.found || alt.upstreamStatus === 200) result = alt;
    }

    // Kui AeroDataBox ei leidnud või on maas, proovi AirLabs'i.
    // Varu "ei leitud" (200) on kasutajale parem vastus kui kvoodiviga.
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
    // Leitud ja "ei leitud" (püsiv seis) elavad kuupäevapõhise astme järgi;
    // vead (429/5xx) saavad lühikese pausi, et pollijad kvooti ei taguks
    const ttl =
      body.found || body.upstreamStatus === 200
        ? ttlSeconds(hoursUntil)
        : ERROR_TTL;
    await setCached(cacheKey, body, ttl);
    return Response.json(body);
  } catch (e) {
    console.error(`[flight] ${number} ${date} → exception: ${e?.message}`);
    return Response.json({ configured: true, found: false, error: "fetch failed" });
  }
}
