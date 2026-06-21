"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { sectionByKey, SectionEditor } from "@/lib/editorSchema";

const EditCtx = createContext({ canEdit: false, editMode: false });
export const useEdit = () => useContext(EditCtx);

export function EditProvider({ canEdit, children }) {
  const [editMode, setEditMode] = useState(false);
  const [openKey, setOpenKey] = useState(null);

  return (
    <EditCtx.Provider value={{ canEdit, editMode, setEditMode, openKey, setOpenKey }}>
      {children}
      {canEdit && (
        <button
          onClick={() => setEditMode((v) => !v)}
          className={`fixed bottom-5 right-5 z-[70] flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-lg transition ${
            editMode
              ? "bg-olive text-white"
              : "bg-ink text-cream hover:opacity-90"
          }`}
        >
          {editMode ? "✓ Valmis" : "✎ Muuda sisu"}
        </button>
      )}
      {openKey && (
        <EditModal sectionKey={openKey} onClose={() => setOpenKey(null)} />
      )}
    </EditCtx.Provider>
  );
}

export function EditButton({ section, label }) {
  const { canEdit, editMode, setOpenKey } = useEdit();
  if (!canEdit || !editMode) return null;
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpenKey(section);
      }}
      title={label || "Muuda"}
      aria-label={label || "Muuda"}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-ink/15 bg-white/90 text-sm text-ink/60 shadow-sm transition hover:border-iseo hover:text-iseo"
    >
      ✎
    </button>
  );
}

function EditModal({ sectionKey, onClose }) {
  const router = useRouter();
  const section = sectionByKey(sectionKey);
  const [content, setContent] = useState(null);
  const [draft, setDraft] = useState(null);
  const [status, setStatus] = useState("loading"); // loading|idle|saving|error|noconf

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/content", { cache: "no-store" });
        const json = await res.json();
        if (cancelled) return;
        setContent(json.content);
        setDraft(json.content[sectionKey]);
        setStatus(json.configured ? "idle" : "noconf");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sectionKey]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = async () => {
    setStatus("saving");
    try {
      const next = { ...content, [sectionKey]: draft };
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: next }),
      });
      if (res.ok) {
        router.refresh();
        onClose();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const photoKeys = content ? Object.keys(content.photos || {}) : [];

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-ink/50 p-4 backdrop-blur-sm sm:p-8">
      <div
        className="my-auto w-full max-w-3xl rounded-3xl border border-ink/10 bg-cream shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <h2 className="font-display text-xl font-semibold text-ink">
            Muuda: {section?.title}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink/50 transition hover:bg-ink/5"
            aria-label="Sulge"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          {status === "loading" && <p className="text-ink/50">Laen…</p>}
          {status === "error" && content == null && (
            <p className="text-bergamo">Sisu laadimine ebaõnnestus.</p>
          )}
          {status === "noconf" && (
            <div className="mb-4 rounded-2xl border border-sun/40 bg-sun/15 p-3 text-sm text-ink/80">
              Andmebaas pole ühendatud — muudatusi ei saa salvestada. Ühenda
              Vercel KV (vt README).
            </div>
          )}
          {draft !== null && (
            <SectionEditor
              section={section}
              value={draft}
              onChange={setDraft}
              photoKeys={photoKeys}
            />
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-ink/10 px-6 py-4">
          <span className="text-sm text-ink/50">
            {status === "saving" && "Salvestan…"}
            {status === "error" && content != null && "Viga salvestamisel"}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/60 transition hover:bg-ink/5"
            >
              Tühista
            </button>
            <button
              onClick={save}
              disabled={status === "saving" || status === "noconf" || draft === null}
              className="rounded-full bg-ink px-6 py-2 text-sm font-semibold text-cream transition hover:opacity-90 disabled:opacity-40"
            >
              Salvesta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
