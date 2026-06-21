// Kogu reisi sisu ühes failis. Andmed pärinevad reisi Exceli tabelist.

export const trip = {
  title: "Itaalia 2026",
  subtitle: "Bergamo · Lake Iseo · Gardajärv · Milano",
  dateRange: "24.–31. juuli 2026",
  families: ["Perekond Murd", "Perekond Rankla"],
  group: "4 täiskasvanut + 3 last (4-aastane, 3-aastane ja alla 2-aastane)",
  route: ["Malpensa", "Bergamo", "Lake Iseo", "Gardajärv", "Milano"],
  startISO: "2026-07-24T00:00:00",
  endISO: "2026-07-31T23:59:59",
};

// ─────────────────────────────────────────────────────────────
// LENNUD — täida lennunumbrid CMS-is; elav staatus tuleb API-st
// ─────────────────────────────────────────────────────────────
export const flights = [
  {
    id: "out",
    direction: "Väljalend",
    flightNumber: "",
    date: "2026-07-24",
    from: "Tallinn (TLL)",
    to: "Milano–Malpensa (MXP)",
    note: "",
  },
  {
    id: "ret",
    direction: "Tagasilend",
    flightNumber: "",
    date: "2026-07-31",
    from: "Milano–Malpensa (MXP)",
    to: "Tallinn (TLL)",
    note: "",
  },
];

// ─────────────────────────────────────────────────────────────
// SÖÖGIKOHAD (peresõbralikud, peatuste lähedal). Link → Google Maps.
// ─────────────────────────────────────────────────────────────
export const food = [
  // Bergamo
  { id: "f1", name: "Il Circolino", area: "Città Alta, Bergamo", accent: "bergamo", note: "Pizza ja värske pasta, suvel mõnus õueala.", price: "€€", hours: "" },
  { id: "f2", name: "Pizzeria San Vigilio", area: "Città Alta, Bergamo", accent: "bergamo", note: "Pizza ja panoraamvaade köisraudtee tipus.", price: "€€", hours: "" },
  { id: "f3", name: "Da Franco", area: "Città Alta, Bergamo", accent: "bergamo", note: "Traditsiooniline Lombardia köök, mõistlik hind.", price: "€€", hours: "" },
  // Lake Iseo
  { id: "f4", name: "Cascina Boneta", area: "Sarnico", accent: "iseo", note: "Pererestoran järvevaatega — pasta, grill, pizza, õuealad.", price: "€€", hours: "" },
  { id: "f5", name: "La Baia", area: "Sarnico", accent: "iseo", note: "Pizza ja kala järve ääres; gluteeni-/laktoosivabad valikud.", price: "€€", hours: "" },
  { id: "f6", name: "L'Approdo", area: "Sarnico", accent: "iseo", note: "Restoran-pizzeria otse järve ääres.", price: "€€", hours: "" },
  // Garda — läänekallas
  { id: "f7", name: "Ristorante Pisenze", area: "Manerba del Garda", accent: "garda", note: "Mänguala lastele, lähedal majutusele.", price: "€€", hours: "" },
  { id: "f8", name: "Al Porticciolo", area: "San Felice del Benaco", accent: "garda", note: "Järve ääres, pereomanduses.", price: "€€", hours: "" },
  { id: "f9", name: "Osteria della Pieve", area: "Manerba del Garda", accent: "garda", note: "Hubane ja peresõbralik.", price: "€€", hours: "" },
  // Garda — Valeggio (tortellinid)
  { id: "f10", name: "Alla Borsa", area: "Valeggio sul Mincio", accent: "garda", note: "Kuulus tortellini-restoran.", price: "€€€", hours: "" },
  { id: "f11", name: "Al Re del Tortellino", area: "Valeggio sul Mincio", accent: "garda", note: "Kohalikud käsitsi tehtud tortellinid.", price: "€€", hours: "" },
  // Garda — Lazise & Sirmione
  { id: "f12", name: "Agriturismo Le Caldane", area: "Lazise", accent: "garda", note: "Talurestoran, kõrgtoolid ja aiamänguala.", price: "€€", hours: "" },
  { id: "f13", name: "Pizzeria Bengio", area: "Lazise", accent: "garda", note: "Pizza ja lihatoidud, sõbralik perele.", price: "€", hours: "" },
  { id: "f14", name: "Pizzeria Erica", area: "Sirmione", accent: "garda", note: "Pizza/pasta, terrass ja basseinid lastele.", price: "€€", hours: "" },
  // Milano / Malpensa (viimane õhtu)
  { id: "f15", name: "Corte Visconti", area: "Somma Lombardo", accent: "milano", note: "Pereomanduses, värske pizza — lennujaama lähedal.", price: "€€", hours: "" },
  { id: "f16", name: "Trattoria Cacciatori", area: "Somma Lombardo", accent: "milano", note: "Traditsiooniline Itaalia köök.", price: "€€", hours: "" },
  { id: "f17", name: "Osteria della Pista", area: "Somma Lombardo", accent: "milano", note: "Lastesõbralik, sobib gruppidele.", price: "€€", hours: "" },
  // Jäätis / gelato 🍦
  { id: "g1", name: "La Marianna", area: "Città Alta, Bergamo", accent: "bergamo", type: "gelato", note: "Stracciatella sünnikoht (1961), terrass linnavaatega.", price: "€", hours: "" },
  { id: "g2", name: "Gelateria La Gatta", area: "Sarnico", accent: "iseo", type: "gelato", note: "Pere jäätisekoht 1950ndatest järve ääres; gluteeni-/laktoosivaba.", price: "€", hours: "" },
  { id: "g3", name: "La Cremeria di Lazise", area: "Lazise", accent: "garda", type: "gelato", note: "Käsitööjäätis ja saiakesed järvepromenaadil.", price: "€", hours: "" },
  { id: "g4", name: "Amor di Gelato", area: "Salò", accent: "garda", type: "gelato", note: "Käsitööjäätis, granita, vegan/gluteenivabad valikud.", price: "€", hours: "" },
  { id: "g5", name: "La Gelateria del Castello", area: "Somma Lombardo", accent: "milano", type: "gelato", note: "Lossi vastas, odav — mugav Malpensa teel.", price: "€", hours: "" },
];

// ─────────────────────────────────────────────────────────────
// KAART — peatused ja marsruut
// ─────────────────────────────────────────────────────────────
// type: "airport" | "stay" | "spot"
export const mapStops = [
  {
    name: "Malpensa lennujaam",
    region: "airport",
    type: "airport",
    emoji: "✈️",
    lat: 45.6306,
    lng: 8.7281,
    note: "Saabumine ja lahkumine. Siit ka rendiauto.",
  },
  {
    name: "Bergamo — majutus",
    region: "bergamo",
    type: "stay",
    emoji: "🛏️",
    lat: 45.71,
    lng: 9.677,
    note: "Via Stelvio 8 · 24.–25.07. Õhtul Città Alta köisraudteega.",
  },
  {
    name: "Le Cornelle loomaaed",
    region: "bergamo",
    type: "spot",
    emoji: "🦒",
    lat: 45.7237,
    lng: 9.586,
    note: "Üks Itaalia paremaid loomaaedu · 25.07.",
  },
  {
    name: "Lake Iseo — majutus",
    region: "iseo",
    type: "stay",
    emoji: "🛏️",
    lat: 45.6603,
    lng: 10.0537,
    note: "Järve ääres · 25.–27.07.",
  },
  {
    name: "Monte Isola",
    region: "iseo",
    type: "spot",
    emoji: "⛴️",
    lat: 45.717,
    lng: 10.077,
    note: "Praamisõit Euroopa suurimale järvesaarele · 26.07.",
  },
  {
    name: "Sarnico",
    region: "iseo",
    type: "spot",
    emoji: "🍦",
    lat: 45.6699,
    lng: 9.9569,
    note: "Promenaad ja jäätisekohvikud.",
  },
  {
    name: "Parco Giardino Sigurtà",
    region: "garda",
    type: "spot",
    emoji: "🌳",
    lat: 45.3625,
    lng: 10.734,
    note: "Mini-rong, muruväljakud, loomad · 27.07.",
  },
  {
    name: "Valeggio · Borghetto",
    region: "garda",
    type: "spot",
    emoji: "🍝",
    lat: 45.349,
    lng: 10.733,
    note: "Kuulsad tortellinid ja vesiveskite küla · 27.07.",
  },
  {
    name: "Gardajärv — majutus",
    region: "garda",
    type: "stay",
    emoji: "🛏️",
    lat: 45.5466,
    lng: 10.5616,
    note: "Basseiniga, läänekallas · 27.–30.07.",
  },
  {
    name: "Parco Natura Viva",
    region: "garda",
    type: "spot",
    emoji: "🦁",
    lat: 45.4815,
    lng: 10.7177,
    note: "Autosafari + loomapark · 28.07.",
  },
  {
    name: "Sirmione",
    region: "garda",
    type: "spot",
    emoji: "🏰",
    lat: 45.4946,
    lng: 10.6066,
    note: "Vanalinn ja 25-min paadisõit · 29.07.",
  },
  {
    name: "Parco della Preistoria",
    region: "milano",
    type: "spot",
    emoji: "🦕",
    lat: 45.469,
    lng: 9.523,
    note: "Dinosaurusepark · 30.07.",
  },
  {
    name: "Milano akvaarium",
    region: "milano",
    type: "spot",
    emoji: "🐠",
    lat: 45.475,
    lng: 9.179,
    note: "Civic Aquarium · 30.07.",
  },
  {
    name: "Milano — majutus",
    region: "milano",
    type: "stay",
    emoji: "🛏️",
    lat: 45.62,
    lng: 8.73,
    note: "~5 min lennujaamast · 30.–31.07.",
  },
];

// Ööbimiste marsruut (joon kaardil)
export const routePath = [
  [45.6306, 8.7281], // Malpensa
  [45.71, 9.677], // Bergamo
  [45.6603, 10.0537], // Lake Iseo
  [45.5466, 10.5616], // Garda
  [45.62, 8.73], // Milano (lennujaama lähedal)
  [45.6306, 8.7281], // tagasi Malpensa
];

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
    photo: "bergamo",
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
    photo: "iseo",
    url: "https://www.booking.com/Share-ZEQ1bHY",
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
    photo: "sirmione",
    url: "https://www.booking.com/Share-B5sNlV",
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
    photo: "milano",
    url: "https://www.airbnb.co.uk/rooms/1557308793147256955?unique_share_id=b7563045-b63e-44d9-9463-5039aa280d49&viralityEntryPoint=1&s=76",
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
        url: "https://www.lecornelle.it/?lang=en",
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
        url: "https://www.leolandia.it/en/",
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
        url: "https://www.navigazionelagoiseo.it/en/",
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
        url: "https://www.sigurta.it/",
        desc: "Mini-rong, suured muruväljakud ja loomad. Arvesta 3–4 h.",
        price: "18 € täiskasvanu · 0–4a tasuta · mini-rong 5 €/in",
      },
      {
        name: "Parco Natura Viva",
        url: "https://www.parconaturaviva.it/en",
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
        url: "https://www.museonicolis.com/en/",
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
        url: "https://www.parcodellapreistoria.it/",
        desc: "Dinosaurusepark. Arvesta 4–5 h.",
        price: "18 € täiskasvanu · 3–12a 13 € · 0–2a tasuta",
      },
      {
        name: "Civic Aquarium of Milan",
        url: "https://www.acquariodimilano.it/it/",
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
  { label: "Sigurtà piletid", url: "https://ticket.sigurta.it/" },
  { label: "Natura Viva piletid", url: "https://www.parconaturaviva.it/en" },
  { label: "Natura Viva — soodushinnad", url: "https://prezzi.parconaturaviva.it/en" },
];

// ─────────────────────────────────────────────────────────────
// PRAKTILINE INFO
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// FOTOD (Wikimedia Commons, vabad litsentsid — viited krediidis)
// ─────────────────────────────────────────────────────────────
export const photos = {
  garda: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Lago_di_Garda_Panorama_001.JPG/1920px-Lago_di_Garda_Panorama_001.JPG",
    page: "https://commons.wikimedia.org/wiki/File:Lago_di_Garda_Panorama_001.JPG",
    label: "Lago di Garda",
  },
  bergamo: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Bergamo_Citt%C3%A0_Alta.JPG/1280px-Bergamo_Citt%C3%A0_Alta.JPG",
    page: "https://commons.wikimedia.org/wiki/File:Bergamo_Citt%C3%A0_Alta.JPG",
    label: "Bergamo Città Alta",
  },
  iseo: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Lago_d%27Iseo.JPG/1280px-Lago_d%27Iseo.JPG",
    page: "https://commons.wikimedia.org/wiki/File:Lago_d%27Iseo.JPG",
    label: "Lago d'Iseo",
  },
  sirmione: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Italy_-_Sirmione_-_Scaligero_Castle.jpg/1280px-Italy_-_Sirmione_-_Scaligero_Castle.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Italy_-_Sirmione_-_Scaligero_Castle.jpg",
    label: "Sirmione, Gardajärv",
  },
  milano: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Duomo_di_Milano.JPG/1280px-Duomo_di_Milano.JPG",
    page: "https://commons.wikimedia.org/wiki/File:Duomo_di_Milano.JPG",
    label: "Duomo di Milano",
  },
};

// Milline foto käib millise ööbimiskoha juurde
export const stayPhotoKey = {
  Bergamo: "bergamo",
  "Lake Iseo": "iseo",
  Gardajärv: "sirmione",
  Milano: "milano",
};

// Ajakava päev → kaardimärgi nimi (kaardiga sidumiseks)
export const dayFocus = {
  1: "Bergamo — majutus",
  2: "Le Cornelle loomaaed",
  3: "Monte Isola",
  4: "Parco Giardino Sigurtà",
  5: "Parco Natura Viva",
  6: "Sirmione",
  7: "Parco della Preistoria",
  8: "Malpensa lennujaam",
};

// ─────────────────────────────────────────────────────────────
// ILM — tüüpiline juuli (kliimanormid) + elav hetketemp (Open-Meteo)
// ─────────────────────────────────────────────────────────────
export const climate = [
  {
    region: "bergamo",
    label: "Bergamo",
    lat: 45.71,
    lng: 9.677,
    hi: 29,
    lo: 18,
    note: "Päikeseline, õhtuti jahedam",
  },
  {
    region: "iseo",
    label: "Lake Iseo",
    lat: 45.66,
    lng: 10.05,
    hi: 28,
    lo: 17,
    water: 24,
    note: "Järvevesi mõnusalt soe",
  },
  {
    region: "garda",
    label: "Gardajärv",
    lat: 45.55,
    lng: 10.56,
    hi: 29,
    lo: 19,
    water: 25,
    note: "Väga päikeseline, kõrge UV",
  },
  {
    region: "milano",
    label: "Milano",
    lat: 45.46,
    lng: 9.19,
    hi: 30,
    lo: 19,
    note: "Kuum ja niiske",
  },
];

// ─────────────────────────────────────────────────────────────
// PAKKIMISNIMEKIRI (vaikevalik, jagatud kahe pere peale)
// ─────────────────────────────────────────────────────────────
export const packingCategories = [
  {
    id: "docs",
    title: "Dokumendid & raha",
    icon: "ticket",
    items: [
      { id: "docs-0", label: "Passid / ID-kaardid (kõik)" },
      { id: "docs-1", label: "Lennupiletid" },
      { id: "docs-2", label: "Rendiauto broneering + juhiload" },
      { id: "docs-3", label: "Majutuse broneeringud" },
      { id: "docs-4", label: "Reisi- ja ravikindlustus (EHIC kaart)" },
      { id: "docs-5", label: "Pangakaardid + veidi sularaha (€)" },
    ],
  },
  {
    id: "kids",
    title: "Lapsed",
    icon: "kids",
    items: [
      { id: "kids-0", label: "Turvatoolid / istmekõrgendused autosse" },
      { id: "kids-1", label: "Mähkmed + niisked salvrätid" },
      { id: "kids-2", label: "Käru või kandekott" },
      { id: "kids-3", label: "Beebitoit ja snäkid" },
      { id: "kids-4", label: "Lemmikmänguasi / unekaaslane" },
      { id: "kids-5", label: "Päikesemütsid ja UV-riided" },
      { id: "kids-6", label: "Ujupüksid / käeujukid" },
    ],
  },
  {
    id: "clothes",
    title: "Riided",
    icon: "sun",
    items: [
      { id: "clothes-0", label: "Suveriided + vahetusriided" },
      { id: "clothes-1", label: "Ujumisriided ja rätikud" },
      { id: "clothes-2", label: "Üks soojem kiht õhtuks" },
      { id: "clothes-3", label: "Mugavad jalanõud + sandaalid" },
      { id: "clothes-4", label: "Õhuke vihmajope / vihmakeep" },
    ],
  },
  {
    id: "health",
    title: "Hügieen & ravimid",
    icon: "warning",
    items: [
      { id: "health-0", label: "Päikesekreem (kõrge SPF)" },
      { id: "health-1", label: "Putukatõrje" },
      { id: "health-2", label: "Esmaabi: plaastrid, palavikualandaja" },
      { id: "health-3", label: "Isiklikud ravimid" },
      { id: "health-4", label: "Hambaharjad ja hügieenitarbed" },
    ],
  },
  {
    id: "tech",
    title: "Tehnika",
    icon: "pin",
    items: [
      { id: "tech-0", label: "Telefonid + laadijad" },
      { id: "tech-1", label: "Pistikuadapter (Itaalia tüüp L/F)" },
      { id: "tech-2", label: "Powerbank" },
      { id: "tech-3", label: "Kaamera" },
      { id: "tech-4", label: "Kõrvaklapid lastele" },
    ],
  },
  {
    id: "car",
    title: "Auto & tee",
    icon: "car",
    items: [
      { id: "car-0", label: "Navigatsioon / offline-kaardid" },
      { id: "car-1", label: "Snäkid ja vesi autosse" },
      { id: "car-2", label: "Prügikotid + salvrätid" },
      { id: "car-3", label: "Päikesekaitse autoaknale" },
    ],
  },
];

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
