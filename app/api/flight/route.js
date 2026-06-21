// Elav lennustaatus. Pärib lennuandmete API-st (AeroDataBox / RapidAPI)
// serveripoolselt, et API võti jääks salajaseks. Kaitstud middleware'iga.
//
// Aktiveerub, kui keskkonnamuutuja FLIGHT_API_KEY on seatud.
//   FLIGHT_API_KEY  – RapidAPI võti
//   FLIGHT_API_HOST – vaikimisi aerodatabox.p.rapidapi.com

export const dynamic = "force-dynamic";

const KEY = process.env.FLIGHT_API_KEY || "";
const HOST = process.env.FLIGHT_API_HOST || "aerodatabox.p.rapidapi.com";

function seg(s) {
  if (!s) return null;
  return {
    airport: s.airport?.name || s.airport?.iata || s.airport?.icao || "",
    iata: s.airport?.iata || "",
    scheduled: s.scheduledTime?.local || null,
    revised: s.revisedTime?.local || s.actualTime?.local || null,
    terminal: s.terminal || null,
    gate: s.gate || null,
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

  try {
    const url = `https://${HOST}/flights/number/${number}/${date}?withAircraftImage=false&withLocation=false`;
    const r = await fetch(url, {
      headers: { "X-RapidAPI-Key": KEY, "X-RapidAPI-Host": HOST },
      cache: "no-store",
    });
    if (!r.ok) {
      return Response.json({ configured: true, found: false, status: r.status });
    }
    const data = await r.json();
    const leg = Array.isArray(data) ? data[0] : data?.flights?.[0] || null;
    if (!leg) return Response.json({ configured: true, found: false });

    return Response.json({
      configured: true,
      found: true,
      status: leg.status || "Unknown",
      number: leg.number || number,
      departure: seg(leg.departure),
      arrival: seg(leg.arrival),
    });
  } catch {
    return Response.json({ configured: true, found: false, error: "fetch failed" });
  }
}
