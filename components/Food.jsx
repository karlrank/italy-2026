"use client";

import { useMemo, useState } from "react";
import { accentFor } from "@/components/accents";
import { Icon } from "@/components/Icons";
import { mapsUrl } from "@/lib/links";

export default function Food({ food }) {
  const [filter, setFilter] = useState("all");

  // Regions in the order they appear
  const regions = useMemo(() => {
    const seen = [];
    food.forEach((f) => {
      if (!seen.includes(f.accent)) seen.push(f.accent);
    });
    return seen;
  }, [food]);

  const shown =
    filter === "all"
      ? food
      : filter === "gelato"
        ? food.filter((f) => f.type === "gelato")
        : food.filter((f) => f.accent === filter);

  const pills = [
    { key: "all", label: "Kõik" },
    ...regions.map((r) => ({ key: r, label: accentFor(r).label })),
    { key: "gelato", label: "🍦 Jäätis" },
  ];

  return (
    <div>
      <div className="mb-9 flex flex-wrap justify-center gap-2.5">
        {pills.map((p) => {
          const isActive = filter === p.key;
          const a =
            p.key === "all" || p.key === "gelato" ? null : accentFor(p.key);
          return (
            <button
              key={p.key}
              onClick={() => setFilter(p.key)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? a
                    ? `${a.bgSolid} border-transparent text-white shadow-md`
                    : "border-transparent bg-ink text-cream shadow-md"
                  : "border-ink/12 bg-white/60 text-ink/70 hover:bg-white"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((f) => {
          const a = accentFor(f.accent);
          const q = `${f.name}, ${f.area}, Italia`;
          return (
            <article
              key={f.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(42,33,24,0.5)]"
            >
              <span
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${a.gradient} opacity-70`}
              />
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex w-fit items-center gap-1.5 rounded-full ${a.bgSoft} ${a.text} px-2.5 py-0.5 text-xs font-semibold`}
                >
                  <Icon name="pin" className="h-3 w-3" />
                  {f.area}
                </span>
                <span className="flex items-center gap-1.5">
                  {f.type === "gelato" && (
                    <span className="rounded-full bg-milano-soft px-2 py-0.5 text-xs font-semibold text-milano">
                      🍦 Jäätis
                    </span>
                  )}
                  {f.price && (
                    <span className="text-sm font-semibold text-olive">
                      {f.price}
                    </span>
                  )}
                </span>
              </div>
              <h4 className="mt-2.5 font-display text-lg font-semibold leading-snug text-ink">
                <a
                  href={f.url || mapsUrl(q)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-bergamo hover:underline"
                >
                  {f.name}
                </a>
              </h4>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink/70">
                {f.note}
              </p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <a
                  href={mapsUrl(q)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-fit items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-ink/55 transition hover:bg-ink/5 hover:text-ink"
                  title="Ava Google Mapsis"
                >
                  <Icon name="pin" className="h-3.5 w-3.5" />
                  Kaardil
                </a>
                {f.hours && (
                  <span className="text-xs text-ink/50">🕒 {f.hours}</span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
