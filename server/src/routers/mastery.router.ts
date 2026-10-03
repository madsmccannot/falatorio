import { z } from "zod";
import { eq, and, sql, desc, count, inArray } from "drizzle-orm";
import { t } from "../trpc/router.js";
import { protectedProcedure } from "../trpc/middleware.js";
import { recalculateMasteryForKnowledgeItems } from "../services/mastery-recalculator.service.js";
import {
  skills,
  knowledgeItems,
  skillPrerequisites,
  exerciseKnowledge,
  skillEvidence,
  skillMastery,
  knowledgeRelations,
  lessonSkills,
  exercises,
  lessons,
} from "@falatorio/db/schema";
import {
  SKILL_DOMAINS,
  CEFR_LEVELS,
  computeCoverageMetrics,
  computeExerciseCoverage,
  runFullQA,
  getAvailableSkills,
  checkArchitectureReadiness,
  checkContentReadiness,
  checkVerticalSlice,
  checkPhaseStatus,
  RECOMMENDED_VERTICAL_SLICES,
  estimateCEFR,
  topologicalSort,
  type Skill,
  type KnowledgeItem,
  type MasteryScore,
} from "@falatorio/core";
import type { CEFRLevel } from "@falatorio/core";

export const masteryRouter = t.router({
  getSkills: protectedProcedure
    .input(
      z.object({
        domain: z.enum(SKILL_DOMAINS as unknown as [string, ...string[]]).optional(),
        cefrLevel: z.enum(CEFR_LEVELS).optional(),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.db.select().from(skills).orderBy(skills.sortOrder);

      if (input?.domain) {
        query = query.where(eq(skills.domain, input.domain as any)) as any;
      }

      const rows = await query;

      const filtered = input?.cefrLevel
        ? rows.filter((r) => r.cefrLevel === input.cefrLevel)
        : rows;

      return filtered.map((s) => ({
        id: s.id,
        code: s.code,
        domain: s.domain,
        name: s.name as Record<string, string>,
        description: s.description as Record<string, string> | null,
        cefrLevel: s.cefrLevel as CEFRLevel,
        sortOrder: s.sortOrder,
      }));
    }),

  getKnowledgeItems: protectedProcedure
    .input(
      z.object({
        skillId: z.string().uuid().optional(),
        skillCode: z.string().optional(),
        status: z.enum(["draft", "review", "approved", "live"]).optional(),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      let rows = await ctx.db.select().from(knowledgeItems);

      if (input?.skillId) {
        rows = rows.filter((r) => r.skillId === input.skillId);
      }
      if (input?.skillCode) {
        const [skill] = await ctx.db.select().from(skills).where(eq(skills.code, input.skillCode)).limit(1);
        if (skill) {
          const sid = skill.id;
          rows = rows.filter((r) => r.skillId === sid);
        } else {
          return [];
        }
      }
      if (input?.status) {
        rows = rows.filter((r) => r.status === input.status);
      }

      return rows.map((ki) => ({
        id: ki.id,
        skillId: ki.skillId,
        code: ki.code,
        cefrLevel: ki.cefrLevel as CEFRLevel,
        rule: ki.rule,
        examples: ki.examples as string[],
        counterexamples: (ki.counterexamples ?? []) as string[],
        commonErrors: (ki.commonErrors ?? []) as string[],
        l1Notes: ki.l1Notes as Record<string, any> | null,
        shortExplanation: ki.shortExplanation as Record<string, string> | null,
        exerciseTypes: (ki.exerciseTypes ?? []) as string[],
        masteryCriteria: ki.masteryCriteria as { minAccuracy: number; minVariety: number; minReps: number } | null,
        version: ki.version,
        status: ki.status,
      }));
    }),

  getPrerequisites: protectedProcedure
    .input(z.object({ skillId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const prereqs = await ctx.db
        .select()
        .from(skillPrerequisites)
        .where(eq(skillPrerequisites.skillId, input.skillId));

      const prereqSkills = prereqs.length > 0
        ? await ctx.db
            .select()
            .from(skills)
            .where(inArray(skills.id, prereqs.map((p) => p.prerequisiteId)))
        : [];

      return prereqSkills.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name as Record<string, string>,
        cefrLevel: s.cefrLevel as CEFRLevel,
      }));
    }),

  getRelations: protectedProcedure
    .input(z.object({ knowledgeItemId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const rels = await ctx.db
        .select()
        .from(knowledgeRelations)
        .where(
          sql`${knowledgeRelations.sourceId} = ${input.knowledgeItemId} OR ${knowledgeRelations.targetId} = ${input.knowledgeItemId}`,
        );

      return rels.map((r) => ({
        sourceId: r.sourceId,
        targetId: r.targetId,
        relationType: r.relationType,
      }));
    }),

  getUserMastery: protectedProcedure
    .input(
      z.object({
        skillId: z.string().uuid().optional(),
        domain: z.enum(SKILL_DOMAINS as unknown as [string, ...string[]]).optional(),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      let rows = await ctx.db
        .select()
        .from(skillMastery)
        .where(eq(skillMastery.userId, ctx.user.userId));

      if (input?.skillId) {
        rows = rows.filter((r) => r.skillId === input.skillId);
      }

      const masteryWithSkills = [];
      for (const m of rows) {
        const [skill] = await ctx.db.select().from(skills).where(eq(skills.id, m.skillId)).limit(1);
        if (!skill) continue;
        if (input?.domain && skill.domain !== input.domain) continue;

        masteryWithSkills.push({
          skillId: m.skillId,
          skillCode: skill.code,
          skillName: skill.name as Record<string, string>,
          domain: skill.domain,
          cefrLevel: skill.cefrLevel as CEFRLevel,
          mastery: m.mastery,
          confidence: m.confidence,
          totalEvidence: m.totalEvidence,
          varietyScore: m.varietyScore,
          productionScore: m.productionScore,
          lastEvidenceAt: m.lastEvidenceAt,
        });
      }

      return masteryWithSkills;
    }),

  getEvidence: protectedProcedure
    .input(
      z.object({
        knowledgeItemId: z.string().uuid(),
        limit: z.number().int().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(skillEvidence)
        .where(
          and(
            eq(skillEvidence.userId, ctx.user.userId),
            eq(skillEvidence.knowledgeItemId, input.knowledgeItemId),
          ),
        )
        .orderBy(desc(skillEvidence.createdAt))
        .limit(input.limit);

      return rows.map((e) => ({
        id: e.id,
        score: e.score,
        exerciseType: e.exerciseType,
        createdAt: e.createdAt,
      }));
    }),

  getCEFREstimate: protectedProcedure.query(async ({ ctx }) => {
    const allSkills = await ctx.db.select().from(skills);
    const userMastery = await ctx.db
      .select()
      .from(skillMastery)
      .where(eq(skillMastery.userId, ctx.user.userId));

    const masteryMap = new Map<string, MasteryScore>();
    for (const m of userMastery) {
      masteryMap.set(m.skillId, {
        userId: m.userId,
        skillId: m.skillId,
        mastery: m.mastery,
        confidence: m.confidence,
        totalEvidence: m.totalEvidence,
        varietyScore: m.varietyScore,
        productionScore: m.productionScore,
        lastEvidenceAt: m.lastEvidenceAt,
      });
    }

    const skillsWithMastery = allSkills.map((s) => ({
      skill: {
        id: s.id,
        code: s.code,
        domain: s.domain as any,
        name: s.name as Record<string, string>,
        description: s.description as Record<string, string> | null,
        cefrLevel: s.cefrLevel as CEFRLevel,
        sortOrder: s.sortOrder,
      } as Skill,
      mastery: masteryMap.get(s.id) ?? null,
    }));

    return estimateCEFR(skillsWithMastery);
  }),

  getAvailableSkills: protectedProcedure.query(async ({ ctx }) => {
    const allSkills = await ctx.db.select().from(skills);
    const prereqs = await ctx.db.select().from(skillPrerequisites);
    const userMastery = await ctx.db
      .select()
      .from(skillMastery)
      .where(eq(skillMastery.userId, ctx.user.userId));

    const skillsTyped: Skill[] = allSkills.map((s) => ({
      id: s.id,
      code: s.code,
      domain: s.domain as any,
      name: s.name as Record<string, string>,
      description: s.description as Record<string, string> | null,
      cefrLevel: s.cefrLevel as CEFRLevel,
      sortOrder: s.sortOrder,
    }));

    const masteryScores: MasteryScore[] = userMastery.map((m) => ({
      userId: m.userId,
      skillId: m.skillId,
      mastery: m.mastery,
      confidence: m.confidence,
      totalEvidence: m.totalEvidence,
      varietyScore: m.varietyScore,
      productionScore: m.productionScore,
      lastEvidenceAt: m.lastEvidenceAt,
    }));

    const available = getAvailableSkills(
      skillsTyped,
      prereqs.map((p) => ({ skillId: p.skillId, prerequisiteId: p.prerequisiteId })),
      masteryScores,
      0.7,
    );

    return available.map((s) => ({
      id: s.id,
      code: s.code,
      domain: s.domain,
      name: s.name,
      cefrLevel: s.cefrLevel,
    }));
  }),

  getCoverage: protectedProcedure.query(async ({ ctx }) => {
    const allSkills = await ctx.db.select().from(skills);
    const allKIs = await ctx.db.select().from(knowledgeItems);
    const prereqs = await ctx.db.select().from(skillPrerequisites);
    const exKnowledge = await ctx.db.select().from(exerciseKnowledge);
    const [exerciseCount] = await ctx.db.select({ count: count() }).from(exercises);

    const skillsTyped: Skill[] = allSkills.map((s) => ({
      id: s.id,
      code: s.code,
      domain: s.domain as any,
      name: s.name as Record<string, string>,
      description: s.description as Record<string, string> | null,
      cefrLevel: s.cefrLevel as CEFRLevel,
      sortOrder: s.sortOrder,
    }));

    const kisTyped: KnowledgeItem[] = allKIs.map((ki) => ({
      id: ki.id,
      skillId: ki.skillId,
      code: ki.code,
      cefrLevel: ki.cefrLevel as CEFRLevel,
      rule: ki.rule,
      examples: (ki.examples ?? []) as string[],
      counterexamples: (ki.counterexamples ?? []) as string[],
      commonErrors: (ki.commonErrors ?? []) as string[],
      l1Notes: ki.l1Notes as any,
      shortExplanation: ki.shortExplanation as Record<string, string> | null,
      exerciseTypes: (ki.exerciseTypes ?? []) as any[],
      masteryCriteria: ki.masteryCriteria as any,
    }));

    const coverage = computeCoverageMetrics(
      skillsTyped,
      kisTyped,
      prereqs.map((p) => ({ skillId: p.skillId, prerequisiteId: p.prerequisiteId })),
    );

    const exerciseCoverage = computeExerciseCoverage(
      allKIs.map((ki) => ki.id),
      exKnowledge.map((ek) => ({ exerciseId: ek.exerciseId, knowledgeItemId: ek.knowledgeItemId })),
      Number(exerciseCount?.count ?? 0),
    );

    return { coverage, exerciseCoverage };
  }),

  getReadiness: protectedProcedure.query(async ({ ctx }) => {
    const allSkills = await ctx.db.select().from(skills);
    const allKIs = await ctx.db.select().from(knowledgeItems);
    const prereqs = await ctx.db.select().from(skillPrerequisites);
    const exKnowledge = await ctx.db.select().from(exerciseKnowledge);
    const evidence = await ctx.db.select({ count: count() }).from(skillEvidence);
    const mastery = await ctx.db.select({ count: count() }).from(skillMastery);
    const lessonSkillLinks = await ctx.db.select({ count: count() }).from(lessonSkills);

    const skillsTyped: Skill[] = allSkills.map((s) => ({
      id: s.id,
      code: s.code,
      domain: s.domain as any,
      name: s.name as Record<string, string>,
      description: s.description as Record<string, string> | null,
      cefrLevel: s.cefrLevel as CEFRLevel,
      sortOrder: s.sortOrder,
    }));

    const kisTyped: KnowledgeItem[] = allKIs.map((ki) => ({
      id: ki.id,
      skillId: ki.skillId,
      code: ki.code,
      cefrLevel: ki.cefrLevel as CEFRLevel,
      rule: ki.rule,
      examples: (ki.examples ?? []) as string[],
      counterexamples: (ki.counterexamples ?? []) as string[],
      commonErrors: (ki.commonErrors ?? []) as string[],
      l1Notes: ki.l1Notes as any,
      shortExplanation: ki.shortExplanation as Record<string, string> | null,
      exerciseTypes: (ki.exerciseTypes ?? []) as any[],
      masteryCriteria: ki.masteryCriteria as any,
    }));

    const coverage = computeCoverageMetrics(
      skillsTyped,
      kisTyped,
      prereqs.map((p) => ({ skillId: p.skillId, prerequisiteId: p.prerequisiteId })),
    );

    const qaResult = runFullQA(skillsTyped, kisTyped, prereqs.map((p) => ({
      skillId: p.skillId,
      prerequisiteId: p.prerequisiteId,
    })));

    const architecture = checkArchitectureReadiness({
      skillCount: allSkills.length,
      knowledgeItemCount: allKIs.length,
      prerequisiteCount: prereqs.length,
      exerciseKnowledgeLinkCount: exKnowledge.length,
      evidenceCount: Number(evidence[0]?.count ?? 0),
      masteryCount: Number(mastery[0]?.count ?? 0),
    });

    const content = checkContentReadiness(skillsTyped, kisTyped, qaResult, coverage);

    const verticalSlices = RECOMMENDED_VERTICAL_SLICES.map((code) =>
      checkVerticalSlice(
        code,
        skillsTyped,
        kisTyped,
        prereqs.map((p) => ({ skillId: p.skillId, prerequisiteId: p.prerequisiteId })),
      ),
    );
    const allSlicesComplete = verticalSlices.every((s) => s.complete);

    const phases = checkPhaseStatus({
      skillCount: allSkills.length,
      kiCount: allKIs.length,
      domainCount: Object.keys(coverage.skillsByDomain).length,
      prerequisiteCount: prereqs.length,
      cefrLevelCount: Object.keys(coverage.skillsByCEFR).length,
      exerciseKnowledgeLinkCount: exKnowledge.length,
      evidenceCount: Number(evidence[0]?.count ?? 0),
      masteryCount: Number(mastery[0]?.count ?? 0),
      lessonSkillLinkCount: Number(lessonSkillLinks[0]?.count ?? 0),
      qaValid: qaResult.valid,
      verticalSliceComplete: allSlicesComplete,
      knowledgeWithRules: kisTyped.filter((ki) => ki.rule.length > 0).length,
      knowledgeWithExamples: coverage.knowledgeWithExamples,
      knowledgeWithL1Notes: coverage.knowledgeWithL1Notes,
      contentGeneratorIntegrated: true,
    });

    return {
      architecture,
      content,
      qa: qaResult,
      verticalSlices,
      phases,
    };
  }),

  getUserGlossary: protectedProcedure
    .input(
      z.object({
        domain: z.enum(SKILL_DOMAINS as unknown as [string, ...string[]]).optional(),
        limit: z.number().int().min(1).max(200).default(50),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      const userEvidence = await ctx.db
        .select({ knowledgeItemId: skillEvidence.knowledgeItemId })
        .from(skillEvidence)
        .where(eq(skillEvidence.userId, ctx.user.userId))
        .groupBy(skillEvidence.knowledgeItemId);

      if (userEvidence.length === 0) return [];

      const encounteredIds = userEvidence.map((e) => e.knowledgeItemId);
      const allKIs = await ctx.db
        .select()
        .from(knowledgeItems)
        .where(inArray(knowledgeItems.id, encounteredIds))
        .limit(input?.limit ?? 50);

      const skillIds = [...new Set(allKIs.map((ki) => ki.skillId))];
      const relatedSkills = skillIds.length > 0
        ? await ctx.db.select().from(skills).where(inArray(skills.id, skillIds))
        : [];

      const skillMap = new Map(relatedSkills.map((s) => [s.id, s]));

      const results = allKIs
        .filter((ki) => {
          if (!input?.domain) return true;
          const skill = skillMap.get(ki.skillId);
          return skill?.domain === input.domain;
        })
        .map((ki) => {
          const skill = skillMap.get(ki.skillId);
          return {
            id: ki.id,
            code: ki.code,
            rule: ki.rule,
            examples: (ki.examples ?? []) as string[],
            shortExplanation: ki.shortExplanation as Record<string, string> | null,
            cefrLevel: ki.cefrLevel as CEFRLevel,
            domain: skill?.domain ?? "unknown",
            skillCode: skill?.code ?? "unknown",
            skillName: skill?.name as Record<string, string>,
          };
        });

      return results;
    }),

  getLessonSkills: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const links = await ctx.db
        .select()
        .from(lessonSkills)
        .where(eq(lessonSkills.lessonId, input.lessonId));

      if (links.length === 0) return [];

      const skillIds = links.map((l) => l.skillId);
      const linkedSkills = await ctx.db
        .select()
        .from(skills)
        .where(inArray(skills.id, skillIds));

      const primaryMap = new Map(links.map((l) => [l.skillId, l.isPrimary]));

      return linkedSkills.map((s) => ({
        id: s.id,
        code: s.code,
        domain: s.domain,
        name: s.name as Record<string, string>,
        cefrLevel: s.cefrLevel as CEFRLevel,
        isPrimary: primaryMap.get(s.id) ?? false,
      }));
    }),

  getSkillLessons: protectedProcedure
    .input(z.object({ skillId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const links = await ctx.db
        .select()
        .from(lessonSkills)
        .where(eq(lessonSkills.skillId, input.skillId));

      if (links.length === 0) return [];

      const lessonIds = links.map((l) => l.lessonId);
      const linkedLessons = await ctx.db
        .select()
        .from(lessons)
        .where(inArray(lessons.id, lessonIds));

      const primaryMap = new Map(links.map((l) => [l.lessonId, l.isPrimary]));

      return linkedLessons.map((l) => ({
        id: l.id,
        unitId: l.unitId,
        sortOrder: l.sortOrder,
        grammarFocus: l.grammarFocus,
        isPrimary: primaryMap.get(l.id) ?? false,
      }));
    }),

  linkLessonSkill: protectedProcedure
    .input(
      z.object({
        lessonId: z.string().uuid(),
        skillId: z.string().uuid(),
        isPrimary: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(lessonSkills)
        .values({
          lessonId: input.lessonId,
          skillId: input.skillId,
          isPrimary: input.isPrimary,
        })
        .onConflictDoUpdate({
          target: [lessonSkills.lessonId, lessonSkills.skillId],
          set: { isPrimary: input.isPrimary },
        });

      return { success: true };
    }),

  unlinkLessonSkill: protectedProcedure
    .input(
      z.object({
        lessonId: z.string().uuid(),
        skillId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(lessonSkills)
        .where(
          and(
            eq(lessonSkills.lessonId, input.lessonId),
            eq(lessonSkills.skillId, input.skillId),
          ),
        );

      return { success: true };
    }),

  recordEvidence: protectedProcedure
    .input(
      z.object({
        knowledgeItemId: z.string().uuid(),
        exerciseId: z.string().uuid().optional(),
        score: z.number().min(0).max(1),
        exerciseType: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [evidence] = await ctx.db
        .insert(skillEvidence)
        .values({
          userId: ctx.user.userId,
          knowledgeItemId: input.knowledgeItemId,
          exerciseId: input.exerciseId ?? null,
          score: input.score,
          exerciseType: input.exerciseType,
        })
        .returning({ id: skillEvidence.id });

      await recalculateMasteryForKnowledgeItems(
        ctx.db,
        ctx.user.userId,
        [input.knowledgeItemId],
      );

      return { evidenceId: evidence?.id ?? null };
    }),

  getTopologicalOrder: protectedProcedure.query(async ({ ctx }) => {
    const allSkills = await ctx.db.select().from(skills).orderBy(skills.sortOrder);
    const prereqs = await ctx.db.select().from(skillPrerequisites);

    const skillsTyped: Skill[] = allSkills.map((s) => ({
      id: s.id,
      code: s.code,
      domain: s.domain as any,
      name: s.name as Record<string, string>,
      description: s.description as Record<string, string> | null,
      cefrLevel: s.cefrLevel as CEFRLevel,
      sortOrder: s.sortOrder,
    }));

    const sorted = topologicalSort(
      skillsTyped,
      prereqs.map((p) => ({ skillId: p.skillId, prerequisiteId: p.prerequisiteId })),
    );

    return sorted.map((s) => ({
      id: s.id,
      code: s.code,
      domain: s.domain,
      name: s.name,
      cefrLevel: s.cefrLevel,
    }));
  }),

  recordVocabLookup: protectedProcedure
    .input(
      z.object({
        knowledgeItemCode: z.string().min(1).max(128),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [ki] = await ctx.db
        .select({ id: knowledgeItems.id })
        .from(knowledgeItems)
        .where(eq(knowledgeItems.code, input.knowledgeItemCode))
        .limit(1);

      if (!ki) return { recorded: false };

      await ctx.db.insert(skillEvidence).values({
        userId: ctx.user.userId,
        knowledgeItemId: ki.id,
        score: 0.5,
        exerciseType: "vocab_lookup",
      });

      return { recorded: true };
    }),
});
