import type { CulturalRef } from "../types.js";

export const esCulturalRefs: readonly CulturalRef[] = [
  {
    id: "es_desenrascar",
    type: "expression",
    contentPt: "Desenrascar-se",
    contentL1: "Apañárselas / buscarse la vida",
    explanation: "Like 'apañárselas' but elevated to national identity. Portuguese people are proud of their ability to 'desenrascar' — it's their version of improvisation.",
    cefrMin: "A2",
    tags: ["culture", "daily-life"],
  },
  {
    id: "es_autocarro_onibus",
    type: "reference",
    contentPt: "Autocarro (PT-EU) vs Ônibus (PT-BR)",
    contentL1: "Autobús",
    explanation: "Same word as Spanish but different from Brazilian Portuguese. In Portugal it's 'autocarro', never 'ônibus'.",
    cefrMin: "A1",
    tags: ["vocabulary", "pt-eu-vs-br"],
  },
  {
    id: "es_false_friend_polvo",
    type: "joke",
    contentPt: "Quero polvo grelhado",
    contentL1: "Quiero pulpo a la parrilla (¡no polvo!)",
    explanation: "Careful! Ordering 'polvo' in Portugal gets you grilled octopus. In Spanish, 'polvo' means dust. One of the funniest false friends between ES and PT.",
    cefrMin: "A2",
    tags: ["false-friends", "food", "humor"],
  },
  {
    id: "es_bue",
    type: "expression",
    contentPt: "Bué",
    contentL1: "Muy / un montón",
    explanation: "Portuguese slang for 'a lot' or 'very'. 'Isto é bué fixe' = 'Esto mola mucho'. You'll hear it constantly from younger Portuguese.",
    cefrMin: "A2",
    tags: ["slang", "daily-life"],
  },
  {
    id: "es_pa",
    type: "expression",
    contentPt: "Ó pá!",
    contentL1: "¡Tío! / ¡Oye!",
    explanation: "The Portuguese equivalent of '¡Tío!' — used to get someone's attention or express surprise. Very informal, very common.",
    cefrMin: "A2",
    tags: ["slang", "daily-life"],
  },
];
