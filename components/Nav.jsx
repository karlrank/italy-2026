"use client";

import { useEffect, useState } from "react";

const links = [
  { id: "lennud", label: "Lennud" },
  { id: "kaart", label: "Kaart" },
  { id: "ajakava", label: "Ajakava" },
  { id: "majutus", label: "Majutus" },
  { id: "tegevused", label: "Tegevused" },
  { id: "pakkimine", label: "Pakkimine" },
  { id: "eelarve", label: "Eelarve" },
  { id: "info", label: "Info" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = links
      .map((l) => document.getElementById(l.id))
      .filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-md bg-cream/80 shadow-[0_1px_0_rgba(42,33,24,0.08)]"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <a
          href="#top"
          className="font-display text-lg font-semibold tracking-tight text-ink"
        >
          Itaalia<span className="text-bergamo">’26</span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active === l.id
                  ? "bg-ink text-cream"
                  : "text-ink/70 hover:bg-ink/5 hover:text-ink"
              }`}
            >
              {l.label}
            </a>
          ))}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/5 md:hidden"
          aria-label="Menüü"
        >
          <span className="relative block h-4 w-5">
            <span
              className={`absolute left-0 h-0.5 w-5 bg-ink transition-all ${
                open ? "top-2 rotate-45" : "top-0.5"
              }`}
            />
            <span
              className={`absolute left-0 top-2 h-0.5 w-5 bg-ink transition-all ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 h-0.5 w-5 bg-ink transition-all ${
                open ? "top-2 -rotate-45" : "top-3.5"
              }`}
            />
          </span>
        </button>
      </nav>

      {/* Mobile dropdown */}
      <div
        className={`overflow-hidden border-t border-ink/5 bg-cream/95 backdrop-blur-md transition-all duration-300 md:hidden ${
          open ? "max-h-80" : "max-h-0"
        }`}
      >
        <div className="flex flex-col px-5 py-2">
          {links.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={() => setOpen(false)}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium ${
                active === l.id ? "text-bergamo" : "text-ink/80"
              }`}
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
