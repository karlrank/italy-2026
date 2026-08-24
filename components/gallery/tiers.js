// Shared vocabulary for the gallery.
//
// Tiers are nested: everything in "Parimad" is also in "Album", everything in
// "Album" is also in "Kõik". A photo therefore stores the tightest tier it
// belongs to, and a tab shows every photo whose level is at most its own.
// Level 0 means the curation cut it — those live only in "Välja jäetud".

export const TIERS = [
  {
    level: 1,
    label: "Parimad",
    blurb: "Reisi tippkaadrid",
    dot: "bg-sun",
    chip: "bg-sun/15 text-[#8a6410] ring-sun/30",
  },
  {
    level: 2,
    label: "Album",
    blurb: "Pereaalbum — päevade kaupa tasakaalus",
    dot: "bg-bergamo",
    chip: "bg-bergamo/12 text-bergamo ring-bergamo/30",
  },
  {
    level: 3,
    label: "Kõik",
    blurb: "Iga eristuv, tehniliselt korralik kaader",
    dot: "bg-iseo",
    chip: "bg-iseo/12 text-iseo ring-iseo/30",
  },
  {
    level: 0,
    label: "Välja jäetud",
    blurb: "Duplikaadid, ekraanipildid ja udused kaadrid",
    dot: "bg-ink/25",
    chip: "bg-ink/8 text-ink/55 ring-ink/15",
  },
];

export const tierOf = (level) => TIERS.find((t) => t.level === level) || TIERS[3];

// A tab shows a tier and everything better than it; "Välja jäetud" is its own
// bucket rather than a step on the same ladder.
export const inTab = (level, tab) =>
  tab === 0 ? level === 0 : level > 0 && level <= tab;

export const src = (base, kind, p) => `${base}/${kind}/${p.s}-${p.k}.jpg`;
export const videoSrc = (base, v) => `${base}/v/${v.s}-${v.k}.mp4`;
export const posterSrc = (base, v) => `${base}/vp/${v.s}-${v.k}.jpg`;

export const dayKey = (isoish) => (isoish || "").slice(0, 10);

const ET_MONTHS = [
  "jaanuar", "veebruar", "märts", "aprill", "mai", "juuni",
  "juuli", "august", "september", "oktoober", "november", "detsember",
];

export function prettyDay(key) {
  const [y, m, d] = key.split("-");
  return `${Number(d)}. ${ET_MONTHS[Number(m) - 1]}`;
}

export const clockOf = (isoish) => (isoish || "").slice(11, 16);
