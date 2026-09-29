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

export const COURSE_SECTIONS: SectionDef[] = [
  // ── S1 Básico (A1-A2) ── 10 units, 5 lições/unit ──
  {
    title: { pt: "Secção 1 - Básico", en: "Section 1 - Basics" },
    description: { pt: "Fundamentos do português europeu: cumprimentos, vocabulário essencial e gramática básica", en: "European Portuguese fundamentals: greetings, essential vocabulary and basic grammar" },
    sectionType: "numbered",
    cefrMin: "A1",
    cefrMax: "A2",
    lessonsPerUnitStart: 5,
    lessonsPerUnitEnd: 6,
    units: [
      { title: "Cumprimentos e apresentações", theme: "greetings", description: "Olá, como te chamas, de onde és", grammarFocus: ["ser present", "articles"], vocabTarget: ["greetings", "introductions"] },
      { title: "Números e datas", theme: "numbers", description: "Contar, dias da semana, meses", grammarFocus: ["cardinal numbers", "ordinal numbers"], vocabTarget: ["numbers", "dates", "time"] },
      { title: "Família e relações", theme: "family", description: "Mãe, pai, irmãos, amigos", grammarFocus: ["possessives", "gender agreement"], vocabTarget: ["family", "relationships"] },
      { title: "Comida e bebida", theme: "food", description: "No restaurante, no café, no supermercado", grammarFocus: ["querer present", "partitive"], vocabTarget: ["food", "drinks", "restaurant"] },
      { title: "A casa", theme: "home", description: "Divisões, mobília, rotina em casa", grammarFocus: ["estar present", "prepositions em/de"], vocabTarget: ["rooms", "furniture", "daily objects"] },
      { title: "O corpo e a saúde", theme: "body", description: "Partes do corpo, dizer como te sentes", grammarFocus: ["ter present", "doer"], vocabTarget: ["body parts", "health", "feelings"] },
      { title: "Transportes e direções", theme: "transport", description: "Autocarro, comboio, telemóvel, pedir direções", grammarFocus: ["ir present", "imperative basic"], vocabTarget: ["transport", "directions", "city"] },
      { title: "Compras e dinheiro", theme: "shopping", description: "Na loja, preços, pagar", grammarFocus: ["poder present", "demonstratives"], vocabTarget: ["shopping", "clothes", "money"] },
      { title: "Rotina diária", theme: "routine", description: "O meu dia, horas, hábitos", grammarFocus: ["reflexive verbs", "frequency adverbs"], vocabTarget: ["daily routine", "time expressions"] },
      { title: "Tempo e estações", theme: "weather", description: "Como está o tempo, estações do ano", grammarFocus: ["fazer weather", "comparative"], vocabTarget: ["weather", "seasons", "nature"] },
    ],
  },
  // ── S2 Principiante (A2-B1) ── 30 units, 6 lições/unit ──
  {
    title: { pt: "Secção 2 - Principiante", en: "Section 2 - Beginner" },
    description: { pt: "Consolidação e expansão: passado, opinião, cultura e vida quotidiana", en: "Consolidation and expansion: past tenses, opinions, culture and daily life" },
    sectionType: "numbered",
    cefrMin: "A2",
    cefrMax: "B1",
    lessonsPerUnitStart: 7,
    lessonsPerUnitEnd: 6,
    units: [
      { title: "Profissões e trabalho", theme: "work", description: "O que fazes, o escritório, entrevistas", grammarFocus: ["preterite regular", "porque/por que"], vocabTarget: ["professions", "workplace"] },
      { title: "Viagens e férias", theme: "travel", description: "No aeroporto, no hotel, férias", grammarFocus: ["preterite irregular", "prepositions para/a"], vocabTarget: ["travel", "accommodation", "tourism"] },
      { title: "Lazer e passatempos", theme: "leisure", description: "Desporto, música, cinema, hobbies", grammarFocus: ["gostar de", "imperfect introduction"], vocabTarget: ["hobbies", "sports", "entertainment"] },
      { title: "A cidade e serviços", theme: "city", description: "Correios, banco, hospital, polícia", grammarFocus: ["imperfect regular", "object pronouns direct"], vocabTarget: ["city services", "public places"] },
      { title: "Saúde e bem-estar", theme: "health", description: "No médico, na farmácia, emergências", grammarFocus: ["imperfect irregular", "subjunctive present intro"], vocabTarget: ["medical", "pharmacy", "emergency"] },
      { title: "Festas e tradições", theme: "traditions", description: "Santos Populares, Natal, Páscoa, casamentos", grammarFocus: ["preterite vs imperfect", "indirect objects"], vocabTarget: ["celebrations", "traditions", "culture"] },
      { title: "Opinião e debate", theme: "opinion", description: "Concordar, discordar, argumentar", grammarFocus: ["subjunctive present", "conjunctions"], vocabTarget: ["opinions", "debate", "connectors"] },
      { title: "Notícias e media", theme: "news", description: "Jornais, televisão, redes sociais", grammarFocus: ["passive voice", "reported speech intro"], vocabTarget: ["media", "news", "technology"] },
      { title: "Cultura portuguesa", theme: "culture", description: "Fado, literatura, cinema, arte", grammarFocus: ["relative pronouns", "subjunctive with emotions"], vocabTarget: ["arts", "music", "literature"] },
      { title: "Trabalho e carreira", theme: "career", description: "CV, entrevista, promoção, reuniões", grammarFocus: ["conditional", "por/para distinction"], vocabTarget: ["career", "business", "meetings"] },
      { title: "Educação e formação", theme: "education", description: "Universidade, cursos, aprender", grammarFocus: ["future subjunctive", "personal infinitive"], vocabTarget: ["education", "studying", "exams"] },
      { title: "Ambiente e natureza", theme: "environment", description: "Reciclagem, alterações climáticas, ecologia", grammarFocus: ["imperfect subjunctive", "conditional sentences"], vocabTarget: ["environment", "ecology", "sustainability"] },
      { title: "Tecnologia e inovação", theme: "technology", description: "Internet, apps, inteligência artificial", grammarFocus: ["compound tenses intro", "gerund vs infinitive"], vocabTarget: ["technology", "innovation", "digital"] },
      { title: "Relações e emoções", theme: "relationships", description: "Amizade, amor, conflitos, emoções", grammarFocus: ["subjunctive with doubt", "pronoun placement"], vocabTarget: ["emotions", "relationships", "personality"] },
      { title: "Habitação e arrendamento", theme: "housing", description: "Alugar casa, contratos, vizinhos, condomínio", grammarFocus: ["conditional", "prepositions em/de"], vocabTarget: ["housing", "contracts", "neighborhoods"] },
      { title: "Documentação e burocracia", theme: "bureaucracy", description: "NIF, NISS, SEF, vistos, finanças", grammarFocus: ["passive voice", "imperative basic"], vocabTarget: ["documents", "government offices", "bureaucracy"] },
      { title: "Desporto e vida activa", theme: "sports", description: "Futebol, ginásio, corrida, competições", grammarFocus: ["preterite regular", "comparative"], vocabTarget: ["sports", "fitness", "competition"] },
      { title: "Animais e natureza", theme: "animals", description: "Animais domésticos, fauna portuguesa, campo", grammarFocus: ["imperfect regular", "demonstratives"], vocabTarget: ["animals", "nature", "countryside"] },
      { title: "Comunicação e redes sociais", theme: "communication", description: "Email, mensagens, telefonemas, publicações", grammarFocus: ["gerund vs infinitive", "reflexive verbs"], vocabTarget: ["communication", "social media", "messaging"] },
      { title: "Direitos e deveres", theme: "rights", description: "Direitos laborais, segurança social, cidadania", grammarFocus: ["subjunctive present", "passive voice"], vocabTarget: ["rights", "labor law", "citizenship"] },
      { title: "Culinária portuguesa", theme: "cooking", description: "Receitas, ingredientes, pratos típicos, bacalhau", grammarFocus: ["imperative basic", "partitive"], vocabTarget: ["cooking", "recipes", "ingredients"] },
      { title: "Música e dança", theme: "music", description: "Fado, música popular, festivais, concertos", grammarFocus: ["preterite vs imperfect", "subjunctive with emotions"], vocabTarget: ["music", "dance", "festivals"] },
      { title: "Vida social e convívio", theme: "social", description: "Fazer amigos, convites, festas, saídas", grammarFocus: ["conditional", "indirect objects"], vocabTarget: ["socializing", "invitations", "going out"] },
      { title: "Imigração e integração", theme: "immigration", description: "Chegar a Portugal, integração, saudades, comunidade", grammarFocus: ["imperfect subjunctive", "pronoun placement"], vocabTarget: ["immigration", "integration", "community"] },
      { title: "Vestuário e moda", theme: "clothing", description: "Roupa, tamanhos, cores, estilo", grammarFocus: ["demonstratives", "comparative"], vocabTarget: ["clothing", "fashion", "colors"] },
      { title: "Correio e encomendas", theme: "mail", description: "Correios, encomendas online, devoluções", grammarFocus: ["preterite irregular", "passive voice"], vocabTarget: ["mail", "online shopping", "deliveries"] },
      { title: "Vizinhança e comunidade", theme: "neighborhood", description: "Vizinhos, associações, vida local", grammarFocus: ["imperfect regular", "prepositions em/de"], vocabTarget: ["neighbors", "local community", "associations"] },
      { title: "Emergências e segurança", theme: "emergencies", description: "112, bombeiros, polícia, primeiros socorros", grammarFocus: ["imperative basic", "conditional"], vocabTarget: ["emergencies", "safety", "first aid"] },
      { title: "Entrevistas e candidaturas", theme: "interviews", description: "CV, carta de motivação, entrevista de emprego", grammarFocus: ["conditional", "future subjunctive"], vocabTarget: ["job applications", "CVs", "interviews"] },
      { title: "Jardim e plantas", theme: "gardening", description: "Horta, flores, plantas, mercados biológicos", grammarFocus: ["imperfect introduction", "demonstratives"], vocabTarget: ["plants", "gardening", "organic markets"] },
    ],
  },
  // ── S3 Intermédio (B2-C1) ── 40 units, 8→6 lições/unit ──
  {
    title: { pt: "Secção 3 - Intermédio", en: "Section 3 - Intermediate" },
    description: { pt: "Fluência e profundidade: política, economia, expressões idiomáticas e análise crítica", en: "Fluency and depth: politics, economy, idioms and critical analysis" },
    sectionType: "numbered",
    cefrMin: "B2",
    cefrMax: "C1",
    lessonsPerUnitStart: 8,
    lessonsPerUnitEnd: 6,
    units: [
      { title: "Política e sociedade", theme: "politics", description: "Democracia, eleições, problemas sociais", grammarFocus: ["pluperfect subjunctive", "complex conditionals"], vocabTarget: ["politics", "society", "government"] },
      { title: "Economia e negócios", theme: "economy", description: "Mercado, investimento, empreendedorismo", grammarFocus: ["future perfect", "formal register"], vocabTarget: ["economics", "business", "finance"] },
      { title: "Arte e estética", theme: "art", description: "Pintura, escultura, fotografia, design", grammarFocus: ["subjunctive in relative clauses", "passive se"], vocabTarget: ["art", "aesthetics", "criticism"] },
      { title: "Literatura portuguesa", theme: "literature", description: "Pessoa, Saramago, Camões, poesia", grammarFocus: ["literary tenses", "mesoclisis"], vocabTarget: ["literature", "poetry", "authors"] },
      { title: "Ciência e descoberta", theme: "science", description: "Investigação, descobertas, medicina", grammarFocus: ["compound subjunctive", "abstract nominalization"], vocabTarget: ["science", "research", "discovery"] },
      { title: "Portugal no mundo", theme: "world", description: "Descobrimentos, CPLP, emigração, diáspora", grammarFocus: ["narrative tenses", "discourse connectors"], vocabTarget: ["history", "diaspora", "lusophone world"] },
      { title: "Expressões idiomáticas", theme: "idioms", description: "Estar-se nas tintas, dar o litro, ficar a ver navios", grammarFocus: ["idiomatic usage", "register variation"], vocabTarget: ["idioms", "colloquialisms", "slang"] },
      { title: "Registo formal e académico", theme: "formal", description: "Textos académicos, correspondência formal, discursos", grammarFocus: ["formal subjunctive", "impersonal constructions"], vocabTarget: ["academic", "formal writing", "correspondence"] },
      { title: "Textos literários", theme: "literary", description: "Análise de textos, crítica, interpretação", grammarFocus: ["stylistic devices", "archaic forms"], vocabTarget: ["literary analysis", "criticism", "interpretation"] },
      { title: "Argumentação e retórica", theme: "rhetoric", description: "Persuasão, debate formal, ensaio", grammarFocus: ["advanced connectors", "subjunctive nuances"], vocabTarget: ["argumentation", "rhetoric", "persuasion"] },
      { title: "Direito e justiça", theme: "law", description: "Sistema judicial, tribunais, contratos, queixas", grammarFocus: ["passive voice", "formal register"], vocabTarget: ["law", "courts", "contracts"] },
      { title: "Psicologia e comportamento", theme: "psychology", description: "Saúde mental, emoções complexas, terapia", grammarFocus: ["subjunctive with doubt", "compound subjunctive"], vocabTarget: ["psychology", "mental health", "behavior"] },
      { title: "Filosofia e ética", theme: "philosophy", description: "Debates éticos, dilemas morais, pensamento crítico", grammarFocus: ["complex conditionals", "subjunctive nuances"], vocabTarget: ["philosophy", "ethics", "critical thinking"] },
      { title: "Arquitectura e urbanismo", theme: "architecture", description: "Arquitectura portuguesa, Manuelino, urbanismo moderno", grammarFocus: ["passive se", "narrative tenses"], vocabTarget: ["architecture", "urban planning", "design"] },
      { title: "Marketing e publicidade", theme: "marketing", description: "Campanhas, marca pessoal, comunicação persuasiva", grammarFocus: ["conditional", "imperative basic"], vocabTarget: ["marketing", "advertising", "branding"] },
      { title: "Jornalismo e reportagem", theme: "journalism", description: "Escrever artigos, reportagem, jornalismo de investigação", grammarFocus: ["reported speech intro", "narrative tenses"], vocabTarget: ["journalism", "reporting", "media writing"] },
      { title: "Diplomacia e relações internacionais", theme: "diplomacy", description: "UE, ONU, negociações, tratados", grammarFocus: ["formal subjunctive", "discourse connectors"], vocabTarget: ["diplomacy", "international relations", "treaties"] },
      { title: "Empreendedorismo e startups", theme: "startups", description: "Criar empresa, financiamento, pitch, inovação", grammarFocus: ["future perfect", "conditional sentences"], vocabTarget: ["entrepreneurship", "startups", "funding"] },
      { title: "Saúde pública e epidemiologia", theme: "public_health", description: "SNS, vacinação, pandemias, políticas de saúde", grammarFocus: ["impersonal constructions", "passive voice"], vocabTarget: ["public health", "healthcare system", "epidemiology"] },
      { title: "Turismo e hospitalidade", theme: "hospitality", description: "Hotelaria, turismo rural, gastronomia, guias", grammarFocus: ["conditional", "subjunctive with emotions"], vocabTarget: ["tourism", "hospitality", "service industry"] },
      { title: "Agricultura e pecuária", theme: "agriculture", description: "Vinho, azeite, cortiça, agricultura biológica", grammarFocus: ["passive se", "gerund vs infinitive"], vocabTarget: ["agriculture", "farming", "Portuguese products"] },
      { title: "Energia e sustentabilidade", theme: "energy", description: "Energias renováveis, transição energética, pegada ecológica", grammarFocus: ["future subjunctive", "complex conditionals"], vocabTarget: ["energy", "sustainability", "climate"] },
      { title: "Transportes e logística", theme: "logistics", description: "Cadeias de abastecimento, importação, exportação", grammarFocus: ["compound tenses intro", "formal register"], vocabTarget: ["logistics", "supply chain", "trade"] },
      { title: "Comunicação empresarial", theme: "corporate_comms", description: "Apresentações, relatórios, reuniões formais", grammarFocus: ["formal subjunctive", "abstract nominalization"], vocabTarget: ["business writing", "presentations", "reports"] },
      { title: "Mediação e resolução de conflitos", theme: "mediation", description: "Negociação, mediação, conciliação, arbitragem", grammarFocus: ["subjunctive nuances", "conditional sentences"], vocabTarget: ["mediation", "conflict resolution", "negotiation"] },
      { title: "Linguística e tradução", theme: "linguistics", description: "Análise linguística, tradução, interpretação simultânea", grammarFocus: ["abstract nominalization", "register variation"], vocabTarget: ["linguistics", "translation", "interpretation"] },
      { title: "Cinema e audiovisual", theme: "cinema", description: "Cinema português, análise fílmica, documentário", grammarFocus: ["narrative tenses", "relative pronouns"], vocabTarget: ["cinema", "film analysis", "documentary"] },
      { title: "Gastronomia avançada", theme: "gastronomy", description: "Vinhos, queijos, pastelaria, cozinha de autor", grammarFocus: ["idiomatic usage", "passive se"], vocabTarget: ["gastronomy", "wine", "pastry"] },
      { title: "Desporto e cultura física", theme: "sports_culture", description: "Comentário desportivo, análise táctica, história do desporto", grammarFocus: ["preterite vs imperfect", "discourse connectors"], vocabTarget: ["sports commentary", "tactics", "sports history"] },
      { title: "Sociologia e demografia", theme: "sociology", description: "Estruturas sociais, migrações, envelhecimento, desigualdade", grammarFocus: ["impersonal constructions", "compound subjunctive"], vocabTarget: ["sociology", "demographics", "inequality"] },
      { title: "Relações laborais", theme: "labour_relations", description: "Sindicatos, negociação colectiva, direitos dos trabalhadores", grammarFocus: ["formal subjunctive", "passive voice"], vocabTarget: ["labour relations", "unions", "workers' rights"] },
      { title: "Urbanismo e habitação", theme: "urban_housing", description: "Arrendamento, reabilitação urbana, políticas de habitação", grammarFocus: ["complex conditionals", "impersonal constructions"], vocabTarget: ["housing", "urban renewal", "rental market"] },
      { title: "Voluntariado e ONG", theme: "volunteering", description: "Solidariedade, missões humanitárias, cooperação para o desenvolvimento", grammarFocus: ["subjunctive with emotions", "gerund vs infinitive"], vocabTarget: ["volunteering", "NGOs", "humanitarian aid"] },
      { title: "Segurança e defesa", theme: "security_defence", description: "Forças armadas, NATO, proteção civil, cibersegurança", grammarFocus: ["passive se", "compound subjunctive"], vocabTarget: ["security", "defence", "civil protection"] },
      { title: "Propriedade intelectual", theme: "intellectual_property", description: "Patentes, direitos de autor, marcas registadas", grammarFocus: ["formal register", "abstract nominalization"], vocabTarget: ["intellectual property", "patents", "copyright"] },
      { title: "Oceanografia e recursos marinhos", theme: "oceanography", description: "Mar português, pesca, aquacultura, economia azul", grammarFocus: ["narrative tenses", "passive se"], vocabTarget: ["oceanography", "marine resources", "blue economy"] },
      { title: "Inteligência artificial e ética", theme: "ai_ethics", description: "Automação, privacidade, viés algorítmico, regulação", grammarFocus: ["conditional sentences", "subjunctive nuances"], vocabTarget: ["artificial intelligence", "ethics", "regulation"] },
      { title: "Património cultural", theme: "cultural_heritage", description: "UNESCO, monumentos, tradições, preservação", grammarFocus: ["archaic forms", "discourse connectors"], vocabTarget: ["cultural heritage", "monuments", "preservation"] },
      { title: "Comunicação intercultural", theme: "intercultural_comms", description: "Choque cultural, adaptação, mediação entre comunidades", grammarFocus: ["register variation", "complex conditionals"], vocabTarget: ["intercultural communication", "culture shock", "adaptation"] },
      { title: "Finanças pessoais", theme: "personal_finance", description: "Poupança, impostos, crédito, literacia financeira", grammarFocus: ["conditional sentences", "formal register"], vocabTarget: ["personal finance", "taxes", "financial literacy"] },
    ],
  },
  // ── S4 Avançado (C1-C2) ── 50 units, 9→7 lições/unit ──
  {
    title: { pt: "Secção 4 - Avançado", en: "Section 4 - Advanced" },
    description: { pt: "Domínio nativo: nuances, produção criativa, registo literário e variação regional", en: "Native-level mastery: nuances, creative production, literary register and regional variation" },
    sectionType: "numbered",
    cefrMin: "C1",
    cefrMax: "C2",
    lessonsPerUnitStart: 9,
    lessonsPerUnitEnd: 7,
    units: [
      { title: "Domínio nativo", theme: "mastery", description: "Nuances, humor, duplo sentido, registos", grammarFocus: ["all tenses review", "regional variation"], vocabTarget: ["nuance", "humor", "register"] },
      { title: "Produção criativa", theme: "creative", description: "Escrita criativa, tradução, adaptação", grammarFocus: ["stylistic choices", "creative grammar"], vocabTarget: ["creative writing", "translation", "adaptation"] },
      { title: "Análise crítica de textos", theme: "critical_analysis", description: "Desconstruir argumentos, identificar falácias, avaliar fontes", grammarFocus: ["discourse connectors", "subjunctive nuances"], vocabTarget: ["critical analysis", "argumentation", "fallacies"] },
      { title: "Escrita académica", theme: "academic_writing", description: "Teses, artigos científicos, citação, estilo académico", grammarFocus: ["impersonal constructions", "abstract nominalization"], vocabTarget: ["academic writing", "citations", "methodology"] },
      { title: "Debate parlamentar", theme: "parliamentary", description: "Linguagem parlamentar, intervenções, moções, interpelações", grammarFocus: ["formal subjunctive", "complex conditionals"], vocabTarget: ["parliament", "legislative language", "political debate"] },
      { title: "Tradução literária", theme: "literary_translation", description: "Traduzir poesia, prosa, teatro, manter registo e ritmo", grammarFocus: ["stylistic devices", "mesoclisis"], vocabTarget: ["literary translation", "adaptation", "register"] },
      { title: "Sociolinguística portuguesa", theme: "sociolinguistics", description: "Variação social, prestígio, estigma, mudança linguística", grammarFocus: ["register variation", "regional variation"], vocabTarget: ["sociolinguistics", "variation", "prestige"] },
      { title: "Pragmática e implicatura", theme: "pragmatics", description: "O que se diz vs o que se quer dizer, actos de fala", grammarFocus: ["subjunctive nuances", "conditional sentences"], vocabTarget: ["pragmatics", "implicature", "speech acts"] },
      { title: "Etimologia e história da língua", theme: "etymology", description: "Do latim ao português, empréstimos, evolução fonética", grammarFocus: ["archaic forms", "literary tenses"], vocabTarget: ["etymology", "language history", "Latin roots"] },
      { title: "Dialectologia portuguesa", theme: "dialectology", description: "Dialectos do Norte, Centro, Sul, Açores, Madeira", grammarFocus: ["regional variation", "idiomatic usage"], vocabTarget: ["dialects", "regional speech", "phonetic variation"] },
      { title: "Poesia e métrica", theme: "poetry", description: "Soneto, redondilha, verso livre, rima, ritmo", grammarFocus: ["stylistic devices", "archaic forms"], vocabTarget: ["poetry", "meter", "verse forms"] },
      { title: "Teatro e dramaturgia", theme: "theatre", description: "Gil Vicente, Garrett, teatro contemporâneo, monólogo", grammarFocus: ["narrative tenses", "stylistic choices"], vocabTarget: ["theatre", "dramaturgy", "performance"] },
      { title: "Ensaio e opinião", theme: "essay", description: "Ensaio argumentativo, crónica, coluna de opinião", grammarFocus: ["advanced connectors", "formal subjunctive"], vocabTarget: ["essay", "opinion writing", "chronicle"] },
      { title: "Oratória e discurso público", theme: "oratory", description: "Técnicas de persuasão, discursos, comunicação pública", grammarFocus: ["discourse connectors", "impersonal constructions"], vocabTarget: ["oratory", "public speaking", "persuasion"] },
      { title: "Negociação avançada", theme: "negotiation", description: "Estratégias, concessões, diplomacia comercial", grammarFocus: ["conditional sentences", "subjunctive nuances"], vocabTarget: ["negotiation", "strategy", "compromise"] },
      { title: "Terminologia jurídica", theme: "legal_terminology", description: "Código civil, contratos, linguagem dos tribunais", grammarFocus: ["formal subjunctive", "passive se"], vocabTarget: ["legal terminology", "civil code", "court language"] },
      { title: "Terminologia médica", theme: "medical_terminology", description: "Anatomia, diagnóstico, relatórios clínicos", grammarFocus: ["abstract nominalization", "compound subjunctive"], vocabTarget: ["medical terminology", "clinical reports", "diagnosis"] },
      { title: "Terminologia técnica", theme: "technical_terminology", description: "Engenharia, informática, especificações técnicas", grammarFocus: ["passive voice", "gerund vs infinitive"], vocabTarget: ["technical writing", "specifications", "engineering"] },
      { title: "Humor e sátira", theme: "humor", description: "Ironia, sarcasmo, paródia, comédia portuguesa", grammarFocus: ["idiomatic usage", "stylistic choices"], vocabTarget: ["humor", "satire", "irony"] },
      { title: "Provérbios e sabedoria popular", theme: "proverbs", description: "Ditados, provérbios, sabedoria tradicional portuguesa", grammarFocus: ["archaic forms", "idiomatic usage"], vocabTarget: ["proverbs", "folk wisdom", "traditional sayings"] },
      { title: "Calão e gíria", theme: "slang", description: "Gíria jovem, calão urbano, linguagem coloquial", grammarFocus: ["register variation", "regional variation"], vocabTarget: ["slang", "colloquial speech", "informal register"] },
      { title: "Variação lusófona", theme: "lusophone_variation", description: "Português do Brasil, África, Timor, Macau", grammarFocus: ["regional variation", "pronoun placement"], vocabTarget: ["Brazilian Portuguese", "African Portuguese", "Lusophone world"] },
      { title: "Textos históricos", theme: "historical_texts", description: "Carta de Pero Vaz de Caminha, crónicas medievais", grammarFocus: ["archaic forms", "literary tenses"], vocabTarget: ["historical texts", "medieval chronicles", "archaic language"] },
      { title: "Crítica de arte e cultura", theme: "art_criticism", description: "Recensão, crítica musical, análise de exposições", grammarFocus: ["stylistic devices", "abstract nominalization"], vocabTarget: ["art criticism", "reviews", "cultural analysis"] },
      { title: "Mediação intercultural", theme: "intercultural", description: "Comunicação entre culturas, mal-entendidos, integração", grammarFocus: ["conditional sentences", "register variation"], vocabTarget: ["intercultural communication", "cultural mediation", "integration"] },
      { title: "Escrita jornalística avançada", theme: "advanced_journalism", description: "Reportagem longa, jornalismo narrativo, investigação", grammarFocus: ["narrative tenses", "discourse connectors"], vocabTarget: ["longform journalism", "narrative writing", "investigation"] },
      { title: "Correspondência diplomática", theme: "diplomatic_correspondence", description: "Notas verbais, protocolos, linguagem protocolar", grammarFocus: ["formal subjunctive", "impersonal constructions"], vocabTarget: ["diplomatic writing", "protocol", "formal correspondence"] },
      { title: "Análise do discurso político", theme: "political_discourse", description: "Propaganda, spin, framing, análise de campanha", grammarFocus: ["subjunctive nuances", "complex conditionals"], vocabTarget: ["political discourse", "propaganda analysis", "framing"] },
      { title: "Retórica publicitária", theme: "advertising_rhetoric", description: "Slogans, copywriting, linguagem persuasiva comercial", grammarFocus: ["stylistic choices", "imperative basic"], vocabTarget: ["advertising", "copywriting", "persuasive language"] },
      { title: "Escrita criativa avançada", theme: "advanced_creative", description: "Narrativa experimental, autoficção, microconto, crónica", grammarFocus: ["creative grammar", "stylistic devices"], vocabTarget: ["experimental fiction", "autofiction", "flash fiction"] },
      { title: "Fonética avançada", theme: "advanced_phonetics", description: "Entoação, prosódia, sotaques regionais, pares mínimos", grammarFocus: ["regional variation", "register variation"], vocabTarget: ["phonetics", "prosody", "intonation"] },
      { title: "Semântica e polissemia", theme: "semantics", description: "Campos semânticos, ambiguidade, conotação, denotação", grammarFocus: ["idiomatic usage", "abstract nominalization"], vocabTarget: ["semantics", "polysemy", "connotation"] },
      { title: "Morfologia derivacional", theme: "derivation", description: "Prefixos, sufixos, composição, neologismos", grammarFocus: ["abstract nominalization", "creative grammar"], vocabTarget: ["word formation", "derivation", "neologisms"] },
      { title: "Sintaxe complexa", theme: "complex_syntax", description: "Orações encaixadas, topicalização, clivagem", grammarFocus: ["impersonal constructions", "complex conditionals"], vocabTarget: ["complex syntax", "embedding", "topicalization"] },
      { title: "Discurso académico oral", theme: "academic_oral", description: "Conferências, defesas de tese, painéis, moderação", grammarFocus: ["formal subjunctive", "discourse connectors"], vocabTarget: ["academic presentations", "thesis defense", "panels"] },
      { title: "Escrita técnico-científica", theme: "scientific_writing", description: "Artigos, relatórios laboratoriais, abstracts", grammarFocus: ["passive se", "abstract nominalization"], vocabTarget: ["scientific writing", "lab reports", "abstracts"] },
      { title: "Interpretação simultânea", theme: "interpreting", description: "Técnicas de interpretação, memória, reformulação", grammarFocus: ["pronoun placement", "gerund vs infinitive"], vocabTarget: ["interpreting", "reformulation", "memory techniques"] },
      { title: "Análise de imprensa", theme: "press_analysis", description: "Editoriais, manchetes, viés mediático, fact-checking", grammarFocus: ["narrative tenses", "subjunctive nuances"], vocabTarget: ["press analysis", "media bias", "fact-checking"] },
      { title: "Filosofia da linguagem", theme: "language_philosophy", description: "Wittgenstein, Saussure, significado e referência", grammarFocus: ["complex conditionals", "impersonal constructions"], vocabTarget: ["philosophy of language", "meaning", "reference"] },
      { title: "Cultura empresarial portuguesa", theme: "corporate_culture", description: "Hierarquia, networking, cultura de reunião, horários", grammarFocus: ["formal subjunctive", "register variation"], vocabTarget: ["corporate culture", "networking", "Portuguese business"] },
      { title: "Direito internacional", theme: "international_law", description: "Tratados, direito europeu, asilo, extradição", grammarFocus: ["passive voice", "compound subjunctive"], vocabTarget: ["international law", "EU law", "asylum"] },
      { title: "Economia portuguesa", theme: "portuguese_economy", description: "Sectores, exportações, turismo, investimento estrangeiro", grammarFocus: ["narrative tenses", "conditional sentences"], vocabTarget: ["Portuguese economy", "sectors", "foreign investment"] },
      { title: "Pedagogia e didáctica", theme: "pedagogy", description: "Ensinar português, métodos, avaliação, currículo", grammarFocus: ["conditional sentences", "subjunctive nuances"], vocabTarget: ["pedagogy", "teaching methods", "assessment"] },
      { title: "Redacção publicitária avançada", theme: "advanced_copywriting", description: "Storytelling de marca, tom de voz, branded content", grammarFocus: ["stylistic choices", "idiomatic usage"], vocabTarget: ["brand storytelling", "tone of voice", "content marketing"] },
      { title: "Antropologia cultural", theme: "anthropology", description: "Rituais, identidade, globalização, etnografia", grammarFocus: ["abstract nominalization", "discourse connectors"], vocabTarget: ["anthropology", "cultural identity", "ethnography"] },
      { title: "Ecologia e biodiversidade", theme: "ecology", description: "Ecossistemas portugueses, Ria Formosa, Gerês, conservação", grammarFocus: ["passive se", "complex conditionals"], vocabTarget: ["ecology", "biodiversity", "conservation"] },
      { title: "Música erudita e popular", theme: "music_theory", description: "Teoria musical, fado, música de intervenção, ópera", grammarFocus: ["archaic forms", "register variation"], vocabTarget: ["music theory", "fado history", "intervention music"] },
      { title: "Urbanismo e mobilidade", theme: "urbanism", description: "Cidades inteligentes, gentrificação, mobilidade sustentável", grammarFocus: ["compound subjunctive", "formal register"], vocabTarget: ["urbanism", "gentrification", "sustainable mobility"] },
      { title: "Geopolítica lusófona", theme: "lusophone_geopolitics", description: "CPLP, relações pós-coloniais, cooperação, diplomacia", grammarFocus: ["complex conditionals", "narrative tenses"], vocabTarget: ["geopolitics", "CPLP", "post-colonial relations"] },
      { title: "Revisão e edição de texto", theme: "editing", description: "Revisão linguística, estilo, coerência, coesão textual", grammarFocus: ["discourse connectors", "stylistic choices"], vocabTarget: ["text editing", "proofreading", "cohesion"] },
    ],
  },
  // ── Daily Refresh (sempre presente, não directamente acessível) ──
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
): Promise<{ courseId: string; sectionCount: number; unitCount: number; lessonCount: number }> {
  const profile = getProfile(l1);
  const startLevel = profile.transfer.startingCEFR;

  const cefrOrder: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const startIdx = cefrOrder.indexOf(startLevel);

  const [course] = await db
    .insert(courses)
    .values({
      title: { pt: `Português europeu para falantes de ${profile.nativeName}`, [l1]: `European Portuguese for ${profile.name} speakers` },
      description: { pt: `Curso completo de PT-EU adaptado para falantes de ${profile.name}`, [l1]: `Complete PT-EU course adapted for ${profile.name} speakers` },
      l1Source: l1,
      cefrMin: startLevel,
      cefrMax: "C2" as CEFRLevel,
      sortOrder: "0",
    })
    .returning({ id: courses.id });

  let sectionCount = 0;
  let unitCount = 0;
  let lessonCount = 0;

  for (let sIdx = 0; sIdx < COURSE_SECTIONS.length; sIdx++) {
    const sectionDef = COURSE_SECTIONS[sIdx]!;

    const sectionCefrMinIdx = cefrOrder.indexOf(sectionDef.cefrMin);
    if (sectionCefrMinIdx < startIdx && sectionDef.sectionType !== "daily_refresh") {
      continue;
    }

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
      const lessonsForUnit = Math.round(
        sectionDef.lessonsPerUnitStart +
          (sectionDef.lessonsPerUnitEnd - sectionDef.lessonsPerUnitStart) * progress,
      );

      for (let lIdx = 0; lIdx < lessonsForUnit; lIdx++) {
        const [lesson] = await db.insert(lessons).values({
          unitId: unit!.id,
          sortOrder: lIdx,
          grammarFocus: unitDef.grammarFocus,
          vocabTarget: unitDef.vocabTarget,
        }).returning({ id: lessons.id });

        if (resolvedSkillIds.length > 0 && lesson) {
          await db.insert(lessonSkills).values(
            resolvedSkillIds.map((s) => ({
              lessonId: lesson.id,
              skillId: s.id,
              isPrimary: s.isPrimary,
            })),
          );
        }
        lessonCount++;
      }
    }
  }

  return { courseId: course!.id, sectionCount, unitCount, lessonCount };
}

export async function seedAllPhase1Courses(
  db: Database,
): Promise<Record<string, { courseId: string; sectionCount: number; unitCount: number; lessonCount: number }>> {
  const results: Record<string, { courseId: string; sectionCount: number; unitCount: number; lessonCount: number }> = {};

  for (const l1 of L1_PHASE_1) {
    results[l1] = await seedCourseStructure(l1, db);
  }

  return results;
}
