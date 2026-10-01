import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";
import { useHearts } from "@/hooks/useHearts";
import { useStreak } from "@/hooks/useStreak";
import { useOuro } from "@/hooks/useOuro";
import { Loading } from "@/components/ui/Loading";
import {
  HeartIcon,
  StreakIcon,
  GoldPrisms,
  BookIcon,
  ChestIcon,
  StarIcon,
  BoltIcon,
  LockIcon,
  CheckIcon,
  ChevronRightIcon,
} from "@/components/icons";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const NODE_SIZE = 64;
const PATH_CENTER = SCREEN_WIDTH / 2;
const PATH_AMPLITUDE = 70;
const NODE_GAP = 20;

function getUnitColor(index: number): string {
  return colors.unitColors[index % colors.unitColors.length]!;
}

const PATH_OFFSETS = [0, 0.7, 1, 0.7, 0, -0.7, -1, -0.7];

function getNodeX(index: number): number {
  const phase = PATH_OFFSETS[index % PATH_OFFSETS.length]!;
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
  index,
  totalInUnit,
  unitColor,
  locked,
  theme,
  t,
  onPress,
}: {
  node: LessonNode;
  index: number;
  totalInUnit: number;
  unitColor: string;
  locked: boolean;
  theme: ReturnType<typeof import("@/lib/theme").useTheme>;
  t: (key: import("@/lib/i18n").TKey) => string;
  onPress: () => void;
}) {
  const isChest = node.nodeType === "chest";
  const nodeX = getNodeX(index);
  const isLast = index === totalInUnit - 1 && !isChest;
  const isCompleted = node.completed;

  let lessonNum = 0;
  if (!isChest) {
    lessonNum = index + 1;
  }

  const bgColor = locked
    ? colors.neutral[300]
    : isChest
      ? colors.ouro
      : isCompleted
        ? unitColor
        : unitColor;
  const borderColor = locked ? colors.neutral[400] : bgColor;
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
            ) : index === 0 || isLast ? (
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
  const params = useLocalSearchParams<{
    courseId?: string;
    sectionId?: string;
    unitId?: string;
    sectionTitle?: string;
  }>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { hearts, unlimited } = useHearts();
  const { currentDays } = useStreak();
  const { balance } = useOuro();
  const { t } = useTranslation();

  const courses = trpc.content.getCourses.useQuery(undefined, {
    enabled: !params.courseId && !params.sectionId,
  });
  const sectionList = trpc.content.getSections.useQuery(
    { courseId: params.courseId! },
    { enabled: !!params.courseId && !params.sectionId },
  );
  const sectionMap = trpc.content.getSectionMap.useQuery(
    { sectionId: params.sectionId! },
    { enabled: !!params.sectionId },
  );

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

  // ── Section map: all units + lessons in a continuous winding path ──
  if (params.sectionId) {
    const isLoading = sectionMap.isLoading;
    const unitsData = (sectionMap.data ?? []) as UnitWithLessons[];
    const sectionTitle = params.sectionTitle ? decodeURIComponent(params.sectionTitle) : "";

    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        {renderTopBar()}
        {sectionTitle ? (
          <View style={[styles.sectionHeaderBar, { borderBottomColor: theme.border }]}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Text style={[styles.backArrow, { color: theme.textMuted }]}>{"←"}</Text>
            </Pressable>
            <Text style={[styles.sectionHeaderTitle, { color: theme.text }]} numberOfLines={1}>
              {sectionTitle}
            </Text>
          </View>
        ) : null}
        {isLoading ? (
          <Loading message={t("learn.loading")} />
        ) : unitsData.length === 0 ? (
          renderEmpty()
        ) : (
          <ScrollView
            contentContainerStyle={[styles.pathContainer, { paddingBottom: insets.bottom + 100 }]}
            showsVerticalScrollIndicator={false}
          >
            {(() => {
              let prevUnitLastCompleted = true;
              return unitsData.map((unit) => {
                const unitColor = getUnitColor(unit.colorIndex);
                const unitTitle = (unit.title as Record<string, string>)["pt"] ?? unit.theme;
                const unitLocked = !prevUnitLastCompleted && unit.colorIndex > 0;

                const rendered = (
                  <View key={unit.id}>
                    <View style={[styles.unitBanner, { backgroundColor: unitLocked ? colors.neutral[400] : unitColor, opacity: unitLocked ? 0.5 : 1 }]}>
                      <View style={styles.unitBannerContent}>
                        <Text style={styles.unitBannerLabel}>
                          UNIDADE {unit.sortOrder + 1}
                        </Text>
                        <Text style={styles.unitBannerTitle} numberOfLines={2}>
                          {unitTitle}
                        </Text>
                      </View>
                      <View style={styles.unitBannerIcon}>
                        {unitLocked ? (
                          <LockIcon size={20} color="#FFFFFF" />
                        ) : (
                          <BookIcon size={20} color="#FFFFFF" />
                        )}
                      </View>
                    </View>

                    {unit.lessons.map((lesson, lIdx) => {
                      const prevCompleted = lIdx === 0
                        ? prevUnitLastCompleted
                        : unit.lessons[lIdx - 1]!.completed;
                      const isLocked = unitLocked || (lIdx > 0 && !prevCompleted);

                      return (
                        <LessonPathNode
                          key={lesson.id}
                          node={lesson}
                          index={lIdx}
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

            {/* Daily Refresh -- always last, always locked */}
            <View style={styles.dailyRefreshBanner}>
              <View style={[styles.unitBanner, { backgroundColor: colors.neutral[400], opacity: 0.5 }]}>
                <View style={styles.unitBannerContent}>
                  <Text style={styles.unitBannerLabel}>
                    {t("learn.daily_refresh").toUpperCase()}
                  </Text>
                  <Text style={styles.unitBannerTitle} numberOfLines={2}>
                    {t("learn.daily_refresh")}
                  </Text>
                </View>
                <View style={styles.unitBannerIcon}>
                  <LockIcon size={20} color="#FFFFFF" />
                </View>
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

  // ── Course selected: show sections (Duolingo-style large cards) ──
  if (params.courseId) {
    const isLoading = sectionList.isLoading;
    const data = sectionList.data ?? [];
    const numbered = data.filter((s) => s.sectionType !== "daily_refresh");
    const dailyRefresh = data.find((s) => s.sectionType === "daily_refresh");

    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        {renderTopBar()}
        <View style={[styles.sectionHeaderBar, { borderBottomColor: theme.border }]}>
          <Pressable onPress={() => router.setParams({ courseId: undefined })} hitSlop={12}>
            <Text style={[styles.backArrow, { color: theme.textMuted }]}>{"←"}</Text>
          </Pressable>
          <Text style={[styles.sectionHeaderTitle, { color: theme.text }]} numberOfLines={1}>
            {t("learn.section")}
          </Text>
        </View>
        {isLoading ? (
          <Loading message={t("learn.loading")} />
        ) : (
          <ScrollView
            contentContainerStyle={styles.sectionListContainer}
            showsVerticalScrollIndicator={false}
          >
            <QuestBanner />
            {numbered.length === 0 && renderEmpty()}
            {numbered.map((section, idx) => {
              const sectionColor = colors.sectionColors[idx % colors.sectionColors.length]!;
              const title = (section.title as Record<string, string>)["pt"] ?? "";
              const isFirst = idx === 0;
              const unitRange = section.unitCount > 0
                ? `${section.unitStart}–${section.unitEnd}`
                : "";
              const progressPct = section.totalLessons > 0
                ? Math.round((section.completedLessons / section.totalLessons) * 100)
                : 0;

              return (
                <Pressable
                  key={section.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/tabs/learn?sectionId=${section.id}&sectionTitle=${encodeURIComponent(title)}`);
                  }}
                >
                  <View style={[styles.sectionLargeCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                    {/* Colored top area */}
                    <View style={[styles.sectionColorBlock, { backgroundColor: sectionColor }]}>
                      <View style={styles.sectionColorContent}>
                        <View style={styles.sectionIconCircle}>
                          <BookIcon size={32} color="#FFFFFF" />
                        </View>
                      </View>
                    </View>

                    {/* Info area */}
                    <View style={styles.sectionCardBody}>
                      <Text style={[styles.sectionLargeLabel, { color: theme.textMuted }]}>
                        {t("learn.section").toUpperCase()} {idx + 1}
                      </Text>
                      <Text style={[styles.sectionLargeTitle, { color: theme.text }]} numberOfLines={2}>
                        {title}
                      </Text>

                      {/* Unit range + CEFR badge row */}
                      <View style={styles.sectionMetaRow}>
                        {unitRange ? (
                          <View style={[styles.sectionUnitBadge, { backgroundColor: sectionColor + "20" }]}>
                            <Text style={[styles.sectionUnitBadgeText, { color: sectionColor }]}>
                              {section.unitCount === 1 ? `1 unidade` : `Unidades ${unitRange}`}
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

                      {/* Skip link for sections beyond current */}
                      {!isFirst && (
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

            {/* Daily Refresh card */}
            {dailyRefresh && (
              <View style={[styles.sectionLargeCard, { backgroundColor: theme.bgCard, borderColor: theme.border, opacity: 0.55 }]}>
                <View style={[styles.sectionColorBlock, { backgroundColor: colors.neutral[400] }]}>
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
        )}
      </View>
    );
  }

  // ── No course selected: show course list ──
  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {renderTopBar()}
      {courses.isLoading ? (
        <Loading message={t("learn.loading")} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {(courses.data ?? []).length === 0 && renderEmpty()}
          {(courses.data ?? []).map((course) => (
            <Pressable
              key={course.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/tabs/learn?courseId=${course.id}`);
              }}
            >
              <View style={[styles.courseCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <View style={[styles.courseIcon, { backgroundColor: colors.primary[500] + "20" }]}>
                  <BookIcon size={24} color={colors.primary[400]} />
                </View>
                <View style={styles.sectionInfo}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    {(course.title as Record<string, string>)["pt"] ?? (course.title as Record<string, string>)["en"] ?? t("learn.course_fallback")}
                  </Text>
                  <Text style={[styles.sectionDesc, { color: theme.textMuted }]}>
                    {course.cefrMin} - {course.cefrMax}
                  </Text>
                </View>
                <ChevronRightIcon size={20} color={theme.textMuted} />
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── Top stats bar (Duolingo-style) ──
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

  // ── Section header bar ──
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

  // ── Path view ──
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

  // ── Unit banners ──
  unitBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    minHeight: 80,
  },
  unitBannerContent: {
    flex: 1,
  },
  unitBannerLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 2,
  },
  unitBannerTitle: {
    color: "#FFFFFF",
    fontSize: typography.sizes.xl,
    fontWeight: "800",
    lineHeight: 26,
  },
  unitBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.md,
  },
  unitSpacer: {
    height: spacing["2xl"],
  },

  // ── Daily Refresh ──
  dailyRefreshBanner: {
    marginTop: spacing.lg,
  },
  dailyRefreshLocked: {
    fontSize: typography.sizes.sm,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 18,
  },

  // ── Section list ──
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
  sectionInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    marginBottom: 2,
  },
  sectionDesc: {
    fontSize: typography.sizes.sm,
    lineHeight: 18,
  },

  // ── Course cards ──
  courseCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    gap: spacing.md,
  },
  courseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Shared ──
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
