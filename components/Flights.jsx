"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icons";

// API staatus → eestikeelne silt + värv
const STATUS = {
  Scheduled: { label: "Plaanis", cls: "bg-iseo-soft text-iseo" },
  Expected: { label: "Oodatud", cls: "bg-iseo-soft text-iseo" },
  CheckIn: { label: "Check-in", cls: "bg-iseo-soft text-iseo" },
  Boarding: { label: "Pardale", cls: "bg-garda-soft text-garda" },
  GateClosed: { label: "Värav suletud", cls: "bg-sun/20 text-[#9a6b15]" },
  Departed: { label: "Õhus", cls: "bg-garda-soft text-garda" },
  EnRoute: { label: "Õhus", cls: "bg-garda-soft text-garda" },
  Approaching: { label: "Maandumas", cls: "bg-garda-soft text-garda" },
  Arrived: { label: "Maandunud", cls: "bg-olive/15 text-olive" },
  Delayed: { label: "Hilineb", cls: "bg-sun/20 text-[#9a6b15]" },
  Canceled: { label: "Tühistatud", cls: "bg-bergamo-soft text-bergamo" },
  Diverted: { label: "Ümber suunatud", cls: "bg-bergamo-soft text-bergamo" },
};

function fmt(t) {
  if (!t) return null;
  const d = new Date(String(t).replace(" ", "T"));
  if (isNaN(d)) return String(t);
  return d.toLocaleString("et-EE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDate(d) {
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString("et-EE", {
    day: "numeric",
    month: "long",
    weekday: "short",
  });
}

function FlightCard({ flight, index = 0 }) {
  const [live, setLive] = useState(null); // null | {configured, found, ...}

  useEffect(() => {
    if (!flight.flightNumber || !flight.date) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(
          `/api/flight?number=${encodeURIComponent(
            flight.flightNumber
          )}&date=${encodeURIComponent(flight.date)}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (!cancelled) setLive(json);
      } catch {
        if (!cancelled) setLive({ configured: true, found: false });
      }
    };
    // Hajuta päringud, et mitte tabada API kiiruspiiri (nt 1 päring/sek)
    const startId = setTimeout(load, index * 1500);
    const id = setInterval(load, 5 * 60 * 1000); // iga 5 min
    const onVis = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      clearTimeout(startId);
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [flight.flightNumber, flight.date, index]);

  const st = live?.found ? STATUS[live.status] : null;
  const dep = live?.departure;
  const arr = live?.arrival;

  return (
    <article className="overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm">
      <div className="h-1.5 w-full bg-gradient-to-r from-garda to-iseo" />
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-garda-soft px-2.5 py-0.5 text-xs font-semibold text-garda">
              <Icon name="plane" className="h-3.5 w-3.5" />
              {flight.direction}
            </span>
            <p className="mt-2 text-sm text-ink/55">{fmtDate(flight.date)}</p>
          </div>
          {st ? (
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${st.cls}`}>
              {st.label}
            </span>
          ) : (
            flight.flightNumber && (
              <span className="rounded-full bg-ink/8 px-2.5 py-1 text-xs font-semibold text-ink/50">
                {flight.flightNumber}
              </span>
            )
          )}
        </div>

        {/* Route */}
        <div className="mt-5 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-semibold text-ink">
              {dep?.airport || flight.from || "—"}
            </p>
            <p className="text-sm text-ink/55">
              {fmt(dep?.revised || dep?.scheduled) || "—"}
              {dep?.terminal && (
                <span className="ml-1 text-ink/40">· T{dep.terminal}</span>
              )}
              {dep?.gate && <span className="ml-1 text-ink/40">· {dep.gate}</span>}
            </p>
          </div>
          <Icon name="plane" className="h-5 w-5 shrink-0 text-garda" />
          <div className="min-w-0 flex-1 text-right">
            <p className="truncate font-display text-lg font-semibold text-ink">
              {arr?.airport || flight.to || "—"}
            </p>
            <p className="text-sm text-ink/55">
              {fmt(arr?.revised || arr?.scheduled) || "—"}
              {arr?.terminal && (
                <span className="ml-1 text-ink/40">· T{arr.terminal}</span>
              )}
            </p>
          </div>
        </div>

        {flight.flightNumber && (
          <p className="mt-4 text-xs font-medium text-ink/45">
            Lend {flight.flightNumber}
            {live && live.configured === false && " · lisa API võti elavaks staatuseks"}
            {live?.configured &&
              live.found === false &&
              ` · staatust ei leitud${
                live.upstreamStatus ? ` (${live.upstreamStatus})` : ""
              }`}
          </p>
        )}
        {live?.configured && live.found === false && live.message && (
          <p className="mt-1 text-xs text-bergamo/80">{live.message}</p>
        )}
        {!flight.flightNumber && (
          <p className="mt-4 text-xs text-ink/45">
            Lisa lennunumber, et näha elavat staatust.
          </p>
        )}
        {flight.note && (
          <p className="mt-2 text-sm text-ink/60">{flight.note}</p>
        )}
      </div>
    </article>
  );
}

export default function Flights({ flights }) {
  if (!flights?.length) return null;
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {flights.map((f, i) => (
        <FlightCard key={f.id || f.flightNumber + f.date} flight={f} index={i} />
      ))}
    </div>
  );
}
