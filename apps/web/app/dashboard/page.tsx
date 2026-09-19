import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div>
      <h1
        style={{
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 8,
          letterSpacing: "-0.02em",
        }}
      >
        Olá! Bem-vindo de volta.
      </h1>
      <p style={{ color: "#78716C", fontSize: 15, marginBottom: 32 }}>
        Continua de onde paraste.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {[
          { label: "Streak", value: "0 dias", color: "#F97316" },
          { label: "XP total", value: "0", color: "#F59E0B" },
          { label: "Nivel CEFR", value: "A1", color: "#059669" },
          { label: "Cristais", value: "0", color: "#7C3AED" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "#fff",
              border: "1px solid #E7E5E4",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <p style={{ fontSize: 12, color: "#A8A29E", marginBottom: 4 }}>
              {stat.label}
            </p>
            <p
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: stat.color,
              }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #E7E5E4",
          borderRadius: 12,
          padding: 32,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Lição diária
        </h2>
        <p style={{ color: "#78716C", fontSize: 14, marginBottom: 24 }}>
          Completa a tua lição diária para manter o streak ativo.
        </p>
        <a
          href="/dashboard/lesson/1"
          style={{
            display: "inline-block",
            background: "#059669",
            color: "#fff",
            padding: "12px 32px",
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Começar lição
        </a>
      </div>
    </div>
  );
}
