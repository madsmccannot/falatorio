import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  View, Text, ScrollView, Pressable, StyleSheet, Dimensions, BackHandler,
} from "react-native";
import type { NativeSyntheticEvent, NativeScrollEvent, LayoutChangeEvent } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";
import { useHearts } from "@/hooks/useHearts";
import { useStreak } from "@/hooks/useStreak";
import { useOuro } from "@/hooks/useOuro";
import { Loading } from "@/components/ui/Loading";
import {
  HeartIcon, StreakIcon, GoldPrisms, BookIcon, ChestIcon,
  StarIcon, BoltIcon, LockIcon, CheckIcon, ChevronRightIcon,
} from "@/components/icons";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const NODE_SIZE = 64;
const PATH_CENTER = SCREEN_WIDTH / 2;
const PATH_AMPLITUDE = 80;
const NODE_GAP = 20;

function getUnitColor(index: number): string {
  return colors.unitColors[index % colors.unitColors.length]!;
}

const PATH_OFFSETS = [0, 0.6, 1, 0.8, 0, -0.6, -1, -0.8];

function getNodeX(globalIndex: number): number {
  const phase = PATH_OFFSETS[globalIndex % PATH_OFFSETS.length]!;
  return PATH_CENTER - NODE_SIZE / 2 + phase * PATH_AMPLITUDE;
}

type LessonNode = {
  id: string;
  sortOrder: number;
  nodeType: "lesson" | "chest";
  rewardConfig: { type: string; amount: number } | null;
  completed: boolean;
};

type UnitWithLessons = {
  id: string;
  title: Record<string, string>;
  theme: string;
  description: Record<string, string> | null;
  sortOrder: number;
  colorIndex: number;
  lessons: LessonNode[];
};

function LessonPathNode({
  node,
  globalIndex,
  totalInUnit,
  localIndex,
  unitColor,
  locked,
  theme,
  t,
  onPress,
}: {
  node: LessonNode;
  globalIndex: number;
  totalInUnit: number;
  localIndex: number;
  unitColor: string;
  locked: boolean;
  theme: ReturnType<typeof import("@/lib/theme").useTheme>;
  t: (key: import("@/lib/i18n").TKey) => string;
  onPress: () => void;
}) {
  const isChest = node.nodeType === "chest";
  const nodeX = getNodeX(globalIndex);
  const isLast = localIndex === totalInUnit - 1 && !isChest;
  const isCompleted = node.completed;

  let lessonNum = 0;
  if (!isChest) {
    lessonNum = localIndex + 1;
  }

  const bgColor = locked
    ? (theme.isDark ? "#374151" : colors.neutral[300])
    : isChest
      ? colors.ouro
      : unitColor;
  const borderColor = locked ? (theme.isDark ? "#4B5563" : colors.neutral[400]) : bgColor;
  const opacity = locked ? 0.5 : 1;

  return (
    <View style={styles.nodeRow}>
      <Pressable
        onPress={() => {
          if (locked) return;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
        style={[styles.nodeWrapper, { left: nodeX, opacity }]}
      >
        <View
          style={[
            styles.nodeCircle,
            { backgroundColor: bgColor, borderColor },
          ]}
        >
          <View style={styles.nodeInnerShadow}>
            {locked ? (
              <LockIcon size={22} color="#FFFFFF" />
            ) : isChest ? (
              <ChestIcon size={28} />
            ) : isCompleted ? (
              <CheckIcon size={24} color="#FFFFFF" />
            ) : localIndex === 0 || isLast ? (
              <StarIcon size={24} color="#FFFFFF" />
            ) : lessonNum % 3 === 0 ? (
              <BoltIcon size={22} color="#FFFFFF" />
            ) : (
              <BookIcon size={22} color="#FFFFFF" />
            )}
          </View>
        </View>
        <Text style={[styles.nodeLabel, { color: theme.textMuted }]} numberOfLines={1}>
          {isChest ? t("learn.chest") : isLast ? t("learn.recap") : `${t("learn.lesson")} ${lessonNum}`}
        </Text>
      </Pressable>
    </View>
  );
}

function QuestBanner() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const quests = trpc.quests.getDailyQuests.useQuery();
  const data = quests.data ?? [];
  const completed = data.filter((q) => q.completed).length;

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push("/quests");
      }}
      style={[styles.questBanner, { backgroundColor: theme.dueCard, borderColor: theme.dueBorder }]}
    >
      <BoltIcon size={20} color={colors.xp} />
      <View style={styles.questBannerContent}>
        <Text style={[styles.questBannerTitle, { color: theme.text }]}>
          {t("quests.daily_title")}
        </Text>
        <View style={[styles.questBannerTrack, { backgroundColor: theme.border }]}>
          <View style={[styles.questBannerFill, { width: `${(completed / 3) * 100}%` as any }]} />
        </View>
      </View>
      <Text style={[styles.questBannerCount, { color: theme.textMuted }]}>{completed}/3</Text>
      <ChevronRightIcon size={16} color={theme.textMuted} />
    </Pressable>
  );
}

export default function LearnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { hearts, unlimited } = useHearts();
  const { currentDays } = useStreak();
  const { balance } = useOuro();
  const { t } = useTranslation();

  const [showSections, setShowSections] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [visibleUnitIdx, setVisibleUnitIdx] = useState(0);

  const unitYPositions = useRef<number[]>([]);

  const coursesQuery = trpc.content.getCourses.useQuery();
  const courseId = coursesQuery.data?.[0]?.id ?? null;

  const sectionsQuery = trpc.content.getSections.useQuery(
    { courseId: courseId! },
    { enabled: !!courseId },
  );

  const allSections = useMemo(() => {
    return (sectionsQuery.data ?? []).filter((s) => s.sectionType !== "daily_refresh");
  }, [sectionsQuery.data]);

  const dailyRefresh = useMemo(() => {
    return (sectionsQuery.data ?? []).find((s) => s.sectionType === "daily_refresh");
  }, [sectionsQuery.data]);

  useEffect(() => {
    if (allSections.length > 0 && !activeSectionId) {
      const firstIncomplete = allSections.find((s) => s.completedLessons < s.totalLessons);
      setActiveSectionId((firstIncomplete ?? allSections[0])?.id ?? null);
    }
  }, [allSections, activeSectionId]);

  const currentSection = allSections.find((s) => s.id === activeSectionId);
  const currentSectionIdx = allSections.findIndex((s) => s.id === activeSectionId);

  const sectionMapQuery = trpc.content.getSectionMap.useQuery(
    { sectionId: activeSectionId! },
    { enabled: !!activeSectionId && !showSections },
  );

  useEffect(() => {
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (showSections) {
        setShowSections(false);
        return true;
      }
      return true;
    });
    return () => handler.remove();
  }, [showSections]);

  const isLoading = coursesQuery.isLoading || (!!courseId && sectionsQuery.isLoading);

  const handleSelectSection = useCallback((sectionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveSectionId(sectionId);
    setShowSections(false);
    setVisibleUnitIdx(0);
    unitYPositions.current = [];
  }, []);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = e.nativeEvent.contentOffset.y;
    const positions = unitYPositions.current;
    if (positions.length === 0) return;

    const bannerOffset = 80;
    let idx = 0;
    for (let i = positions.length - 1; i >= 0; i--) {
      if (scrollY + bannerOffset >= (positions[i] ?? 0)) {
        idx = i;
        break;
      }
    }
    setVisibleUnitIdx(idx);
  }, []);

  const handleUnitLayout = useCallback((unitIdx: number, e: LayoutChangeEvent) => {
    unitYPositions.current[unitIdx] = e.nativeEvent.layout.y;
  }, []);

  const renderTopBar = () => (
    <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
      <Pressable style={styles.topBarStat} onPress={() => router.push("/tabs/shop")}>
        <GoldPrisms size={20} />
        <Text style={[styles.topBarValue, { color: colors.ouro }]}>{balance}</Text>
      </Pressable>
      <Pressable style={styles.topBarStat}>
        <HeartIcon size={20} />
        <Text style={[styles.topBarValue, { color: colors.heart }]}>
          {unlimited ? "∞" : hearts}
        </Text>
      </Pressable>
      <Pressable style={styles.topBarStat}>
        <StreakIcon size={20} color={colors.streak} />
        <Text style={[styles.topBarValue, { color: colors.streak }]}>{currentDays}</Text>
      </Pressable>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.bgCard }]}>
        <BookIcon size={48} color={theme.textMuted} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>{t("learn.empty_title")}</Text>
      <Text style={[styles.emptyText, { color: theme.textMuted }]}>{t("learn.empty_text")}</Text>
    </View>
  );

  // -- SECTIONS VIEW --
  if (showSections) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        {renderTopBar()}
        <View style={[styles.sectionHeaderBar, { borderBottomColor: theme.border }]}>
          <Pressable onPress={() => setShowSections(false)} hitSlop={12}>
            <Text style={[styles.backArrow, { color: theme.textMuted }]}>{"←"}</Text>
          </Pressable>
          <Text style={[styles.sectionHeaderTitle, { color: theme.text }]} numberOfLines={1}>
            {t("learn.section")}
          </Text>
        </View>
        <ScrollView
          contentContainerStyle={styles.sectionListContainer}
          showsVerticalScrollIndicator={false}
        >
          <QuestBanner />
          {allSections.length === 0 && renderEmpty()}
          {allSections.map((section) => {
            const sectionColor = colors.sectionColors[section.sortOrder % colors.sectionColors.length]!;
            const title = (section.title as Record<string, string>)["pt"] ?? "";
            const isActive = section.id === activeSectionId;
            const unitRange = section.unitCount > 0
              ? `${section.unitStart}–${section.unitEnd}`
              : "";
            const progressPct = section.totalLessons > 0
              ? Math.round((section.completedLessons / section.totalLessons) * 100)
              : 0;

            return (
              <Pressable
                key={section.id}
                onPress={() => handleSelectSection(section.id)}
              >
                <View style={[
                  styles.sectionLargeCard,
                  { backgroundColor: theme.bgCard, borderColor: isActive ? sectionColor : theme.border, borderWidth: isActive ? 2 : 1 },
                ]}>
                  <View style={[styles.sectionColorBlock, { backgroundColor: sectionColor }]}>
                    <View style={styles.sectionColorContent}>
                      <View style={styles.sectionIconCircle}>
                        <BookIcon size={32} color="#FFFFFF" />
                      </View>
                    </View>
                  </View>

                  <View style={styles.sectionCardBody}>
                    <Text style={[styles.sectionLargeLabel, { color: theme.textMuted }]}>
                      {t("learn.section").toUpperCase()} {section.sortOrder + 1}
                    </Text>
                    <Text style={[styles.sectionLargeTitle, { color: theme.text }]} numberOfLines={2}>
                      {title}
                    </Text>

                    <View style={styles.sectionMetaRow}>
                      {unitRange ? (
                        <View style={[styles.sectionUnitBadge, { backgroundColor: sectionColor + "20" }]}>
                          <Text style={[styles.sectionUnitBadgeText, { color: sectionColor }]}>
                            {section.unitCount === 1 ? "1 unidade" : `Unidades ${unitRange}`}
                          </Text>
                        </View>
                      ) : null}
                      <View style={[styles.sectionCefrBadge, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                        <Text style={[styles.sectionCefrText, { color: theme.textMuted }]}>
                          {section.cefrMin}{section.cefrMax !== section.cefrMin ? `–${section.cefrMax}` : ""}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.sectionProgressTrack, { backgroundColor: theme.border }]}>
                      <View style={[styles.sectionProgressFill, { backgroundColor: sectionColor, width: `${progressPct}%` as any }]} />
                    </View>

                    {section.sortOrder > 0 && progressPct === 0 && (
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          router.push(
                            `/section-test?sectionId=${section.id}&sectionTitle=${encodeURIComponent(title)}&cefrMin=${section.cefrMin}&cefrMax=${section.cefrMax}`,
                          );
                        }}
                        hitSlop={8}
                      >
                        <Text style={[styles.sectionSkipLink, { color: sectionColor }]}>
                          {t("learn.skip_here")}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}

          {dailyRefresh && (
            <View style={[styles.sectionLargeCard, { backgroundColor: theme.bgCard, borderColor: theme.border, opacity: 0.55 }]}>
              <View style={[styles.sectionColorBlock, { backgroundColor: theme.isDark ? "#4B5563" : colors.neutral[400] }]}>
                <View style={styles.sectionColorContent}>
                  <View style={styles.sectionIconCircle}>
                    <LockIcon size={32} color="#FFFFFF" />
                  </View>
                </View>
              </View>
              <View style={styles.sectionCardBody}>
                <Text style={[styles.sectionLargeLabel, { color: theme.textMuted }]}>
                  {t("learn.daily_refresh").toUpperCase()}
                </Text>
                <Text style={[styles.sectionLargeTitle, { color: theme.textMuted }]}>
                  {t("learn.daily_refresh")}
                </Text>
                <Text style={[styles.sectionLockedText, { color: theme.textMuted }]}>
                  {t("learn.daily_refresh_locked")}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // -- LOADING / ERROR --
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        {renderTopBar()}
        <Loading message={t("learn.loading")} />
      </View>
    );
  }

  if (coursesQuery.isError) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        {renderTopBar()}
        <View style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Erro de ligação</Text>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            {coursesQuery.error?.message ?? "Não foi possível carregar os cursos."}
          </Text>
          <Pressable
            onPress={() => coursesQuery.refetch()}
            style={{ marginTop: spacing.lg, padding: spacing.md }}
          >
            <Text style={{ color: colors.primary[500], fontWeight: "700", fontSize: typography.sizes.md }}>
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // -- DEFAULT: UNIT PATH --
  const unitsLoading = !!activeSectionId && sectionMapQuery.isLoading;
  const unitsData = (sectionMapQuery.data ?? []) as UnitWithLessons[];

  const visibleUnit = unitsData[visibleUnitIdx];
  const bannerColor = visibleUnit
    ? getUnitColor(visibleUnit.colorIndex)
    : currentSection
      ? colors.sectionColors[currentSectionIdx % colors.sectionColors.length]!
      : colors.primary[500];
  const bannerSectionNum = currentSection ? currentSection.sortOrder + 1 : 1;
  const bannerUnitNum = visibleUnit ? visibleUnit.sortOrder + 1 : 1;
  const bannerTitle = visibleUnit
    ? ((visibleUnit.title as Record<string, string>)["pt"] ?? visibleUnit.theme)
    : currentSection
      ? ((currentSection.title as Record<string, string>)["pt"] ?? "")
      : "";

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {renderTopBar()}

      {currentSection && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowSections(true);
          }}
          style={[styles.currentSectionBanner, { backgroundColor: bannerColor }]}
        >
          <View style={styles.currentSectionContent}>
            <Text style={styles.currentSectionLabel}>
              {t("learn.section").toUpperCase()} {bannerSectionNum}, {t("learn.unit").toUpperCase()} {bannerUnitNum}
            </Text>
            <Text style={styles.currentSectionTitle} numberOfLines={1}>
              {bannerTitle}
            </Text>
          </View>
          <View style={styles.currentSectionAction}>
            <BookIcon size={18} color="#FFFFFF" />
          </View>
        </Pressable>
      )}

      {unitsLoading ? (
        <Loading message={t("learn.loading")} />
      ) : unitsData.length === 0 ? (
        renderEmpty()
      ) : (
        <ScrollView
          contentContainerStyle={[styles.pathContainer, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {(() => {
            let prevUnitLastCompleted = true;
            let globalNodeIdx = 0;
            return unitsData.map((unit, unitIdx) => {
              const unitColor = getUnitColor(unit.colorIndex);
              const unitTitle = (unit.title as Record<string, string>)["pt"] ?? unit.theme;
              const unitLocked = !prevUnitLastCompleted && unit.colorIndex > 0;

              const rendered = (
                <View
                  key={unit.id}
                  onLayout={(e) => handleUnitLayout(unitIdx, e)}
                >
                  {unitIdx > 0 && (
                    <View style={styles.unitDivider}>
                      <View style={[styles.unitDividerLine, { backgroundColor: theme.border }]} />
                      <Text style={[styles.unitDividerText, { color: theme.textMuted }]} numberOfLines={1}>
                        {unitTitle}
                      </Text>
                      <View style={[styles.unitDividerLine, { backgroundColor: theme.border }]} />
                    </View>
                  )}

                  {unitLocked && unitIdx > 0 && (
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push(
                          `/section-test?sectionId=${activeSectionId}&sectionTitle=${encodeURIComponent(bannerTitle)}&cefrMin=${currentSection?.cefrMin ?? "A1"}&cefrMax=${currentSection?.cefrMax ?? "A2"}`,
                        );
                      }}
                      style={[styles.jumpHereBtn, { borderColor: theme.border }]}
                    >
                      <Text style={[styles.jumpHereText, { color: unitColor }]}>
                        {t("learn.skip_here")}
                      </Text>
                    </Pressable>
                  )}

                  {unit.lessons.map((lesson, lIdx) => {
                    const prevCompleted = lIdx === 0
                      ? prevUnitLastCompleted
                      : unit.lessons[lIdx - 1]!.completed;
                    const isLocked = unitLocked || (lIdx > 0 && !prevCompleted);

                    const thisGlobalIdx = globalNodeIdx;
                    globalNodeIdx++;

                    return (
                      <LessonPathNode
                        key={lesson.id}
                        node={lesson}
                        globalIndex={thisGlobalIdx}
                        localIndex={lIdx}
                        totalInUnit={unit.lessons.length}
                        unitColor={unitColor}
                        locked={isLocked}
                        theme={theme}
                        t={t}
                        onPress={() => {
                          if (lesson.nodeType === "chest") {
                            router.push(`/lesson/chest?lessonId=${lesson.id}`);
                          } else {
                            router.push(`/lesson/${lesson.id}`);
                          }
                        }}
                      />
                    );
                  })}

                  <View style={styles.unitSpacer} />
                </View>
              );

              const lastLesson = unit.lessons[unit.lessons.length - 1];
              prevUnitLastCompleted = lastLesson ? lastLesson.completed : true;

              return rendered;
            });
          })()}

          <View style={styles.dailyRefreshBanner}>
            <View style={styles.unitDivider}>
              <View style={[styles.unitDividerLine, { backgroundColor: theme.border }]} />
              <Text style={[styles.unitDividerText, { color: theme.textMuted }]}>
                {t("learn.daily_refresh")}
              </Text>
              <View style={[styles.unitDividerLine, { backgroundColor: theme.border }]} />
            </View>
            <View style={[styles.lockBadge, { backgroundColor: theme.isDark ? "#4B5563" : colors.neutral[400] }]}>
              <LockIcon size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.dailyRefreshLocked, { color: theme.textMuted }]}>
              {t("learn.daily_refresh_locked")}
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // -- Top stats bar --
  topBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing["3xl"],
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  topBarStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  topBarValue: {
    fontSize: typography.sizes.lg,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  // -- Current section/unit banner --
  currentSectionBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
  },
  currentSectionContent: {
    flex: 1,
  },
  currentSectionLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 2,
  },
  currentSectionTitle: {
    color: "#FFFFFF",
    fontSize: typography.sizes.md,
    fontWeight: "700",
  },
  currentSectionAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.md,
  },

  // -- Section header bar --
  sectionHeaderBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  backArrow: {
    fontSize: 22,
    fontWeight: "600",
  },
  sectionHeaderTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    flex: 1,
  },

  // -- Path view --
  pathContainer: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  nodeRow: {
    height: NODE_SIZE + NODE_GAP + 18,
    position: "relative",
  },
  nodeWrapper: {
    position: "absolute",
    top: 0,
    alignItems: "center",
    width: NODE_SIZE,
  },
  nodeCircle: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  nodeInnerShadow: {
    width: NODE_SIZE - 12,
    height: NODE_SIZE - 12,
    borderRadius: (NODE_SIZE - 12) / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  nodeLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
  },

  // -- Unit dividers --
  unitDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.xl,
    gap: spacing.md,
  },
  unitDividerLine: {
    flex: 1,
    height: 1,
  },
  unitDividerText: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
    maxWidth: "60%" as any,
    textAlign: "center",
  },
  jumpHereBtn: {
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  jumpHereText: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  unitSpacer: {
    height: spacing.lg,
  },

  // -- Daily Refresh --
  dailyRefreshBanner: {
    marginTop: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  lockBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.5,
  },
  dailyRefreshLocked: {
    fontSize: typography.sizes.sm,
    textAlign: "center",
    lineHeight: 18,
  },

  // -- Section list --
  sectionListContainer: {
    padding: spacing.lg,
    paddingBottom: spacing["5xl"],
    gap: spacing.lg,
  },
  sectionLargeCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionColorBlock: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionColorContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  sectionIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionCardBody: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  sectionLargeLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  sectionLargeTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: "800",
    lineHeight: 26,
  },
  sectionMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  sectionUnitBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  sectionUnitBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
  },
  sectionCefrBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  sectionCefrText: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
  },
  sectionProgressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  sectionProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  sectionSkipLink: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    letterSpacing: 0.5,
    textAlign: "center",
    paddingTop: spacing.xs,
  },
  sectionLockedText: {
    fontSize: typography.sizes.sm,
    lineHeight: 18,
  },

  // -- Shared --
  list: {
    padding: spacing.lg,
    paddingBottom: spacing["5xl"],
  },
  empty: {
    alignItems: "center",
    paddingTop: spacing["5xl"],
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    textAlign: "center",
    lineHeight: 22,
  },
  questBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  questBannerContent: {
    flex: 1,
    gap: 4,
  },
  questBannerTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
  },
  questBannerTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  questBannerFill: {
    height: "100%",
    backgroundColor: colors.primary[500],
    borderRadius: 3,
  },
  questBannerCount: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
  },
});
