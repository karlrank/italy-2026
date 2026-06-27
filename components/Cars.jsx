"use client";

import { accentFor } from "@/components/accents";
import { Icon } from "@/components/Icons";
import { mapsUrl } from "@/lib/links";

function Row({ label, children }) {
  if (!children) return null;
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-ink/45">
        {label}
      </span>
      <span className="text-right text-sm font-medium text-ink">{children}</span>
    </div>
  );
}

function CarCard({ car }) {
  const a = accentFor(car.accent);
  const confirmed = car.status === "confirmed";
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm">
      <div className={`h-1.5 w-full bg-gradient-to-r ${a.gradient}`} />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className={`text-sm font-semibold ${a.text}`}>{car.family}</span>
            <h3 className="font-display text-2xl font-semibold text-ink">
              {car.vehicle}
            </h3>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
              confirmed ? "bg-olive text-white" : "bg-sun text-ink"
            }`}
          >
            {confirmed ? "Kinnitatud" : "Tõenäoline"}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-medium text-ink/70">
            <Icon name="car" className="h-3.5 w-3.5" />
            {car.provider}
          </span>
          {car.transmission && (
            <span className="rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-medium text-ink/70">
              {car.transmission}
            </span>
          )}
          {car.seats && (
            <span className="rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-medium text-ink/70">
              👥 {car.seats}
            </span>
          )}
          {car.luggage && (
            <span className="rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-medium text-ink/70">
              🧳 {car.luggage}
            </span>
          )}
        </div>

        <div className="mt-4 divide-y divide-ink/8">
          <Row label="Võtmine">
            <a
              href={mapsUrl("Malpensa Airport Terminal 1, Italia")}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 hover:text-bergamo hover:underline"
            >
              {car.pickup}
            </a>
          </Row>
          <Row label="Tagastus">{car.dropoff}</Row>
          <Row label="Juht">{car.driver}</Row>
          <Row label="Broneering">{car.reservation}</Row>
          <Row label="Hind">{car.price}</Row>
          <Row label="Tagatis">{car.deposit}</Row>
        </div>

        {car.note && (
          <p className="mt-4 flex-1 rounded-2xl bg-cream/60 p-3 text-sm leading-relaxed text-ink/70">
            {car.note}
          </p>
        )}

        {car.url && (
          <a
            href={car.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-4 inline-flex w-fit items-center gap-1.5 rounded-full ${a.bgSoft} ${a.text} px-4 py-2 text-sm font-semibold transition hover:brightness-95`}
          >
            {car.provider}
            <Icon name="arrow" className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </article>
  );
}

export default function Cars({ cars }) {
  if (!cars?.length) return null;
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {cars.map((c) => (
        <CarCard key={c.id} car={c} />
      ))}
    </div>
  );
}
