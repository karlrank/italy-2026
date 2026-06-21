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
- 🔒 **Paroolikaitse** — valikuline, oma sisselogimislehega (vt allpool)
- ✏️ **Sisuhaldus (CMS)** — lisa/muuda/kustuta enamikku sisust `/admin` all (vt allpool)

## Tehnoloogia

- [Next.js 15](https://nextjs.org/) (App Router) + serverivaba API marsruut
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Leaflet](https://leafletjs.com/) + CARTO kaardiplaadid (võtmeta)
- [Open-Meteo](https://open-meteo.com/) ilmateade (võtmeta, kliendipoolne)
- Fraunces + Inter (Google Fonts)
- Fotod: [Wikimedia Commons](https://commons.wikimedia.org/) (vabad litsentsid, viited jaluses)

## Paroolikaitse

Kogu saidi saab panna ühe jagatud parooli taha — **lehed, reisiandmed ja API**.
Aktiveerimiseks lisa Vercelis (Settings → Environment Variables) muutuja:

```
SITE_PASSWORD = sinu-salajane-parool
```

Tee uus deploy. Pärast seda:

- Iga külastaja näeb kõigepealt **ilusat sisselogimislehte** (`/login`), mitte
  brauseri halli dialoogi.
- Õige parooli järel pannakse `httpOnly`-küpsis (parooli HMAC-allkiri — parool
  ise küpsisesse ei satu) ja edasi sirvib leht tavapäraselt.
- Jaluses on „Logi välja“ nupp.

**Miks see on päriselt turvaline (mitte ainult peidetud):**

- Kaitse toimub serveris (`middleware.js`) **enne** vastuse saatmist — nii lehed
  kui `/api/*` annavad ilma küpsiseta `401` / suunavad sisselogimisele.
- Reisiandmed renderdatakse **ainult** kaitstud `/` vastusesse ega satu üldse
  avalikesse JS-pakkidesse (komponendid saavad andmed propsidena serverist).
  Seda saab kontrollida: `grep -r "Perekond Murd" .next/static` → tühi.

Ilma `SITE_PASSWORD`-muutujata on sait avatud (mugav arenduseks).

## Sisuhaldus (CMS)

Sisu saab muuta **kahel viisil** (mõlemad nõuavad sisselogimist + ühendatud KV-d):

1. **Otse avalehel** — vajuta paremas alanurgas **„✎ Muuda sisu“**, misjärel
   ilmuvad sektsioonide kõrvale väikesed pliiatsinupud (✎). Klõps avab dialoogi
   selle sektsiooni muutmiseks. Pakkimissektsioonis saab esemeid lisada otse iga
   kategooria all ja luua uusi kategooriaid.
2. **Haldusleht `/admin`** — kõik sektsioonid ühel lehel (link jaluses
   „Halda sisu“).

Redigeerida saab: reisi pealkiri/kuupäevad/pered, kiirfaktid, **ajakava**
(päevad + tegevused), **majutus**, **tegevused**, **eelarve**, **kaardi
peatused**, **ilm**, piletivihjed/lingid, praktiline info, **pakkimisnimekiri**
ja fotode URL-id. Iga nimekirja saab täiendada, ümber järjestada (↑/↓) ja
kustutada.

Pakkimisnimekiri on **täielikult CMS-is**: esemeid saab lisada/eemaldada nii
`/admin` all kui ka otse pakkimissektsioonis (KV-ga). Ainult linnukesed
(„pakitud“) on jooksev olek, mis sünkroonib perede vahel.

Kuidas see töötab:

- Vaikesisu elab failis [`data/trip.js`](data/trip.js).
- Kui **KV-andmebaas on ühendatud** (sama, mida pakkimisnimekiri kasutab —
  vt allpool), salvestatakse muudatused sinna ja leht loeb need sealt. Klõps
  „Salvesta“ kirjutab kogu sisu KV-sse; „Taasta vaikeväärtused“ kustutab selle.
- Ilma KV-ta on `/admin` **ainult vaatamiseks** (muudatusi ei saa salvestada) —
  leht kasutab vaikesisu.

Turvalisus: `/admin` ja sisu-API (`/api/content`) on middleware'iga kaitstud
(vajavad sisselogimist), nii et muuta saavad ainult parooli teadjad.

## Pakkimisnimekiri — jagatud salvestus

Nimekiri töötab **kohe**, ilma seadistuseta: linnukesed salvestatakse brauserisse
(`localStorage`, seadmepõhine).

Kui soovid, et nimekiri **sünkroniseeruks mõlema pere ja kõigi seadmete vahel**,
ühenda Vercelis KV-andmebaas. Kood on juba valmis — andmebaasi ühendamisel
hakkab sünk **automaatselt** tööle (sh elav uuendus: leht küsib serverilt
muudatusi fookusel ja iga 15 sekundi tagant, kirjutamata üle sinu parajasti
tehtud linnukesi).

**Variant A — Vercel dashboard (lihtsaim):**

1. Vercel projekt → **Storage** → **Create Database** → **Upstash for Redis** (KV).
2. **Connect Project** → vali see projekt. Vercel lisab automaatselt
   keskkonnamuutujad (`KV_REST_API_URL` + `KV_REST_API_TOKEN`, või Upstashi
   vasted `UPSTASH_REDIS_REST_*`).
3. **Redeploy** (Deployments → ⋯ → Redeploy). Pakkimisnimekirja juures muutub
   silt „▢ Selles seadmes“ → „☁ Sünkroonitud“.

**Variant B — Vercel CLI:**

```bash
npm i -g vercel
vercel link            # seo kaust Vercel projektiga
vercel storage create  # loo KV / Upstash Redis ja ühenda projektiga
vercel env pull .env.local   # tõmba muutujad lokaalseks arenduseks
vercel --prod          # uus deploy
```

**Kuidas kontrollida, et töötab:**

```bash
curl "https://SINU-DOMEEN.vercel.app/api/checklist?key=packing:italy-2026"
# Ootus pärast ühendamist: {"configured":true, ...}
# Ilma andmebaasita:       {"configured":false,"data":null}
```

Ilma nende muutujateta vastab API `{"configured": false}` ja klient kasutab
turvaliselt `localStorage`'i — midagi ei katki. Toetatud muutujanimed on
kirjas failis [`.env.example`](.env.example).

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
