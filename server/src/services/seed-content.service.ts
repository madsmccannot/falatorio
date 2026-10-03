import type { Database } from "@falatorio/db/client";
import { courses, sections, units, lessons, lessonSkills, skills } from "@falatorio/db/schema";

import { L1_PHASE_1, type L1Code, type CEFRLevel } from "@falatorio/core";
import { getProfile } from "@falatorio/core/l1-profiles";

export interface UnitDef {
  title: string;
  theme: string;
  description: string;
  grammarFocus: string[];
  vocabTarget: string[];
  skillCodes?: string[];
}

export interface SectionDef {
  title: Record<string, string>;
  description: Record<string, string>;
  sectionType: "numbered" | "daily_refresh";
  cefrMin: CEFRLevel;
  cefrMax: CEFRLevel;
  lessonsPerUnitStart: number;
  lessonsPerUnitEnd: number;
  units: UnitDef[];
}

const GRAMMAR_TO_SKILLS: Record<string, string[]> = {
  "ser present": ["PT.TENSES.PRESENT", "PT.TENSES.SER_ESTAR"],
  "articles": ["PT.DET.ARTICLES.DEFINITE", "PT.DET.ARTICLES.INDEFINITE"],
  "cardinal numbers": ["PT.ADJ.NUMERAL"],
  "ordinal numbers": ["PT.ADJ.NUMERAL"],
  "possessives": ["PT.DET.POSSESSIVE", "PT.PRON.POSSESSIVE"],
  "gender agreement": ["PT.MORPH.GENDER", "PT.MORPH.AGREEMENT", "PT.ADJ.AGREEMENT"],
  "querer present": ["PT.TENSES.PRESENT"],
  "partitive": ["PT.DET.ARTICLES.INDEFINITE"],
  "estar present": ["PT.TENSES.PRESENT", "PT.TENSES.SER_ESTAR"],
  "prepositions em/de": ["PT.PREP.BASIC", "PT.PREP.DE_POSSESSION", "PT.PREP.CONTRACTIONS"],
  "ter present": ["PT.TENSES.PRESENT", "PT.TENSES.TER_HAVER"],
  "doer": ["PT.PRON.PERSONAL.SUBJECT"],
  "ir present": ["PT.TENSES.PRESENT"],
  "imperative basic": ["PT.TENSES.IMPERATIVE"],
  "poder present": ["PT.TENSES.PRESENT"],
  "demonstratives": ["PT.DET.DEMONSTRATIVE", "PT.PRON.DEMONSTRATIVE.BASIC"],
  "reflexive verbs": ["PT.PRON.REFLEXIVE"],
  "frequency adverbs": ["PT.ADV.TIME"],
  "fazer weather": ["PT.TENSES.PRESENT"],
  "comparative": ["PT.ADJ.DEGREE"],
  "preterite regular": ["PT.TENSES.PRETERITE_PERFECT"],
  "porque/por que": ["PT.CONJ.CAUSAL", "PT.ADV.INTERROGATIVE"],
  "preterite irregular": ["PT.TENSES.PRETERITE_PERFECT"],
  "prepositions para/a": ["PT.PREP.POR_PARA", "PT.PREP.A_MOVEMENT"],
  "gostar de": ["PT.PREP.DE_POSSESSION"],
  "imperfect introduction": ["PT.TENSES.IMPERFECT"],
  "imperfect regular": ["PT.TENSES.IMPERFECT"],
  "object pronouns direct": ["PT.PRON.PERSONAL.DIRECT_OBJECT"],
  "imperfect irregular": ["PT.TENSES.IMPERFECT"],
  "subjunctive present intro": ["PT.TENSES.SUBJUNCTIVE_PRESENT"],
  "preterite vs imperfect": ["PT.TENSES.PRETERITE_PERFECT", "PT.TENSES.IMPERFECT"],
  "indirect objects": ["PT.PRON.PERSONAL.INDIRECT_OBJECT", "PT.SYNTAX.INDIRECT_OBJECT"],
  "subjunctive present": ["PT.TENSES.SUBJUNCTIVE_PRESENT"],
  "conjunctions": ["PT.CONJ.COPULATIVE", "PT.CONJ.ADVERSATIVE", "PT.CONJ.CAUSAL"],
  "passive voice": ["PT.SYNTAX.PASSIVE_AGENT"],
  "reported speech intro": ["PT.SYNTAX.SUB.COMPLETIVE", "PT.CONJ.COMPLETIVE"],
  "relative pronouns": ["PT.PRON.RELATIVE", "PT.DET.RELATIVE"],
  "subjunctive with emotions": ["PT.TENSES.SUBJUNCTIVE_PRESENT"],
  "conditional": ["PT.TENSES.CONDITIONAL"],
  "por/para distinction": ["PT.PREP.POR_PARA"],
  "future subjunctive": ["PT.TENSES.SUBJUNCTIVE_FUTURE"],
  "personal infinitive": ["PT.TENSES.PERSONAL_INFINITIVE"],
  "imperfect subjunctive": ["PT.TENSES.SUBJUNCTIVE_IMPERFECT"],
  "conditional sentences": ["PT.CONJ.CONDITIONAL", "PT.SYNTAX.SUB.CONDITIONAL"],
  "compound tenses intro": ["PT.TENSES.COMPOUND_PAST"],
  "gerund vs infinitive": ["PT.TENSES.GERUND"],
  "subjunctive with doubt": ["PT.TENSES.SUBJUNCTIVE_PRESENT", "PT.ADV.DOUBT"],
  "pronoun placement": ["PT.PRON.PERSONAL.CLITIC_PLACEMENT"],
  "pluperfect subjunctive": ["PT.TENSES.PLUPERFECT"],
  "complex conditionals": ["PT.CONJ.CONDITIONAL", "PT.SYNTAX.SUB.CONDITIONAL"],
  "future perfect": ["PT.TENSES.COMPOUND_PAST", "PT.TENSES.FUTURE"],
  "formal register": ["PT.LEX.REGISTER.FORMAL"],
  "subjunctive in relative clauses": ["PT.TENSES.SUBJUNCTIVE_PRESENT", "PT.PRON.RELATIVE"],
  "passive se": ["PT.SYNTAX.PASSIVE_AGENT"],
  "literary tenses": ["PT.TENSES.PLUPERFECT"],
  "mesoclisis": ["PT.PRON.PERSONAL.CLITIC_PLACEMENT", "PT.PRON.MESOCLISIS"],
  "compound subjunctive": ["PT.TENSES.SUBJUNCTIVE_IMPERFECT", "PT.TENSES.COMPOUND_PAST"],
  "abstract nominalization": ["PT.MORPH.DERIVATION.SUFFIX"],
  "narrative tenses": ["PT.TENSES.PRETERITE_PERFECT", "PT.TENSES.IMPERFECT", "PT.TENSES.PLUPERFECT"],
  "discourse connectors": ["PT.ADV.CONNECTIVE", "PT.CONJ.CONCLUSIVE"],
  "idiomatic usage": ["PT.LEX.REGISTER.FORMAL", "PT.LEX.IDIOMS.ADVANCED"],
  "register variation": ["PT.LEX.REGISTER.FORMAL", "PT.LEX.COLLOCATIONS.SPECIALIZED"],
  "formal subjunctive": ["PT.TENSES.SUBJUNCTIVE_FUTURE", "PT.TENSES.COMPOUND_SUBJUNCTIVE"],
  "impersonal constructions": ["PT.SYNTAX.SUBJECT", "PT.SYNTAX.TOPICALIZATION"],
  "stylistic devices": ["PT.RHETORIC.ADVANCED_ANALYSIS"],
  "archaic forms": ["PT.LEX.ETYMOLOGY", "PT.TENSES.LITERARY_PLUPERFECT", "PT.SYNTAX.ARCHAIC_FORMS"],
  "advanced connectors": ["PT.ADV.CONNECTIVE", "PT.CONJ.CONCESSIVE", "PT.CONJ.CONSECUTIVE"],
  "subjunctive nuances": ["PT.TENSES.SUBJUNCTIVE_PRESENT", "PT.TENSES.SUBJUNCTIVE_IMPERFECT", "PT.TENSES.COMPOUND_SUBJUNCTIVE"],
  "all tenses review": ["PT.TENSES.PRESENT", "PT.TENSES.PRETERITE_PERFECT", "PT.TENSES.IMPERFECT"],
  "regional variation": ["PT.SYNTAX.STYLISTIC_VARIATION", "PT.DISCOURSE.DIALECTAL_AWARENESS", "PT.PHON.DIALECTAL_VARIATION"],
  "stylistic choices": ["PT.DISCOURSE.STYLISTICS", "PT.DISCOURSE.LITERARY_ANALYSIS"],
  "creative grammar": ["PT.SYNTAX.STYLISTIC_VARIATION", "PT.LEX.CREATIVE_NEOLOGY", "PT.SYNTAX.ARCHAIC_FORMS"],
};

// ── Chest reward pool ──
const CHEST_REWARDS: Array<{ type: "ouro" | "xp_boost" | "super_days" | "streak_freeze"; amount: number; weight: number }> = [
  { type: "ouro", amount: 25, weight: 40 },
  { type: "ouro", amount: 50, weight: 25 },
  { type: "xp_boost", amount: 15, weight: 20 },
  { type: "streak_freeze", amount: 1, weight: 10 },
  { type: "super_days", amount: 1, weight: 5 },
];

function pickChestReward(unitIndex: number): { type: "ouro" | "xp_boost" | "super_days" | "streak_freeze"; amount: number } {
  const idx = unitIndex % CHEST_REWARDS.length;
  const r = CHEST_REWARDS[idx]!;
  return { type: r.type, amount: r.amount };
}

function getChestPositions(totalSlots: number): number[] {
  if (totalSlots <= 4) return [];
  if (totalSlots <= 6) return [Math.floor(totalSlots / 2)];
  const first = Math.floor(totalSlots / 3);
  const second = Math.floor(2 * totalSlots / 3);
  return [first, second];
}

export const COURSE_SECTIONS: SectionDef[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // S1 Basico (A1-A2) — 10 units — "Consigo desenrascar-me em Portugal"
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    title: { pt: "Secção 1 - Básico", en: "Section 1 - Basics" },
    description: { pt: "Sobreviver e construir frases: cumprimentos, necessidades básicas e primeiros passos", en: "Survive and build sentences: greetings, basic needs and first steps" },
    sectionType: "numbered",
    cefrMin: "A1",
    cefrMax: "A2",
    lessonsPerUnitStart: 5,
    lessonsPerUnitEnd: 6,
    units: [
      { title: "Olá! Quem és tu?", theme: "greetings", description: "Cumprimentos, apresentações, nome, idade, nacionalidade, línguas", grammarFocus: ["ser present", "articles"], vocabTarget: ["greetings", "introductions", "nationalities", "languages"] },
      { title: "Sobre mim", theme: "personal_info", description: "Família e informação pessoal, profissão, gostos, números, contactos, morada, datas", grammarFocus: ["cardinal numbers", "ordinal numbers", "ter present"], vocabTarget: ["personal info", "numbers", "dates", "contacts", "professions"] },
      { title: "A minha gente", theme: "family", description: "Família, amigos, relações, descrição física básica, possessivos, género e número", grammarFocus: ["possessives", "gender agreement"], vocabTarget: ["family", "friends", "physical description", "relationships"] },
      { title: "Café, por favor!", theme: "food", description: "Comida e bebida, café, restaurante, pastelaria, pedir e pagar, preços, quantidades", grammarFocus: ["querer present", "partitive", "gostar de"], vocabTarget: ["food", "drinks", "restaurant", "ordering", "prices"] },
      { title: "A minha casa", theme: "home", description: "Divisões da casa, objetos comuns, localização, ser/estar, preposições básicas", grammarFocus: ["estar present", "prepositions em/de", "demonstratives"], vocabTarget: ["rooms", "furniture", "daily objects", "location"] },
      { title: "Estou a precisar de ajuda", theme: "needs", description: "Corpo, sintomas, farmácia, necessidades básicas, pedidos, imperativo, expressões de cortesia", grammarFocus: ["ter present", "imperative basic", "doer"], vocabTarget: ["body parts", "health", "pharmacy", "needs", "courtesy"] },
      { title: "Como chego lá?", theme: "transport", description: "Rua, cidade, transportes, direções, bilhetes, ir/vir/chegar/sair, preposições e contrações", grammarFocus: ["ir present", "prepositions para/a"], vocabTarget: ["transport", "directions", "city", "tickets", "prepositions"] },
      { title: "Quanto custa?", theme: "shopping", description: "Lojas, compras, dinheiro, preços, tamanhos, números, pagamentos, comparações simples", grammarFocus: ["poder present", "comparative"], vocabTarget: ["shopping", "money", "prices", "sizes", "payments"] },
      { title: "Um dia normal", theme: "routine", description: "Rotina diária, horas, dias da semana, atividades, frequência, verbos reflexivos", grammarFocus: ["reflexive verbs", "frequency adverbs"], vocabTarget: ["daily routine", "time expressions", "activities", "habits"] },
      { title: "Hoje, amanhã, este fim de semana", theme: "weather_plans", description: "Tempo, meteorologia, planos, estações, convites, estar a + infinitivo, ir + infinitivo", grammarFocus: ["fazer weather", "comparative"], vocabTarget: ["weather", "seasons", "plans", "future", "invitations"] },
    ],
  },
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // S2 Principiante (A2-B1) — 30 units — "Viver em Portugal"
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    title: { pt: "Secção 2 - Principiante", en: "Section 2 - Beginner" },
    description: { pt: "Viver em Portugal: funcionar no dia a dia, pedir, explicar, perguntar e esclarecer", en: "Living in Portugal: daily autonomy, asking, explaining, questioning and clarifying" },
    sectionType: "numbered",
    cefrMin: "A2",
    cefrMax: "B1",
    lessonsPerUnitStart: 7,
    lessonsPerUnitEnd: 6,
    units: [
      { title: "O meu trabalho", theme: "work", description: "Profissões, local de trabalho, horários, responsabilidades, colegas, pedir e explicar tarefas", grammarFocus: ["preterite regular", "porque/por que"], vocabTarget: ["professions", "workplace", "schedules", "responsibilities"] },
      { title: "Estudar e aprender", theme: "study", description: "Escola, universidade, disciplinas, aulas, estudar, aprender, explicar dificuldades", grammarFocus: ["preterite irregular", "gostar de"], vocabTarget: ["school", "university", "studying", "subjects"] },
      { title: "Viajar por Portugal", theme: "travel", description: "Estações e aeroportos, bilhetes, comboios e autocarros, hotéis, check-in, perguntar informações", grammarFocus: ["prepositions para/a", "preterite regular"], vocabTarget: ["travel", "transport stations", "hotels", "information"] },
      { title: "Férias e escapadinhas", theme: "holidays", description: "Férias, praias, campo, turismo, reservas, planos, experiências passadas", grammarFocus: ["preterite irregular", "imperfect introduction"], vocabTarget: ["holidays", "beaches", "countryside", "reservations"] },
      { title: "A cidade onde vivo", theme: "city", description: "Bairro, ruas, lojas, serviços, transportes, locais públicos, descrever onde se vive", grammarFocus: ["prepositions em/de", "demonstratives"], vocabTarget: ["neighborhood", "local services", "public places"] },
      { title: "Serviços do dia a dia", theme: "services", description: "Correios, cabeleireiro, oficina, serviços públicos, marcar horários, pedir informações", grammarFocus: ["imperative basic", "poder present"], vocabTarget: ["services", "appointments", "public services", "scheduling"] },
      { title: "Saúde, médico e farmácia", theme: "health", description: "Corpo, sintomas, consultas, medicamentos, doenças comuns, explicar o que aconteceu", grammarFocus: ["imperfect regular", "object pronouns direct"], vocabTarget: ["medical", "pharmacy", "symptoms", "consultations"] },
      { title: "Casa, renda e senhorio", theme: "housing", description: "Arrendar casa, contratos, renda, problemas domésticos, reparações, senhorio e inquilino", grammarFocus: ["conditional", "prepositions em/de"], vocabTarget: ["housing", "contracts", "landlord", "repairs"] },
      { title: "Supermercado e compras", theme: "supermarket", description: "Produtos, quantidades, embalagens, preços, promoções, comparar produtos, pedir ajuda", grammarFocus: ["comparative", "partitive"], vocabTarget: ["supermarket", "products", "quantities", "promotions"] },
      { title: "Roupa, tamanhos e aparência", theme: "clothing", description: "Roupa, calçado, tamanhos, cores, aparência, experimentar e comprar, descrever pessoas", grammarFocus: ["demonstratives", "comparative"], vocabTarget: ["clothing", "sizes", "appearance", "colors"] },
      { title: "Cozinhar e comer em casa", theme: "cooking", description: "Ingredientes, receitas, cozinha, utensílios, quantidades, instruções, sequência temporal", grammarFocus: ["imperative basic", "partitive"], vocabTarget: ["cooking", "recipes", "kitchen", "utensils"] },
      { title: "Comida portuguesa", theme: "portuguese_food", description: "Pratos portugueses, ingredientes, restaurantes, sabores, especialidades regionais", grammarFocus: ["gostar de", "preterite vs imperfect"], vocabTarget: ["Portuguese food", "dishes", "flavors", "regional specialties"] },
      { title: "Amigos e vida social", theme: "social", description: "Amizade, convites, encontros, conversas informais, combinar planos, aceitar e recusar", grammarFocus: ["imperfect introduction", "indirect objects"], vocabTarget: ["friendship", "invitations", "social life", "informal register"] },
      { title: "Gostos, emoções e relações", theme: "emotions", description: "Gostar, adorar, detestar, emoções, opiniões pessoais, relações, concordar e discordar", grammarFocus: ["subjunctive present intro", "gostar de"], vocabTarget: ["emotions", "opinions", "feelings", "relationships"] },
      { title: "Convites, planos e encontros", theme: "social_plans", description: "Marcar encontros, alterar planos, confirmar e cancelar, horários, justificações", grammarFocus: ["conditional", "future subjunctive"], vocabTarget: ["plans", "appointments", "time management", "confirmation"] },
      { title: "Desporto e tempo livre", theme: "sports", description: "Desporto, hobbies, atividades, frequência, preferências, convites", grammarFocus: ["preterite regular", "frequency adverbs"], vocabTarget: ["sports", "hobbies", "leisure", "activities"] },
      { title: "Música, filmes e séries", theme: "entertainment", description: "Entretenimento, géneros, recomendações, descrever histórias, dar opiniões", grammarFocus: ["preterite vs imperfect", "subjunctive with emotions"], vocabTarget: ["entertainment", "genres", "recommendations", "opinions"] },
      { title: "Telemóvel, Internet e redes sociais", theme: "daily_tech", description: "Tecnologia quotidiana, aplicações, mensagens, redes sociais, problemas técnicos", grammarFocus: ["gerund vs infinitive", "reflexive verbs"], vocabTarget: ["technology", "apps", "social media", "messaging"] },
      { title: "Mensagens, chamadas e conversas", theme: "communication", description: "Telefonemas, mensagens escritas, pedir para repetir, esclarecer, manter uma conversa", grammarFocus: ["imperative basic", "pronoun placement"], vocabTarget: ["phone calls", "messages", "communication", "clarification"] },
      { title: "Bairro, vizinhos e comunidade", theme: "neighborhood", description: "Vizinhança, regras, problemas comuns, pedidos, reclamações, relações comunitárias", grammarFocus: ["imperfect regular", "conditional"], vocabTarget: ["neighbors", "community", "rules", "complaints"] },
      { title: "Correio, encomendas e entregas", theme: "mail", description: "Encomendas, moradas, entregas, levantamentos, atrasos, problemas com compras", grammarFocus: ["preterite irregular", "passive voice"], vocabTarget: ["mail", "deliveries", "packages", "online shopping"] },
      { title: "Banco, dinheiro e pagamentos", theme: "banking", description: "Contas bancárias, cartões, transferências, pagamentos, levantamentos, comissões", grammarFocus: ["conditional", "object pronouns direct"], vocabTarget: ["banking", "cards", "transfers", "payments"] },
      { title: "Documentos e burocracia", theme: "bureaucracy", description: "Documentos, formulários, finanças, segurança social, câmara, agendamentos", grammarFocus: ["passive voice", "imperative basic"], vocabTarget: ["documents", "government offices", "bureaucracy", "appointments"] },
      { title: "Emergências e segurança", theme: "emergencies", description: "Emergências, polícia, bombeiros, acidente, perigo, pedir ajuda, explicar acontecimentos", grammarFocus: ["imperative basic", "preterite irregular"], vocabTarget: ["emergencies", "safety", "first aid", "police"] },
      { title: "Família, infância e memórias", theme: "memories", description: "Infância, família, memórias, descrever acontecimentos, pretérito perfeito e imperfeito", grammarFocus: ["preterite vs imperfect", "imperfect irregular"], vocabTarget: ["childhood", "memories", "family history", "narrative"] },
      { title: "O que aconteceu?", theme: "past_events", description: "Passado e experiências, acontecimentos passados, sequência temporal, narrar acontecimentos", grammarFocus: ["preterite vs imperfect", "reported speech intro"], vocabTarget: ["past events", "experiences", "narrative", "sequence"] },
      { title: "O que vai acontecer?", theme: "future", description: "Planos, intenções, futuro, previsões, condições simples, expressões temporais", grammarFocus: ["conditional sentences", "future subjunctive"], vocabTarget: ["future", "plans", "predictions", "intentions"] },
      { title: "Portugal e as suas tradições", theme: "traditions", description: "Festas, costumes, gastronomia, tradições regionais, feriados, cultura quotidiana", grammarFocus: ["relative pronouns", "subjunctive with emotions"], vocabTarget: ["traditions", "festivals", "Portuguese culture", "holidays"] },
      { title: "Opiniões, concordância e discordância", theme: "opinions", description: "Dar opinião, justificar, concordar, discordar educadamente, comparar ideias", grammarFocus: ["subjunctive present", "conjunctions"], vocabTarget: ["opinions", "debate", "agreement", "justification"] },
      { title: "Desenrascar-me sozinho", theme: "independence", description: "Situações inesperadas, resolver problemas, pedir ajuda, reformular, confirmar informação", grammarFocus: ["imperfect subjunctive", "pronoun placement"], vocabTarget: ["problem solving", "asking for help", "independence", "reformulation"] },
    ],
  },
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // S3 Intermedio (B2-C1) — 40 units — "Conversar, trabalhar, compreender"
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    title: { pt: "Secção 3 - Intermédio", en: "Section 3 - Intermediate" },
    description: { pt: "Conversar, trabalhar, estudar e compreender sociedade e cultura", en: "Converse, work, study and understand society and culture" },
    sectionType: "numbered",
    cefrMin: "B2",
    cefrMax: "C1",
    lessonsPerUnitStart: 8,
    lessonsPerUnitEnd: 6,
    units: [
      { title: "Trabalho e carreira", theme: "career", description: "Carreiras, currículo, entrevistas, experiência profissional, progressão, ambiente profissional", grammarFocus: ["pluperfect subjunctive", "complex conditionals"], vocabTarget: ["career", "CV", "interviews", "professional growth"] },
      { title: "Universidade e investigação", theme: "university", description: "Ensino superior, investigação, trabalhos académicos, hipóteses, resultados", grammarFocus: ["future perfect", "formal register"], vocabTarget: ["university", "research", "academic writing", "methodology"] },
      { title: "Negócios e dinheiro", theme: "business", description: "Empresas, investimento, mercado, lucros e prejuízos, negociação, finanças", grammarFocus: ["conditional sentences", "formal register"], vocabTarget: ["business", "finance", "investment", "negotiation"] },
      { title: "Tecnologia e sociedade", theme: "technology", description: "Tecnologia, digitalização, IA, redes sociais, privacidade, impacto social", grammarFocus: ["compound tenses intro", "gerund vs infinitive"], vocabTarget: ["technology", "AI", "social media", "privacy"] },
      { title: "Ciência e descoberta", theme: "science", description: "Ciência, experiências, descobertas, evidência, hipóteses, explicações científicas", grammarFocus: ["compound subjunctive", "abstract nominalization"], vocabTarget: ["science", "research", "discovery", "methodology"] },
      { title: "Ambiente e alterações climáticas", theme: "climate", description: "Ambiente, clima, sustentabilidade, poluição, energia, alterações climáticas", grammarFocus: ["imperfect subjunctive", "conditional sentences"], vocabTarget: ["environment", "climate", "sustainability", "energy"] },
      { title: "Saúde e sociedade", theme: "public_health", description: "Saúde pública, medicina, prevenção, sistemas de saúde, comportamentos, debate social", grammarFocus: ["impersonal constructions", "passive voice"], vocabTarget: ["public health", "healthcare", "prevention", "social debate"] },
      { title: "Política e cidadania", theme: "politics", description: "Cidadania, estado, participação cívica, eleições, instituições, debate público", grammarFocus: ["subjunctive in relative clauses", "passive se"], vocabTarget: ["politics", "citizenship", "elections", "civic participation"] },
      { title: "Direitos, leis e justiça", theme: "law", description: "Direitos, obrigações, leis, tribunais, justiça, linguagem jurídica básica", grammarFocus: ["passive voice", "formal register"], vocabTarget: ["rights", "law", "courts", "justice"] },
      { title: "Economia e vida quotidiana", theme: "economy", description: "Inflação, salários, habitação, impostos, consumo, economia doméstica", grammarFocus: ["conditional", "por/para distinction"], vocabTarget: ["economy", "salaries", "taxes", "cost of living"] },
      { title: "Portugal no mundo", theme: "world", description: "Portugal e Europa, relações internacionais, migração, lusofonia, identidade, globalização", grammarFocus: ["narrative tenses", "discourse connectors"], vocabTarget: ["international relations", "migration", "lusophone world", "identity"] },
      { title: "História de Portugal", theme: "history", description: "Períodos históricos, descobrimentos, Estado Novo, revolução, democracia, personagens históricas", grammarFocus: ["literary tenses", "narrative tenses"], vocabTarget: ["Portuguese history", "discoveries", "revolution", "democracy"] },
      { title: "Cultura portuguesa", theme: "culture", description: "Música, literatura, arte, tradições, cultura popular, identidade portuguesa", grammarFocus: ["relative pronouns", "subjunctive with emotions"], vocabTarget: ["culture", "music", "traditions", "Portuguese identity"] },
      { title: "Literatura e livros", theme: "literature", description: "Géneros literários, autores, narrativa, poesia, interpretação, linguagem literária", grammarFocus: ["literary tenses", "mesoclisis"], vocabTarget: ["literature", "genres", "authors", "literary analysis"] },
      { title: "Cinema e televisão", theme: "cinema", description: "Filmes, séries, crítica narrativa, personagens, opiniões complexas", grammarFocus: ["narrative tenses", "relative pronouns"], vocabTarget: ["cinema", "TV", "film analysis", "criticism"] },
      { title: "Arte e criatividade", theme: "art", description: "Pintura, escultura, fotografia, design, criatividade, crítica artística", grammarFocus: ["subjunctive in relative clauses", "passive se"], vocabTarget: ["art", "design", "creativity", "art criticism"] },
      { title: "Viagens fora do roteiro", theme: "offbeat_travel", description: "Viagens independentes, experiências culturais, imprevistos, recomendações, narrativas", grammarFocus: ["preterite vs imperfect", "discourse connectors"], vocabTarget: ["independent travel", "cultural experiences", "recommendations"] },
      { title: "Turismo e hospitalidade", theme: "hospitality", description: "Hotelaria, turismo, atendimento, reclamações, experiência do cliente", grammarFocus: ["conditional", "subjunctive with emotions"], vocabTarget: ["tourism", "hospitality", "service industry", "complaints"] },
      { title: "Comida, vinho e gastronomia", theme: "gastronomy", description: "Gastronomia, vinhos, regiões, degustação, restaurantes, vocabulário especializado", grammarFocus: ["idiomatic usage", "passive se"], vocabTarget: ["gastronomy", "wine", "regional cuisine", "tasting"] },
      { title: "Desporto e sociedade", theme: "sports_society", description: "Competições, clubes, adeptos, media, negócio do desporto, identidade coletiva", grammarFocus: ["preterite vs imperfect", "discourse connectors"], vocabTarget: ["sports", "competitions", "fandom", "sports media"] },
      { title: "Media e notícias", theme: "media", description: "Notícias, jornalismo, fontes, manchetes, informação e desinformação, narrativa mediática", grammarFocus: ["reported speech intro", "narrative tenses"], vocabTarget: ["news", "journalism", "sources", "misinformation"] },
      { title: "Publicidade e influência", theme: "advertising", description: "Publicidade, marketing, persuasão, marcas, comportamento do consumidor", grammarFocus: ["conditional", "imperative basic"], vocabTarget: ["advertising", "marketing", "persuasion", "consumer behavior"] },
      { title: "Psicologia e comportamento", theme: "psychology", description: "Emoções, comportamento, relações sociais, hábitos, perceções, explicações psicológicas", grammarFocus: ["subjunctive with doubt", "compound subjunctive"], vocabTarget: ["psychology", "behavior", "emotions", "relationships"] },
      { title: "Relações, conflito e negociação", theme: "conflict", description: "Conflitos, negociação, limites, compromissos, estratégias comunicativas", grammarFocus: ["subjunctive nuances", "conditional sentences"], vocabTarget: ["conflict resolution", "negotiation", "compromise", "diplomacy"] },
      { title: "Humor, ironia e sarcasmo", theme: "humor_irony", description: "Humor, ironia, sarcasmo, duplo sentido, subentendidos, contexto cultural", grammarFocus: ["idiomatic usage", "stylistic choices"], vocabTarget: ["humor", "irony", "sarcasm", "double meaning"] },
      { title: "Expressões e provérbios", theme: "idioms", description: "Expressões idiomáticas, provérbios, metáforas, linguagem figurada, origem e contexto", grammarFocus: ["idiomatic usage", "register variation"], vocabTarget: ["idioms", "proverbs", "metaphors", "figurative language"] },
      { title: "Gíria e linguagem informal", theme: "informal_speech", description: "Gíria, calão, abreviaturas, internet, linguagem jovem, registo informal", grammarFocus: ["register variation", "regional variation"], vocabTarget: ["slang", "informal speech", "internet language", "youth speak"] },
      { title: "Falar de forma formal", theme: "formal_speech", description: "Registo formal, cortesia, comunicação profissional, pedidos, reclamações, reformulação", grammarFocus: ["formal subjunctive", "impersonal constructions"], vocabTarget: ["formal register", "courtesy", "professional communication"] },
      { title: "Argumentar e defender uma ideia", theme: "argumentation", description: "Argumentação, evidência, contra-argumentos, concordância e discordância, estrutura lógica", grammarFocus: ["advanced connectors", "subjunctive nuances"], vocabTarget: ["argumentation", "evidence", "debate", "persuasion"] },
      { title: "Conversas reais", theme: "real_conversations", description: "Conversação espontânea, interrupções, reformulação, hesitação, subentendidos, registo, fluência", grammarFocus: ["all tenses review", "pronoun placement"], vocabTarget: ["spontaneous speech", "hesitation", "reformulation", "fluency"] },
      { title: "Trabalho em equipa", theme: "teamwork", description: "Colaboração, responsabilidades, delegação, reuniões, dar e receber feedback", grammarFocus: ["formal register", "conditional"], vocabTarget: ["teamwork", "collaboration", "meetings", "feedback"] },
      { title: "Entrevistas e carreira", theme: "job_interviews", description: "Entrevistas de emprego, currículo, experiência profissional, qualificações, objetivos", grammarFocus: ["conditional sentences", "future subjunctive"], vocabTarget: ["job interviews", "qualifications", "career goals", "professional skills"] },
      { title: "Universidade e investigação", theme: "academic", description: "Ensino superior, trabalhos académicos, investigação, fontes, hipóteses e conclusões", grammarFocus: ["abstract nominalization", "formal register"], vocabTarget: ["academic writing", "research", "sources", "conclusions"] },
      { title: "Tecnologia do quotidiano", theme: "everyday_tech", description: "Aplicações, inteligência artificial, privacidade, segurança digital, automação", grammarFocus: ["gerund vs infinitive", "compound tenses intro"], vocabTarget: ["technology", "AI", "digital security", "automation"] },
      { title: "Ambiente e sustentabilidade", theme: "sustainability", description: "Alterações climáticas, energia, reciclagem, consumo, sustentabilidade, políticas ambientais", grammarFocus: ["future subjunctive", "complex conditionals"], vocabTarget: ["sustainability", "recycling", "energy policy", "green economy"] },
      { title: "Sociedade e mudança", theme: "social_change", description: "Mudanças sociais, gerações, desigualdade, migração, comunidade, transformações culturais", grammarFocus: ["compound subjunctive", "narrative tenses"], vocabTarget: ["social change", "inequality", "generations", "migration"] },
      { title: "Notícias e informação", theme: "news_literacy", description: "Notícias, jornalismo, fontes, manchetes, opinião, desinformação, facto vs interpretação", grammarFocus: ["passive voice", "reported speech intro"], vocabTarget: ["news literacy", "fact-checking", "media analysis", "opinion"] },
      { title: "Comunicação e conflito", theme: "communication_conflict", description: "Desacordos, reclamações, negociação, compromissos, diplomacia, resolver mal-entendidos", grammarFocus: ["conditional sentences", "subjunctive nuances"], vocabTarget: ["conflict communication", "complaints", "compromise", "diplomacy"] },
      { title: "Linguagem, humor e cultura", theme: "language_culture", description: "Ironia, humor, expressões idiomáticas, referências culturais, linguagem informal, memes e cultura digital", grammarFocus: ["stylistic choices", "idiomatic usage"], vocabTarget: ["cultural references", "memes", "digital culture", "humor"] },
      { title: "Conversas sem guião", theme: "unscripted", description: "Conversação espontânea, interrupções, hesitações, reformulação, marcadores discursivos, fala natural", grammarFocus: ["discourse connectors", "register variation"], vocabTarget: ["spontaneous speech", "discourse markers", "natural talk", "register switching"] },
    ],
  },
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // S4 Avancado (C1-C2) — 50 units — "Dominar nuance, registo, argumentação, humor"
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    title: { pt: "Secção 4 - Avançado", en: "Section 4 - Advanced" },
    description: { pt: "Domínio avançado: nuances, produção criativa, registo literário, argumentação e variação regional", en: "Advanced mastery: nuances, creative production, literary register, argumentation and regional variation" },
    sectionType: "numbered",
    cefrMin: "C1",
    cefrMax: "C2",
    lessonsPerUnitStart: 9,
    lessonsPerUnitEnd: 7,
    units: [
      { title: "Falar com precisão", theme: "precision", description: "Escolha lexical, nuances entre palavras próximas, precisão semântica, reformulação, evitar ambiguidades", grammarFocus: ["all tenses review", "register variation"], vocabTarget: ["lexical precision", "synonyms", "reformulation", "register"] },
      { title: "Nuances e subtilezas", theme: "nuance", description: "Subentendidos, implicaturas, ironia subtil, atenuação, intensificação, sentido contextual", grammarFocus: ["subjunctive nuances", "conditional sentences"], vocabTarget: ["implicature", "attenuation", "intensification", "context"] },
      { title: "Humor português", theme: "pt_humor", description: "Humor português, referências culturais, ironia, sarcasmo, absurdo, humor de situação", grammarFocus: ["idiomatic usage", "stylistic choices"], vocabTarget: ["humor", "cultural references", "irony", "wordplay"] },
      { title: "Memes, Internet e cultura digital", theme: "memes", description: "Memes portugueses, linguagem online, abreviaturas, referências virais, humor digital", grammarFocus: ["register variation", "creative grammar"], vocabTarget: ["memes", "internet language", "viral references", "digital culture"] },
      { title: "Gíria, calão e linguagem de rua", theme: "street_language", description: "Gíria, calão, expressões populares, linguagem juvenil, registo informal", grammarFocus: ["regional variation", "register variation"], vocabTarget: ["slang", "colloquial speech", "informal register", "youth language"] },
      { title: "Provérbios e sabedoria popular", theme: "proverbs", description: "Provérbios, expressões tradicionais, metáforas, valores culturais, uso em contexto", grammarFocus: ["archaic forms", "idiomatic usage"], vocabTarget: ["proverbs", "folk wisdom", "traditional sayings", "metaphors"] },
      { title: "Ironia, sarcasmo e subentendidos", theme: "irony", description: "Ironia, sarcasmo, eufemismo, litote, pergunta retórica, contraste literal e implícito", grammarFocus: ["stylistic devices", "subjunctive nuances"], vocabTarget: ["irony", "sarcasm", "euphemism", "rhetorical devices"] },
      { title: "Debater sem perder o fio", theme: "debate", description: "Estrutura argumentativa, conectores discursivos, retoma de ideias, contraposição, gestão de turnos", grammarFocus: ["discourse connectors", "advanced connectors"], vocabTarget: ["debate structure", "connectors", "turn management", "counterarguments"] },
      { title: "Persuadir e argumentar", theme: "persuasion", description: "Argumentação avançada, evidência, contra-argumentação, estratégias persuasivas, apelo emocional e racional", grammarFocus: ["formal subjunctive", "complex conditionals"], vocabTarget: ["persuasion", "argumentation", "evidence", "rhetoric"] },
      { title: "Negociar e resolver conflitos", theme: "negotiation", description: "Negociação, concessão, compromisso, discordância diplomática, mediação", grammarFocus: ["conditional sentences", "subjunctive nuances"], vocabTarget: ["negotiation", "compromise", "mediation", "diplomacy"] },
      { title: "Falar em público", theme: "public_speaking", description: "Discursos, apresentações, introdução e conclusão, ênfase, pausas, entoação, retórica", grammarFocus: ["discourse connectors", "impersonal constructions"], vocabTarget: ["public speaking", "presentations", "rhetoric", "intonation"] },
      { title: "Entrevistas e apresentações profissionais", theme: "professional", description: "Entrevistas, apresentações profissionais, perguntas difíceis, comunicação persuasiva", grammarFocus: ["formal register", "conditional sentences"], vocabTarget: ["professional interviews", "presentations", "persuasive communication"] },
      { title: "Reuniões e comunicação empresarial", theme: "corporate", description: "Reuniões, agenda, decisões, negociação, discordância profissional, follow-up", grammarFocus: ["formal subjunctive", "discourse connectors"], vocabTarget: ["meetings", "corporate communication", "decisions", "follow-up"] },
      { title: "Escrever emails e mensagens formais", theme: "formal_writing", description: "Emails profissionais, pedidos, reclamações, respostas diplomáticas, cortesia linguística", grammarFocus: ["formal register", "impersonal constructions"], vocabTarget: ["formal email", "professional writing", "complaints", "courtesy"] },
      { title: "Escrita académica", theme: "academic_writing", description: "Textos académicos, estrutura, citação, paráfrase, síntese, argumentação, registo académico", grammarFocus: ["impersonal constructions", "abstract nominalization"], vocabTarget: ["academic writing", "citations", "methodology", "academic register"] },
      { title: "Textos jornalísticos", theme: "journalism", description: "Notícias, reportagens, editorial, entrevista, manchetes, estrutura jornalística", grammarFocus: ["narrative tenses", "passive se"], vocabTarget: ["journalism", "reporting", "editorial", "news writing"] },
      { title: "Analisar notícias e opinião", theme: "news_analysis", description: "Facto vs opinião, enquadramento, argumentação, linguagem avaliativa, fontes", grammarFocus: ["reported speech intro", "subjunctive nuances"], vocabTarget: ["news analysis", "fact vs opinion", "framing", "media literacy"] },
      { title: "Literatura portuguesa", theme: "pt_literature", description: "Autores, obras, géneros, contexto histórico, análise textual, interpretação", grammarFocus: ["literary tenses", "mesoclisis"], vocabTarget: ["Portuguese literature", "authors", "literary analysis", "interpretation"] },
      { title: "Poesia e linguagem figurada", theme: "poetry", description: "Poesia, metáfora, símbolo, aliteração, anáfora, antítese, sinestesia, recursos expressivos", grammarFocus: ["stylistic devices", "archaic forms"], vocabTarget: ["poetry", "meter", "figurative language", "literary devices"] },
      { title: "Teatro e diálogo", theme: "theatre", description: "Teatro, diálogo, monólogo, subtexto, personagens, registo, discurso direto", grammarFocus: ["narrative tenses", "stylistic choices"], vocabTarget: ["theatre", "dramaturgy", "dialogue", "subtexto"] },
      { title: "Crítica de arte e cultura", theme: "art_criticism", description: "Crítica, avaliação, argumentação, linguagem estética, justificação de opiniões", grammarFocus: ["stylistic devices", "abstract nominalization"], vocabTarget: ["art criticism", "reviews", "cultural analysis", "aesthetics"] },
      { title: "História e documentos", theme: "historical_texts", description: "Documentos históricos, fontes, narrativa histórica, interpretação, vocabulário histórico", grammarFocus: ["archaic forms", "literary tenses"], vocabTarget: ["historical texts", "chronicles", "archaic language", "interpretation"] },
      { title: "Direito e linguagem jurídica", theme: "legal", description: "Contratos, legislação, direitos, deveres, obrigações, terminologia jurídica", grammarFocus: ["formal subjunctive", "passive se"], vocabTarget: ["legal terminology", "contracts", "legislation", "court language"] },
      { title: "Ciência e linguagem técnica", theme: "scientific", description: "Textos científicos, hipóteses, métodos, resultados, causalidade, escrita científica", grammarFocus: ["passive se", "abstract nominalization"], vocabTarget: ["scientific writing", "methodology", "technical language", "causality"] },
      { title: "Saúde e linguagem médica", theme: "medical", description: "Terminologia médica, consultas complexas, sintomas, diagnóstico, informação de saúde", grammarFocus: ["abstract nominalization", "compound subjunctive"], vocabTarget: ["medical terminology", "diagnosis", "clinical reports", "health info"] },
      { title: "Política e discurso público", theme: "political_discourse", description: "Discurso político, debate público, retórica, argumentação, eufemismo, framing", grammarFocus: ["complex conditionals", "impersonal constructions"], vocabTarget: ["political discourse", "rhetoric", "propaganda", "framing"] },
      { title: "Portugal, regiões e sotaques", theme: "dialects", description: "Variação regional, sotaques, vocabulário regional, Açores, Madeira, Norte, Centro, Sul", grammarFocus: ["regional variation", "idiomatic usage"], vocabTarget: ["dialects", "regional speech", "accents", "geographic variation"] },
      { title: "Português através dos tempos", theme: "etymology", description: "Arcaísmos, evolução lexical, mudanças semânticas, neologismos, origem das palavras", grammarFocus: ["archaic forms", "literary tenses"], vocabTarget: ["etymology", "language history", "archaisms", "neologisms"] },
      { title: "Criar, contar e escrever", theme: "creative_writing", description: "Escrita criativa, narrativa, descrição, diálogo, construção de personagens, coerência, estilo", grammarFocus: ["stylistic choices", "creative grammar"], vocabTarget: ["creative writing", "narrative", "style", "character building"] },
      { title: "Português sem legendas", theme: "authentic_listening", description: "Listening avançado, fala espontânea, velocidade natural, redução vocálica, contrações", grammarFocus: ["all tenses review", "regional variation"], vocabTarget: ["authentic listening", "natural speech", "vowel reduction", "contractions"] },
      { title: "O português que não se diz literalmente", theme: "implicature", description: "Implícito, pressuposição, implicatura, inferência, duplo sentido, intenção comunicativa", grammarFocus: ["subjunctive nuances", "stylistic devices"], vocabTarget: ["implicature", "presupposition", "inference", "double meaning"] },
      { title: "Escolher a palavra certa", theme: "lexical_choice", description: "Sinónimos e quase-sinónimos, polissemia, homonímia, colocações, seleção lexical", grammarFocus: ["register variation", "idiomatic usage"], vocabTarget: ["synonyms", "polysemy", "collocations", "lexical precision"] },
      { title: "Frases longas sem te perderes", theme: "complex_syntax", description: "Coordenação, subordinação, orações relativas, completivas, condicionais, coesão sintática", grammarFocus: ["complex conditionals", "impersonal constructions"], vocabTarget: ["complex syntax", "subordination", "relative clauses", "cohesion"] },
      { title: "Quem fez o quê?", theme: "voice_focus", description: "Voz ativa, voz passiva, construções impessoais, se impessoal, foco informacional", grammarFocus: ["passive se", "passive voice"], vocabTarget: ["voice", "impersonal constructions", "focus", "perspective"] },
      { title: "Tempo, aspeto e perspetiva", theme: "tense_aspect", description: "Pretéritos, futuro, condicional, aspeto, duração, iteração, relações temporais complexas", grammarFocus: ["narrative tenses", "compound tenses intro"], vocabTarget: ["tense", "aspect", "temporal relations", "duration"] },
      { title: "Certeza, dúvida, desejo e obrigação", theme: "modality", description: "Modalidade, possibilidade, probabilidade, certeza, necessidade, obrigação, desejo", grammarFocus: ["subjunctive nuances", "conditional sentences"], vocabTarget: ["modality", "possibility", "obligation", "desire"] },
      { title: "Dizer sem dizer diretamente", theme: "indirectness", description: "Cortesia, atenuação, estratégias indiretas, pedidos indiretos, recusas, preservação da face", grammarFocus: ["formal subjunctive", "conditional"], vocabTarget: ["politeness", "indirect speech", "face-saving", "attenuation"] },
      { title: "Como o discurso se organiza", theme: "discourse", description: "Coerência, coesão, conectores, progressão temática, referência, elipse", grammarFocus: ["discourse connectors", "advanced connectors"], vocabTarget: ["discourse structure", "cohesion", "thematic progression", "connectors"] },
      { title: "Contar exatamente o que alguém disse", theme: "reported_speech", description: "Discurso direto, indireto, indireto livre, verbos de elocução, alteração de tempos", grammarFocus: ["reported speech intro", "narrative tenses"], vocabTarget: ["reported speech", "speech verbs", "tense shifting", "quotation"] },
      { title: "Ver o mundo através das palavras", theme: "deixis", description: "Deixis pessoal, temporal, espacial, contexto, referência, perspetiva do falante", grammarFocus: ["pronoun placement", "demonstratives"], vocabTarget: ["deixis", "context", "reference", "speaker perspective"] },
      { title: "Palavras que nasceram ontem", theme: "neologisms", description: "Neologismos, internet, tecnologia, empréstimos, formação de palavras, produtividade lexical", grammarFocus: ["creative grammar", "abstract nominalization"], vocabTarget: ["neologisms", "word formation", "derivation", "borrowings"] },
      { title: "Palavras que já quase desapareceram", theme: "archaisms", description: "Arcaísmos, vocabulário histórico, mudança lexical, textos antigos, formas antigas", grammarFocus: ["archaic forms", "literary tenses"], vocabTarget: ["archaisms", "historical vocabulary", "language change", "old texts"] },
      { title: "Português e outras línguas", theme: "comparative", description: "Empréstimos, estrangeirismos, falsos amigos, influências linguísticas, comparação lexical", grammarFocus: ["register variation", "idiomatic usage"], vocabTarget: ["borrowings", "false friends", "linguistic influence", "comparison"] },
      { title: "Ler nas entrelinhas", theme: "intertextuality", description: "Intertextualidade, citação, epígrafe, alusão, paráfrase, paródia, referências culturais", grammarFocus: ["stylistic devices", "literary tenses"], vocabTarget: ["intertextuality", "allusion", "parody", "cultural references"] },
      { title: "Quando uma palavra muda tudo", theme: "semantics", description: "Polissemia, ambiguidade, metáfora, metonímia, sinédoque, personificação", grammarFocus: ["stylistic choices", "idiomatic usage"], vocabTarget: ["semantics", "metaphor", "metonymy", "ambiguity"] },
      { title: "A língua como ferramenta de estilo", theme: "style", description: "Adjetivação, enumeração, graduação, hipérbole, pleonasmo, antítese, anástrofe", grammarFocus: ["stylistic devices", "creative grammar"], vocabTarget: ["stylistic devices", "hyperbole", "antithesis", "literary style"] },
      { title: "Português em situações difíceis", theme: "high_stakes", description: "Reclamações complexas, conflitos, negociação, comunicação sob pressão, reformulação", grammarFocus: ["conditional sentences", "subjunctive nuances"], vocabTarget: ["high-stakes communication", "complaints", "pressure", "reformulation"] },
      { title: "Falar como um português", theme: "native_speech", description: "Colocações naturais, expressões idiomáticas, marcadores discursivos, interjeições, ritmo, hesitação", grammarFocus: ["all tenses review", "discourse connectors"], vocabTarget: ["natural collocations", "discourse markers", "interjections", "rhythm"] },
      { title: "Compreender Portugal", theme: "understanding_portugal", description: "Cultura contemporânea, história e memória, humor, música, televisão, internet, regionalismos", grammarFocus: ["regional variation", "idiomatic usage"], vocabTarget: ["contemporary culture", "Portuguese identity", "media", "regionalism"] },
      { title: "Português sem limites", theme: "mastery", description: "Mistura de todos os domínios, listening autêntico, leitura avançada, escrita, argumentação, produção espontânea", grammarFocus: ["creative grammar", "stylistic choices"], vocabTarget: ["full mastery", "authentic content", "all domains", "spontaneous production"] },
    ],
  },
  // ── Daily Refresh (sempre presente, nao directamente acessivel) ──
  {
    title: { pt: "Revisão Diária", en: "Daily Refresh" },
    description: { pt: "Revisão adaptativa de conteúdo aprendido, personalizada por dia", en: "Adaptive review of learned content, personalized daily" },
    sectionType: "daily_refresh",
    cefrMin: "A1",
    cefrMax: "C2",
    lessonsPerUnitStart: 5,
    lessonsPerUnitEnd: 5,
    units: [],
  },
];

export async function seedCourseStructure(
  l1: L1Code,
  db: Database,
): Promise<{ courseId: string; sectionCount: number; unitCount: number; lessonCount: number; chestCount: number }> {
  const profile = getProfile(l1);

  const [course] = await db
    .insert(courses)
    .values({
      title: { pt: `Português europeu para falantes de ${profile.nativeName}`, [l1]: `European Portuguese for ${profile.name} speakers` },
      description: { pt: `Curso completo de PT-EU adaptado para falantes de ${profile.name}`, [l1]: `Complete PT-EU course adapted for ${profile.name} speakers` },
      l1Source: l1,
      cefrMin: "A1" as CEFRLevel,
      cefrMax: "C2" as CEFRLevel,
      sortOrder: "0",
    })
    .returning({ id: courses.id });

  let sectionCount = 0;
  let unitCount = 0;
  let lessonCount = 0;
  let chestCount = 0;

  for (let sIdx = 0; sIdx < COURSE_SECTIONS.length; sIdx++) {
    const sectionDef = COURSE_SECTIONS[sIdx]!;


    const [section] = await db
      .insert(sections)
      .values({
        courseId: course!.id,
        sortOrder: sIdx,
        title: sectionDef.title,
        description: sectionDef.description,
        sectionType: sectionDef.sectionType,
        cefrMin: sectionDef.cefrMin,
        cefrMax: sectionDef.cefrMax,
        lessonsPerUnitStart: sectionDef.lessonsPerUnitStart,
        lessonsPerUnitEnd: sectionDef.lessonsPerUnitEnd,
      })
      .returning({ id: sections.id });

    sectionCount++;

    for (let uIdx = 0; uIdx < sectionDef.units.length; uIdx++) {
      const unitDef = sectionDef.units[uIdx]!;
      const [unit] = await db
        .insert(units)
        .values({
          sectionId: section!.id,
          title: { pt: unitDef.title },
          theme: unitDef.theme,
          description: { pt: unitDef.description },
          sortOrder: uIdx,
        })
        .returning({ id: units.id });

      unitCount++;

      const skillCodes = new Set<string>();
      for (const gf of unitDef.grammarFocus) {
        const mapped = GRAMMAR_TO_SKILLS[gf];
        if (mapped) mapped.forEach((c) => skillCodes.add(c));
      }

      let resolvedSkillIds: { id: string; code: string; isPrimary: boolean }[] = [];
      if (skillCodes.size > 0) {
        const allSkills = await db
          .select({ id: skills.id, code: skills.code })
          .from(skills);
        const firstGf = unitDef.grammarFocus[0];
        const primaryCodes = new Set(GRAMMAR_TO_SKILLS[firstGf ?? ""] ?? []);
        resolvedSkillIds = allSkills
          .filter((s) => skillCodes.has(s.code))
          .map((s) => ({ ...s, isPrimary: primaryCodes.has(s.code) }));
      }

      const totalUnits = sectionDef.units.length;
      const progress = totalUnits > 1 ? uIdx / (totalUnits - 1) : 0;
      const totalSlots = Math.round(
        sectionDef.lessonsPerUnitStart +
          (sectionDef.lessonsPerUnitEnd - sectionDef.lessonsPerUnitStart) * progress,
      );

      const chestPositions = new Set(getChestPositions(totalSlots));

      for (let slotIdx = 0; slotIdx < totalSlots; slotIdx++) {
        const isChest = chestPositions.has(slotIdx);

        const [lesson] = await db.insert(lessons).values({
          unitId: unit!.id,
          sortOrder: slotIdx,
          nodeType: isChest ? "chest" : "lesson",
          grammarFocus: isChest ? [] : unitDef.grammarFocus,
          vocabTarget: isChest ? [] : unitDef.vocabTarget,
          rewardConfig: isChest ? pickChestReward(uIdx + slotIdx) : null,
        }).returning({ id: lessons.id });

        if (isChest) {
          chestCount++;
        } else {
          if (resolvedSkillIds.length > 0 && lesson) {
            await db.insert(lessonSkills).values(
              resolvedSkillIds.map((s) => ({
                lessonId: lesson.id,
                skillId: s.id,
                isPrimary: s.isPrimary,
              })),
            );
          }
        }
        lessonCount++;
      }
    }
  }

  return { courseId: course!.id, sectionCount, unitCount, lessonCount, chestCount };
}

export async function seedAllPhase1Courses(
  db: Database,
): Promise<Record<string, { courseId: string; sectionCount: number; unitCount: number; lessonCount: number; chestCount: number }>> {
  const results: Record<string, { courseId: string; sectionCount: number; unitCount: number; lessonCount: number; chestCount: number }> = {};

  for (const l1 of L1_PHASE_1) {
    results[l1] = await seedCourseStructure(l1, db);
  }

  return results;
}
