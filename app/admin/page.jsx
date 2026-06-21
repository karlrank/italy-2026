"use client";

import { useEffect, useState } from "react";
import { SECTIONS, SectionEditor } from "@/lib/editorSchema";

function Section({ title, hint, children, defaultOpen = false }) {
  return (
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-4">
        <span>
          <span className="font-display text-xl font-semibold text-ink">
            {title}
          </span>
          {hint && <span className="ml-2 text-xs text-ink/45">{hint}</span>}
        </span>
        <span className="text-ink/40 transition group-open:rotate-180">▾</span>
      </summary>
      <div className="border-t border-ink/10 p-6">{children}</div>
    </details>
  );
}

export default function AdminPage() {
  const [content, setContent] = useState(null);
  const [configured, setConfigured] = useState(true);
  const [status, setStatus] = useState("loading");

  const load = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/content", { cache: "no-store" });
      const json = await res.json();
      setConfigured(json.configured);
      setContent(json.content);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const set = (key, value) => setContent((c) => ({ ...c, [key]: value }));

  const save = async () => {
    setStatus("saving");
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      setStatus(res.ok ? "saved" : "error");
      if (res.ok) setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
    }
  };

  const reset = async () => {
    if (!confirm("Taasta kogu sisu vaikeväärtustele? See kustutab muudatused."))
      return;
    setStatus("saving");
    try {
      await fetch("/api/content", { method: "DELETE" });
      await load();
    } catch {
      setStatus("error");
    }
  };

  if (status === "loading" || !content) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-cream text-ink/50">
        Laen sisu…
      </main>
    );
  }

  const photoKeys = Object.keys(content.photos || {});

  return (
    <main className="bg-grain min-h-[100svh] bg-cream pb-32">
      <div className="border-b border-ink/10 bg-cream/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <div>
            <a href="/" className="text-sm font-medium text-ink/55 hover:text-ink">
              ← Tagasi lehele
            </a>
            <h1 className="font-display text-2xl font-semibold text-ink">
              Sisu haldus
            </h1>
          </div>
          <a
            href="/"
            className="hidden text-sm font-medium text-iseo hover:underline sm:block"
          >
            Vaata lehte
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-5 py-8">
        {!configured && (
          <div className="mb-6 rounded-2xl border border-sun/40 bg-sun/15 p-4 text-sm text-ink/80">
            <strong>Andmebaas pole ühendatud.</strong> Sa näed ja saad muuta
            sisu, aga <em>salvestamiseks</em> ühenda Vercelis KV-andmebaas (vt
            README). Ilma selleta jäävad muudatused salvestamata.
          </div>
        )}

        <div className="space-y-5">
          {SECTIONS.map((s) => (
            <Section
              key={s.key}
              title={s.title}
              hint={s.hint}
              defaultOpen={s.key === "trip"}
            >
              <SectionEditor
                section={s}
                value={content[s.key]}
                onChange={(v) => set(s.key, v)}
                photoKeys={photoKeys}
              />
            </Section>
          ))}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-5 py-3">
          <button
            onClick={reset}
            className="rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/60 transition hover:bg-ink/5"
          >
            Taasta vaikeväärtused
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-ink/50">
              {status === "saving" && "Salvestan…"}
              {status === "saved" && "✓ Salvestatud"}
              {status === "error" && "Viga salvestamisel"}
            </span>
            <button
              onClick={save}
              disabled={!configured || status === "saving"}
              className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream transition hover:opacity-90 disabled:opacity-40"
            >
              Salvesta
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
