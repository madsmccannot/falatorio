export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "learning" | "streak" | "cultural" | "social" | "milestone";
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
}

export const ACHIEVEMENTS: readonly AchievementDef[] = [
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
    id: "first_perfect",
    name: "Flawless",
    description: "Get a perfect score on a lesson",
    icon: "star",
    category: "learning",
    condition: (s) => s.perfectLessons >= 1,
  },
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
  {
    id: "survived_financas",
    name: "Survived Finanças",
    description: "Complete the Finanças scenario",
    icon: "bank",
    category: "cultural",
    condition: (s) => s.scenariosCompleted.includes("financas"),
  },
  {
    id: "cafe_galao",
    name: "Ordered a Galão",
    description: "Complete the café scenario without hesitation",
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
    condition: (s) => s.leagueTier === "gold" || s.leagueTier === "diamond" || s.leagueTier === "obsidian",
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
    id: "skills_50",
    name: "Grammar Architect",
    description: "Master 50 skills",
    icon: "building",
    category: "milestone",
    condition: (s) => s.skillsMastered >= 50,
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
    id: "domains_5",
    name: "Well-Rounded",
    description: "Study across 5 different domains",
    icon: "globe",
    category: "milestone",
    condition: (s) => s.domainsCovered >= 5,
  },
  {
    id: "knowledge_50",
    name: "Knowledge Builder",
    description: "Learn 50 knowledge items",
    icon: "lightbulb",
    category: "learning",
    condition: (s) => s.knowledgeItemsLearned >= 50,
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
