import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
};

export default async function BlogPostPage(_props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await _props.params;

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "64px 16px" }}>
      <a
        href="/marketing"
        style={{ fontSize: 14, color: "#059669", textDecoration: "none" }}
      >
        &larr; Voltar
      </a>
      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          marginTop: 24,
          marginBottom: 16,
          letterSpacing: "-0.02em",
        }}
      >
        {slug.replace(/-/g, " ")}
      </h1>
      <p style={{ color: "#78716C", fontSize: 16, lineHeight: 1.7 }}>
        Conteúdo do blog em breve. Esta página será populada com artigos sobre
        aprendizagem de português europeu, dicas culturais e novidades da plataforma.
      </p>
    </main>
  );
}
