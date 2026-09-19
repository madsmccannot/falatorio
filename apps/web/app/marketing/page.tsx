import { Hero } from "../../components/Hero";
import { PricingTable } from "../../components/PricingTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aprende Português Europeu de Verdade",
};

const FEATURES = [
  {
    title: "Adaptado à tua língua",
    description:
      "Conteúdo personalizado para falantes de 15 idiomas. Piadas, expressões e referências culturais que fazem sentido para ti.",
    icon: "globe",
  },
  {
    title: "Português europeu real",
    description:
      "Não é PT-BR com sotaque diferente. É português de Portugal — coloquialismos, expressões, situações reais (Finanças, SNS, senhorio).",
    icon: "flag",
  },
  {
    title: "Repetição espaçada (FSRS)",
    description:
      "O algoritmo lembra-se do que esqueceste. Revisão no momento exacto para maximizar retenção a longo prazo.",
    icon: "brain",
  },
  {
    title: "Conversação com IA",
    description:
      "Pratica cenários reais — pedir um galão, ir às Finanças, falar com o senhorio. A IA adapta-se ao teu nível e L1.",
    icon: "chat",
  },
  {
    title: "8 tipos de exercício",
    description:
      "Traduzir, ouvir e escrever, falar e pontuar, preencher espaços, ligar pares, escolher, reordenar — variedade para não aborrecer.",
    icon: "puzzle",
  },
  {
    title: "Pronúncia PT-EU",
    description:
      "O -ão, o lh, o nh, o R uvular, as vogais reduzidas — os sons que nenhuma outra app te ensina a fazer.",
    icon: "mic",
  },
] as const;

const L1_LANGUAGES = [
  { code: "en", name: "English", flag: "GB" },
  { code: "es", name: "Español", flag: "ES" },
  { code: "fr", name: "Français", flag: "FR" },
  { code: "hi", name: "Hindi", flag: "IN" },
  { code: "ur", name: "Urdu", flag: "PK" },
  { code: "ar", name: "Arabic", flag: "SA" },
  { code: "bn", name: "Bangla", flag: "BD" },
  { code: "de", name: "Deutsch", flag: "DE" },
  { code: "zh", name: "Chinese", flag: "CN" },
  { code: "ru", name: "Russian", flag: "RU" },
  { code: "uk", name: "Ukrainian", flag: "UA" },
  { code: "tr", name: "Turkish", flag: "TR" },
  { code: "pl", name: "Polski", flag: "PL" },
  { code: "ko", name: "Korean", flag: "KR" },
  { code: "ja", name: "Japanese", flag: "JP" },
] as const;

export default function MarketingPage() {
  return (
    <main>
      <Hero />

      <section
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "64px 16px",
        }}
      >
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            textAlign: "center",
            marginBottom: 8,
            letterSpacing: "-0.02em",
          }}
        >
          Porque é diferente
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#78716C",
            fontSize: 16,
            marginBottom: 48,
            maxWidth: 520,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Construído de raiz para português europeu — não é uma tradução de outra app.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                background: "#fff",
                border: "1px solid #E7E5E4",
                borderRadius: 12,
                padding: 24,
              }}
            >
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: "#57534E", lineHeight: 1.6 }}>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          background: "#F5F5F4",
          padding: "64px 16px",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 700,
              textAlign: "center",
              marginBottom: 8,
              letterSpacing: "-0.02em",
            }}
          >
            Fala a tua língua?
          </h2>
          <p
            style={{
              textAlign: "center",
              color: "#78716C",
              fontSize: 16,
              marginBottom: 40,
            }}
          >
            Conteúdo adaptado para falantes de 15 idiomas
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              justifyContent: "center",
            }}
          >
            {L1_LANGUAGES.map((l) => (
              <div
                key={l.code}
                style={{
                  background: "#fff",
                  border: "1px solid #E7E5E4",
                  borderRadius: 10,
                  padding: "10px 18px",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {l.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="pricing"
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "64px 16px",
        }}
      >
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            textAlign: "center",
            marginBottom: 8,
            letterSpacing: "-0.02em",
          }}
        >
          Escolhe o teu plano
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#78716C",
            fontSize: 16,
            marginBottom: 48,
          }}
        >
          Começa grátis. Passa a Super quando quiseres.
        </p>
        <PricingTable />
      </section>

      <footer
        style={{
          borderTop: "1px solid #E7E5E4",
          padding: "32px 16px",
          textAlign: "center",
          fontSize: 13,
          color: "#A8A29E",
        }}
      >
        Fala PT — Aprende português europeu de verdade
      </footer>
    </main>
  );
}
