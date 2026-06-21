"use client";

import { useEffect, useState } from "react";
import { accentFor } from "@/components/accents";
import { Icon } from "@/components/Icons";
import { linkify } from "@/lib/linkify";
import { mapsUrl } from "@/lib/links";

export default function Itinerary({ days, dayFocus, food = [] }) {
  const [active, setActive] = useState(0);
  const [todayIndex, setTodayIndex] = useState(-1);

  // Leia tänane reisipäev (kliendipoolselt, et vältida hydratsiooni viga)
  useEffect(() => {
    const d = new Date();
    const key = `${String(d.getDate()).padStart(2, "0")}.${String(
      d.getMonth() + 1
    ).padStart(2, "0")}`;
    const idx = days.findIndex((x) => x.date === key);
    setTodayIndex(idx);
    if (idx >= 0) setActive(idx);
  }, [days]);

  const day = days[active];
  const a = accentFor(day.accent);
  const dayFood = food.filter((f) => f.accent === day.accent).slice(0, 3);

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
        {days.map((d, i) => {
          const da = accentFor(d.accent);
          const isActive = i === active;
          return (
            <button
              key={d.day}
              onClick={() => setActive(i)}
              className={`group relative flex shrink-0 flex-col items-center rounded-2xl border px-4 py-3 transition-all duration-300 ${
                isActive
                  ? `${da.bgSolid} border-transparent text-white shadow-lg`
                  : "border-ink/10 bg-white/60 text-ink/70 hover:border-ink/20 hover:bg-white"
              } ${
                i === todayIndex
                  ? "ring-2 ring-sun ring-offset-2 ring-offset-cream"
                  : ""
              }`}
            >
              {i === todayIndex && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-sun px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-ink shadow">
                  Täna
                </span>
              )}
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

            {dayFood.length > 0 && (
              <div className="mt-6 rounded-2xl border border-ink/10 bg-cream/50 p-4">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink/50">
                  🍝 Söögikohad lähedal
                </p>
                <ul className="space-y-1.5">
                  {dayFood.map((f) => (
                    <li key={f.id}>
                      <a
                        href={mapsUrl(`${f.name}, ${f.area}, Italia`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-baseline justify-between gap-2 text-sm"
                      >
                        <span className="font-medium text-ink/85 underline-offset-2 group-hover:text-bergamo group-hover:underline">
                          {f.name}
                        </span>
                        <span className="shrink-0 text-xs text-ink/45">
                          {f.area}
                          {f.price ? ` · ${f.price}` : ""}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
                <a
                  href="#sook"
                  className={`mt-2 inline-block text-xs font-semibold ${a.text} hover:underline`}
                >
                  Kõik söögikohad →
                </a>
              </div>
            )}
          </div>

          {/* Right: timeline of items */}
          <ol className="relative space-y-5">
            {/* dashed line — runs through the checkpoint centers (x = 10px) */}
            <span
              aria-hidden="true"
              className="absolute bottom-3 left-[9px] top-3 border-l-2 border-dashed border-ink/15"
            />
            {day.items.map((item, i) => (
              <li key={i} className="relative pl-9">
                <span
                  className={`absolute left-0 top-0.5 flex h-5 w-5 items-center justify-center rounded-full ${a.bgSolid} text-white ring-4 ring-white`}
                >
                  <Icon name="check" className="h-3 w-3" />
                </span>
                <p className="text-[0.95rem] leading-relaxed text-ink/85">
                  {linkify(item, `d${day.day}-${i}`)}
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
          {active + 1} / {days.length}
        </span>
        <button
          onClick={() => setActive((v) => Math.min(days.length - 1, v + 1))}
          disabled={active === days.length - 1}
          className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 transition hover:bg-ink/5 disabled:opacity-30"
        >
          Järgmine
          <Icon name="arrow" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
