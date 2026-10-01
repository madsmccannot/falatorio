import type { SkillDomain } from "../mastery/types.js";

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "learning" | "streak" | "cultural" | "social" | "milestone" | "competence";
  condition: (stats: UserStats) => boolean;
}

export interface UserStats {
  lessonsCompleted: number;
  perfectLessons: number;
  streakDays: number;
  longestStreak: number;
  wordsLearned: number;
  hoursSpent: number;
  conversationsCompleted: number;
  leagueTier: string;
  cefrLevel: string;
  scenariosCompleted: readonly string[];
  skillsMastered: number;
  knowledgeItemsLearned: number;
  productionExercisesCompleted: number;
  domainsCovered: number;
  masteredDomains: readonly SkillDomain[];
  averageMastery: number;
  evidenceCount: number;
  distinctExerciseTypes: number;
  highestCognitiveLevel: string;
  accuracyLast20: number;
  freeProductionPassed: number;
  communicationPassed: number;
}

const CEFR_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
function cefrAtLeast(current: string, target: string): boolean {
  return CEFR_ORDER.indexOf(current as typeof CEFR_ORDER[number]) >=
    CEFR_ORDER.indexOf(target as typeof CEFR_ORDER[number]);
}

export const ACHIEVEMENTS: readonly AchievementDef[] = [
  // ─── Milestone ───
  {
    id: "first_lesson",
    name: "First Steps",
    description: "Complete your first lesson",
    icon: "footsteps",
    category: "milestone",
    condition: (s) => s.lessonsCompleted >= 1,
  },
  {
    id: "ten_lessons",
    name: "Getting Started",
    description: "Complete 10 lessons",
    icon: "book",
    category: "milestone",
    condition: (s) => s.lessonsCompleted >= 10,
  },
  {
    id: "hundred_lessons",
    name: "Dedicated Learner",
    description: "Complete 100 lessons",
    icon: "trophy",
    category: "milestone",
    condition: (s) => s.lessonsCompleted >= 100,
  },
  {
    id: "skills_50",
    name: "Grammar Architect",
    description: "Master 50 skills",
    icon: "building",
    category: "milestone",
    condition: (s) => s.skillsMastered >= 50,
  },
  {
    id: "domains_5",
    name: "Well-Rounded",
    description: "Study across 5 different domains",
    icon: "globe",
    category: "milestone",
    condition: (s) => s.domainsCovered >= 5,
  },

  // ─── Learning ───
  {
    id: "first_perfect",
    name: "Flawless",
    description: "Get a perfect score on a lesson",
    icon: "star",
    category: "learning",
    condition: (s) => s.perfectLessons >= 1,
  },
  {
    id: "words_100",
    name: "Vocabulary Builder",
    description: "Learn 100 words",
    icon: "pencil",
    category: "learning",
    condition: (s) => s.wordsLearned >= 100,
  },
  {
    id: "words_500",
    name: "Wordsmith",
    description: "Learn 500 words",
    icon: "books",
    category: "learning",
    condition: (s) => s.wordsLearned >= 500,
  },
  {
    id: "first_skill_mastered",
    name: "First Mastery",
    description: "Master your first skill",
    icon: "key",
    category: "learning",
    condition: (s) => s.skillsMastered >= 1,
  },
  {
    id: "skills_10",
    name: "Knowledge Explorer",
    description: "Master 10 skills",
    icon: "compass",
    category: "learning",
    condition: (s) => s.skillsMastered >= 10,
  },
  {
    id: "production_25",
    name: "Finding My Voice",
    description: "Complete 25 production exercises",
    icon: "microphone",
    category: "learning",
    condition: (s) => s.productionExercisesCompleted >= 25,
  },
  {
    id: "production_100",
    name: "Active Speaker",
    description: "Complete 100 production exercises",
    icon: "speaker",
    category: "learning",
    condition: (s) => s.productionExercisesCompleted >= 100,
  },
  {
    id: "knowledge_50",
    name: "Knowledge Builder",
    description: "Learn 50 knowledge items",
    icon: "lightbulb",
    category: "learning",
    condition: (s) => s.knowledgeItemsLearned >= 50,
  },

  // ─── Streak ───
  {
    id: "streak_7",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "flame",
    category: "streak",
    condition: (s) => s.streakDays >= 7,
  },
  {
    id: "streak_30",
    name: "Monthly Commitment",
    description: "Maintain a 30-day streak",
    icon: "strength",
    category: "streak",
    condition: (s) => s.streakDays >= 30,
  },
  {
    id: "streak_100",
    name: "Unstoppable",
    description: "Maintain a 100-day streak",
    icon: "volcano",
    category: "streak",
    condition: (s) => s.streakDays >= 100,
  },

  // ─── Cultural ───
  {
    id: "survived_financas",
    name: "Survived Financas",
    description: "Complete the Financas scenario",
    icon: "bank",
    category: "cultural",
    condition: (s) => s.scenariosCompleted.includes("financas"),
  },
  {
    id: "cafe_galao",
    name: "Ordered a Galao",
    description: "Complete the cafe scenario without hesitation",
    icon: "coffee",
    category: "cultural",
    condition: (s) => s.scenariosCompleted.includes("cafe"),
  },
  {
    id: "porto_taxi",
    name: "Understood the Porto Taxi Driver",
    description: "Complete the Porto taxi scenario",
    icon: "taxi",
    category: "cultural",
    condition: (s) => s.scenariosCompleted.includes("porto_taxi"),
  },

  // ─── Social ───
  {
    id: "first_conversation",
    name: "Let's Talk",
    description: "Complete your first AI conversation",
    icon: "chat",
    category: "social",
    condition: (s) => s.conversationsCompleted >= 1,
  },
  {
    id: "gold_league",
    name: "Gold Standard",
    description: "Reach the Gold league",
    icon: "medal",
    category: "social",
    condition: (s) =>
      s.leagueTier === "gold" ||
      s.leagueTier === "sapphire" ||
      s.leagueTier === "ruby" ||
      s.leagueTier === "emerald" ||
      s.leagueTier === "diamond",
  },

  // ─── Competence (NEW) ───
  {
    id: "cefr_a2",
    name: "A2 Breakthrough",
    description: "Reach CEFR level A2",
    icon: "shield",
    category: "competence",
    condition: (s) => cefrAtLeast(s.cefrLevel, "A2"),
  },
  {
    id: "cefr_b1",
    name: "B1 Independent",
    description: "Reach CEFR level B1",
    icon: "shield",
    category: "competence",
    condition: (s) => cefrAtLeast(s.cefrLevel, "B1"),
  },
  {
    id: "cefr_b2",
    name: "B2 Advanced",
    description: "Reach CEFR level B2",
    icon: "castle",
    category: "competence",
    condition: (s) => cefrAtLeast(s.cefrLevel, "B2"),
  },
  {
    id: "cefr_c1",
    name: "C1 Proficient",
    description: "Reach CEFR level C1",
    icon: "crown",
    category: "competence",
    condition: (s) => cefrAtLeast(s.cefrLevel, "C1"),
  },
  {
    id: "cefr_c2",
    name: "C2 Mastery",
    description: "Reach CEFR level C2",
    icon: "diamond",
    category: "competence",
    condition: (s) => cefrAtLeast(s.cefrLevel, "C2"),
  },
  {
    id: "domain_phonetics",
    name: "Sound System",
    description: "Master all phonetics skills at your CEFR level",
    icon: "waveform",
    category: "competence",
    condition: (s) => s.masteredDomains.includes("phonetics"),
  },
  {
    id: "domain_morphology",
    name: "Word Builder",
    description: "Master all morphology skills at your CEFR level",
    icon: "puzzle",
    category: "competence",
    condition: (s) => s.masteredDomains.includes("morphology"),
  },
  {
    id: "domain_tenses",
    name: "Time Traveler",
    description: "Master all tense and mood skills at your CEFR level",
    icon: "clock",
    category: "competence",
    condition: (s) => s.masteredDomains.includes("tenses_moods"),
  },
  {
    id: "domain_syntax",
    name: "Sentence Architect",
    description: "Master all syntax skills at your CEFR level",
    icon: "blueprint",
    category: "competence",
    condition: (s) => s.masteredDomains.includes("syntax"),
  },
  {
    id: "domain_lexicon",
    name: "Living Dictionary",
    description: "Master all vocabulary skills at your CEFR level",
    icon: "dictionary",
    category: "competence",
    condition: (s) => s.masteredDomains.includes("lexicon"),
  },
  {
    id: "domain_pragmatics",
    name: "Culture Navigator",
    description: "Master all pragmatics skills at your CEFR level",
    icon: "compass",
    category: "competence",
    condition: (s) => s.masteredDomains.includes("pragmatics"),
  },
  {
    id: "all_domains_mastered",
    name: "Complete Linguist",
    description: "Master skills across all 10 domains",
    icon: "laurel",
    category: "competence",
    condition: (s) => s.masteredDomains.length >= 10,
  },
  {
    id: "accuracy_90",
    name: "Precision",
    description: "Maintain 90%+ accuracy over your last 20 lessons",
    icon: "target",
    category: "competence",
    condition: (s) => s.lessonsCompleted >= 20 && s.accuracyLast20 >= 0.9,
  },
  {
    id: "accuracy_95",
    name: "Sharp Shooter",
    description: "Maintain 95%+ accuracy over your last 20 lessons",
    icon: "bullseye",
    category: "competence",
    condition: (s) => s.lessonsCompleted >= 20 && s.accuracyLast20 >= 0.95,
  },
  {
    id: "exercise_variety",
    name: "Versatile Learner",
    description: "Complete exercises of every type",
    icon: "rainbow",
    category: "competence",
    condition: (s) => s.distinctExerciseTypes >= 8,
  },
  {
    id: "first_free_production",
    name: "Own Words",
    description: "Pass your first free production exercise",
    icon: "pen",
    category: "competence",
    condition: (s) => s.freeProductionPassed >= 1,
  },
  {
    id: "first_communication",
    name: "Real Conversation",
    description: "Pass your first communication exercise",
    icon: "handshake",
    category: "competence",
    condition: (s) => s.communicationPassed >= 1,
  },
  {
    id: "evidence_100",
    name: "Proof of Learning",
    description: "Accumulate 100 evidence entries",
    icon: "archive",
    category: "competence",
    condition: (s) => s.evidenceCount >= 100,
  },
  {
    id: "evidence_500",
    name: "Deep Practice",
    description: "Accumulate 500 evidence entries",
    icon: "vault",
    category: "competence",
    condition: (s) => s.evidenceCount >= 500,
  },
  {
    id: "mastery_average_80",
    name: "Strong Foundation",
    description: "Achieve 80%+ average mastery across all studied skills",
    icon: "pillar",
    category: "competence",
    condition: (s) => s.skillsMastered >= 5 && s.averageMastery >= 0.8,
  },
  {
    id: "conversations_10",
    name: "Conversationalist",
    description: "Complete 10 AI conversations",
    icon: "bubbles",
    category: "competence",
    condition: (s) => s.conversationsCompleted >= 10,
  },
  {
    id: "perfect_streak_5",
    name: "Five in a Row",
    description: "Get 5 perfect lessons",
    icon: "stars",
    category: "competence",
    condition: (s) => s.perfectLessons >= 5,
  },
];

export function checkAchievements(
  stats: UserStats,
  alreadyUnlocked: ReadonlySet<string>,
): string[] {
  const newlyUnlocked: string[] = [];
  for (const achievement of ACHIEVEMENTS) {
    if (!alreadyUnlocked.has(achievement.id) && achievement.condition(stats)) {
      newlyUnlocked.push(achievement.id);
    }
  }
  return newlyUnlocked;
}

export function getAchievement(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
