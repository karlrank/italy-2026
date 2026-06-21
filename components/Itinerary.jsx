"use client";

import { useState } from "react";
import { itinerary, dayFocus } from "@/data/trip";
import { accentFor } from "@/components/accents";
import { Icon } from "@/components/Icons";

export default function Itinerary() {
  const [active, setActive] = useState(0);
  const day = itinerary[active];
  const a = accentFor(day.accent);

  const focusOnMap = () => {
    const name = dayFocus[day.day];
    if (!name) return;
    const el = document.getElementById("kaart");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(
      () => window.dispatchEvent(new CustomEvent("trip:focus", { detail: { name } })),
      550
    );
  };

  return (
    <div>
      {/* Day rail */}
      <div className="no-scrollbar -mx-5 mb-8 flex gap-2.5 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:justify-center md:px-0">
        {itinerary.map((d, i) => {
          const da = accentFor(d.accent);
          const isActive = i === active;
          return (
            <button
              key={d.day}
              onClick={() => setActive(i)}
              className={`group flex shrink-0 flex-col items-center rounded-2xl border px-4 py-3 transition-all duration-300 ${
                isActive
                  ? `${da.bgSolid} border-transparent text-white shadow-lg`
                  : "border-ink/10 bg-white/60 text-ink/70 hover:border-ink/20 hover:bg-white"
              }`}
            >
              <span
                className={`text-[0.65rem] font-semibold uppercase tracking-wider ${
                  isActive ? "text-white/80" : "text-ink/45"
                }`}
              >
                Päev {d.day}
              </span>
              <span className="font-display text-xl font-semibold leading-tight">
                {d.date}
              </span>
              <span
                className={`text-[0.65rem] font-medium ${
                  isActive ? "text-white/85" : "text-ink/55"
                }`}
              >
                {d.weekday}
              </span>
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      <div
        key={active}
        className="overflow-hidden rounded-3xl border border-ink/10 bg-white/80 shadow-[0_20px_60px_-30px_rgba(42,33,24,0.4)]"
      >
        <div className={`h-1.5 w-full bg-gradient-to-r ${a.gradient}`} />
        <div className="grid gap-8 p-7 md:grid-cols-[1fr_1.4fr] md:p-10">
          {/* Left: meta */}
          <div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full ${a.bgSoft} ${a.text} px-3 py-1 text-xs font-semibold`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${a.dot}`} />
              {a.label}
            </span>
            <h3 className="mt-4 font-display text-3xl font-semibold leading-tight text-ink md:text-4xl">
              {day.title}
            </h3>
            <p className="mt-3 flex items-center gap-2 text-sm text-ink/60">
              <Icon name="route" className="h-4 w-4 shrink-0" />
              {day.drive}
            </p>
            {day.stay && (
              <p className="mt-2 flex items-center gap-2 text-sm text-ink/60">
                <Icon name="bed" className="h-4 w-4 shrink-0" />
                Ööbimine: {day.stay}
              </p>
            )}
            {day.warning && (
              <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-sun/15 p-3.5 text-sm text-ink/80">
                <Icon name="warning" className="h-5 w-5 shrink-0 text-sun" />
                <span>{day.warning}</span>
              </div>
            )}
            {dayFocus[day.day] && (
              <button
                onClick={focusOnMap}
                className={`mt-5 inline-flex items-center gap-2 rounded-full ${a.bgSoft} ${a.text} px-4 py-2 text-sm font-semibold transition hover:brightness-95`}
              >
                <Icon name="pin" className="h-4 w-4" />
                Vaata kaardil
                <Icon name="arrow" className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Right: timeline of items */}
          <ol className="relative space-y-5 border-l-2 border-dashed border-ink/15 pl-7">
            {day.items.map((item, i) => (
              <li key={i} className="relative">
                <span
                  className={`absolute -left-[2.15rem] top-0.5 flex h-5 w-5 items-center justify-center rounded-full ${a.bgSolid} text-white`}
                >
                  <Icon name="check" className="h-3 w-3" />
                </span>
                <p className="text-[0.95rem] leading-relaxed text-ink/85">
                  {item}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Prev / next */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setActive((v) => Math.max(0, v - 1))}
          disabled={active === 0}
          className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 transition hover:bg-ink/5 disabled:opacity-30"
        >
          <Icon name="arrow" className="h-4 w-4 rotate-180" />
          Eelmine
        </button>
        <span className="text-xs font-medium text-ink/45">
          {active + 1} / {itinerary.length}
        </span>
        <button
          onClick={() => setActive((v) => Math.min(itinerary.length - 1, v + 1))}
          disabled={active === itinerary.length - 1}
          className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 transition hover:bg-ink/5 disabled:opacity-30"
        >
          Järgmine
          <Icon name="arrow" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
