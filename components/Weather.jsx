"use client";

import { useEffect, useState } from "react";
import { accentFor } from "@/components/accents";

// WMO ilmakood → emoji
function codeEmoji(code) {
  if (code == null) return "";
  if (code === 0) return "☀️";
  if (code <= 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "🌨️";
  if (code <= 82) return "🌦️";
  if (code <= 99) return "⛈️";
  return "";
}

const dayMonth = (iso) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;

// Haversine'i kaugus km-des
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function WeatherCard({ c, startISO, endISO, featured = false }) {
  const a = accentFor(c.region);
  const [data, setData] = useState(null); // {temp, code, hours:[{t,temp,code}], focusLabel, isTrip}
  const [open, setOpen] = useState(featured);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lng}&current=temperature_2m,weather_code&hourly=temperature_2m,weather_code&forecast_days=16&timezone=auto`
        );
        const j = await res.json();
        if (cancelled || !j.current) return;

        const times = j.hourly?.time || [];
        const temps = j.hourly?.temperature_2m || [];
        const codes = j.hourly?.weather_code || [];
        const all = times.map((t, i) => ({ t, temp: temps[i], code: codes[i] }));

        const locNow = j.current.time; // "YYYY-MM-DDTHH:MM"
        const locDate = locNow.slice(0, 10);
        const startDate = (startISO || "").slice(0, 10);
        const endDate = (endISO || "").slice(0, 10);
        const lastDate = times.length ? times[times.length - 1].slice(0, 10) : locDate;

        let focus, isTrip;
        if (startDate && locDate >= startDate && locDate <= endDate) {
          focus = locDate; // reisi ajal
          isTrip = true;
        } else if (startDate && startDate <= lastDate) {
          focus = startDate; // reis ennustusaknas
          isTrip = true;
        } else {
          focus = locDate; // liiga vara → kohalik tänane eelvaade
          isTrip = false;
        }

        let hours = all.filter((h) => h.t.slice(0, 10) === focus);
        if (focus === locDate) hours = hours.filter((h) => h.t >= locNow);
        hours = hours.slice(0, 24);

        if (!cancelled)
          setData({
            temp: Math.round(j.current.temperature_2m),
            code: j.current.weather_code,
            hours,
            focusLabel: isTrip ? `Reisipäev ${dayMonth(focus)}` : "Täna kohapeal",
            isTrip,
          });
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [c.lat, c.lng, startISO, endISO]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-ink/8 bg-cream/50 p-4">
      <span
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${a.gradient}`}
      />
      <div className="flex items-center justify-between">
        <span className={`flex items-center gap-2 text-sm font-semibold ${a.text}`}>
          {c.label}
          {featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-cream">
              📍 Lähim
            </span>
          )}
        </span>
        {data && (
          <span className="flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-ink shadow-sm">
            <span className="text-ink/45">Praegu</span>
            <span>{codeEmoji(data.code)}</span>
            {data.temp}°
          </span>
        )}
      </div>

      <p className="mt-3 text-[0.7rem] font-semibold uppercase tracking-wider text-ink/40">
        Tüüpiline juuli
      </p>
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-3xl font-semibold text-ink">{c.hi}°</span>
        <span className="text-sm text-ink/45">/ {c.lo}° öösel</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink/60">
        {c.water != null && <span>🌊 vesi ~{c.water}°</span>}
        <span>{c.note}</span>
      </div>

      {data?.hours?.length > 0 && (
        <div className="mt-3 border-t border-ink/8 pt-2">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center justify-between text-xs font-semibold text-ink/55 transition hover:text-ink"
          >
            <span>Tunniennustus · {data.focusLabel}</span>
            <span className={`transition ${open ? "rotate-180" : ""}`}>▾</span>
          </button>
          {open && (
            <>
              <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto pb-1">
                {data.hours.map((h) => (
                  <div
                    key={h.t}
                    className="flex shrink-0 flex-col items-center rounded-xl bg-white px-2 py-1.5 text-center shadow-sm"
                  >
                    <span className="text-[0.65rem] text-ink/45">
                      {h.t.slice(11, 16)}
                    </span>
                    <span className="text-sm">{codeEmoji(h.code)}</span>
                    <span className="text-xs font-semibold text-ink">
                      {Math.round(h.temp)}°
                    </span>
                  </div>
                ))}
              </div>
              {!data.isTrip && (
                <p className="mt-1 text-[0.65rem] text-ink/40">
                  Reisipäevade tunniennustus ilmub reisile lähemal.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Weather({ climate, startISO, endISO }) {
  const [nearest, setNearest] = useState(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let best = null;
        let bestD = Infinity;
        climate.forEach((c) => {
          const d = distanceKm(latitude, longitude, c.lat, c.lng);
          if (d < bestD) {
            bestD = d;
            best = c.region;
          }
        });
        setNearest(best);
      },
      () => {},
      { timeout: 8000, maximumAge: 600000 }
    );
  }, [climate]);

  const featured = nearest ? climate.find((c) => c.region === nearest) : null;
  const rest = featured
    ? climate.filter((c) => c.region !== nearest)
    : climate;

  return (
    <div className="rounded-3xl border border-ink/10 bg-white/70 p-5 backdrop-blur md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-ink">
          Ilm peatustes
        </h3>
        <span className="text-xs font-medium text-ink/45">
          tüüpiline juuli + elav seis (Open-Meteo)
        </span>
      </div>

      {featured && (
        <div className="mb-3">
          <WeatherCard
            key={featured.region}
            c={featured}
            startISO={startISO}
            endISO={endISO}
            featured
          />
        </div>
      )}

      <div
        className={`grid gap-3 ${
          featured ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {rest.map((c) => (
          <WeatherCard key={c.region} c={c} startISO={startISO} endISO={endISO} />
        ))}
      </div>
    </div>
  );
}
