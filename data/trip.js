// Kogu reisi sisu ühes failis. Andmed pärinevad reisi Exceli tabelist.

export const trip = {
  title: "Itaalia 2026",
  subtitle: "Bergamo · Lake Iseo · Gardajärv · Milano",
  dateRange: "24.–31. juuli 2026",
  families: ["Perekond Murd", "Perekond Rankla"],
  group: "4 täiskasvanut + 3 last (4-aastane, 3-aastane ja alla 2-aastane)",
  route: ["Malpensa", "Bergamo", "Lake Iseo", "Gardajärv", "Malpensa"],
};

export const quickFacts = [
  { label: "Kestus", value: "8 päeva / 7 ööd", icon: "calendar" },
  { label: "Seltskond", value: "2 peret · 4 täiskasvanut · 3 last", icon: "users" },
  { label: "Marsruut", value: "Malpensa → Bergamo → Iseo → Garda → Malpensa", icon: "route" },
  { label: "Transport", value: "Rendiauto (Malpensa lennujaamast)", icon: "car" },
];

// ─────────────────────────────────────────────────────────────
// AJAKAVA
// ─────────────────────────────────────────────────────────────
export const itinerary = [
  {
    day: "1",
    weekday: "Reede",
    date: "24.07",
    title: "Saabumine & Bergamo",
    region: "Bergamo",
    drive: "Malpensa → Bergamo · 95 km · ~1 h",
    accent: "bergamo",
    items: [
      "Maandumine Malpensas, võtame rendiauto kätte.",
      "Sõidame Bergamo poole, otsime teel söögikoha.",
      "Alates 16:00 check-in Bergamos (Via Stelvio 8).",
      "Õhtune jalutuskäik vanalinnas (Città Alta) ja Piazza Vecchial — köisraudtee Parcheggio Fara parklast üles.",
      "Õhtusöök või poeskäik.",
    ],
    stay: "Bergamo",
  },
  {
    day: "2",
    weekday: "Laupäev",
    date: "25.07",
    title: "Le Cornelle loomaaed → Lake Iseo",
    region: "Iseo",
    drive: "Bergamo → Le Cornelle → Lake Iseo · 11 km · ~20 min",
    accent: "iseo",
    items: [
      "Check-out kell 10:00.",
      "Päev Parco Faunistico Le Cornelles — üks Itaalia paremaid loomaaedu.",
      "Söögipaus / poeskäik ja sõit Iseo järve äärde.",
      "Õhtune jalutuskäik Sarnicos (~40 min / 32 km), seejärel puhkus.",
    ],
    stay: "Lake Iseo",
  },
  {
    day: "3",
    weekday: "Pühapäev",
    date: "26.07",
    title: "Lake Iseo päev",
    region: "Iseo",
    drive: "Päev järve ääres",
    accent: "iseo",
    items: [
      "Hommikune praamisõit Monte Isolale, jalutuskäik sadamas.",
      "Rannapäev: Lido di Iseo (madal sissepääs vette) või Pisogne rand (vähem rahvast, kiviklibu).",
      "Jalutuskäik Sarnicos või Loveres — jäätisekohvikud ja promenaad.",
      "Alternatiiv: Franciacorta viinamarjaistandused (nt Al Rocol, kus on ka loomad ja saab õhtust süüa).",
    ],
    stay: "Lake Iseo",
  },
  {
    day: "4",
    weekday: "Esmaspäev",
    date: "27.07",
    title: "Sigurtà park & Valeggio → Garda",
    region: "Garda",
    drive: "Iseo → Sigurtà · 85 km · ~1 h → Valeggio → Garda · 20–30 min",
    accent: "garda",
    warning: "Esmaspäeval on paljud kohad kinni — planeeri ette!",
    items: [
      "Check-out ja sõit Parco Giardino Sigurtàsse.",
      "Mini-rong, suured muruväljakud, loomad ja mänguväljakud.",
      "Lõuna Valeggio sul Mincios — kuulsad kohalikud tortellinid.",
      "Jalutuskäik Borghetto sul Mincio külas (vesiveskid, sillad, pardid, jäätis).",
      "Soovi korral Castello Scaligero ja keskaegne Ponte Visconteo sild.",
      "Õhtul saabumine Garda majutusse.",
    ],
    stay: "Gardajärv",
  },
  {
    day: "5",
    weekday: "Teisipäev",
    date: "28.07",
    title: "Gardajärv — Natura Viva",
    region: "Garda",
    drive: "Päev Garda ääres",
    accent: "garda",
    items: [
      "Parco Natura Viva — autosafari + loomapark.",
      "Pärastlõunal bassein majutuses.",
      "Õhtune jalutuskäik Lazises.",
    ],
    stay: "Gardajärv",
  },
  {
    day: "6",
    weekday: "Kolmapäev",
    date: "29.07",
    title: "Gardajärv — rand & Sirmione",
    region: "Garda",
    drive: "Päev Garda ääres",
    accent: "garda",
    items: [
      "Rannapäev: Jamaica Beach (madal, selge vesi) / Lido delle Bionde (kohvik) / Lazise rand (mänguväljakud).",
      "Lähedal ka Spiaggia La Romantica (Manerba ~10 min), San Felice rannad (~5–10 min), Salò promenaad (~10 min).",
      "Pärastlõunal Sirmione vanalinn ja 25-minutiline paadisõit.",
      "Jäätis ja õhtusöök järve ääres.",
    ],
    stay: "Gardajärv",
  },
  {
    day: "7",
    weekday: "Neljapäev",
    date: "30.07",
    title: "Dinosaurusepark → Milano → Malpensa",
    region: "Milano",
    drive: "Garda → Milano → Malpensa · ~1 h",
    accent: "milano",
    items: [
      "Check-out Gardast.",
      "Parco della Preistoria — dinosaurusepark (4–5 tundi).",
      "Lõunasöök ja Milano akvaarium (Civic Aquarium).",
      "Sõit Malpensa lähedale hotelli, rahulik õhtu.",
    ],
    stay: "Milano (lennujaama lähedal)",
  },
  {
    day: "8",
    weekday: "Reede",
    date: "31.07",
    title: "Kojusõit",
    region: "Milano",
    drive: "Malpensa → kodu",
    accent: "milano",
    items: ["Tagastame rendiauto ja lendame koju. Ciao, Italia! 👋"],
    stay: null,
  },
];

// ─────────────────────────────────────────────────────────────
// MAJUTUS (hinnad ühe pere kohta)
// ─────────────────────────────────────────────────────────────
export const stays = [
  {
    place: "Bergamo",
    nights: "1 öö",
    dates: "24.–25.07",
    address: "Via Stelvio 8",
    pricePerFamily: 99.61,
    payment: "Maksta 15.07",
    status: "booked",
    note: "Lähedal mänguväljakud: Parco Clementina, Baden Powell Park, Redona Park.",
    accent: "bergamo",
  },
  {
    place: "Lake Iseo",
    nights: "2 ööd",
    dates: "25.–27.07",
    address: "Iseo järve ääres",
    pricePerFamily: 248,
    payment: "Maksta 09.07",
    status: "booked",
    note: "Hea asukoht järve ääres, jalutuskäikude kaugusel Sarnicost ja Loverest.",
    accent: "iseo",
  },
  {
    place: "Gardajärv",
    nights: "3 ööd",
    dates: "27.–30.07",
    address: "Garda läänekallas (Manerba / San Felice / Salò kandis)",
    pricePerFamily: 451.33,
    payment: "Makstud",
    status: "paid",
    note: "Basseinidega, suured voodid, hea asukoht. Rannad lähedal: La Romantica, San Felice, Salò.",
    accent: "garda",
  },
  {
    place: "Milano",
    nights: "1 öö",
    dates: "30.–31.07",
    address: "~5 min Malpensa lennujaamast",
    pricePerFamily: 94.3,
    payment: "Makstud",
    status: "paid",
    note: "Viimane öö lennujaama lähedal — mugav enne kojulendu.",
    accent: "milano",
  },
];

// ─────────────────────────────────────────────────────────────
// TEGEVUSED PIIRKONDADE KAUPA
// ─────────────────────────────────────────────────────────────
export const activityRegions = [
  {
    region: "Bergamo",
    accent: "bergamo",
    activities: [
      {
        name: "Parco Faunistico Le Cornelle",
        desc: "Üks Itaalia paremaid loomaaedu.",
        price: "~20 € / in · 3–11a soodushinnaga",
      },
      {
        name: "Città Alta",
        desc: "Köisraudteega üles vanalinna. Parki Parcheggio Fara parklasse ja sõida köisraudteega üles.",
        price: "Ühe otsa 1,7 € · edasi-tagasi 3,4 € · alla 1 m tasuta",
      },
      {
        name: "Leolandia",
        desc: "Teemapark.",
        price: "30 € / tk",
      },
    ],
  },
  {
    region: "Lake Iseo",
    accent: "iseo",
    activities: [
      {
        name: "Monte Isola",
        desc: "Praamisõit järvel Euroopa suurimale järvesaarele.",
        price: "5–7 € täiskasvanu · 3–5 € laps",
      },
      {
        name: "Sarnico või Lovere",
        desc: "Jäätisekohvikud ja kaunis promenaad.",
        price: "Tasuta jalutuskäik",
      },
    ],
  },
  {
    region: "Gardajärv",
    accent: "garda",
    activities: [
      {
        name: "Parco Giardino Sigurtà",
        desc: "Mini-rong, suured muruväljakud ja loomad. Arvesta 3–4 h.",
        price: "18 € täiskasvanu · 0–4a tasuta · mini-rong 5 €/in",
      },
      {
        name: "Parco Natura Viva",
        desc: "Autosafari ja loomapark. Onlinest odavam, saab ka ilma safarita.",
        price: "30 € / in · 0–2a tasuta",
      },
      {
        name: "Valeggio sul Mincio",
        desc: "Kuulsad tortellinid. Söögikohad: Al Re del Tortellino ja Alla Borsa.",
        price: "Eelroog 12–15 € · pearoog 15–20 €",
      },
      {
        name: "Borghetto sul Mincio",
        desc: "Jalutuskäik külas: vesiveskid, sillad, jõgi, pardid ja jäätisekohad.",
        price: "Tasuta",
      },
      {
        name: "Castello Scaligero",
        desc: "Väga suur loss Valeggios, torni saab trepist üles ronida.",
        price: "2,5 € täiskasvanu · alla 13a tasuta",
      },
      {
        name: "Ponte Visconteo",
        desc: "Keskaegne kindlustatud sild.",
        price: "Tasuta",
      },
      {
        name: "Sirmione",
        desc: "Lühike paadisõit (25 min) ja vanalinn.",
        price: "6–8 € täiskasvanu · lapsed sama või soodsam",
      },
      {
        name: "Museo Nicolis",
        desc: "Auto- ja tehnikamuuseum, 23 min autoga Garda lõunaservast.",
        price: "14 € täiskasvanu · lastele tasuta",
      },
    ],
  },
  {
    region: "Milano",
    accent: "milano",
    activities: [
      {
        name: "Parco della Preistoria",
        desc: "Dinosaurusepark. Arvesta 4–5 h.",
        price: "18 € täiskasvanu · 3–12a 13 € · 0–2a tasuta",
      },
      {
        name: "Civic Aquarium of Milan",
        desc: "Milano akvaarium.",
        price: "8 € täiskasvanu · lapsed tasuta",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// EELARVE
// ─────────────────────────────────────────────────────────────
export const budgetActivities = [
  { name: "Città Alta köisraudtee", cost: "14 €" },
  { name: "Le Cornelle loomaaed", cost: "110 €" },
  { name: "Monte Isola praam", cost: "27 €" },
  { name: "Sigurtà park", cost: "72 €" },
  { name: "Sigurtà mini-rong", cost: "30 €" },
  { name: "Castello Scaligero", cost: "10 €" },
  { name: "Natura Viva", cost: "130–156 €" },
  { name: "Sirmione paadisõit", cost: "35–40 €" },
  { name: "Parco della Preistoria", cost: "98 €" },
  { name: "Dino-rong", cost: "18 €" },
];

export const budgetActivitiesTotal = "544–575 €";
export const budgetActivitiesNote = "Mõlema pere peale kokku";

// Pileteid ette ostes saab säästa
export const ticketTips = [
  "Sigurtà: online 64 € (4×16 €) vs kohapeal 72 € — sääst ~8 €.",
  "Natura Viva: online 150 € (6×25 €) vs kohapeal 180 € — sääst ~30 €.",
  "Sigurtà mini-rong: sama hind kohapeal ja online.",
];

export const ticketLinks = [
  { label: "Sigurtà piletid", url: "https://www.parcosigurta.com/tickets" },
  {
    label: "Natura Viva piletid",
    url: "https://www.gardavisit.it/en/experiences/lake-garda-parks-discount-tickets/parco-natura-viva-discount-tickets/",
  },
  { label: "Natura Viva (alternatiiv)", url: "https://prezzi.parconaturaviva.it/en" },
];

// ─────────────────────────────────────────────────────────────
// PRAKTILINE INFO
// ─────────────────────────────────────────────────────────────
export const practicalNotes = [
  {
    title: "Esmaspäev = kinni",
    body: "Arvesta, et esmaspäeval (27.07) on paljud kohad suletud. Sigurtà + Valeggio + Garda kolimispäev on selleks hästi planeeritud.",
    icon: "warning",
  },
  {
    title: "Osta piletid ette",
    body: "Suuremate parkide (Sigurtà, Natura Viva) piletid tasub osta online — säästate raha ja väldite järjekorda.",
    icon: "ticket",
  },
  {
    title: "Rendiauto",
    body: "Auto Malpensa lennujaamast 24.–30.07. Uuritud firmadel (rentalplus, noleggiare, rentsmart24) oli kehv tagasiside — varjatud kulud ja hilisemad vigade otsimised. Vali ettevaatlikult ja loe leping hoolega läbi.",
    icon: "car",
  },
  {
    title: "Lastega tempo",
    body: "Seltskonnas on 3 väikest last — planeeri puhkepause, basseini- ja rannaaega ning varu söögikohad ette.",
    icon: "kids",
  },
];
