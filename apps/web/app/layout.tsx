import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Falatório — Aprende Português Europeu",
    template: "%s | Falatório",
  },
  description:
    "A plataforma para aprender português europeu de verdade. Lições adaptativas, repetição espaçada e conversação com IA — tudo adaptado à tua língua materna.",
  keywords: [
    "português europeu",
    "aprender português",
    "PT-EU",
    "portugal",
    "língua portuguesa",
    "european portuguese",
  ],
  openGraph: {
    title: "Falatório — Aprende Português Europeu",
    description:
      "Lições adaptativas, repetição espaçada e conversação com IA — tudo adaptado à tua língua materna.",
    locale: "pt_PT",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          margin: 0,
          fontFamily: "'Inter', system-ui, sans-serif",
          backgroundColor: "#FAFAF9",
          color: "#1C1917",
        }}
      >
        {children}
      </body>
    </html>
  );
}
