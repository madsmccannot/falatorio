import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fala PT — Learn European Portuguese",
  description: "Master European Portuguese with adaptive lessons, spaced repetition, and AI-powered conversation practice.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
