export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav
        style={{
          width: 240,
          borderRight: "1px solid #E7E5E4",
          padding: "24px 16px",
          background: "#fff",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#059669",
            marginBottom: 32,
          }}
        >
          Falatório
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {[
            { href: "/dashboard", label: "Início" },
            { href: "/dashboard", label: "Aprender" },
            { href: "/dashboard", label: "Praticar" },
            { href: "/dashboard", label: "Ligas" },
            { href: "/dashboard", label: "Perfil" },
          ].map((item) => (
            <li key={item.label} style={{ marginBottom: 4 }}>
              <a
                href={item.href}
                style={{
                  display: "block",
                  padding: "10px 12px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#44403C",
                  textDecoration: "none",
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <main style={{ flex: 1, padding: "32px 40px", background: "#FAFAF9" }}>
        {children}
      </main>
    </div>
  );
}
