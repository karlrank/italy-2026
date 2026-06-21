"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/Icons";

const CHECK_KEY = "packing:italy-2026"; // linnukeste salvestusvõti (KV)
const LS = "italy2026-packing-checked"; // kohalik varuvariant
const POLL_MS = 15000;
const EDIT_GRACE_MS = 2500;

export default function Packing({ categories }) {
  const [cats, setCats] = useState(categories || []);
  const [checked, setChecked] = useState({});
  const [mode, setMode] = useState("local"); // 'local' | 'shared'
  const [ready, setReady] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [draft, setDraft] = useState({
    label: "",
    cat: categories?.[0]?.id || "",
  });
  const [busy, setBusy] = useState(false);

  const saveTimer = useRef(null);
  const lastLocalWrite = useRef(0);
  const lastSnap = useRef("");

  const editable = mode === "shared";

  const readLocal = () => {
    try {
      const raw = localStorage.getItem(LS);
      if (raw) return JSON.parse(raw).checked || {};
    } catch {}
    return {};
  };

  // ── Laadimine: linnukesed + värsked kategooriad ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // linnukesed
      try {
        const res = await fetch(
          `/api/checklist?key=${encodeURIComponent(CHECK_KEY)}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (cancelled) return;
        if (json.configured) {
          setMode("shared");
          const c = json.data?.checked || readLocal();
          setChecked(c);
          setUpdatedAt(json.data?.updatedAt || null);
          lastSnap.current = JSON.stringify(c);
        } else {
          const c = readLocal();
          setChecked(c);
          lastSnap.current = JSON.stringify(c);
        }
      } catch {
        const c = readLocal();
        setChecked(c);
        lastSnap.current = JSON.stringify(c);
      }
      // värsked kategooriad CMS-ist
      try {
        const res = await fetch("/api/packing", { cache: "no-store" });
        const json = await res.json();
        if (!cancelled && Array.isArray(json.categories)) setCats(json.categories);
      } catch {}
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Linnukeste salvestamine ──
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(LS, JSON.stringify({ checked }));
    } catch {}
    if (mode !== "shared") return;

    lastLocalWrite.current = Date.now();
    lastSnap.current = JSON.stringify(checked);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/checklist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: CHECK_KEY, data: { checked } }),
        });
        const json = await res.json();
        if (json?.updatedAt) setUpdatedAt(json.updatedAt);
      } catch {}
    }, 600);
  }, [checked, mode, ready]);

  // ── Elav sünk (jagatud režiim) ──
  useEffect(() => {
    if (!ready || mode !== "shared") return;
    const refresh = async () => {
      if (document.visibilityState === "hidden") return;
      // kategooriad
      try {
        const r = await fetch("/api/packing", { cache: "no-store" });
        const j = await r.json();
        if (Array.isArray(j.categories)) setCats(j.categories);
      } catch {}
      // linnukesed (ära katkesta värsket toimetamist)
      if (Date.now() - lastLocalWrite.current < EDIT_GRACE_MS) return;
      try {
        const r = await fetch(
          `/api/checklist?key=${encodeURIComponent(CHECK_KEY)}`,
          { cache: "no-store" }
        );
        const j = await r.json();
        if (!j.data) return;
        const snap = JSON.stringify(j.data.checked || {});
        if (snap === lastSnap.current) return;
        lastSnap.current = snap;
        setChecked(j.data.checked || {});
        setUpdatedAt(j.data.updatedAt || null);
      } catch {}
    };
    const id = setInterval(refresh, POLL_MS);
    const onVis = () => document.visibilityState === "visible" && refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [ready, mode]);

  const allItems = useMemo(() => cats.flatMap((c) => c.items || []), [cats]);
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

  const addItem = async (e) => {
    e.preventDefault();
    const label = draft.label.trim();
    if (!label || !draft.cat || !editable || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/packing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", catId: draft.cat, label }),
      });
      const json = await res.json();
      if (json.ok && Array.isArray(json.categories)) {
        setCats(json.categories);
        setDraft((d) => ({ ...d, label: "" }));
      }
    } catch {}
    setBusy(false);
  };

  const removeItem = async (catId, itemId) => {
    if (!editable || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/packing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", catId, itemId }),
      });
      const json = await res.json();
      if (json.ok && Array.isArray(json.categories)) {
        setCats(json.categories);
        setChecked((c) => {
          const next = { ...c };
          delete next[itemId];
          return next;
        });
      }
    } catch {}
    setBusy(false);
  };

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
          <span
            title={
              mode === "shared"
                ? "Esemed ja linnukesed sünkroonivad kõigi seadmete vahel."
                : "Linnukesed salvestatakse sinu seadmesse. Ühenda Vercel KV, et nimekirja jagada ja muuta."
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
        </div>
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-ink/8">
          <div
            className="h-full rounded-full bg-gradient-to-r from-iseo via-garda to-olive transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Lisa oma ese — ainult jagatud (CMS) režiimis */}
      {editable ? (
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
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition hover:opacity-90 disabled:opacity-40"
          >
            Lisa
          </button>
        </form>
      ) : (
        <p className="mb-8 rounded-2xl border border-dashed border-ink/15 bg-cream/40 p-3 text-center text-xs text-ink/50">
          Esemete lisamiseks ja muutmiseks ühenda Vercel KV (vt README). Linnukesed
          töötavad ka praegu.
        </p>
      )}

      {/* Kategooriad */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {cats.map((cat) => {
          const items = cat.items || [];
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
                            isChecked ? "text-ink/40 line-through" : "text-ink/80"
                          }`}
                        >
                          {it.label}
                        </span>
                      </button>
                      {editable && (
                        <button
                          onClick={() => removeItem(cat.id, it.id)}
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
