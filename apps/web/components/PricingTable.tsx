const FREE_FEATURES = [
  "Todas as lições e exercícios",
  "15 idiomas de origem",
  "Repetição espaçada (FSRS)",
  "5 vidas (recarregam a cada 4h)",
  "Ligas semanais e conquistas",
  "Loja de cristais",
];

const SUPER_FEATURES = [
  "Tudo do plano grátis",
  "Vidas ilimitadas",
  "Sem anúncios",
  "Revisão de erros detalhada",
  "Recuperação de streak",
  "Power-ups bónus",
  "Explicações ilimitadas com IA",
];

export function PricingTable() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 24,
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #E7E5E4",
          borderRadius: 16,
          padding: 32,
        }}
      >
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Grátis</h3>
        <p style={{ fontSize: 14, color: "#78716C", marginBottom: 24 }}>
          Para sempre, sem cartão
        </p>
        <p style={{ fontSize: 36, fontWeight: 700, marginBottom: 24 }}>
          0 EUR
          <span style={{ fontSize: 14, fontWeight: 400, color: "#A8A29E" }}> /mês</span>
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {FREE_FEATURES.map((f) => (
            <li
              key={f}
              style={{
                fontSize: 14,
                padding: "8px 0",
                borderBottom: "1px solid #F5F5F4",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ color: "#059669", fontWeight: 700 }}>&#10003;</span> {f}
            </li>
          ))}
        </ul>
      </div>

      <div
        style={{
          background: "linear-gradient(135deg, #065F46, #047857)",
          borderRadius: 16,
          padding: 32,
          color: "#fff",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -12,
            right: 20,
            background: "#F59E0B",
            color: "#1C1917",
            fontSize: 11,
            fontWeight: 700,
            padding: "4px 12px",
            borderRadius: 6,
            letterSpacing: "0.04em",
          }}
        >
          7 DIAS GRÁTIS
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Super</h3>
        <p style={{ fontSize: 14, color: "#A7F3D0", marginBottom: 24 }}>
          A experiência completa
        </p>
        <p style={{ fontSize: 36, fontWeight: 700, marginBottom: 24 }}>
          6.99 EUR
          <span style={{ fontSize: 14, fontWeight: 400, color: "#A7F3D0" }}> /mês</span>
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {SUPER_FEATURES.map((f) => (
            <li
              key={f}
              style={{
                fontSize: 14,
                padding: "8px 0",
                borderBottom: "1px solid rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontWeight: 700 }}>&#10003;</span> {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
