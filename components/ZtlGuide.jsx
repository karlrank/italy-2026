import { Icon } from "@/components/Icons";

const parts = [
  {
    dot: "bg-ink/70",
    title: "zona traffico limitato",
    body: "= „piiratud liikluse tsoon“.",
  },
  {
    dot: "bg-[#d92b2b]",
    title: "Punane ring",
    body: "Sõiduautod keelatud — siseneda ei tohi.",
  },
  {
    dot: "bg-garda",
    title: "Kellaaeg (nt 08.00–20.00)",
    body: "Millal ZTL kehtib. Väljaspool seda aega on tavaliselt lubatud.",
  },
  {
    dot: "bg-olive",
    title: "Väiketekst",
    body: "Load ja erandid — kes tohivad siseneda (ei puuduta rendiautosid).",
  },
];

export default function ZtlGuide() {
  return (
    <div className="overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm">
      <div className="h-1.5 w-full bg-gradient-to-r from-bergamo to-sun" />
      <div className="grid gap-8 p-6 md:grid-cols-[auto_1fr] md:p-8">
        {/* CSS-drawn ZTL sign */}
        <div className="flex justify-center">
          <div className="w-48 rounded-2xl border-2 border-ink/70 bg-white p-4 text-center shadow-md">
            <p className="text-sm font-semibold leading-tight text-ink">
              zona
              <br />
              traffico limitato
            </p>
            <div
              className="mx-auto my-4 h-24 w-24 rounded-full border-[11px] border-[#d92b2b]"
              aria-hidden="true"
            />
            <p className="mx-auto w-fit rounded-md border border-ink/40 px-2 py-0.5 text-sm font-semibold tracking-wide text-ink">
              08.00 – 20.00
            </p>
            <p className="mt-3 text-[0.6rem] italic leading-tight text-ink/45">
              accesso consentito agli autorizzati muniti di Pass…
            </p>
          </div>
        </div>

        {/* Explanation */}
        <div>
          <h3 className="font-display text-2xl font-semibold text-ink">
            Kuidas lugeda ZTL-märki
          </h3>
          <p className="mt-1 text-sm text-ink/60">
            ZTL (<em>zona traffico limitato</em>) on kaameratega valvatud
            piiratud liikluse tsoon Itaalia linnasüdametes.
          </p>

          <ul className="mt-4 space-y-3">
            {parts.map((p) => (
              <li key={p.title} className="flex items-start gap-3">
                <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${p.dot}`} />
                <span className="text-sm text-ink/80">
                  <span className="font-semibold text-ink">{p.title}</span> —{" "}
                  {p.body}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-bergamo-soft p-4">
            <Icon name="warning" className="h-5 w-5 shrink-0 text-bergamo" />
            <p className="text-sm text-ink/85">
              <span className="font-semibold text-bergamo">
                Rendiautod ei tohi kunagi
              </span>{" "}
              siseneda aktiivsesse ZTL-tsooni — ka väiketeksti eranditest
              hoolimata. Kaamerad trahvivad automaatselt. Pargi tsoonist
              väljapoole ja jaluta.
            </p>
          </div>

          <p className="mt-4 text-xs text-ink/55">
            <span className="font-semibold text-ink/70">Meie peatustest:</span>{" "}
            Bergamo Città Alta (pargi Parcheggio Fara), Sirmione vanalinn,
            Valeggio / Borghetto ja mitmed järveäärsed kesklinnad on ZTL või
            jalakäijate ala.
          </p>
        </div>
      </div>
    </div>
  );
}
