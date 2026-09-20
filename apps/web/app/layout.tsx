import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

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
    <html lang="pt" className={inter.className}>
      <body
        style={{
          margin: 0,
          backgroundColor: "#FAFAF9",
          color: "#1C1917",
        }}
      >
        {children}
      </body>
    </html>
  );
}
