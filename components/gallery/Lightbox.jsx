"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  TIERS,
  tierOf,
  src,
  prettyDay,
  clockOf,
  dayKey,
} from "@/components/gallery/tiers";

const mapsHref = (g) => `https://www.google.com/maps?q=${g[0]},${g[1]}`;

// A 2560px frame is ~1.4 MB; only worth fetching where it can actually be seen.
// Measured after mount, never during render — a phone and a desktop must not
// disagree about what the first paint contains.
function useWantsLarge() {
  const [want, setWant] = useState(false);
  useEffect(() => {
    setWant(window.innerWidth * (window.devicePixelRatio || 1) > 1100);
  }, []);
  return want;
}

function TierPicker({ level, onPick, disabled }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {TIERS.map((t) => {
        const on = t.level === level;
        return (
          <button
            key={t.level}
            onClick={() => onPick(t.level)}
            disabled={disabled}
            title={`${t.label} — ${t.blurb}`}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-40 ${
              on
                ? "bg-white text-ink shadow"
                : "bg-white/10 text-white/75 hover:bg-white/20"
            }`}
          >
            <span
              className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle ${t.dot}`}
            />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function Series({ photo, siblings, levelOf, base, onOpen, onSwap, onSeparate, onReset, busy }) {
  const [target, setTarget] = useState(null);
  const alt = siblings.filter((s) => s.s !== photo.s);
  if (!alt.length) return null;

  const chosen = alt.find((s) => s.s === target) || null;
  const myLevel = levelOf(photo.s);

  return (
    <div className="border-t border-white/10 pt-3">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
          Seeria · {siblings.length} kaadrit
        </p>
        <button
          onClick={onReset}
          disabled={busy}
          className="text-xs text-white/45 underline underline-offset-2 hover:text-white/80 disabled:opacity-40"
        >
          Taasta masina valik
        </button>
      </div>
      <p className="mb-2.5 text-xs leading-relaxed text-white/45">
        Need kaadrid on peaaegu ühesugused, nii et albumisse võeti neist üks.
        Vali mõni teine — või lase kahel eraldi seista.
      </p>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {siblings.map((s) => {
          const lv = levelOf(s.s);
          const t = tierOf(lv);
          const isSelf = s.s === photo.s;
          const isTarget = s.s === target;
          return (
            <button
              key={s.s}
              onClick={() => (isSelf ? null : setTarget(isTarget ? null : s.s))}
              onDoubleClick={() => onOpen(s)}
              className={`relative shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                isSelf
                  ? "ring-white"
                  : isTarget
                    ? "ring-sun"
                    : "ring-transparent hover:ring-white/40"
              }`}
              title={isSelf ? "Praegu vaatad seda" : s.s}
            >
              <img
                src={src(base, "t", s)}
                alt=""
                loading="lazy"
                className={`h-20 w-20 object-cover ${lv === 0 ? "opacity-55" : ""}`}
              />
              <span
                className={`absolute bottom-1 left-1 h-2 w-2 rounded-full ring-1 ring-black/40 ${t.dot}`}
              />
              {isSelf && (
                <span className="absolute inset-x-0 bottom-0 bg-black/55 py-0.5 text-[10px] font-semibold text-white">
                  praegu
                </span>
              )}
            </button>
          );
        })}
      </div>

      {chosen && (
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              onSwap(chosen);
              setTarget(null);
            }}
            disabled={busy}
            className="rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-ink disabled:opacity-40"
          >
            Vaheta selle vastu
          </button>
          <button
            onClick={() => {
              onSeparate(chosen);
              setTarget(null);
            }}
            disabled={busy || myLevel === 0 || levelOf(chosen.s) === myLevel}
            className="rounded-full bg-white/12 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white/22 disabled:opacity-40"
          >
            Hoia mõlemat
          </button>
          <button
            onClick={() => onOpen(chosen)}
            className="text-xs text-white/55 underline underline-offset-2 hover:text-white"
          >
            Vaata suurelt
          </button>
        </div>
      )}
    </div>
  );
}

export default function Lightbox({
  items,
  index,
  setIndex,
  onClose,
  base,
  cams,
  levelOf,
  siblingsOf,
  dayTitles,
  canEdit,
  busy,
  onSetTier,
  onSwap,
  onSeparate,
  onResetSeries,
  onOpenPhoto,
}) {
  const [info, setInfo] = useState(false);
  const [hi, setHi] = useState(false); // the 2560px version has arrived
  const bigScreen = useWantsLarge();
  const touch = useRef(null);
  const photo = items[index];

  const go = useCallback(
    (d) => {
      setIndex((i) => (i + d + items.length) % items.length);
    },
    [items.length, setIndex]
  );

  useEffect(() => setHi(false), [photo?.s]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") return onClose();
      if (e.key === "ArrowRight") return go(1);
      if (e.key === "ArrowLeft") return go(-1);
      if (e.key === "i") return setInfo((v) => !v);
      if (canEdit && ["0", "1", "2", "3"].includes(e.key)) {
        onSetTier(photo, Number(e.key));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose, onSetTier, photo, canEdit]);

  // Neighbours are almost always where the next click goes
  useEffect(() => {
    for (const d of [1, -1]) {
      const n = items[(index + d + items.length) % items.length];
      if (n) new Image().src = src(base, "m", n);
    }
  }, [index, items, base]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!photo) return null;

  const level = levelOf(photo.s);
  const siblings = siblingsOf(photo);
  const day = dayKey(photo.d);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-ink/97 backdrop-blur-sm"
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current == null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-white/70">
        <div className="min-w-0 text-xs">
          <span className="font-semibold text-white/90">{prettyDay(day)}</span>
          <span className="mx-1.5 text-white/30">·</span>
          {clockOf(photo.d)}
          {dayTitles[day] && (
            <span className="ml-2 hidden truncate text-white/45 sm:inline">
              {dayTitles[day]}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="mr-1 text-xs tabular-nums text-white/45">
            {index + 1}/{items.length}
          </span>
          <button
            onClick={() => setInfo((v) => !v)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              info ? "bg-white text-ink" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            Info
          </button>
          <button
            onClick={onClose}
            aria-label="Sulge"
            className="rounded-full bg-white/10 px-3 py-1.5 text-sm leading-none hover:bg-white/20"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2">
        <img
          key={photo.s}
          src={src(base, "m", photo)}
          alt={photo.y || photo.s}
          className="max-h-full max-w-full object-contain"
          style={{ aspectRatio: `${photo.w} / ${photo.h}` }}
        />
        {/* Quietly swap in the 2560px frame on screens that can show it */}
        {bigScreen && (
          <img
            src={src(base, "l", photo)}
            alt=""
            aria-hidden="true"
            onLoad={() => setHi(true)}
            className={`absolute inset-0 m-auto max-h-full max-w-full object-contain transition-opacity duration-200 ${
              hi ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {items.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Eelmine"
              className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-3 text-white/80 backdrop-blur transition hover:bg-black/60 hover:text-white"
            >
              ‹
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Järgmine"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-3 text-white/80 backdrop-blur transition hover:bg-black/60 hover:text-white"
            >
              ›
            </button>
          </>
        )}
      </div>

      <div className="max-h-[52vh] shrink-0 overflow-y-auto border-t border-white/10 bg-black/30 px-4 py-3">
        {photo.y && (
          <p className="mb-3 border-l-2 border-sun/70 pl-3 text-sm italic leading-relaxed text-white/75">
            {photo.y}
          </p>
        )}
        {photo.x && (
          <p className="mb-3 text-xs text-white/45">
            Masin jättis välja: <span className="text-white/70">{photo.x}</span>
          </p>
        )}

        {canEdit ? (
          <TierPicker
            level={level}
            onPick={(l) => onSetTier(photo, l)}
            disabled={busy}
          />
        ) : (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${tierOf(level).chip}`}
          >
            {tierOf(level).label}
          </span>
        )}

        {info && (
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-white/55 sm:grid-cols-4">
            <div>
              <dt className="text-white/35">Fail</dt>
              <dd className="truncate text-white/80">{photo.s}</dd>
            </div>
            <div>
              <dt className="text-white/35">Kaamera</dt>
              <dd className="truncate text-white/80">{cams[photo.c]}</dd>
            </div>
            <div>
              <dt className="text-white/35">Suurus</dt>
              <dd className="text-white/80">
                {photo.w}×{photo.h}
              </dd>
            </div>
            <div>
              <dt className="text-white/35">Hinne</dt>
              <dd className="text-white/80">{photo.q}</dd>
            </div>
            {photo.g && (
              <div className="col-span-2">
                <dt className="text-white/35">Asukoht</dt>
                <dd>
                  <a
                    href={mapsHref(photo.g)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white/80 underline underline-offset-2"
                  >
                    {photo.g[0].toFixed(4)}, {photo.g[1].toFixed(4)}
                  </a>
                </dd>
              </div>
            )}
            <div className="col-span-2">
              <dt className="text-white/35">Originaalsuuruses</dt>
              <dd>
                <a
                  href={src(base, "l", photo)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/80 underline underline-offset-2"
                >
                  ava 2560px kaader
                </a>
              </dd>
            </div>
          </dl>
        )}

        {siblings.length > 1 && (
          <div className="mt-3">
            <Series
              photo={photo}
              siblings={siblings}
              levelOf={levelOf}
              base={base}
              busy={busy || !canEdit}
              onOpen={onOpenPhoto}
              onSwap={(other) => onSwap(photo, other)}
              onSeparate={(other) => onSeparate(photo, other)}
              onReset={() => onResetSeries(siblings)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
