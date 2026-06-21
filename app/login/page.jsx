"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";

function safeNext() {
  if (typeof window === "undefined") return "/";
  const n = new URLSearchParams(window.location.search).get("next") || "/";
  // Luba ainult sama-saidi suhtelised teed
  return n.startsWith("/") && !n.startsWith("//") ? n : "/";
}

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.replace(safeNext());
      } else {
        setError(true);
        setPassword("");
        setLoading(false);
      }
    } catch {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <main className="bg-grain relative flex min-h-[100svh] items-center justify-center overflow-hidden px-5">
      {/* sky + blobs */}
      <div className="absolute inset-0 bg-gradient-to-b from-iseo-soft via-cream to-cream" />
      <div className="shimmer absolute -right-10 top-16 h-72 w-72 rounded-full bg-gradient-to-br from-sun to-bergamo opacity-30 blur-3xl" />
      <div className="float-slow absolute -left-16 bottom-1/4 h-64 w-64 rounded-full bg-iseo opacity-20 blur-3xl" />
      <div className="float-slower absolute -bottom-10 right-1/4 h-72 w-72 rounded-full bg-garda opacity-20 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-ink/10 bg-white/80 p-8 shadow-[0_30px_80px_-40px_rgba(42,33,24,0.6)] backdrop-blur-md md:p-10">
          <div className="flex justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bergamo-soft text-bergamo">
              <Icon name="sun" className="h-7 w-7" />
            </span>
          </div>

          <h1 className="mt-5 text-center font-display text-4xl font-semibold leading-tight text-ink">
            Itaalia
            <span className="bg-gradient-to-r from-bergamo via-sun to-iseo bg-clip-text text-transparent">
              {" "}
              2026
            </span>
          </h1>
          <p className="mt-2 text-center text-sm text-ink/60">
            Sisesta parool, et reisiplaani vaadata
          </p>

          <form onSubmit={submit} className="mt-7">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink/45">
              Parool
            </label>
            <input
              type="password"
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="••••••••"
              className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-ink outline-none transition focus:border-iseo ${
                error ? "border-bergamo" : "border-ink/15"
              }`}
            />
            {error && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-bergamo">
                <Icon name="warning" className="h-4 w-4" />
                Vale parool, proovi uuesti.
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 font-semibold text-cream transition hover:opacity-90 disabled:opacity-40"
            >
              {loading ? "Sisenen…" : "Sisene"}
              {!loading && <Icon name="arrow" className="h-4 w-4" />}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-ink/40">
          Murd &amp; Rankla · 24.–31. juuli 2026
        </p>
      </div>
    </main>
  );
}
