"use client";

import { useEffect, useState } from "react";

function diffParts(ms) {
  const total = Math.max(0, ms);
  const days = Math.floor(total / 86400000);
  const hours = Math.floor((total % 86400000) / 3600000);
  const minutes = Math.floor((total % 3600000) / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

export default function Countdown({ startISO, endISO, dateRange }) {
  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const phase =
    now == null ? "loading" : now < start ? "before" : now <= end ? "during" : "after";

  const parts = diffParts(now == null ? 0 : start - now);

  const boxes = [
    { v: parts.days, l: "päeva" },
    { v: parts.hours, l: "tundi" },
    { v: parts.minutes, l: "minutit" },
    { v: parts.seconds, l: "sekundit" },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-8 text-cream shadow-[0_24px_60px_-40px_rgba(42,33,24,0.7)] md:px-10 md:py-10">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-bergamo opacity-25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-iseo opacity-25 blur-3xl" />

      <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sun">
            {phase === "during"
              ? "Olemegi kohal"
              : phase === "after"
                ? "Reis on läbi"
                : "Loendus"}
          </p>
          <p className="mt-2 font-display text-3xl font-semibold leading-tight md:text-4xl">
            {phase === "during"
              ? "Tere tulemast Itaaliasse! 🇮🇹"
              : phase === "after"
                ? "Täname, Itaalia! 👋"
                : "Reisini on jäänud"}
          </p>
        </div>

        {phase === "before" || phase === "loading" ? (
          <div className="flex gap-2.5 sm:gap-3.5">
            {boxes.map((b) => (
              <div
                key={b.l}
                className="flex w-[68px] flex-col items-center rounded-2xl bg-cream/10 px-2 py-3 backdrop-blur sm:w-[80px]"
              >
                <span className="font-display text-3xl font-semibold tabular-nums text-cream sm:text-4xl">
                  {now == null ? "—" : String(b.v).padStart(2, "0")}
                </span>
                <span className="mt-1 text-[0.65rem] font-medium uppercase tracking-wider text-cream/60">
                  {b.l}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <span className="rounded-full bg-sun px-5 py-2.5 font-display text-lg font-semibold text-ink">
            {dateRange}
          </span>
        )}
      </div>
    </div>
  );
}
