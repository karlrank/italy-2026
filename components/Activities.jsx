"use client";

import { useMemo, useState } from "react";
import { accentFor } from "@/components/accents";
import { Icon } from "@/components/Icons";

export default function Activities({ regions }) {
  const [filter, setFilter] = useState("all");

  const shown = useMemo(
    () =>
      filter === "all" ? regions : regions.filter((r) => r.accent === filter),
    [filter, regions]
  );

  const pills = [
    { key: "all", label: "Kõik" },
    ...regions.map((r) => ({ key: r.accent, label: r.region })),
  ];

  return (
    <div>
      <div className="mb-9 flex flex-wrap justify-center gap-2.5">
        {pills.map((p) => {
          const isActive = filter === p.key;
          const a = p.key === "all" ? null : accentFor(p.key);
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

      <div className="space-y-12">
        {shown.map((region) => {
          const a = accentFor(region.accent);
          return (
            <div key={region.region}>
              <div className="mb-5 flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${a.dot}`} />
                <h3 className="font-display text-2xl font-semibold text-ink">
                  {region.region}
                </h3>
                <span className="h-px flex-1 bg-ink/10" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {region.activities.map((act) => (
                  <article
                    key={act.name}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(42,33,24,0.5)]"
                  >
                    <span
                      className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${a.gradient} opacity-70`}
                    />
                    <h4 className="font-display text-lg font-semibold leading-snug text-ink">
                      {act.name}
                    </h4>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70">
                      {act.desc}
                    </p>
                    <p
                      className={`mt-4 flex items-center gap-1.5 text-sm font-semibold ${a.text}`}
                    >
                      <Icon name="euro" className="h-4 w-4" />
                      {act.price}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
