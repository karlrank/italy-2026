# Itaalia 2026 🇮🇹

Reisileht perekondade **Murd & Rankla** Itaalia reisi jaoks **24.–31. juuli 2026**.

Marsruut: **Malpensa → Bergamo → Lake Iseo → Gardajärv → Milano**

Leht sisaldab:

- ⏳ **Loendus** — reaalajas taimer reisi alguseni
- 🗺️ **Interaktiivne kaart** — kogu marsruut, ööbimised ja peatused (Leaflet). Ajakavast saab vajutada „Vaata kaardil“ ja kaart lendab õigesse kohta.
- 🌤️ **Ilm** — tüüpiline juuli iga peatuse jaoks + elav hetketemperatuur (Open-Meteo)
- 📅 **Ajakava** — interaktiivne päev-päevalt vaade (8 päeva)
- 🛏️ **Majutus** — neli peatust fotodega, hinnad pere kohta + makseseis
- 🎟️ **Tegevused** — lastesõbralikud tegevused piirkonna kaupa hindadega
- 🧳 **Pakkimisnimekiri** — jagatud, salvestuv nimekiri (vt allpool)
- 💶 **Eelarve** — piletite kogusumma + näpunäited online-säästuks
- ℹ️ **Praktiline info** — rendiauto, esmaspäeva-hoiatus jms

## Tehnoloogia

- [Next.js 15](https://nextjs.org/) (App Router) + serverivaba API marsruut
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Leaflet](https://leafletjs.com/) + CARTO kaardiplaadid (võtmeta)
- [Open-Meteo](https://open-meteo.com/) ilmateade (võtmeta, kliendipoolne)
- Fraunces + Inter (Google Fonts)
- Fotod: [Wikimedia Commons](https://commons.wikimedia.org/) (vabad litsentsid, viited jaluses)

## Pakkimisnimekiri — jagatud salvestus

Nimekiri töötab **kohe**, ilma seadistuseta: linnukesed salvestatakse brauserisse
(`localStorage`, seadmepõhine).

Kui soovid, et nimekiri **sünkroniseeruks mõlema pere ja kõigi seadmete vahel**,
ühenda Vercelis KV-andmebaas:

1. Vercel projekt → **Storage** → **Create Database** → **Upstash for Redis** (KV).
2. Ühenda see projektiga — Vercel lisab automaatselt keskkonnamuutujad
   (`KV_REST_API_URL` ja `KV_REST_API_TOKEN`, või Upstashi vasted).
3. Tee uus deploy. Nimekirja juures muutub silt „▢ Selles seadmes“ →
   „☁ Sünkroonitud“.

Ilma nende muutujateta vastab API `{"configured": false}` ja klient kasutab
turvaliselt `localStorage`'i — midagi ei katki.

Kogu reisi sisu elab ühes failis: [`data/trip.js`](data/trip.js). Andmete
muutmiseks redigeeri seda faili.

## Kohalik arendus

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # produktsioonibuild
```

## Vercelisse paigaldamine

1. Lükka see repo GitHubi.
2. Mine [vercel.com/new](https://vercel.com/new) ja impordi repo.
3. Vercel tuvastab Next.js automaatselt — vajuta **Deploy**.

Eraldi seadistust pole vaja; vaikeväärtused töötavad.
