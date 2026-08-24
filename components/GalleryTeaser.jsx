import Link from "next/link";
import { getManifest, galleryConfigured, getOverrides } from "@/lib/photos";
import { src } from "@/components/gallery/tiers";
import Reveal from "@/components/Reveal";

// The front page's window into the album: the best-of row, plus the way in.
// Renders nothing at all if the gallery is not configured or the manifest is
// unreachable — the trip page must never fail over photos.
export default async function GalleryTeaser() {
  if (!galleryConfigured) return null;

  let manifest, overrides;
  try {
    [manifest, overrides] = await Promise.all([getManifest(), getOverrides()]);
  } catch {
    return null;
  }
  if (!manifest?.photos?.length) return null;

  const levelOf = (p) => overrides[p.s] ?? p.t;
  const best = manifest.photos
    .filter((p) => levelOf(p) === 1)
    .sort((a, b) => (a.n || 99) - (b.n || 99))
    .slice(0, 8);
  if (!best.length) return null;

  return (
    <section id="pildid" className="mx-auto max-w-6xl px-5 py-24 md:py-32">
      <Reveal className="mx-auto mb-10 max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-bergamo">
          Reisipildid
        </span>
        <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-ink md:text-5xl">
          {manifest.stats.total.toLocaleString("et-EE")} kaadrit, kolmes tasemes
        </h2>
        <p className="mt-4 text-ink/65 md:text-lg">
          Tipphetkedest terve albumini. Jaotuse tegi masin — sina saad iga pildi
          ümber tõsta ja seeriatest teise kaadri valida.
        </p>
      </Reveal>

      <Reveal>
        <Link
          href="/galerii"
          className="group grid grid-cols-2 gap-1.5 sm:grid-cols-4"
        >
          {best.map((p, i) => (
            <div
              key={p.s}
              className={`relative aspect-square overflow-hidden rounded-xl bg-ink/5 ${
                i >= 4 ? "hidden sm:block" : ""
              }`}
            >
              <img
                src={src(manifest.base, "t", p)}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            </div>
          ))}
        </Link>
      </Reveal>

      <div className="mt-8 text-center">
        <Link
          href="/galerii"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-ink/85"
        >
          Ava galerii
          <span aria-hidden="true">→</span>
        </Link>
        <p className="mt-3 text-xs text-ink/40">
          {manifest.stats.moments.toLocaleString("et-EE")} hetke ·{" "}
          {manifest.stats.videos} videot
        </p>
      </div>
    </section>
  );
}
