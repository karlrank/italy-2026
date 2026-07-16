"use client";

import { useEffect, useState } from "react";

// Edit history for the CMS: lists content snapshots (each one is the state
// BEFORE an edit), shows a per-field diff of what that edit changed, and
// can restore any snapshot. Restores are themselves snapshotted → undoable.

const ACTION_LABEL = {
  save: "muutmine",
  restore: "taastamine",
  reset: "lähtestamine",
  packing: "pakkeleht",
};

// Flatten a document to path → value. Array items with an id are keyed by
// it, so inserting an item doesn't shift every later path in the diff.
function flatten(v, path, out) {
  if (v === null || typeof v !== "object") {
    out[path] = v;
    return;
  }
  if (Array.isArray(v)) {
    if (!v.length) {
      out[path] = "[]";
      return;
    }
    v.forEach((item, i) => {
      const seg =
        item && typeof item === "object" && !Array.isArray(item) && item.id
          ? `[${item.id}]`
          : `[${i}]`;
      flatten(item, path + seg, out);
    });
    return;
  }
  const keys = Object.keys(v);
  if (!keys.length) {
    out[path] = "{}";
    return;
  }
  for (const k of keys) flatten(v[k], path ? `${path}.${k}` : k, out);
}

function diffDocs(oldDoc, newDoc) {
  const a = {};
  const b = {};
  flatten(oldDoc ?? {}, "", a);
  flatten(newDoc ?? {}, "", b);
  const paths = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
  const rows = [];
  for (const p of paths) {
    const inA = p in a;
    const inB = p in b;
    if (inA && inB && Object.is(a[p], b[p])) continue;
    rows.push({
      path: p,
      from: inA ? a[p] : undefined,
      to: inB ? b[p] : undefined,
      kind: !inA ? "added" : !inB ? "removed" : "changed",
    });
  }
  return rows;
}

const fmtTs = (ts) =>
  new Date(ts).toLocaleString("et-EE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

function Val({ v, tone }) {
  if (v === undefined) return null;
  const s = typeof v === "string" ? v : JSON.stringify(v);
  const short = s.length > 120 ? s.slice(0, 120) + "…" : s;
  return (
    <span title={s} className={`break-all ${tone}`}>
      {short === "" ? "∅" : short}
    </span>
  );
}

export default function History({ onRestored }) {
  const [entries, setEntries] = useState(null); // null = loading
  const [openTs, setOpenTs] = useState(null);
  const [diffs, setDiffs] = useState({}); // ts → rows | "loading" | "error"
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/content?backups=1", { cache: "no-store" });
      const json = await res.json();
      setEntries(json.backups || []);
    } catch {
      setEntries([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const fetchDoc = async (ts) => {
    const res = await fetch(
      ts ? `/api/content?backup=${ts}` : "/api/content",
      { cache: "no-store" }
    );
    const json = await res.json();
    return ts ? json.doc : json.content;
  };

  // The change made by the edit at entry i = snapshot i → the next-newer
  // state (the following snapshot, or the live content for the newest one)
  const showDiff = async (i) => {
    const ts = entries[i].ts;
    if (openTs === ts) {
      setOpenTs(null);
      return;
    }
    setOpenTs(ts);
    if (diffs[ts]) return;
    setDiffs((d) => ({ ...d, [ts]: "loading" }));
    try {
      const [older, newer] = await Promise.all([
        fetchDoc(ts),
        fetchDoc(i > 0 ? entries[i - 1].ts : null),
      ]);
      setDiffs((d) => ({ ...d, [ts]: diffDocs(older, newer) }));
    } catch {
      setDiffs((d) => ({ ...d, [ts]: "error" }));
    }
  };

  const restore = async (ts) => {
    if (
      !confirm(
        `Taasta sisu seisuga ${fmtTs(ts)}? Praegune seis salvestatakse enne varukoopiana.`
      )
    )
      return;
    setBusy(true);
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restore: ts }),
      });
      if (res.ok) {
        setDiffs({});
        setOpenTs(null);
        await load();
        onRestored?.();
      }
    } catch {}
    setBusy(false);
  };

  if (entries === null)
    return <p className="text-sm text-ink/45">Laen ajalugu…</p>;
  if (!entries.length)
    return (
      <p className="text-sm text-ink/45">
        Varukoopiaid pole veel — need tekivad igal salvestamisel.
      </p>
    );

  return (
    <div className="space-y-2">
      <p className="text-xs text-ink/45">
        Iga kirje on sisu seis <em>enne</em> vastavat muudatust. Alles hoitakse
        viimased 20 (kuni 30 päeva). Taastamine on samuti tagasivõetav.
      </p>
      <ul className="divide-y divide-ink/8">
        {entries.map((e, i) => {
          const rows = diffs[e.ts];
          const open = openTs === e.ts;
          return (
            <li key={e.ts} className="py-2.5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-mono text-sm font-medium text-ink">
                  {fmtTs(e.ts)}
                </span>
                <span className="rounded-full bg-ink/8 px-2 py-0.5 text-xs font-medium text-ink/60">
                  {ACTION_LABEL[e.by?.action] || e.by?.action || "muutmine"}
                </span>
                <span className="text-xs text-ink/50">
                  {e.by?.device || "tundmatu seade"}
                  {e.by?.ip && <span className="text-ink/35"> · {e.by.ip}</span>}
                </span>
                <span className="ml-auto flex gap-2">
                  <button
                    onClick={() => showDiff(i)}
                    className="rounded-full border border-ink/15 px-3 py-1 text-xs font-medium text-ink/60 transition hover:bg-ink/5"
                  >
                    {open ? "Peida" : "Muudatused"}
                  </button>
                  <button
                    onClick={() => restore(e.ts)}
                    disabled={busy}
                    className="rounded-full border border-bergamo/30 px-3 py-1 text-xs font-medium text-bergamo transition hover:bg-bergamo-soft disabled:opacity-40"
                  >
                    Taasta
                  </button>
                </span>
              </div>

              {open && (
                <div className="mt-2 rounded-2xl bg-cream/60 p-3">
                  {rows === "loading" && (
                    <p className="text-xs text-ink/45">Võrdlen…</p>
                  )}
                  {rows === "error" && (
                    <p className="text-xs text-bergamo">Võrdlus ebaõnnestus.</p>
                  )}
                  {Array.isArray(rows) && !rows.length && (
                    <p className="text-xs text-ink/45">
                      Sisu ei muutunud (identne järgmise seisuga).
                    </p>
                  )}
                  {Array.isArray(rows) && rows.length > 0 && (
                    <>
                      <p className="mb-2 text-xs font-medium text-ink/55">
                        {rows.length} muudetud välja
                      </p>
                      <div className="max-h-80 space-y-1.5 overflow-y-auto text-xs">
                        {rows.map((r) => (
                          <div key={r.path} className="rounded-lg bg-white p-2">
                            <span className="font-mono text-[11px] text-ink/45">
                              {r.path}
                            </span>
                            <div className="mt-0.5 flex flex-col gap-0.5">
                              {r.kind !== "added" && (
                                <Val
                                  v={r.from}
                                  tone="text-bergamo/80 line-through"
                                />
                              )}
                              {r.kind !== "removed" && (
                                <Val v={r.to} tone="text-olive" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
