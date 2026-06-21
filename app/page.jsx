import {
  trip,
  quickFacts,
  stays,
  budgetActivities,
  budgetActivitiesTotal,
  budgetActivitiesNote,
  ticketTips,
  ticketLinks,
  practicalNotes,
} from "@/data/trip";
import { accentFor } from "@/components/accents";
import { Icon } from "@/components/Icons";
import Reveal from "@/components/Reveal";
import Nav from "@/components/Nav";
import Itinerary from "@/components/Itinerary";
import Activities from "@/components/Activities";
import Countdown from "@/components/Countdown";
import TripMap from "@/components/TripMap";

const stayTotalPerFamily = stays.reduce((s, x) => s + x.pricePerFamily, 0);
const eur = (n) =>
  n.toLocaleString("et-EE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
  " €";

function SectionHeading({ kicker, title, sub }) {
  return (
    <Reveal className="mx-auto mb-12 max-w-2xl text-center">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-bergamo">
        {kicker}
      </span>
      <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-ink md:text-5xl">
        {title}
      </h2>
      {sub && <p className="mt-4 text-ink/65 md:text-lg">{sub}</p>}
    </Reveal>
  );
}

export default function Page() {
  return (
    <main id="top" className="bg-grain">
      <Nav />

      {/* ───────────────── HERO ───────────────── */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden">
        {/* gradient sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-iseo-soft via-cream to-cream" />
        {/* sun */}
        <div className="shimmer absolute -right-10 top-24 h-72 w-72 rounded-full bg-gradient-to-br from-sun to-bergamo opacity-30 blur-3xl md:right-24" />
        {/* lake blobs */}
        <div className="float-slow absolute -left-16 top-1/3 h-64 w-64 rounded-full bg-iseo opacity-15 blur-3xl" />
        <div className="float-slower absolute bottom-10 right-1/4 h-72 w-72 rounded-full bg-garda opacity-15 blur-3xl" />

        <div className="relative mx-auto w-full max-w-5xl px-5 pt-24 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/60 px-4 py-1.5 text-sm font-medium text-ink/75 backdrop-blur">
              <Icon name="sun" className="h-4 w-4 text-sun" />
              {trip.dateRange}
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 font-display text-[18vw] font-semibold leading-[0.9] tracking-tight text-ink sm:text-8xl md:text-[8.5rem]">
              Itaalia
              <span className="block bg-gradient-to-r from-bergamo via-sun to-iseo bg-clip-text text-transparent">
                2026
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-xl text-lg text-ink/70 md:text-xl">
              {trip.subtitle}
            </p>
          </Reveal>

          {/* route ribbon */}
          <Reveal delay={240}>
            <div className="mx-auto mt-9 flex max-w-3xl flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm font-medium text-ink/75">
              {trip.route.map((stop, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="rounded-full bg-white/70 px-3 py-1.5 backdrop-blur">
                    {stop}
                  </span>
                  {i < trip.route.length - 1 && (
                    <Icon name="arrow" className="h-4 w-4 text-ink/35" />
                  )}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              {trip.families.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream"
                >
                  <Icon name="users" className="h-4 w-4" />
                  {f}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-ink/55">{trip.group}</p>
          </Reveal>

          <Reveal delay={420}>
            <a
              href="#ajakava"
              className="mt-12 inline-flex flex-col items-center gap-1 text-xs font-semibold uppercase tracking-widest text-ink/45 transition hover:text-ink"
            >
              Vaata reisi
              <Icon name="chevron" className="h-5 w-5 animate-bounce" />
            </a>
          </Reveal>
        </div>
      </section>

      {/* ───────────────── QUICK FACTS ───────────────── */}
      <section className="relative z-10 mx-auto -mt-6 max-w-6xl px-5">
        <div className="grid gap-3 rounded-3xl border border-ink/10 bg-white/80 p-3 shadow-[0_24px_60px_-40px_rgba(42,33,24,0.5)] backdrop-blur sm:grid-cols-2 lg:grid-cols-4">
          {quickFacts.map((f, i) => (
            <Reveal
              key={f.label}
              delay={i * 70}
              className="flex items-start gap-3.5 rounded-2xl p-4 transition hover:bg-cream/60"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bergamo-soft text-bergamo">
                <Icon name={f.icon} className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wider text-ink/45">
                  {f.label}
                </span>
                <span className="mt-0.5 block text-sm font-medium leading-snug text-ink">
                  {f.value}
                </span>
              </span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────────────── COUNTDOWN ───────────────── */}
      <section className="mx-auto mt-12 max-w-6xl px-5">
        <Reveal>
          <Countdown />
        </Reveal>
      </section>

      {/* ───────────────── KAART ───────────────── */}
      <section id="kaart" className="mx-auto max-w-6xl px-5 py-24 md:py-32">
        <SectionHeading
          kicker="Marsruut"
          title="Reisi kaart"
          sub="Kogu teekond ühel pilgul — ööbimised, peatused ja vaatamisväärsused. Klõpsa märgil, et näha rohkem."
        />
        <Reveal>
          <TripMap />
        </Reveal>
      </section>

      {/* ───────────────── AJAKAVA ───────────────── */}
      <section id="ajakava" className="mx-auto max-w-6xl px-5 py-24 md:py-32">
        <SectionHeading
          kicker="Päev päevalt"
          title="Ajakava"
          sub="Kaheksa päeva, neli peatust. Vali päev ja vaata, mis plaanis."
        />
        <Reveal>
          <Itinerary />
        </Reveal>
      </section>

      {/* ───────────────── MAJUTUS ───────────────── */}
      <section id="majutus" className="bg-white/50 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading
            kicker="Kus magame"
            title="Majutus"
            sub="Neli peatust. Hinnad on ühe pere kohta."
          />
          <div className="grid gap-5 md:grid-cols-2">
            {stays.map((s, i) => {
              const a = accentFor(s.accent);
              return (
                <Reveal key={s.place} delay={i * 80}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-30px_rgba(42,33,24,0.5)]">
                    <div className={`h-2 w-full bg-gradient-to-r ${a.gradient}`} />
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full ${a.bgSoft} ${a.text} px-2.5 py-0.5 text-xs font-semibold`}
                          >
                            {s.dates} · {s.nights}
                          </span>
                          <h3 className="mt-2.5 font-display text-2xl font-semibold text-ink">
                            {s.place}
                          </h3>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            s.status === "paid"
                              ? "bg-olive/15 text-olive"
                              : "bg-sun/20 text-[#9a6b15]"
                          }`}
                        >
                          {s.payment}
                        </span>
                      </div>

                      <p className="mt-3 flex items-center gap-2 text-sm text-ink/60">
                        <Icon name="pin" className="h-4 w-4 shrink-0" />
                        {s.address}
                      </p>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/70">
                        {s.note}
                      </p>

                      <div className="mt-5 flex items-baseline justify-between border-t border-ink/8 pt-4">
                        <span className="text-xs font-medium uppercase tracking-wider text-ink/45">
                          Pere kohta
                        </span>
                        <span className="font-display text-2xl font-semibold text-ink">
                          {eur(s.pricePerFamily)}
                        </span>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>

          <Reveal className="mt-6">
            <div className="flex flex-col items-center justify-between gap-3 rounded-3xl bg-ink px-7 py-6 text-cream sm:flex-row">
              <div>
                <p className="text-sm font-medium text-cream/70">
                  Majutus kokku · ühe pere kohta
                </p>
                <p className="font-display text-3xl font-semibold">
                  {eur(stayTotalPerFamily)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-cream/70">
                  Mõlema pere peale
                </p>
                <p className="font-display text-2xl font-semibold text-sun">
                  {eur(stayTotalPerFamily * 2)}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────────── TEGEVUSED ───────────────── */}
      <section id="tegevused" className="mx-auto max-w-6xl px-5 py-24 md:py-32">
        <SectionHeading
          kicker="Mida teha"
          title="Tegevused"
          sub="Loomaaiad, lossid, praamid ja dinosaurused — lastesõbralik valik piirkonna kaupa."
        />
        <Reveal>
          <Activities />
        </Reveal>
      </section>

      {/* ───────────────── EELARVE ───────────────── */}
      <section id="eelarve" className="bg-white/50 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading
            kicker="Raha"
            title="Eelarve"
            sub="Tegevuste hinnad on kogu seltskonna (mõlema pere) peale."
          />

          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            {/* Activities cost table */}
            <Reveal>
              <div className="overflow-hidden rounded-3xl border border-ink/10 bg-white">
                <div className="flex items-center gap-2.5 border-b border-ink/8 px-6 py-4">
                  <Icon name="ticket" className="h-5 w-5 text-bergamo" />
                  <h3 className="font-display text-xl font-semibold text-ink">
                    Tegevused & piletid
                  </h3>
                </div>
                <ul>
                  {budgetActivities.map((b, i) => (
                    <li
                      key={b.name}
                      className={`flex items-center justify-between px-6 py-3 text-sm ${
                        i % 2 ? "bg-cream/40" : ""
                      }`}
                    >
                      <span className="text-ink/80">{b.name}</span>
                      <span className="font-semibold text-ink">{b.cost}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between bg-ink px-6 py-4 text-cream">
                  <div>
                    <span className="font-display text-lg font-semibold">KOKKU</span>
                    <span className="ml-2 text-xs text-cream/60">
                      {budgetActivitiesNote}
                    </span>
                  </div>
                  <span className="font-display text-2xl font-semibold text-sun">
                    {budgetActivitiesTotal}
                  </span>
                </div>
              </div>
            </Reveal>

            {/* Ticket tips */}
            <Reveal delay={100}>
              <div className="flex h-full flex-col gap-5">
                <div className="rounded-3xl border border-ink/10 bg-gradient-to-br from-olive/10 to-iseo-soft p-6">
                  <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
                    <Icon name="euro" className="h-5 w-5 text-olive" />
                    Säästa online
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {ticketTips.map((t, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-ink/80">
                        <Icon
                          name="check"
                          className="mt-0.5 h-4 w-4 shrink-0 text-olive"
                        />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-3xl border border-ink/10 bg-white p-6">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    Piletilingid
                  </h3>
                  <div className="mt-3 flex flex-col gap-2">
                    {ticketLinks.map((l) => (
                      <a
                        key={l.url}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between rounded-xl bg-cream/60 px-4 py-2.5 text-sm font-medium text-ink/80 transition hover:bg-bergamo-soft hover:text-bergamo"
                      >
                        {l.label}
                        <Icon
                          name="arrow"
                          className="h-4 w-4 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ───────────────── PRAKTILINE INFO ───────────────── */}
      <section id="info" className="mx-auto max-w-6xl px-5 py-24 md:py-32">
        <SectionHeading
          kicker="Hea teada"
          title="Praktiline info"
          sub="Mõned asjad, mida tasub meeles pidada."
        />
        <div className="grid gap-5 sm:grid-cols-2">
          {practicalNotes.map((n, i) => (
            <Reveal key={n.title} delay={i * 80}>
              <div className="flex h-full gap-4 rounded-3xl border border-ink/10 bg-white p-6 transition hover:shadow-[0_18px_40px_-28px_rgba(42,33,24,0.5)]">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-bergamo-soft text-bergamo">
                  <Icon name={n.icon} className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {n.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink/70">
                    {n.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────────────── FOOTER ───────────────── */}
      <footer className="relative overflow-hidden bg-ink py-16 text-cream">
        <div className="float-slower absolute -right-20 -top-20 h-72 w-72 rounded-full bg-bergamo opacity-20 blur-3xl" />
        <div className="float-slow absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-iseo opacity-20 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-5 text-center">
          <Icon name="plane" className="mx-auto h-8 w-8 text-sun" />
          <p className="mt-5 font-display text-4xl font-semibold md:text-5xl">
            Buon viaggio!
          </p>
          <p className="mx-auto mt-4 max-w-md text-cream/65">
            {trip.dateRange} · {trip.families.join(" & ")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm text-cream/55">
            {trip.route.map((stop, i) => (
              <span key={i} className="flex items-center gap-2">
                {stop}
                {i < trip.route.length - 1 && (
                  <span className="text-sun/60">·</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
