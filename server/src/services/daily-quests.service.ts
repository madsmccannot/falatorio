import { eq, and, sql, count, gte } from "drizzle-orm";
import type { Database } from "@falatorio/db/client";
import {
  dailyQuests,
  monthlyQuestProgress,
  lessonCompletions,
  userProgress,
  users,
} from "@falatorio/db/schema";
import type { L1Code } from "@falatorio/core";

type QuestType =
  | "complete_lesson"
  | "earn_xp"
  | "practice_speaking"
  | "review_items"
  | "maintain_streak"
  | "learn_minutes"
  | "perfect_lesson"
  | "practice_mistakes";

interface QuestTemplate {
  type: QuestType;
  target: number;
  descriptions: Record<L1Code, string>;
  weight: number;
}

const BASE_TEMPLATES: QuestTemplate[] = [
  {
    type: "complete_lesson",
    target: 1,
    weight: 3,
    descriptions: {
      en: "Complete 1 lesson", es: "Completa 1 leccion", fr: "Termine 1 lecon",
      hi: "1 पाठ पूरा करें", ur: "1 سبق مکمل کریں", ar: "أكمل درساً واحداً",
      bn: "১টি পাঠ সম্পূর্ণ করুন", pt: "Completa 1 licao",
      de: "Schliesse 1 Lektion ab", zh: "完成1节课", ru: "Завершите 1 урок",
      uk: "Завершіть 1 урок", tr: "1 ders tamamla", pl: "Ukonicz 1 lekcje",
      ko: "레슨 1개 완료", ja: "レッスンを1つ完了",
    } as Record<L1Code, string>,
  },
  {
    type: "earn_xp",
    target: 30,
    weight: 2,
    descriptions: {
      en: "Earn 30 XP", es: "Gana 30 XP", fr: "Gagne 30 XP",
      hi: "30 XP कमाएं", ur: "30 XP حاصل کریں", ar: "احصل على 30 XP",
      bn: "30 XP অর্জন করুন", pt: "Ganha 30 XP",
      de: "Verdiene 30 XP", zh: "获得30 XP", ru: "Заработайте 30 XP",
      uk: "Заробіть 30 XP", tr: "30 XP kazan", pl: "Zdobadz 30 XP",
      ko: "30 XP 획득", ja: "30 XPを獲得",
    } as Record<L1Code, string>,
  },
  {
    type: "practice_speaking",
    target: 1,
    weight: 1,
    descriptions: {
      en: "Complete a speaking exercise", es: "Haz un ejercicio oral",
      fr: "Fais un exercice oral", hi: "एक बोलने का अभ्यास करें",
      ur: "ایک بولنے کی مشق مکمل کریں", ar: "أكمل تمرين نطق",
      bn: "একটি কথা বলার অনুশীলন করুন", pt: "Completa um exercicio de fala",
      de: "Absolviere eine Sprechubung", zh: "完成一个口语练习",
      ru: "Выполните разговорное упражнение", uk: "Виконайте розмовну вправу",
      tr: "Bir konusma egzersizi tamamla", pl: "Wykonaj cwiczenie mowienia",
      ko: "말하기 연습 1개 완료", ja: "スピーキング練習を1つ完了",
    } as Record<L1Code, string>,
  },
  {
    type: "review_items",
    target: 5,
    weight: 2,
    descriptions: {
      en: "Review 5 items", es: "Repasa 5 elementos", fr: "Revise 5 elements",
      hi: "5 आइटम की समीक्षा करें", ur: "5 آئٹمز کا جائزہ لیں",
      ar: "راجع 5 عناصر", bn: "5টি আইটেম পর্যালোচনা করুন",
      pt: "Revê 5 itens", de: "Wiederhole 5 Elemente", zh: "复习5个项目",
      ru: "Повторите 5 элементов", uk: "Повторіть 5 елементів",
      tr: "5 oge tekrarla", pl: "Powtorz 5 elementow",
      ko: "5개 항목 복습", ja: "5つのアイテムを復習",
    } as Record<L1Code, string>,
  },
  {
    type: "maintain_streak",
    target: 1,
    weight: 2,
    descriptions: {
      en: "Keep your streak going", es: "Mantén tu racha",
      fr: "Maintiens ta série", hi: "अपनी स्ट्रीक जारी रखें",
      ur: "اپنی اسٹریک جاری رکھیں", ar: "حافظ على سلسلتك",
      bn: "আপনার স্ট্রিক চালু রাখুন", pt: "Mantém a tua sequência",
      de: "Halte deine Serie aufrecht", zh: "保持你的连续记录",
      ru: "Поддержите свою серию", uk: "Підтримуйте свою серію",
      tr: "Serisini devam ettir", pl: "Utrzymaj swoja serie",
      ko: "스트릭 유지", ja: "ストリークを維持",
    } as Record<L1Code, string>,
  },
  {
    type: "learn_minutes",
    target: 10,
    weight: 1,
    descriptions: {
      en: "Study for 10 minutes", es: "Estudia 10 minutos",
      fr: "Etudie pendant 10 minutes", hi: "10 मिनट पढ़ाई करें",
      ur: "10 منٹ مطالعہ کریں", ar: "ادرس لمدة 10 دقائق",
      bn: "10 মিনিট পড়াশোনা করুন", pt: "Estuda durante 10 minutos",
      de: "Lerne 10 Minuten", zh: "学习10分钟",
      ru: "Учитесь 10 минут", uk: "Навчайтеся 10 хвилин",
      tr: "10 dakika calis", pl: "Ucz sie przez 10 minut",
      ko: "10분 학습", ja: "10分間学習",
    } as Record<L1Code, string>,
  },
  {
    type: "perfect_lesson",
    target: 1,
    weight: 1,
    descriptions: {
      en: "Get 100% on a lesson", es: "Consigue 100% en una leccion",
      fr: "Obtiens 100% dans une lecon", hi: "एक पाठ में 100% प्राप्त करें",
      ur: "ایک سبق میں 100% حاصل کریں", ar: "احصل على 100% في درس",
      bn: "একটি পাঠে 100% পান", pt: "Obtém 100% numa licao",
      de: "Erreiche 100% in einer Lektion", zh: "在一节课中获得100%",
      ru: "Получите 100% за урок", uk: "Отримайте 100% за урок",
      tr: "Bir derste 100% al", pl: "Uzyskaj 100% w lekcji",
      ko: "레슨 100% 달성", ja: "レッスンで100%を達成",
    } as Record<L1Code, string>,
  },
  {
    type: "practice_mistakes",
    target: 3,
    weight: 1,
    descriptions: {
      en: "Practice 3 mistakes", es: "Practica 3 errores",
      fr: "Travaille 3 erreurs", hi: "3 गलतियों का अभ्यास करें",
      ur: "3 غلطیوں کی مشق کریں", ar: "تدرب على 3 أخطاء",
      bn: "3টি ভুলের অনুশীলন করুন", pt: "Pratica 3 erros",
      de: "Ube 3 Fehler", zh: "练习3个错误", ru: "Потренируйте 3 ошибки",
      uk: "Потренуйте 3 помилки", tr: "3 hata uzerinde calis",
      pl: "Popraw 3 bledy", ko: "실수 3개 연습", ja: "間違い3つを練習",
    } as Record<L1Code, string>,
  },
];

function weightedShuffle<T extends { weight: number }>(items: T[]): T[] {
  return items
    .map((item) => ({ item, sort: Math.random() * item.weight }))
    .sort((a, b) => b.sort - a.sort)
    .map((e) => e.item);
}

interface UserBehavior {
  recentSpeakingCount: number;
  streakDays: number;
  recentLessonCount: number;
  recentReviewCount: number;
  recentPerfectCount: number;
}

async function getUserBehavior(db: Database, userId: string): Promise<UserBehavior> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [user] = await db
    .select({ streakDays: users.streakDays })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const [lessonStats] = await db
    .select({ total: count() })
    .from(lessonCompletions)
    .where(
      and(
        eq(lessonCompletions.userId, userId),
        gte(lessonCompletions.lastCompletedAt, sevenDaysAgo),
      ),
    );

  const [perfectStats] = await db
    .select({ total: count() })
    .from(lessonCompletions)
    .where(
      and(
        eq(lessonCompletions.userId, userId),
        gte(lessonCompletions.lastCompletedAt, sevenDaysAgo),
        sql`${lessonCompletions.bestAccuracy} >= 1.0`,
      ),
    );

  const [reviewStats] = await db
    .select({ total: count() })
    .from(userProgress)
    .where(
      and(
        eq(userProgress.userId, userId),
        gte(userProgress.lastReviewedAt, sevenDaysAgo),
      ),
    );

  return {
    recentSpeakingCount: 0,
    streakDays: user?.streakDays ?? 0,
    recentLessonCount: lessonStats?.total ?? 0,
    recentReviewCount: reviewStats?.total ?? 0,
    recentPerfectCount: perfectStats?.total ?? 0,
  };
}

function adaptWeights(templates: QuestTemplate[], behavior: UserBehavior): QuestTemplate[] {
  return templates.map((t) => {
    let boost = 0;

    if (t.type === "practice_speaking" && behavior.recentSpeakingCount === 0) {
      boost += 5;
    }
    if (t.type === "maintain_streak" && behavior.streakDays < 3) {
      boost += 3;
    }
    if (t.type === "learn_minutes" && behavior.recentLessonCount < 3) {
      boost += 3;
    }
    if (t.type === "review_items" && behavior.recentReviewCount < 5) {
      boost += 2;
    }
    if (t.type === "perfect_lesson" && behavior.recentPerfectCount > 3) {
      boost += 2;
    }

    return { ...t, weight: t.weight + boost };
  });
}

function formatYearMonth(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function todayStr(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export async function getOrCreateDailyQuests(
  db: Database,
  userId: string,
  l1: L1Code,
) {
  const today = todayStr();

  const existing = await db
    .select()
    .from(dailyQuests)
    .where(and(eq(dailyQuests.userId, userId), eq(dailyQuests.date, today)));

  if (existing.length > 0) {
    return existing;
  }

  const behavior = await getUserBehavior(db, userId);
  const adapted = adaptWeights([...BASE_TEMPLATES], behavior);
  const sorted = weightedShuffle(adapted);

  const picked = new Set<QuestType>();
  const selected: QuestTemplate[] = [];
  for (const t of sorted) {
    if (selected.length >= 3) break;
    if (picked.has(t.type)) continue;
    picked.add(t.type);
    selected.push(t);
  }

  const rows = selected.map((t) => ({
    userId,
    date: today,
    questType: t.type as QuestType,
    targetValue: t.target,
    currentValue: 0,
    completed: false,
    description: t.descriptions[l1] ?? t.descriptions.en,
  }));

  const inserted = await db.insert(dailyQuests).values(rows).returning();
  return inserted;
}

export async function updateQuestProgress(
  db: Database,
  userId: string,
  questType: QuestType,
  increment: number = 1,
) {
  const today = todayStr();

  const quests = await db
    .select()
    .from(dailyQuests)
    .where(
      and(
        eq(dailyQuests.userId, userId),
        eq(dailyQuests.date, today),
        eq(dailyQuests.questType, questType),
      ),
    );

  if (quests.length === 0) return null;
  const quest = quests[0]!;
  if (quest.completed) return quest;

  const newValue = Math.min(quest.currentValue + increment, quest.targetValue);
  const nowCompleted = newValue >= quest.targetValue;

  const [updated] = await db
    .update(dailyQuests)
    .set({ currentValue: newValue, completed: nowCompleted })
    .where(eq(dailyQuests.id, quest.id))
    .returning();

  if (nowCompleted) {
    await awardPoint(db, userId);
  }

  return updated;
}

async function awardPoint(db: Database, userId: string) {
  const yearMonth = formatYearMonth(new Date());

  await db
    .insert(monthlyQuestProgress)
    .values({ userId, yearMonth, points: 1, rewardClaimed: false })
    .onConflictDoUpdate({
      target: [monthlyQuestProgress.userId, monthlyQuestProgress.yearMonth],
      set: {
        points: sql`${monthlyQuestProgress.points} + 1`,
        updatedAt: sql`now()`,
      },
    });
}

function daysInCurrentMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

export async function getMonthlyProgress(db: Database, userId: string) {
  const yearMonth = formatYearMonth(new Date());
  const target = daysInCurrentMonth();
  const [row] = await db
    .select()
    .from(monthlyQuestProgress)
    .where(
      and(
        eq(monthlyQuestProgress.userId, userId),
        eq(monthlyQuestProgress.yearMonth, yearMonth),
      ),
    );

  return {
    yearMonth,
    points: row?.points ?? 0,
    targetPoints: target,
    rewardClaimed: row?.rewardClaimed ?? false,
  };
}

export async function claimMonthlyReward(db: Database, userId: string) {
  const yearMonth = formatYearMonth(new Date());
  const [row] = await db
    .select()
    .from(monthlyQuestProgress)
    .where(
      and(
        eq(monthlyQuestProgress.userId, userId),
        eq(monthlyQuestProgress.yearMonth, yearMonth),
      ),
    );

  const target = daysInCurrentMonth();
  if (!row || row.points < target || row.rewardClaimed) {
    return { claimed: false };
  }

  await db
    .update(monthlyQuestProgress)
    .set({ rewardClaimed: true, updatedAt: new Date() })
    .where(
      and(
        eq(monthlyQuestProgress.userId, userId),
        eq(monthlyQuestProgress.yearMonth, yearMonth),
      ),
    );

  return { claimed: true };
}
