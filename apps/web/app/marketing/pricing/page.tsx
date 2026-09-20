import { PricingTable } from "../../../components/PricingTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preços",
  description: "Compara os planos Grátis e Super do Falatório.",
};

export default function PricingPage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "64px 16px" }}>
      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          textAlign: "center",
          marginBottom: 8,
          letterSpacing: "-0.02em",
        }}
      >
        Planos e preços
      </h1>
      <p
        style={{
          textAlign: "center",
          color: "#78716C",
          fontSize: 16,
          marginBottom: 48,
        }}
      >
        Começa grátis. Passa a Super quando quiseres — com 7 dias de trial.
      </p>
      <PricingTable />
    </main>
  );
}
