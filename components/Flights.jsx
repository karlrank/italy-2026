"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/Icons";
import { mapsUrl, flightTrackerUrl } from "@/lib/links";

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

function Row({ label, children }) {
  if (children == null || children === "" || children === false) return null;
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-ink/45">
        {label}
      </span>
      <span className="text-right text-sm font-medium text-ink">{children}</span>
    </div>
  );
}

function FlightDialog({ flight, live, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const st = live?.found ? STATUS[live.status] : null;
  const dep = live?.departure;
  const arr = live?.arrival;

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-ink/50 p-4 backdrop-blur-sm sm:p-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-ink/10 bg-cream shadow-2xl"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-garda to-iseo" />
        <div className="flex items-start justify-between gap-3 px-6 pt-5">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-garda-soft px-2.5 py-0.5 text-xs font-semibold text-garda">
              <Icon name="plane" className="h-3.5 w-3.5" />
              {flight.direction}
            </span>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
              {flight.flightNumber ? (
                <a
                  href={flightTrackerUrl(flight.flightNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-garda hover:underline"
                >
                  {flight.flightNumber}
                </a>
              ) : (
                "Lend"
              )}
            </h2>
            <p className="text-sm text-ink/55">{fmtDate(flight.date)}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink/50 transition hover:bg-ink/5"
            aria-label="Sulge"
          >
            ✕
          </button>
        </div>

        <div className="px-6 pb-6">
          {st && (
            <span className={`mt-3 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${st.cls}`}>
              {st.label}
            </span>
          )}

          {/* Route */}
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-4">
            <a
              href={mapsUrl(dep?.airport || flight.from || "Malpensa Airport")}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1 transition hover:text-garda"
            >
              <p className="truncate font-display text-lg font-semibold text-ink">
                {dep?.iata || flight.from || "—"}
              </p>
              <p className="truncate text-xs text-ink/55">
                {dep?.airport || dep?.city || ""}
              </p>
            </a>
            <Icon name="plane" className="h-5 w-5 shrink-0 text-garda" />
            <a
              href={mapsUrl(arr?.airport || flight.to || "Malpensa Airport")}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1 text-right transition hover:text-garda"
            >
              <p className="truncate font-display text-lg font-semibold text-ink">
                {arr?.iata || flight.to || "—"}
              </p>
              <p className="truncate text-xs text-ink/55">
                {arr?.airport || arr?.city || ""}
              </p>
            </a>
          </div>

          {flight.flightNumber && (
            <a
              href={flightTrackerUrl(flight.flightNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-garda transition hover:underline"
            >
              <Icon name="plane" className="h-4 w-4" />
              Jälgi lendu reaalajas (FlightAware) ↗
            </a>
          )}

          {!live?.found && (
            <p className="mt-4 text-sm text-ink/55">
              {live?.configured === false
                ? "Elav info nõuab API võtit."
                : "Elavat infot ei leitud (ilmub reisile lähemal)."}
            </p>
          )}

          {live?.found && (
            <div className="mt-4 grid gap-x-6 sm:grid-cols-2">
              <div className="divide-y divide-ink/8">
                <p className="pb-1 text-xs font-semibold uppercase tracking-wider text-garda">
                  Väljumine
                </p>
                <Row label="Plaanis">{fmt(dep?.scheduled)}</Row>
                {dep?.revised && dep.revised !== dep.scheduled && (
                  <Row label="Uuendatud">{fmt(dep.revised)}</Row>
                )}
                <Row label="Terminal">{dep?.terminal}</Row>
                <Row label="Värav">{dep?.gate}</Row>
                <Row label="Check-in">{dep?.checkInDesk}</Row>
              </div>
              <div className="divide-y divide-ink/8">
                <p className="pb-1 text-xs font-semibold uppercase tracking-wider text-iseo">
                  Saabumine
                </p>
                <Row label="Plaanis">{fmt(arr?.scheduled)}</Row>
                {arr?.revised && arr.revised !== arr.scheduled && (
                  <Row label="Uuendatud">{fmt(arr.revised)}</Row>
                )}
                <Row label="Terminal">{arr?.terminal}</Row>
                <Row label="Pagasilint">{arr?.baggageBelt}</Row>
              </div>
            </div>
          )}

          {live?.found && (
            <div className="mt-4 divide-y divide-ink/8 border-t border-ink/8 pt-2">
              <Row label="Lennufirma">{live.airline}</Row>
              <Row label="Lennuk">
                {[live.aircraft, live.reg].filter(Boolean).join(" · ") || null}
              </Row>
              <Row label="Vahemaa">{live.distanceKm ? `${live.distanceKm} km` : null}</Row>
              <Row label="Kutsung">{live.callSign}</Row>
            </div>
          )}

          {flight.note && (
            <p className="mt-4 rounded-2xl bg-white p-3 text-sm text-ink/70">
              {flight.note}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function FlightCard({ flight, index = 0 }) {
  const [live, setLive] = useState(null); // null | {configured, found, ...}
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!flight.flightNumber || !flight.date) return;
    let cancelled = false;
    let timerId = null;
    let lastLoad = 0;
    // Väljumisaeg täpsustub live-andmetega; enne seda eelda keskpäeva
    let depMs = new Date(`${flight.date}T12:00:00`).getTime();

    // Pollimissamm sõltub lennu kaugusest (server vahemälustab sama astmega,
    // nii et tegelik API-kulu on jagatud kõigi külastajate vahel):
    //   >48 h → ei polli (piisab ühest laadimisest); 48–24 h → 2 h;
    //   24–6 h → 1 h; viimased 6 h kuni saabumiseni → 15 min; möödas → ei polli
    const pollMs = () => {
      const h = (depMs - Date.now()) / 3600000;
      if (h > 48) return null;
      if (h > 24) return 2 * 3600000;
      if (h > 6) return 3600000;
      if (h > -12) return 15 * 60000;
      return null;
    };

    const schedule = () => {
      if (cancelled) return;
      const ms = pollMs();
      if (ms) timerId = setTimeout(load, ms);
    };

    const load = async () => {
      lastLoad = Date.now();
      try {
        const res = await fetch(
          `/api/flight?number=${encodeURIComponent(
            flight.flightNumber
          )}&date=${encodeURIComponent(flight.date)}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (cancelled) return;
        const sched = json?.departure?.scheduled;
        if (sched) {
          const d = new Date(String(sched).replace(" ", "T"));
          if (!isNaN(d)) depMs = d.getTime();
        }
        setLive(json);
      } catch {
        if (!cancelled) setLive({ configured: true, found: false });
      }
      schedule();
    };

    // Hajuta esmased päringud, et mitte tabada API kiiruspiiri (1 päring/sek)
    const startId = setTimeout(load, index * 1500);
    // Tab'i fookusesse tulek värskendab ainult siis, kui andmed on
    // pollimissammu jagu vananenud — mitte igal pilgul
    const onVis = () => {
      const ms = pollMs();
      if (
        document.visibilityState === "visible" &&
        ms &&
        Date.now() - lastLoad >= ms
      ) {
        clearTimeout(timerId);
        load();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      clearTimeout(startId);
      clearTimeout(timerId);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [flight.flightNumber, flight.date, index]);

  const st = live?.found ? STATUS[live.status] : null;
  const dep = live?.departure;
  const arr = live?.arrival;

  return (
    <>
    <article
      onClick={() => setShowDetails(true)}
      className="group cursor-pointer overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(42,33,24,0.5)]"
    >
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
              (live.upstreamStatus === 200
                ? " · elav staatus ilmub lennupäeva lähedal"
                : " · elav staatus pole hetkel saadaval")}
          </p>
        )}
        {!flight.flightNumber && (
          <p className="mt-4 text-xs text-ink/45">
            Lisa lennunumber, et näha elavat staatust.
          </p>
        )}
        {flight.note && (
          <p className="mt-2 text-sm text-ink/60">{flight.note}</p>
        )}

        <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-garda/70 transition group-hover:text-garda">
          Vaata üksikasju
          <Icon name="arrow" className="h-3.5 w-3.5" />
        </p>
      </div>
    </article>
      {showDetails && (
        <FlightDialog
          flight={flight}
          live={live}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
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
