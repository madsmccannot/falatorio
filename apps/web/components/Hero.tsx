export function Hero() {
  return (
    <section
      style={{
        background: "linear-gradient(135deg, #065F46 0%, #047857 40%, #059669 100%)",
        color: "#fff",
        padding: "80px 16px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <h1
          style={{
            fontSize: 44,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: 16,
          }}
        >
          Aprende português europeu
          <br />
          <span style={{ color: "#A7F3D0" }}>de verdade.</span>
        </h1>
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.6,
            color: "#D1FAE5",
            maxWidth: 520,
            margin: "0 auto 32px",
          }}
        >
          Lições adaptadas à tua língua materna. Repetição espaçada. Conversação com IA.
          Pronúncia PT-EU. Tudo o que o Duolingo não te dá.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="#pricing"
            style={{
              display: "inline-block",
              background: "#fff",
              color: "#065F46",
              padding: "14px 32px",
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Começar grátis
          </a>
          <a
            href="#pricing"
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              padding: "14px 32px",
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 600,
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            Ver planos
          </a>
        </div>
      </div>
    </section>
  );
}
