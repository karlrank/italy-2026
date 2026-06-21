"use client";

import { useEffect, useState } from "react";
import { climate } from "@/data/trip";
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

export default function Weather() {
  const [live, setLive] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const results = await Promise.allSettled(
        climate.map((c) =>
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lng}&current=temperature_2m,weather_code`
          ).then((r) => r.json())
        )
      );
      if (cancelled) return;
      const next = {};
      results.forEach((res, i) => {
        if (res.status === "fulfilled" && res.value?.current) {
          next[climate[i].region] = {
            temp: Math.round(res.value.current.temperature_2m),
            code: res.value.current.weather_code,
          };
        }
      });
      setLive(next);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-3xl border border-ink/10 bg-white/70 p-5 backdrop-blur md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-ink">
          Ilm peatustes
        </h3>
        <span className="text-xs font-medium text-ink/45">
          tüüpiline juuli · hetkeseis Open-Meteost
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {climate.map((c) => {
          const a = accentFor(c.region);
          const now = live[c.region];
          return (
            <div
              key={c.region}
              className="relative overflow-hidden rounded-2xl border border-ink/8 bg-cream/50 p-4"
            >
              <span
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${a.gradient}`}
              />
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${a.text}`}>
                  {c.label}
                </span>
                {now && (
                  <span className="flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-ink shadow-sm">
                    <span>{codeEmoji(now.code)}</span>
                    {now.temp}°
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-display text-3xl font-semibold text-ink">
                  {c.hi}°
                </span>
                <span className="text-sm text-ink/45">/ {c.lo}° öösel</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink/60">
                {c.water != null && <span>🌊 vesi ~{c.water}°</span>}
                <span>{c.note}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
