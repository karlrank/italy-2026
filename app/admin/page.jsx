"use client";

import { useEffect, useState } from "react";
import {
  ListEditor,
  StringList,
  ObjectFields,
} from "@/components/admin/Editors";

const accentOptions = [
  { value: "bergamo", label: "Bergamo (terrakota)" },
  { value: "iseo", label: "Iseo (türkiis)" },
  { value: "garda", label: "Garda (sinine)" },
  { value: "milano", label: "Milano (lilla)" },
];
const regionOptions = [...accentOptions, { value: "airport", label: "Lennujaam" }];
const iconOptions = [
  "calendar",
  "users",
  "route",
  "car",
  "ticket",
  "warning",
  "kids",
  "pin",
  "bed",
  "sun",
  "plane",
  "euro",
];
const statusOptions = [
  { value: "paid", label: "Makstud" },
  { value: "booked", label: "Maksta / broneeritud" },
];
const typeOptions = [
  { value: "airport", label: "Lennujaam" },
  { value: "stay", label: "Ööbimine" },
  { value: "spot", label: "Vaatamisväärsus" },
];

function Section({ title, hint, children, defaultOpen = false }) {
  return (
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-4">
        <span>
          <span className="font-display text-xl font-semibold text-ink">
            {title}
          </span>
          {hint && <span className="ml-2 text-xs text-ink/45">{hint}</span>}
        </span>
        <span className="text-ink/40 transition group-open:rotate-180">▾</span>
      </summary>
      <div className="border-t border-ink/10 p-6">{children}</div>
    </details>
  );
}

export default function AdminPage() {
  const [content, setContent] = useState(null);
  const [configured, setConfigured] = useState(true);
  const [status, setStatus] = useState("loading"); // loading|idle|saving|saved|error

  const load = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/content", { cache: "no-store" });
      const json = await res.json();
      setConfigured(json.configured);
      setContent(json.content);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const set = (key, value) => setContent((c) => ({ ...c, [key]: value }));

  const save = async () => {
    setStatus("saving");
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      setStatus(res.ok ? "saved" : "error");
      if (res.ok) setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
    }
  };

  const reset = async () => {
    if (!confirm("Taasta kogu sisu vaikeväärtustele? See kustutab muudatused."))
      return;
    setStatus("saving");
    try {
      await fetch("/api/content", { method: "DELETE" });
      await load();
    } catch {
      setStatus("error");
    }
  };

  if (status === "loading" || !content) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-cream text-ink/50">
        Laen sisu…
      </main>
    );
  }

  const photoKeyOptions = Object.keys(content.photos || {}).map((k) => ({
    value: k,
    label: k,
  }));

  return (
    <main className="bg-grain min-h-[100svh] bg-cream pb-32">
      {/* Header */}
      <div className="border-b border-ink/10 bg-cream/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <div>
            <a href="/" className="text-sm font-medium text-ink/55 hover:text-ink">
              ← Tagasi lehele
            </a>
            <h1 className="font-display text-2xl font-semibold text-ink">
              Sisu haldus
            </h1>
          </div>
          <a
            href="/"
            className="hidden text-sm font-medium text-iseo hover:underline sm:block"
          >
            Vaata lehte
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-5 py-8">
        {!configured && (
          <div className="mb-6 rounded-2xl border border-sun/40 bg-sun/15 p-4 text-sm text-ink/80">
            <strong>Andmebaas pole ühendatud.</strong> Sa näed ja saad muuta
            sisu, aga <em>salvestamiseks</em> ühenda Vercelis KV-andmebaas (vt
            README). Ilma selleta jäävad muudatused salvestamata.
          </div>
        )}

        <div className="space-y-5">
          <Section title="Reis" hint="pealkiri, kuupäevad, pered" defaultOpen>
            <ObjectFields
              fields={[
                { key: "title", label: "Pealkiri" },
                { key: "subtitle", label: "Alapealkiri" },
                { key: "dateRange", label: "Kuupäevad (tekst)" },
                { key: "group", label: "Seltskond", full: true },
                { key: "startISO", label: "Algus (ISO)", placeholder: "2026-07-24T00:00:00" },
                { key: "endISO", label: "Lõpp (ISO)", placeholder: "2026-07-31T23:59:59" },
              ]}
              value={content.trip}
              onChange={(v) => set("trip", v)}
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <StringList
                label="Pered"
                items={content.trip.families}
                onChange={(families) => set("trip", { ...content.trip, families })}
              />
              <StringList
                label="Marsruut (sildid)"
                items={content.trip.route}
                onChange={(route) => set("trip", { ...content.trip, route })}
              />
            </div>
          </Section>

          <Section title="Kiirfaktid" hint="hero all">
            <ListEditor
              items={content.quickFacts}
              titleKey="label"
              fields={[
                { key: "icon", label: "Ikoon", type: "select", options: iconOptions },
                { key: "label", label: "Silt" },
                { key: "value", label: "Väärtus", full: true },
              ]}
              newItem={() => ({ icon: "pin", label: "", value: "" })}
              onChange={(v) => set("quickFacts", v)}
              addLabel="+ Lisa fakt"
            />
          </Section>

          <Section title="Ajakava" hint="päevad ja tegevused">
            <ListEditor
              items={content.itinerary}
              titleKey="title"
              columns={3}
              fields={[
                { key: "day", label: "Päev nr" },
                { key: "date", label: "Kuupäev" },
                { key: "weekday", label: "Nädalapäev" },
                { key: "accent", label: "Värv", type: "select", options: accentOptions },
                { key: "region", label: "Piirkond (tekst)" },
                { key: "stay", label: "Ööbimine" },
                { key: "title", label: "Pealkiri", full: true },
                { key: "drive", label: "Sõit", full: true },
                { key: "warning", label: "Hoiatus (valikuline)", full: true },
              ]}
              newItem={() => ({
                day: String(content.itinerary.length + 1),
                date: "",
                weekday: "",
                accent: "garda",
                region: "",
                title: "",
                drive: "",
                stay: "",
                items: [],
              })}
              renderExtra={(day, update) => (
                <StringList
                  label="Päeva tegevused"
                  items={day.items || []}
                  onChange={(items) => update({ ...day, items })}
                />
              )}
              onChange={(v) => set("itinerary", v)}
              addLabel="+ Lisa päev"
            />
          </Section>

          <Section title="Majutus" hint="ööbimiskohad ja hinnad">
            <ListEditor
              items={content.stays}
              titleKey="place"
              fields={[
                { key: "place", label: "Koht" },
                { key: "dates", label: "Kuupäevad" },
                { key: "nights", label: "Ööde arv" },
                { key: "pricePerFamily", label: "Hind / pere (€)", type: "number" },
                { key: "payment", label: "Makse staatus (tekst)" },
                { key: "status", label: "Olek", type: "select", options: statusOptions },
                { key: "accent", label: "Värv", type: "select", options: accentOptions },
                { key: "photo", label: "Foto", type: "select", options: photoKeyOptions },
                { key: "address", label: "Aadress", full: true },
                { key: "note", label: "Märkus", type: "textarea" },
              ]}
              newItem={() => ({
                place: "",
                dates: "",
                nights: "",
                pricePerFamily: 0,
                payment: "",
                status: "booked",
                accent: "garda",
                photo: "garda",
                address: "",
                note: "",
              })}
              onChange={(v) => set("stays", v)}
              addLabel="+ Lisa majutus"
            />
          </Section>

          <Section title="Tegevused" hint="piirkonniti">
            <ListEditor
              items={content.activityRegions}
              titleKey="region"
              fields={[
                { key: "region", label: "Piirkonna nimi" },
                { key: "accent", label: "Värv", type: "select", options: accentOptions },
              ]}
              newItem={() => ({ region: "", accent: "garda", activities: [] })}
              renderExtra={(region, update) => (
                <ListEditor
                  items={region.activities || []}
                  titleKey="name"
                  columns={3}
                  fields={[
                    { key: "name", label: "Nimi" },
                    { key: "price", label: "Hind" },
                    { key: "desc", label: "Kirjeldus", type: "textarea" },
                  ]}
                  newItem={() => ({ name: "", desc: "", price: "" })}
                  onChange={(activities) => update({ ...region, activities })}
                  addLabel="+ Lisa tegevus"
                />
              )}
              onChange={(v) => set("activityRegions", v)}
              addLabel="+ Lisa piirkond"
            />
          </Section>

          <Section title="Eelarve" hint="tegevuste hinnad">
            <ObjectFields
              fields={[
                { key: "total", label: "Kokku (tekst)" },
                { key: "note", label: "Märkus" },
              ]}
              value={content.budget}
              onChange={(v) => set("budget", v)}
            />
            <div className="mt-4">
              <ListEditor
                items={content.budget.items}
                titleKey="name"
                fields={[
                  { key: "name", label: "Tegevus" },
                  { key: "cost", label: "Hind" },
                ]}
                newItem={() => ({ name: "", cost: "" })}
                onChange={(items) => set("budget", { ...content.budget, items })}
                addLabel="+ Lisa rida"
              />
            </div>
          </Section>

          <Section title="Kaart" hint="peatuste märgid">
            <p className="mb-3 text-xs text-ink/45">
              Marsruudijoon tuleb vaikeväärtusest. Koordinaadid on kümnendkraadid.
            </p>
            <ListEditor
              items={content.mapStops}
              titleKey="name"
              columns={3}
              fields={[
                { key: "name", label: "Nimi", full: true },
                { key: "region", label: "Piirkond", type: "select", options: regionOptions },
                { key: "type", label: "Tüüp", type: "select", options: typeOptions },
                { key: "emoji", label: "Emoji" },
                { key: "lat", label: "Laius (lat)", type: "number" },
                { key: "lng", label: "Pikkus (lng)", type: "number" },
                { key: "note", label: "Märkus", type: "textarea" },
              ]}
              newItem={() => ({
                name: "",
                region: "garda",
                type: "spot",
                emoji: "📍",
                lat: 45.5,
                lng: 10.5,
                note: "",
              })}
              onChange={(v) => set("mapStops", v)}
              addLabel="+ Lisa peatus"
            />
          </Section>

          <Section title="Ilm" hint="kliimanormid peatustes">
            <ListEditor
              items={content.climate}
              titleKey="label"
              columns={3}
              fields={[
                { key: "label", label: "Nimi" },
                { key: "region", label: "Värv", type: "select", options: accentOptions },
                { key: "emoji", label: "(kasutamata)" },
                { key: "lat", label: "Lat", type: "number" },
                { key: "lng", label: "Lng", type: "number" },
                { key: "hi", label: "Päev °C", type: "number" },
                { key: "lo", label: "Öö °C", type: "number" },
                { key: "water", label: "Vesi °C", type: "number" },
                { key: "note", label: "Märkus", full: true },
              ]}
              newItem={() => ({
                label: "",
                region: "garda",
                lat: 45.5,
                lng: 10.5,
                hi: 28,
                lo: 18,
                note: "",
              })}
              onChange={(v) => set("climate", v)}
              addLabel="+ Lisa koht"
            />
          </Section>

          <Section title="Piletid" hint="vihjed ja lingid">
            <div className="grid gap-5 sm:grid-cols-2">
              <StringList
                label="Säästuvihjed"
                items={content.ticketTips}
                onChange={(v) => set("ticketTips", v)}
              />
              <div>
                <span className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-wider text-ink/45">
                  Piletilingid
                </span>
                <ListEditor
                  items={content.ticketLinks}
                  titleKey="label"
                  fields={[
                    { key: "label", label: "Nimi" },
                    { key: "url", label: "URL", full: true },
                  ]}
                  newItem={() => ({ label: "", url: "" })}
                  onChange={(v) => set("ticketLinks", v)}
                  addLabel="+ Lisa link"
                />
              </div>
            </div>
          </Section>

          <Section title="Praktiline info" hint="märkmed">
            <ListEditor
              items={content.practicalNotes}
              titleKey="title"
              fields={[
                { key: "icon", label: "Ikoon", type: "select", options: iconOptions },
                { key: "title", label: "Pealkiri" },
                { key: "body", label: "Tekst", type: "textarea" },
              ]}
              newItem={() => ({ icon: "pin", title: "", body: "" })}
              onChange={(v) => set("practicalNotes", v)}
              addLabel="+ Lisa märge"
            />
          </Section>

          <Section title="Pakkimine" hint="vaikekategooriad ja esemed">
            <ListEditor
              items={content.packingCategories}
              titleKey="title"
              fields={[
                { key: "title", label: "Kategooria" },
                { key: "icon", label: "Ikoon", type: "select", options: iconOptions },
                { key: "id", label: "ID (lühike, unikaalne)" },
              ]}
              newItem={() => ({
                id: "cat" + Date.now(),
                title: "",
                icon: "pin",
                items: [],
              })}
              renderExtra={(cat, update) => (
                <StringList
                  label="Esemed"
                  items={cat.items || []}
                  onChange={(items) => update({ ...cat, items })}
                />
              )}
              onChange={(v) => set("packingCategories", v)}
              addLabel="+ Lisa kategooria"
            />
          </Section>

          <Section title="Fotod" hint="taustapildid ja URL-id">
            <div className="space-y-5">
              {Object.keys(content.photos).map((key) => (
                <div key={key} className="rounded-2xl border border-ink/10 bg-cream/40 p-4">
                  <p className="mb-2 text-sm font-semibold text-ink/70">{key}</p>
                  <ObjectFields
                    fields={[
                      { key: "label", label: "Pealkiri" },
                      { key: "src", label: "Pildi URL", full: true },
                      { key: "page", label: "Allikas (URL)", full: true },
                    ]}
                    value={content.photos[key]}
                    onChange={(v) =>
                      set("photos", { ...content.photos, [key]: v })
                    }
                  />
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-5 py-3">
          <button
            onClick={reset}
            className="rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/60 transition hover:bg-ink/5"
          >
            Taasta vaikeväärtused
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-ink/50">
              {status === "saving" && "Salvestan…"}
              {status === "saved" && "✓ Salvestatud"}
              {status === "error" && "Viga salvestamisel"}
            </span>
            <button
              onClick={save}
              disabled={!configured || status === "saving"}
              className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream transition hover:opacity-90 disabled:opacity-40"
            >
              Salvesta
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
