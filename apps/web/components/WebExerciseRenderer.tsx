"use client";

import { useState } from "react";

export function WebExerciseRenderer() {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E7E5E4",
        borderRadius: 16,
        padding: 32,
      }}
    >
      <p style={{ fontSize: 13, color: "#A8A29E", marginBottom: 8 }}>
        Traduz para português
      </p>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 600,
          marginBottom: 24,
        }}
      >
        Good morning, how are you?
      </h2>

      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Escreve a tradução aqui..."
        disabled={submitted}
        style={{
          width: "100%",
          padding: "14px 16px",
          fontSize: 16,
          border: "2px solid #E7E5E4",
          borderRadius: 10,
          outline: "none",
          fontFamily: "inherit",
          boxSizing: "border-box",
          marginBottom: 16,
        }}
      />

      {submitted ? (
        <div
          style={{
            background: "#ECFDF5",
            border: "1px solid #A7F3D0",
            borderRadius: 10,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 600, color: "#059669" }}>
            Resposta correta: Bom dia, como está?
          </p>
        </div>
      ) : null}

      <button
        onClick={() => setSubmitted(true)}
        disabled={!answer.trim() || submitted}
        style={{
          width: "100%",
          padding: "14px 0",
          fontSize: 16,
          fontWeight: 600,
          border: "none",
          borderRadius: 10,
          cursor: answer.trim() && !submitted ? "pointer" : "default",
          background: answer.trim() && !submitted ? "#059669" : "#E7E5E4",
          color: answer.trim() && !submitted ? "#fff" : "#A8A29E",
          fontFamily: "inherit",
        }}
      >
        {submitted ? "Continuar" : "Verificar"}
      </button>
    </div>
  );
}
