"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Lightbox from "@/components/gallery/Lightbox";
import {
  TIERS,
  tierOf,
  inTab,
  src,
  videoSrc,
  posterSrc,
  dayKey,
  prettyDay,
  clockOf,
} from "@/components/gallery/tiers";

const VIDEO_TAB = "v";

function Tile({ photo, base, level, tab, series, moved, onOpen }) {
  const t = tierOf(level);
  // A dot on every tile says nothing. Marking only the photos that rank higher
  // than the tab you are in makes the album's shape visible: in "Kõik" you can
  // see at a glance which frames made the album and which made the top.
  const standsOut = level > 0 && level < tab;
  return (
    <button
      onClick={onOpen}
      // Offscreen tiles are skipped entirely — the "Kõik" tab is 1700 of these
      style={{ contentVisibility: "auto" }}
      className={`group relative aspect-square overflow-hidden rounded-lg bg-ink/5 ${
        moved ? "ring-2 ring-sun/70" : ""
      }`}
      title={moved ? `${t.label} — käsitsi muudetud` : t.label}
    >
      <img
        src={src(base, "t", photo)}
        alt=""
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-cover transition duration-300 group-hover:scale-[1.04] ${
          level === 0 ? "opacity-65" : ""
        }`}
      />
      {standsOut && (
        <span
          className={`absolute left-1.5 top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-black/20 ${t.dot}`}
        />
      )}
      {series > 1 && (
        <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-sm">
          ⧉ {series}
        </span>
      )}
      {/* The judges' ranking, and only while the photo is still where they put it */}
      {photo.n && level === 1 && (
        <span className="absolute right-1.5 top-1.5 rounded-full bg-sun px-1.5 py-0.5 text-[10px] font-bold text-ink">
          #{photo.n}
        </span>
      )}
    </button>
  );
}

function DayHeading({ dayKey, title, count }) {
  return (
    <h3 className="mb-2.5 flex items-baseline gap-2">
      <span className="font-display text-xl font-semibold text-ink">
        {prettyDay(dayKey)}
      </span>
      {title && <span className="truncate text-sm text-ink/45">{title}</span>}
      <span className="ml-auto shrink-0 text-xs tabular-nums text-ink/35">
        {count}
      </span>
    </h3>
  );
}

function VideoCard({ video, base }) {
  const [play, setPlay] = useState(false);
  const mins = Math.floor(video.dur / 60);
  const secs = String(Math.round(video.dur % 60)).padStart(2, "0");
  return (
    <div className="relative aspect-square overflow-hidden rounded-lg bg-ink/5">
      {play ? (
        <video
          src={videoSrc(base, video)}
          poster={posterSrc(base, video)}
          controls
          autoPlay
          playsInline
          className="h-full w-full bg-black object-contain"
        />
      ) : (
        <button onClick={() => setPlay(true)} className="group h-full w-full">
          <img
            src={posterSrc(base, video)}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition group-hover:bg-black/70">
              ▶
            </span>
          </span>
          <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white/90">
            {mins}:{secs}
          </span>
        </button>
      )}
    </div>
  );
}

export default function Gallery({ dayTitles = {}, canEdit }) {
  const [manifest, setManifest] = useState(null);
  const [overrides, setOverrides] = useState({});
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [tab, setTab] = useState(2);
  const [day, setDay] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [viewer, setViewer] = useState(null); // { items, index }
  const undoRef = useRef(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [m, o] = await Promise.all([
          fetch("/api/photos/manifest").then((r) => {
            if (!r.ok) throw new Error(`manifest ${r.status}`);
            return r.json();
          }),
          fetch("/api/photos", { cache: "no-store" })
            .then((r) => r.json())
            .catch(() => ({ overrides: {} })),
        ]);
        if (!alive) return;
        setManifest(m);
        setOverrides(o.overrides || {});
        setStatus("ready");
      } catch (err) {
        if (!alive) return;
        setError(err.message);
        setStatus("error");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const seedLevels = useMemo(
    () => new Map((manifest?.photos || []).map((p) => [p.s, p.t])),
    [manifest]
  );

  // The pipeline's verdict, unless a human has since said otherwise
  const levelOf = useCallback(
    (stem) => overrides[stem] ?? seedLevels.get(stem) ?? 3,
    [overrides, seedLevels]
  );

  const byMoment = useMemo(() => {
    const m = new Map();
    for (const p of manifest?.photos || []) {
      if (!m.has(p.m)) m.set(p.m, []);
      m.get(p.m).push(p);
    }
    for (const list of m.values()) list.sort((a, b) => a.r - b.r);
    return m;
  }, [manifest]);

  const siblingsOf = useCallback((p) => byMoment.get(p.m) || [p], [byMoment]);

  const visible = useMemo(() => {
    if (!manifest) return [];
    return manifest.photos.filter((p) => inTab(levelOf(p.s), tab));
  }, [manifest, levelOf, tab]);

  const days = useMemo(() => {
    const counts = new Map();
    for (const p of visible) {
      const k = dayKey(p.d);
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
  }, [visible]);

  const shown = useMemo(
    () => (day ? visible.filter((p) => dayKey(p.d) === day) : visible),
    [visible, day]
  );

  // Both grids are chronological, so a day break is simply where the date
  // changes — no grouping pass needed.
  const byDay = (list) => {
    const g = [];
    for (const item of list) {
      const k = dayKey(item.d);
      if (!g.length || g[g.length - 1].key !== k) g.push({ key: k, items: [] });
      g[g.length - 1].items.push(item);
    }
    return g;
  };

  const groups = useMemo(() => byDay(shown), [shown]);

  // A tab switch can strand the open photo (moving it to tier 1 while looking
  // at "Välja jäetud"), so the viewer keeps its own list rather than an index
  // into the filtered one.
  const openAt = (list, photo) =>
    setViewer({ items: list, index: list.indexOf(photo) });

  // Reveals a photo the current filter hides — an alternate from a series —
  // without losing the sequence you were browsing.
  const openPhoto = (photo) => {
    setViewer((v) => {
      if (!v) return { items: [photo], index: 0 };
      const at = v.items.indexOf(photo);
      if (at >= 0) return { ...v, index: at };
      const items = [...v.items];
      items.splice(v.index + 1, 0, photo);
      return { items, index: v.index + 1 };
    });
  };

  const say = (text, undoable = false) => {
    setToast({ text, undoable });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 7000);
  };

  const merge = (delta) =>
    setOverrides((prev) => {
      const next = { ...prev };
      for (const [stem, level] of Object.entries(delta)) {
        if (level == null) delete next[stem];
        else next[stem] = level;
      }
      return next;
    });

  async function post(body) {
    const res = await fetch("/api/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "salvestamine ebaõnnestus");
    return json;
  }

  async function send(body, message) {
    setBusy(true);
    try {
      const json = await post(body);
      merge(json.overrides);
      if (json.applied.length) {
        // The server reports where each photo came from, which is all an undo
        // needs — no snapshot of the whole override set to keep in sync
        undoRef.current = json.applied.map((a) => ({
          stem: a.stem,
          level: a.from,
        }));
        say(message, true);
      }
    } catch (err) {
      say(`Ei õnnestunud: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  const setTier = (photo, level) =>
    send(
      { action: "setTier", stem: photo.s, level },
      level === 0 ? "Jäeti välja" : `Liigutatud: ${tierOf(level).label}`
    );

  const swap = (photo, other) =>
    send({ action: "swap", a: photo.s, b: other.s }, "Seeria valik vahetatud");

  const separate = (photo, other) =>
    send(
      { action: "separate", stem: other.s, level: levelOf(photo.s) },
      "Mõlemad kaadrid jäävad alles"
    );

  const resetSeries = (siblings) =>
    send(
      { action: "reset", stems: siblings.map((s) => s.s) },
      "Seeria taastatud masina valikule"
    );

  async function undo() {
    const changes = undoRef.current;
    if (!changes?.length) return;
    undoRef.current = null;
    setBusy(true);
    try {
      const json = await post({ action: "setMany", changes });
      merge(json.overrides);
      say("Tagasi võetud");
    } catch (err) {
      say(`Tagasivõtmine ebaõnnestus: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") {
    return (
      <p className="py-20 text-center text-sm text-ink/45">Laen pilte…</p>
    );
  }
  if (status === "error") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-ink/10 bg-white p-6 text-center">
        <p className="font-semibold text-ink">Galerii ei laadinud</p>
        <p className="mt-1 text-sm text-ink/55">{error}</p>
      </div>
    );
  }

  const { base, cams, stats } = manifest;
  const isVideo = tab === VIDEO_TAB;
  const videoDays = isVideo
    ? [
        ...manifest.videos.reduce((m, v) => {
          const k = dayKey(v.d);
          return m.set(k, (m.get(k) || 0) + 1);
        }, new Map()),
      ].sort((a, b) => (a[0] < b[0] ? -1 : 1))
    : [];
  const videos = day
    ? manifest.videos.filter((v) => dayKey(v.d) === day)
    : manifest.videos;

  const counts = TIERS.reduce((acc, t) => {
    acc[t.level] = manifest.photos.filter((p) =>
      inTab(levelOf(p.s), t.level)
    ).length;
    return acc;
  }, {});

  return (
    <div>
      {/* Tiers */}
      <div className="sticky top-16 z-30 -mx-5 mb-5 border-b border-ink/8 bg-cream/85 px-5 py-3 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-1.5">
          {TIERS.map((t) => (
            <button
              key={t.level}
              onClick={() => {
                setTab(t.level);
                setDay("");
              }}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                tab === t.level
                  ? "bg-ink text-cream"
                  : "text-ink/65 hover:bg-ink/5 hover:text-ink"
              }`}
            >
              {t.label}
              <span className="ml-1.5 text-xs opacity-55 tabular-nums">
                {counts[t.level]}
              </span>
            </button>
          ))}
          <button
            onClick={() => {
              setTab(VIDEO_TAB);
              setDay("");
            }}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              isVideo ? "bg-ink text-cream" : "text-ink/65 hover:bg-ink/5"
            }`}
          >
            Videod
            <span className="ml-1.5 text-xs opacity-55 tabular-nums">
              {stats.videos}
            </span>
          </button>
        </div>

        {/* Days */}
        <div className="-mx-1 mt-2 flex gap-1 overflow-x-auto px-1">
          <button
            onClick={() => setDay("")}
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition ${
              day === "" ? "bg-ink/10 text-ink" : "text-ink/45 hover:text-ink"
            }`}
          >
            Kõik päevad
          </button>
          {(isVideo ? videoDays : days).map(([k, n]) => (
            <button
              key={k}
              onClick={() => setDay(day === k ? "" : k)}
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                day === k ? "bg-ink/10 text-ink" : "text-ink/45 hover:text-ink"
              }`}
            >
              {prettyDay(k)}
              <span className="ml-1 opacity-55 tabular-nums">{n}</span>
            </button>
          ))}
        </div>
      </div>

      {!isVideo && (
        <p className="mb-4 text-sm text-ink/50">
          {tierOf(tab).blurb}
          {canEdit && (
            <span className="ml-1.5 text-ink/35">
              · ava pilt, et selle taset muuta
            </span>
          )}
        </p>
      )}

      {isVideo
        ? byDay(videos).map((g) => (
            <section key={g.key} className="mb-8">
              <DayHeading
                dayKey={g.key}
                title={dayTitles[g.key]}
                count={g.items.length}
              />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {g.items.map((v) => (
                  <VideoCard key={v.s} video={v} base={base} />
                ))}
              </div>
            </section>
          ))
        : groups.map((g) => (
          <section key={g.key} className="mb-8">
            <DayHeading
              dayKey={g.key}
              title={dayTitles[g.key]}
              count={g.items.length}
            />
            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {g.items.map((p) => (
                <Tile
                  key={p.s}
                  photo={p}
                  base={base}
                  level={levelOf(p.s)}
                  tab={tab}
                  series={siblingsOf(p).length}
                  moved={overrides[p.s] != null}
                  onOpen={() => openAt(shown, p)}
                />
              ))}
            </div>
          </section>
        ))}

      {!isVideo && !shown.length && (
        <p className="py-16 text-center text-sm text-ink/45">
          Selles vaates pilte pole.
        </p>
      )}

      {viewer && (
        <Lightbox
          items={viewer.items}
          index={viewer.index}
          setIndex={(fn) =>
            setViewer((v) => ({
              ...v,
              index: typeof fn === "function" ? fn(v.index) : fn,
            }))
          }
          onClose={() => setViewer(null)}
          base={base}
          cams={cams}
          levelOf={levelOf}
          siblingsOf={siblingsOf}
          dayTitles={dayTitles}
          canEdit={canEdit}
          busy={busy}
          onSetTier={setTier}
          onSwap={swap}
          onSeparate={separate}
          onResetSeries={resetSeries}
          onOpenPhoto={openPhoto}
        />
      )}

      {toast && (
        <div className="fixed inset-x-0 bottom-4 z-[110] flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-full bg-ink px-4 py-2.5 text-sm text-cream shadow-lg">
            <span>{toast.text}</span>
            {toast.undoable && (
              <button
                onClick={undo}
                disabled={busy}
                className="font-semibold text-sun underline underline-offset-2 disabled:opacity-40"
              >
                Võta tagasi
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
