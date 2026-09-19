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
}

export const ACHIEVEMENTS: readonly AchievementDef[] = [
  {
    id: "first_lesson",
    name: "First Steps",
    description: "Complete your first lesson",
    icon: "👣",
    category: "milestone",
    condition: (s) => s.lessonsCompleted >= 1,
  },
  {
    id: "ten_lessons",
    name: "Getting Started",
    description: "Complete 10 lessons",
    icon: "📖",
    category: "milestone",
    condition: (s) => s.lessonsCompleted >= 10,
  },
  {
    id: "hundred_lessons",
    name: "Dedicated Learner",
    description: "Complete 100 lessons",
    icon: "🏆",
    category: "milestone",
    condition: (s) => s.lessonsCompleted >= 100,
  },
  {
    id: "first_perfect",
    name: "Flawless",
    description: "Get a perfect score on a lesson",
    icon: "⭐",
    category: "learning",
    condition: (s) => s.perfectLessons >= 1,
  },
  {
    id: "streak_7",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "🔥",
    category: "streak",
    condition: (s) => s.streakDays >= 7,
  },
  {
    id: "streak_30",
    name: "Monthly Commitment",
    description: "Maintain a 30-day streak",
    icon: "💪",
    category: "streak",
    condition: (s) => s.streakDays >= 30,
  },
  {
    id: "streak_100",
    name: "Unstoppable",
    description: "Maintain a 100-day streak",
    icon: "🌋",
    category: "streak",
    condition: (s) => s.streakDays >= 100,
  },
  {
    id: "survived_financas",
    name: "Survived Finanças",
    description: "Complete the Finanças scenario",
    icon: "🏛️",
    category: "cultural",
    condition: (s) => s.scenariosCompleted.includes("financas"),
  },
  {
    id: "cafe_galao",
    name: "Ordered a Galão",
    description: "Complete the café scenario without hesitation",
    icon: "☕",
    category: "cultural",
    condition: (s) => s.scenariosCompleted.includes("cafe"),
  },
  {
    id: "porto_taxi",
    name: "Understood the Porto Taxi Driver",
    description: "Complete the Porto taxi scenario",
    icon: "🚕",
    category: "cultural",
    condition: (s) => s.scenariosCompleted.includes("porto_taxi"),
  },
  {
    id: "words_100",
    name: "Vocabulary Builder",
    description: "Learn 100 words",
    icon: "📝",
    category: "learning",
    condition: (s) => s.wordsLearned >= 100,
  },
  {
    id: "words_500",
    name: "Wordsmith",
    description: "Learn 500 words",
    icon: "📚",
    category: "learning",
    condition: (s) => s.wordsLearned >= 500,
  },
  {
    id: "first_conversation",
    name: "Let's Talk",
    description: "Complete your first AI conversation",
    icon: "💬",
    category: "social",
    condition: (s) => s.conversationsCompleted >= 1,
  },
  {
    id: "gold_league",
    name: "Gold Standard",
    description: "Reach the Gold league",
    icon: "🥇",
    category: "social",
    condition: (s) => s.leagueTier === "gold" || s.leagueTier === "diamond" || s.leagueTier === "obsidian",
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
