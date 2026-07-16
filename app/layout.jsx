import "./globals.css";
import PwaRegister from "@/components/PwaRegister";

export const metadata = {
  manifest: "/manifest.json",
  title: "Itaalia 2026 · Murd & Rankla",
  description:
    "Meie Itaalia reis 24.–31. juuli 2026 — Bergamo, Lake Iseo, Gardajärv ja Milano. Ajakava, majutus, tegevused ja eelarve.",
  openGraph: {
    title: "Itaalia 2026 · Murd & Rankla",
    description:
      "Bergamo · Lake Iseo · Gardajärv · Milano — 24.–31. juuli 2026",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#fbf6ee",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="et">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
