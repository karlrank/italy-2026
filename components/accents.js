// Staatilised Tailwindi klassinimed iga piirkonna värvi jaoks.
// Klassinimed peavad failis sõna-sõnalt esinema, et Tailwind need leiaks.
export const accents = {
  bergamo: {
    text: "text-bergamo",
    bgSoft: "bg-bergamo-soft",
    bgSolid: "bg-bergamo",
    border: "border-bergamo",
    ring: "ring-bergamo/40",
    dot: "bg-bergamo",
    gradient: "from-bergamo to-sun",
    label: "Bergamo",
  },
  iseo: {
    text: "text-iseo",
    bgSoft: "bg-iseo-soft",
    bgSolid: "bg-iseo",
    border: "border-iseo",
    ring: "ring-iseo/40",
    dot: "bg-iseo",
    gradient: "from-iseo to-garda",
    label: "Lake Iseo",
  },
  garda: {
    text: "text-garda",
    bgSoft: "bg-garda-soft",
    bgSolid: "bg-garda",
    border: "border-garda",
    ring: "ring-garda/40",
    dot: "bg-garda",
    gradient: "from-garda to-iseo",
    label: "Gardajärv",
  },
  milano: {
    text: "text-milano",
    bgSoft: "bg-milano-soft",
    bgSolid: "bg-milano",
    border: "border-milano",
    ring: "ring-milano/40",
    dot: "bg-milano",
    gradient: "from-milano to-bergamo",
    label: "Milano",
  },
};

export const accentFor = (key) => accents[key] || accents.bergamo;
