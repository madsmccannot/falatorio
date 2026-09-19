import { WebExerciseRenderer } from "../../../../components/WebExerciseRenderer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lição",
};

export default async function LessonPage(_props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await _props.params;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <a
          href="/dashboard"
          style={{ fontSize: 14, color: "#A8A29E", textDecoration: "none" }}
        >
          &larr; Sair
        </a>
        <span style={{ fontSize: 13, color: "#78716C" }}>Lição {id}</span>
        <div style={{ display: "flex", gap: 4 }}>
          {[1, 2, 3, 4, 5].map((h) => (
            <span
              key={h}
              style={{
                display: "inline-block",
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#EF4444",
              }}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          height: 6,
          background: "#E7E5E4",
          borderRadius: 3,
          marginBottom: 32,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: "0%",
            background: "#059669",
            borderRadius: 3,
          }}
        />
      </div>

      <WebExerciseRenderer />
    </div>
  );
}
