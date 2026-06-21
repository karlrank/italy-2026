# Itaalia 2026 🇮🇹

Reisileht perekondade **Murd & Rankla** Itaalia reisi jaoks **24.–31. juuli 2026**.

Marsruut: **Malpensa → Bergamo → Lake Iseo → Gardajärv → Milano**

Leht sisaldab:

- 📅 **Ajakava** — interaktiivne päev-päevalt vaade (8 päeva)
- 🛏️ **Majutus** — neli peatust, hinnad pere kohta + makseseis
- 🎟️ **Tegevused** — lastesõbralikud tegevused piirkonna kaupa hindadega
- 💶 **Eelarve** — piletite kogusumma + näpunäited online-säästuks
- ℹ️ **Praktiline info** — rendiauto, esmaspäeva-hoiatus jms

## Tehnoloogia

- [Next.js 15](https://nextjs.org/) (App Router, staatiline väljund)
- [Tailwind CSS v4](https://tailwindcss.com/)
- Fraunces + Inter (Google Fonts)

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
