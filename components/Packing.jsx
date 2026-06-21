"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/Icons";

const KEY = "packing:italy-2026";
const LS = "italy2026-packing";
const POLL_MS = 15000; // jagatud režiimis kontrolli uuendusi iga 15 s
const EDIT_GRACE_MS = 2500; // ära kirjuta üle värsket kohalikku muudatust

const snapOf = (checked, extras) => JSON.stringify({ checked, extras });

export default function Packing({ categories }) {
  // Vaikeesemed stabiilsete id-dega
  const defaultItems = useMemo(
    () =>
      categories.flatMap((c) =>
        c.items.map((label, i) => ({ id: `${c.id}:${i}`, cat: c.id, label }))
      ),
    [categories]
  );

  const [checked, setChecked] = useState({});
  const [extras, setExtras] = useState([]);
  const [mode, setMode] = useState("local"); // 'local' | 'shared'
  const [ready, setReady] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [draft, setDraft] = useState({ label: "", cat: categories[0].id });

  const saveTimer = useRef(null);
  const lastLocalWrite = useRef(0);
  const lastSnapshot = useRef(snapOf({}, []));
  const skipNextSave = useRef(false);
  const modeRef = useRef("local");

  const readLocal = () => {
    try {
      const raw = localStorage.getItem(LS);
      if (raw) {
        const d = JSON.parse(raw);
        return { checked: d.checked || {}, extras: d.extras || [] };
      }
    } catch {}
    return { checked: {}, extras: [] };
  };

  // ── Laadimine ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/checklist?key=${encodeURIComponent(KEY)}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (cancelled) return;
        if (json.configured) {
          setMode("shared");
          modeRef.current = "shared";
          const data = json.data || { ...readLocal() };
          skipNextSave.current = !json.data; // server tühi → tõsta local üles
          applyData(data, data.updatedAt || null);
        } else {
          const local = readLocal();
          skipNextSave.current = true;
          applyData(local, null);
        }
      } catch {
        if (cancelled) return;
        const local = readLocal();
        skipNextSave.current = true;
        applyData(local, null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyData = (data, ts) => {
    setChecked(data.checked || {});
    setExtras(data.extras || []);
    setUpdatedAt(ts);
    lastSnapshot.current = snapOf(data.checked || {}, data.extras || []);
  };

  // ── Salvestamine (localStorage kohe + server debounce'iga) ──
  useEffect(() => {
    if (!ready) return;
    const payload = { checked, extras };
    try {
      localStorage.setItem(LS, JSON.stringify(payload));
    } catch {}

    if (skipNextSave.current) {
      skipNextSave.current = false;
      lastSnapshot.current = snapOf(checked, extras);
      return;
    }

    lastLocalWrite.current = Date.now();
    lastSnapshot.current = snapOf(checked, extras);

    if (mode === "shared") {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          const res = await fetch("/api/checklist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: KEY, data: payload }),
          });
          const json = await res.json();
          if (json?.updatedAt) setUpdatedAt(json.updatedAt);
        } catch {}
      }, 600);
    }
  }, [checked, extras, mode, ready]);

  // ── Elav sünk: küsi serverilt fookusel ja perioodiliselt ──
  useEffect(() => {
    if (!ready || mode !== "shared") return;

    const refresh = async () => {
      if (document.visibilityState === "hidden") return;
      if (Date.now() - lastLocalWrite.current < EDIT_GRACE_MS) return; // ära katkesta toimetamist
      try {
        const res = await fetch(`/api/checklist?key=${encodeURIComponent(KEY)}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!json.configured || !json.data) return;
        const snap = snapOf(json.data.checked || {}, json.data.extras || []);
        if (snap === lastSnapshot.current) return; // muutusi pole
        skipNextSave.current = true;
        applyData(json.data, json.data.updatedAt || null);
      } catch {}
    };

    const id = setInterval(refresh, POLL_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, mode]);

  const allItems = useMemo(() => [...defaultItems, ...extras], [defaultItems, extras]);
  const total = allItems.length;
  const done = allItems.filter((it) => checked[it.id]).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const toggle = (id) =>
    setChecked((c) => {
      const next = { ...c };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });

  const addItem = (e) => {
    e.preventDefault();
    const label = draft.label.trim();
    if (!label) return;
    const id = `x:${Date.now()}`;
    setExtras((x) => [...x, { id, cat: draft.cat, label }]);
    setDraft((d) => ({ ...d, label: "" }));
  };

  const removeExtra = (id) => {
    setExtras((x) => x.filter((it) => it.id !== id));
    setChecked((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });
  };

  const reset = () => {
    setChecked({});
    setExtras([]);
  };

  const itemsByCat = (catId) => allItems.filter((it) => it.cat === catId);

  const updatedLabel =
    mode === "shared" && updatedAt
      ? new Date(updatedAt).toLocaleTimeString("et-EE", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  return (
    <div>
      {/* Progress + sync badge */}
      <div className="mb-8 rounded-3xl border border-ink/10 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-semibold text-ink">
              {done}
            </span>
            <span className="text-ink/50">/ {total} pakitud</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              title={
                mode === "shared"
                  ? "Salvestatud pilve — sünkroonib kõigi seadmete vahel."
                  : "Salvestatud sinu seadmesse. Ühenda Vercel KV, et jagada perede vahel."
              }
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                mode === "shared"
                  ? "bg-olive/15 text-olive"
                  : "bg-ink/8 text-ink/60"
              }`}
            >
              {mode === "shared" ? "☁ Sünkroonitud" : "▢ Selles seadmes"}
              {updatedLabel && (
                <span className="font-medium text-olive/70">· {updatedLabel}</span>
              )}
            </span>
            <button
              onClick={reset}
              className="rounded-full border border-ink/15 px-3 py-1 text-xs font-medium text-ink/60 transition hover:bg-ink/5"
            >
              Lähtesta
            </button>
          </div>
        </div>
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-ink/8">
          <div
            className="h-full rounded-full bg-gradient-to-r from-iseo via-garda to-olive transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Lisa oma ese */}
      <form
        onSubmit={addItem}
        className="mb-8 flex flex-col gap-2.5 rounded-2xl border border-dashed border-ink/20 bg-cream/40 p-3 sm:flex-row"
      >
        <input
          value={draft.label}
          onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
          placeholder="Lisa oma ese…"
          className="flex-1 rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-iseo"
        />
        <select
          value={draft.cat}
          onChange={(e) => setDraft((d) => ({ ...d, cat: e.target.value }))}
          className="rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-iseo"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition hover:opacity-90"
        >
          Lisa
        </button>
      </form>

      {/* Kategooriad */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const items = itemsByCat(cat.id);
          const catDone = items.filter((it) => checked[it.id]).length;
          return (
            <div
              key={cat.id}
              className="rounded-3xl border border-ink/10 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-bergamo-soft text-bergamo">
                  <Icon name={cat.icon} className="h-5 w-5" />
                </span>
                <h3 className="flex-1 font-display text-lg font-semibold text-ink">
                  {cat.title}
                </h3>
                <span className="text-xs font-medium text-ink/40">
                  {catDone}/{items.length}
                </span>
              </div>
              <ul className="space-y-1">
                {items.map((it) => {
                  const isChecked = !!checked[it.id];
                  const isExtra = it.id.startsWith("x:");
                  return (
                    <li key={it.id} className="group flex items-center gap-2">
                      <button
                        onClick={() => toggle(it.id)}
                        className="flex flex-1 items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition hover:bg-cream/60"
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                            isChecked
                              ? "border-olive bg-olive text-white"
                              : "border-ink/25 bg-white"
                          }`}
                        >
                          {isChecked && <Icon name="check" className="h-3 w-3" />}
                        </span>
                        <span
                          className={`text-sm transition ${
                            isChecked
                              ? "text-ink/40 line-through"
                              : "text-ink/80"
                          }`}
                        >
                          {it.label}
                        </span>
                      </button>
                      {isExtra && (
                        <button
                          onClick={() => removeExtra(it.id)}
                          className="shrink-0 rounded-md px-1.5 py-1 text-ink/30 opacity-0 transition hover:text-bergamo group-hover:opacity-100"
                          aria-label="Eemalda"
                          title="Eemalda"
                        >
                          ✕
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
