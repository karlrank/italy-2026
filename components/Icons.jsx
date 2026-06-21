// Lihtsad joonikoonid (stroke = currentColor).
const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function Icon({ name, className = "" }) {
  const paths = {
    calendar: (
      <>
        <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
        <path d="M3 9h18M8 2.5v4M16 2.5v4" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
        <path d="M16 6a3 3 0 0 1 0 6M16.5 14c2.4.3 4 2.2 4 5" />
      </>
    ),
    route: (
      <>
        <circle cx="6" cy="18" r="2.2" />
        <circle cx="18" cy="6" r="2.2" />
        <path d="M8 18h6a3 3 0 0 0 0-6H10a3 3 0 0 1 0-6h6" />
      </>
    ),
    car: (
      <>
        <path d="M3 13l1.8-4.5A2 2 0 0 1 6.7 7h10.6a2 2 0 0 1 1.9 1.5L21 13v4.5a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1V17H6.5v.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V13z" />
        <path d="M3 13h18" />
        <circle cx="7" cy="15.5" r="0.6" fill="currentColor" />
        <circle cx="17" cy="15.5" r="0.6" fill="currentColor" />
      </>
    ),
    ticket: (
      <>
        <path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5V10a2 2 0 0 0 0 4v2.5A1.5 1.5 0 0 1 18.5 18h-13A1.5 1.5 0 0 1 4 16.5V14a2 2 0 0 0 0-4V7.5z" />
        <path d="M14 6v12" strokeDasharray="2 2" />
      </>
    ),
    warning: (
      <>
        <path d="M12 3.5L21 19H3L12 3.5z" />
        <path d="M12 10v4M12 16.5v.5" />
      </>
    ),
    kids: (
      <>
        <circle cx="12" cy="6.5" r="2.5" />
        <path d="M12 9v6M9 11.5h6M9.5 20l2.5-5 2.5 5" />
      </>
    ),
    pin: (
      <>
        <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    check: <path d="M5 12.5l4 4 10-10" />,
    bed: (
      <>
        <path d="M3 7v11M3 12h18v6M21 18v-2a3 3 0 0 0-3-3H9" />
        <circle cx="6.5" cy="10" r="1.5" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
      </>
    ),
    plane: (
      <path d="M10.5 13.5L3 11l1-2 6.5.8L15 5c.8-.8 2.3-1.2 2.9-.6.6.6.2 2.1-.6 2.9l-4.8 4.5.8 6.5-2 1-2.5-7.5-3.3 3.3L3.2 16l.3-2.3 7-3.7z" />
    ),
    euro: (
      <>
        <path d="M16 7a6 6 0 1 0 0 10" />
        <path d="M4 10h7M4 14h6" />
      </>
    ),
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    chevron: <path d="M6 9l6 6 6-6" />,
  };

  return (
    <svg {...base} className={className} aria-hidden="true">
      {paths[name] || paths.pin}
    </svg>
  );
}
