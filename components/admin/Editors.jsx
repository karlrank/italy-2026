"use client";

// Üldotstarbelised redaktorikomponendid CMS-i jaoks.

const inputBase =
  "w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-iseo";

export function Field({ field, value, onChange }) {
  const v = value ?? "";
  const common = { className: inputBase, value: v };

  return (
    <label className="block">
      <span className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-wider text-ink/45">
        {field.label}
      </span>
      {field.type === "textarea" ? (
        <textarea
          {...common}
          rows={field.rows || 3}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === "select" ? (
        <select {...common} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {field.options.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>
              {o.label ?? o}
            </option>
          ))}
        </select>
      ) : field.type === "number" ? (
        <input
          {...common}
          type="number"
          step={field.step || "any"}
          placeholder={field.placeholder}
          onChange={(e) =>
            onChange(e.target.value === "" ? "" : Number(e.target.value))
          }
        />
      ) : (
        <input
          {...common}
          type="text"
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

export function ObjectFields({ fields, value, onChange, columns = 2 }) {
  const set = (key, v) => onChange({ ...value, [key]: v });
  return (
    <div
      className={`grid gap-3 ${
        columns === 2 ? "sm:grid-cols-2" : columns === 3 ? "sm:grid-cols-3" : ""
      }`}
    >
      {fields.map((f) => (
        <div
          key={f.key}
          className={f.type === "textarea" || f.full ? "sm:col-span-full" : ""}
        >
          <Field field={f} value={value?.[f.key]} onChange={(v) => set(f.key, v)} />
        </div>
      ))}
    </div>
  );
}

export function StringList({ label, items = [], onChange, placeholder }) {
  const update = (i, v) => {
    const next = [...items];
    next[i] = v;
    onChange(next);
  };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, ""]);

  return (
    <div>
      {label && (
        <span className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-wider text-ink/45">
          {label}
        </span>
      )}
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2">
            <input
              className={inputBase}
              value={it}
              placeholder={placeholder}
              onChange={(e) => update(i, e.target.value)}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="shrink-0 rounded-lg border border-ink/15 px-3 text-sm text-ink/50 transition hover:border-bergamo hover:text-bergamo"
              aria-label="Eemalda"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 rounded-lg border border-dashed border-ink/25 px-3 py-1.5 text-xs font-semibold text-ink/60 transition hover:border-iseo hover:text-iseo"
      >
        + Lisa rida
      </button>
    </div>
  );
}

// Nimekiri objektidest { id, label } — säilitab id-d (linnukeste jaoks)
export function LabeledList({ label, items = [], onChange, placeholder }) {
  const rid = () =>
    "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const update = (i, v) => {
    const next = items.map((it, idx) => (idx === i ? { ...it, label: v } : it));
    onChange(next);
  };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { id: rid(), label: "" }]);

  return (
    <div>
      {label && (
        <span className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-wider text-ink/45">
          {label}
        </span>
      )}
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={it.id || i} className="flex gap-2">
            <input
              className={inputBase}
              value={it.label || ""}
              placeholder={placeholder}
              onChange={(e) => update(i, e.target.value)}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="shrink-0 rounded-lg border border-ink/15 px-3 text-sm text-ink/50 transition hover:border-bergamo hover:text-bergamo"
              aria-label="Eemalda"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 rounded-lg border border-dashed border-ink/25 px-3 py-1.5 text-xs font-semibold text-ink/60 transition hover:border-iseo hover:text-iseo"
      >
        + Lisa rida
      </button>
    </div>
  );
}

export function ListEditor({
  items = [],
  fields,
  newItem,
  onChange,
  columns = 2,
  titleKey,
  renderExtra,
  addLabel = "+ Lisa",
}) {
  const updateItem = (i, v) => {
    const next = [...items];
    next[i] = v;
    onChange(next);
  };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () => onChange([...items, newItem()]);

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-2xl border border-ink/10 bg-cream/40 p-4"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-ink/70">
              {(titleKey && item?.[titleKey]) || `#${i + 1}`}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="rounded-md border border-ink/15 px-2 py-1 text-xs text-ink/50 transition hover:bg-ink/5 disabled:opacity-30"
                aria-label="Üles"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className="rounded-md border border-ink/15 px-2 py-1 text-xs text-ink/50 transition hover:bg-ink/5 disabled:opacity-30"
                aria-label="Alla"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="rounded-md border border-ink/15 px-2 py-1 text-xs font-semibold text-bergamo transition hover:bg-bergamo hover:text-white"
              >
                Kustuta
              </button>
            </div>
          </div>
          <ObjectFields
            fields={fields}
            value={item}
            columns={columns}
            onChange={(v) => updateItem(i, v)}
          />
          {renderExtra && (
            <div className="mt-3 border-t border-ink/10 pt-3">
              {renderExtra(item, (v) => updateItem(i, v))}
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="rounded-xl border border-dashed border-ink/30 px-4 py-2.5 text-sm font-semibold text-ink/65 transition hover:border-iseo hover:text-iseo"
      >
        {addLabel}
      </button>
    </div>
  );
}
