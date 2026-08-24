import Link from "next/link";
import { getContent, contentConfigured } from "@/lib/content";
import { galleryConfigured, getManifest } from "@/lib/photos";
import Gallery from "@/components/gallery/Gallery";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

const isProtected = Boolean(process.env.SITE_PASSWORD);

// The itinerary numbers the days as "24.07"; the photos carry full dates.
function dayTitlesFrom(itinerary = []) {
  const map = {};
  for (const d of itinerary) {
    const m = String(d.date || "").match(/^(\d{2})\.(\d{2})$/);
    if (!m) continue;
    map[`2026-${m[2]}-${m[1]}`] = `${d.day}. päev · ${d.title}`;
  }
  return map;
}

export default async function GalleryPage() {
  const content = await getContent();
  const dayTitles = dayTitlesFrom(content.itinerary);

  let stats = null;
  if (galleryConfigured) {
    try {
      stats = (await getManifest())?.stats || null;
    } catch {
      stats = null;
    }
  }

  return (
    <main className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 border-b border-ink/8 bg-cream/85 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-3.5">
          <Link
            href="/"
            className="font-display text-lg font-semibold tracking-tight text-ink"
          >
            <span className="mr-1.5 text-ink/40">←</span>
            Itaalia<span className="text-bergamo">’26</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-ink/45 sm:inline">
              {stats
                ? `${stats.total.toLocaleString("et-EE")} kaadrit · ${stats.videos} videot`
                : "Pildid"}
            </span>
            {isProtected && <LogoutButton />}
          </div>
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-6 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-bergamo">
            Reisipildid
          </span>
          <h1 className="mt-2.5 font-display text-4xl font-semibold leading-tight text-ink md:text-5xl">
            Kaheksa päeva, {stats ? stats.total.toLocaleString("et-EE") : "3300"}{" "}
            kaadrit
          </h1>
          <p className="mt-3 text-ink/60">
            Pildid on jaotatud kolme tasemesse — tipphetkedest kuni iga
            korraliku kaadrini. Jaotuse tegi masin, viimane sõna on sinul:
            iga pilti saab tasemete vahel liigutada ja peaaegu ühesugustest
            seeriatest teise kaadri valida.
          </p>
        </div>

        {galleryConfigured ? (
          <Gallery dayTitles={dayTitles} canEdit={contentConfigured} />
        ) : (
          <div className="rounded-2xl border border-ink/10 bg-white p-6">
            <p className="font-semibold text-ink">Galerii pole seadistatud</p>
            <p className="mt-1 text-sm text-ink/55">
              Puudub keskkonnamuutuja <code>PHOTO_MANIFEST_URL</code>.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
