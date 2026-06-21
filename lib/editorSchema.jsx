"use client";

// Üks tõeallikas redaktoritele: sektsioonide skeemid + SectionEditor.
// Kasutavad nii /admin kui ka avalehe inline-dialoogid.

import {
  ListEditor,
  StringList,
  LabeledList,
  ObjectFields,
} from "@/components/admin/Editors";

export const opt = {
  accent: [
    { value: "bergamo", label: "Bergamo (terrakota)" },
    { value: "iseo", label: "Iseo (türkiis)" },
    { value: "garda", label: "Garda (sinine)" },
    { value: "milano", label: "Milano (lilla)" },
  ],
  region: [
    { value: "bergamo", label: "Bergamo" },
    { value: "iseo", label: "Iseo" },
    { value: "garda", label: "Garda" },
    { value: "milano", label: "Milano" },
    { value: "airport", label: "Lennujaam" },
  ],
  icon: [
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
  ],
  status: [
    { value: "paid", label: "Makstud" },
    { value: "booked", label: "Maksta / broneeritud" },
  ],
  type: [
    { value: "airport", label: "Lennujaam" },
    { value: "stay", label: "Ööbimine" },
    { value: "spot", label: "Vaatamisväärsus" },
  ],
};

export const SECTIONS = [
  {
    key: "trip",
    title: "Reis",
    hint: "pealkiri, kuupäevad, pered",
    kind: "tripMeta",
    fields: [
      { key: "title", label: "Pealkiri" },
      { key: "subtitle", label: "Alapealkiri" },
      { key: "dateRange", label: "Kuupäevad (tekst)" },
      { key: "group", label: "Seltskond", full: true },
      { key: "startISO", label: "Algus (ISO)", placeholder: "2026-07-24T00:00:00" },
      { key: "endISO", label: "Lõpp (ISO)", placeholder: "2026-07-31T23:59:59" },
    ],
  },
  {
    key: "quickFacts",
    title: "Kiirfaktid",
    hint: "hero all",
    kind: "list",
    titleKey: "label",
    addLabel: "+ Lisa fakt",
    fields: [
      { key: "icon", label: "Ikoon", type: "select", options: opt.icon },
      { key: "label", label: "Silt" },
      { key: "value", label: "Väärtus", full: true },
    ],
    newItem: () => ({ icon: "pin", label: "", value: "" }),
  },
  {
    key: "itinerary",
    title: "Ajakava",
    hint: "päevad ja tegevused",
    kind: "listItems",
    titleKey: "title",
    columns: 3,
    addLabel: "+ Lisa päev",
    itemsLabel: "Päeva tegevused",
    fields: [
      { key: "day", label: "Päev nr" },
      { key: "date", label: "Kuupäev" },
      { key: "weekday", label: "Nädalapäev" },
      { key: "accent", label: "Värv", type: "select", options: opt.accent },
      { key: "region", label: "Piirkond (tekst)" },
      { key: "stay", label: "Ööbimine" },
      { key: "title", label: "Pealkiri", full: true },
      { key: "drive", label: "Sõit", full: true },
      { key: "warning", label: "Hoiatus (valikuline)", full: true },
    ],
    newItem: () => ({
      day: "",
      date: "",
      weekday: "",
      accent: "garda",
      region: "",
      title: "",
      drive: "",
      stay: "",
      items: [],
    }),
  },
  {
    key: "stays",
    title: "Majutus",
    hint: "ööbimiskohad ja hinnad",
    kind: "list",
    titleKey: "place",
    addLabel: "+ Lisa majutus",
    fields: [
      { key: "place", label: "Koht" },
      { key: "dates", label: "Kuupäevad" },
      { key: "nights", label: "Ööde arv" },
      { key: "pricePerFamily", label: "Hind / pere (€)", type: "number" },
      { key: "payment", label: "Makse staatus (tekst)" },
      { key: "status", label: "Olek", type: "select", options: opt.status },
      { key: "accent", label: "Värv", type: "select", options: opt.accent },
      { key: "photo", label: "Foto", dynamic: "photoKeys" },
      { key: "address", label: "Aadress", full: true },
      { key: "note", label: "Märkus", type: "textarea" },
    ],
    newItem: () => ({
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
    }),
  },
  {
    key: "activityRegions",
    title: "Tegevused",
    hint: "piirkonniti",
    kind: "listNested",
    titleKey: "region",
    addLabel: "+ Lisa piirkond",
    fields: [
      { key: "region", label: "Piirkonna nimi" },
      { key: "accent", label: "Värv", type: "select", options: opt.accent },
    ],
    newItem: () => ({ region: "", accent: "garda", activities: [] }),
    nested: {
      key: "activities",
      titleKey: "name",
      columns: 3,
      addLabel: "+ Lisa tegevus",
      fields: [
        { key: "name", label: "Nimi" },
        { key: "price", label: "Hind" },
        { key: "desc", label: "Kirjeldus", type: "textarea" },
      ],
      newItem: () => ({ name: "", desc: "", price: "" }),
    },
  },
  {
    key: "budget",
    title: "Eelarve",
    hint: "tegevuste hinnad",
    kind: "budget",
  },
  {
    key: "mapStops",
    title: "Kaart",
    hint: "peatuste märgid",
    kind: "list",
    titleKey: "name",
    columns: 3,
    addLabel: "+ Lisa peatus",
    fields: [
      { key: "name", label: "Nimi", full: true },
      { key: "region", label: "Piirkond", type: "select", options: opt.region },
      { key: "type", label: "Tüüp", type: "select", options: opt.type },
      { key: "emoji", label: "Emoji" },
      { key: "lat", label: "Laius (lat)", type: "number" },
      { key: "lng", label: "Pikkus (lng)", type: "number" },
      { key: "note", label: "Märkus", type: "textarea" },
    ],
    newItem: () => ({
      name: "",
      region: "garda",
      type: "spot",
      emoji: "📍",
      lat: 45.5,
      lng: 10.5,
      note: "",
    }),
  },
  {
    key: "climate",
    title: "Ilm",
    hint: "kliimanormid",
    kind: "list",
    titleKey: "label",
    columns: 3,
    addLabel: "+ Lisa koht",
    fields: [
      { key: "label", label: "Nimi" },
      { key: "region", label: "Värv", type: "select", options: opt.accent },
      { key: "lat", label: "Lat", type: "number" },
      { key: "lng", label: "Lng", type: "number" },
      { key: "hi", label: "Päev °C", type: "number" },
      { key: "lo", label: "Öö °C", type: "number" },
      { key: "water", label: "Vesi °C", type: "number" },
      { key: "note", label: "Märkus", full: true },
    ],
    newItem: () => ({
      label: "",
      region: "garda",
      lat: 45.5,
      lng: 10.5,
      hi: 28,
      lo: 18,
      note: "",
    }),
  },
  {
    key: "ticketTips",
    title: "Piletivihjed",
    hint: "säästusoovitused",
    kind: "stringList",
  },
  {
    key: "ticketLinks",
    title: "Piletilingid",
    hint: "ostulingid",
    kind: "list",
    titleKey: "label",
    addLabel: "+ Lisa link",
    fields: [
      { key: "label", label: "Nimi" },
      { key: "url", label: "URL", full: true },
    ],
    newItem: () => ({ label: "", url: "" }),
  },
  {
    key: "practicalNotes",
    title: "Praktiline info",
    hint: "märkmed",
    kind: "list",
    titleKey: "title",
    addLabel: "+ Lisa märge",
    fields: [
      { key: "icon", label: "Ikoon", type: "select", options: opt.icon },
      { key: "title", label: "Pealkiri" },
      { key: "body", label: "Tekst", type: "textarea" },
    ],
    newItem: () => ({ icon: "pin", title: "", body: "" }),
  },
  {
    key: "packingCategories",
    title: "Pakkimine",
    hint: "kategooriad ja esemed",
    kind: "listLabeled",
    titleKey: "title",
    addLabel: "+ Lisa kategooria",
    itemsLabel: "Esemed",
    fields: [
      { key: "title", label: "Kategooria" },
      { key: "icon", label: "Ikoon", type: "select", options: opt.icon },
      { key: "id", label: "ID (lühike, unikaalne)" },
    ],
    newItem: () => ({
      id: "cat" + Date.now().toString(36),
      title: "",
      icon: "pin",
      items: [],
    }),
  },
  {
    key: "photos",
    title: "Fotod",
    hint: "taustapildid ja URL-id",
    kind: "photos",
  },
];

export const sectionByKey = (key) => SECTIONS.find((s) => s.key === key);

function resolveFields(fields, photoKeys) {
  return (fields || []).map((f) =>
    f.dynamic === "photoKeys"
      ? { ...f, type: "select", options: photoKeys.map((k) => ({ value: k, label: k })) }
      : f
  );
}

export function SectionEditor({ section, value, onChange, photoKeys = [] }) {
  if (!section) return null;

  switch (section.kind) {
    case "tripMeta":
      return (
        <>
          <ObjectFields
            fields={section.fields}
            value={value || {}}
            onChange={onChange}
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <StringList
              label="Pered"
              items={value?.families || []}
              onChange={(families) => onChange({ ...value, families })}
            />
            <StringList
              label="Marsruut (sildid)"
              items={value?.route || []}
              onChange={(route) => onChange({ ...value, route })}
            />
          </div>
        </>
      );

    case "list":
      return (
        <ListEditor
          items={value || []}
          fields={resolveFields(section.fields, photoKeys)}
          newItem={section.newItem}
          titleKey={section.titleKey}
          columns={section.columns}
          addLabel={section.addLabel}
          onChange={onChange}
        />
      );

    case "listItems":
      return (
        <ListEditor
          items={value || []}
          fields={section.fields}
          newItem={section.newItem}
          titleKey={section.titleKey}
          columns={section.columns}
          addLabel={section.addLabel}
          onChange={onChange}
          renderExtra={(row, update) => (
            <StringList
              label={section.itemsLabel}
              items={row.items || []}
              onChange={(items) => update({ ...row, items })}
            />
          )}
        />
      );

    case "listLabeled":
      return (
        <ListEditor
          items={value || []}
          fields={section.fields}
          newItem={section.newItem}
          titleKey={section.titleKey}
          columns={section.columns}
          addLabel={section.addLabel}
          onChange={onChange}
          renderExtra={(row, update) => (
            <LabeledList
              label={section.itemsLabel}
              items={row.items || []}
              onChange={(items) => update({ ...row, items })}
            />
          )}
        />
      );

    case "listNested":
      return (
        <ListEditor
          items={value || []}
          fields={section.fields}
          newItem={section.newItem}
          titleKey={section.titleKey}
          addLabel={section.addLabel}
          onChange={onChange}
          renderExtra={(row, update) => (
            <ListEditor
              items={row[section.nested.key] || []}
              fields={section.nested.fields}
              newItem={section.nested.newItem}
              titleKey={section.nested.titleKey}
              columns={section.nested.columns}
              addLabel={section.nested.addLabel}
              onChange={(arr) => update({ ...row, [section.nested.key]: arr })}
            />
          )}
        />
      );

    case "budget":
      return (
        <>
          <ObjectFields
            fields={[
              { key: "total", label: "Kokku (tekst)" },
              { key: "note", label: "Märkus" },
            ]}
            value={value || {}}
            onChange={onChange}
          />
          <div className="mt-4">
            <ListEditor
              items={value?.items || []}
              fields={[
                { key: "name", label: "Tegevus" },
                { key: "cost", label: "Hind" },
              ]}
              newItem={() => ({ name: "", cost: "" })}
              titleKey="name"
              addLabel="+ Lisa rida"
              onChange={(items) => onChange({ ...value, items })}
            />
          </div>
        </>
      );

    case "stringList":
      return <StringList items={value || []} onChange={onChange} />;

    case "photos":
      return (
        <div className="space-y-5">
          {Object.keys(value || {}).map((key) => (
            <div
              key={key}
              className="rounded-2xl border border-ink/10 bg-cream/40 p-4"
            >
              <p className="mb-2 text-sm font-semibold text-ink/70">{key}</p>
              <ObjectFields
                fields={[
                  { key: "label", label: "Pealkiri" },
                  { key: "src", label: "Pildi URL", full: true },
                  { key: "page", label: "Allikas (URL)", full: true },
                ]}
                value={value[key]}
                onChange={(v) => onChange({ ...value, [key]: v })}
              />
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}
