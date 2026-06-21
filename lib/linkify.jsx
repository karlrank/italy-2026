import { mapsUrl } from "@/lib/links";

// Tuntud kohad/objektid → Google Mapsi päring. Tekstis lingitakse automaatselt.
// Eesti käändelõpud haaratakse juurde (nt "Sigurtàsse", "Sarnicos").
const PLACES = [
  ["Parco Faunistico Le Cornelle", "Parco Faunistico Le Cornelle, Valbrembo"],
  ["Le Cornelle", "Parco Faunistico Le Cornelle, Valbrembo"],
  ["Parco Giardino Sigurtà", "Parco Giardino Sigurtà, Valeggio sul Mincio"],
  ["Parco della Preistoria", "Parco della Preistoria, Rivolta d'Adda"],
  ["Parco Natura Viva", "Parco Natura Viva, Bussolengo"],
  ["Valeggio sul Mincio", "Valeggio sul Mincio"],
  ["Borghetto sul Mincio", "Borghetto sul Mincio"],
  ["Spiaggia La Romantica", "Spiaggia La Romantica, Manerba del Garda"],
  ["Castello Scaligero", "Castello Scaligero, Valeggio sul Mincio"],
  ["Lido delle Bionde", "Lido delle Bionde, Sirmione"],
  ["Ponte Visconteo", "Ponte Visconteo, Valeggio sul Mincio"],
  ["Civic Aquarium", "Acquario Civico di Milano"],
  ["Milano akvaarium", "Acquario Civico di Milano"],
  ["Jamaica Beach", "Jamaica Beach, Sirmione"],
  ["Piazza Vecchia", "Piazza Vecchia, Bergamo"],
  ["Parcheggio Fara", "Parcheggio Fara, Bergamo"],
  ["Lido di Iseo", "Lido di Iseo"],
  ["San Felice", "San Felice del Benaco"],
  ["Monte Isola", "Monte Isola, Lago d'Iseo"],
  ["Franciacorta", "Franciacorta, Italia"],
  ["Città Alta", "Città Alta, Bergamo"],
  ["Al Rocol", "Al Rocol, Ome"],
  ["Lake Iseo", "Lago d'Iseo"],
  ["Manerba", "Manerba del Garda"],
  ["Sirmione", "Sirmione"],
  ["Pisogne", "Pisogne"],
  ["Sarnico", "Sarnico"],
  ["Lovere", "Lovere"],
  ["Lazise", "Lazise"],
  ["Malpensa", "Malpensa Airport"],
  ["Bergamo", "Bergamo, Italia"],
  ["Milano", "Milano, Italia"],
  ["Salò", "Salò, Italia"],
  ["Garda", "Lago di Garda"],
  ["Iseo", "Lago d'Iseo"],
];

// Pikimad fraasid esmalt (et "Lido di Iseo" ei jääks "Iseo" alla)
const SORTED = [...PLACES].sort((a, b) => b[0].length - a[0].length);
const QUERY = Object.fromEntries(PLACES.map(([p, q]) => [p, q]));
const PHRASES = SORTED.map(([p]) => p);

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const PATTERN =
  "(?<![\\p{L}])(" +
  SORTED.map(([p]) => esc(p) + "[a-zäöüõšž]*").join("|") +
  ")";

export function linkify(text, prefix = "lx") {
  if (!text || typeof text !== "string") return text;
  const re = new RegExp(PATTERN, "gu");
  const out = [];
  let last = 0;
  let i = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    const matched = m[0];
    const start = m.index;
    if (start > last) out.push(text.slice(last, start));
    const phrase = PHRASES.find((p) => matched.startsWith(p));
    const q = QUERY[phrase] || matched;
    out.push(
      <a
        key={`${prefix}-${i}`}
        href={mapsUrl(/italia/i.test(q) ? q : `${q}, Italia`)}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-ink/20 underline-offset-2 transition hover:text-bergamo hover:decoration-bergamo"
      >
        {matched}
      </a>
    );
    i += 1;
    last = start + matched.length;
    if (re.lastIndex === start) re.lastIndex += 1;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
