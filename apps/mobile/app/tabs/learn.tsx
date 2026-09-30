import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";
import { useHearts } from "@/hooks/useHearts";
import { useStreak } from "@/hooks/useStreak";
import { useOuro } from "@/hooks/useOuro";
import { Loading } from "@/components/ui/Loading";
import { HeartIcon, StreakIcon, GoldPrisms, BookIcon, ChevronRightIcon, ChestIcon, StarIcon } from "@/components/icons";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

export default function LearnScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ courseId?: string; sectionId?: string; unitId?: string }>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { hearts, unlimited } = useHearts();
  const { currentDays } = useStreak();
  const { balance } = useOuro();
  const { t } = useTranslation();

  const courses = trpc.content.getCourses.useQuery(undefined, {
    enabled: !params.courseId && !params.unitId,
  });
  const sectionList = trpc.content.getSections.useQuery(
    { courseId: params.courseId! },
    { enabled: !!params.courseId && !params.sectionId && !params.unitId },
  );
  const unitList = trpc.content.getUnits.useQuery(
    { sectionId: params.sectionId! },
    { enabled: !!params.sectionId && !params.unitId },
  );
  const lessonList = trpc.content.getLessons.useQuery(
    { unitId: params.unitId! },
    { enabled: !!params.unitId },
  );

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
      <Text style={[styles.greeting, { color: theme.text }]}>{t("learn.title")}</Text>
      <View style={styles.statsRow}>
        <View style={[styles.stat, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <HeartIcon size={16} />
          <Text style={[styles.statValue, { color: colors.heart }]}>
            {unlimited ? "∞" : hearts}
          </Text>
        </View>
        <View style={[styles.stat, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <StreakIcon size={16} color={colors.streak} />
          <Text style={[styles.statValue, { color: colors.streak }]}>{currentDays}</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <GoldPrisms size={16} />
          <Text style={[styles.statValue, { color: colors.ouro }]}>{balance}</Text>
        </View>
      </View>
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

  if (params.unitId) {
    const isLoading = lessonList.isLoading;
    const data = lessonList.data ?? [];

    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
        {renderHeader()}
        {isLoading ? (
          <Loading message={t("learn.loading")} />
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item: node, index }) => {
              const isChest = node.nodeType === "chest";
              const isLast = index === data.length - 1;

              return (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (isChest) {
                      router.push(`/lesson/chest?lessonId=${node.id}`);
                    } else {
                      router.push(`/lesson/${node.id}`);
                    }
                  }}
                >
                  <View style={[
                    styles.lessonNode,
                    { backgroundColor: theme.bgCard, borderColor: isChest ? colors.ouro : theme.border },
                    isChest && styles.chestNode,
                  ]}>
                    <View style={[
                      styles.lessonIcon,
                      { backgroundColor: isChest ? colors.ouro + "20" : colors.primary[500] + "20" },
                    ]}>
                      {isChest ? (
                        <ChestIcon size={24} />
                      ) : isLast ? (
                        <StarIcon size={20} color={colors.primary[500]} />
                      ) : (
                        <BookIcon size={20} color={colors.primary[500]} />
                      )}
                    </View>
                    <View style={styles.courseInfo}>
                      <Text style={[styles.lessonTitle, { color: theme.text }]}>
                        {isChest
                          ? t("learn.chest")
                          : isLast
                            ? t("learn.recap")
                            : `${t("learn.lesson")} ${index + 1 - data.slice(0, index).filter((n) => n.nodeType === "chest").length}`}
                      </Text>
                      {isChest && node.rewardConfig && (
                        <Text style={[styles.courseLevel, { color: colors.ouro }]}>
                          {(node.rewardConfig as { type: string; amount: number }).type === "ouro"
                            ? `${(node.rewardConfig as { type: string; amount: number }).amount} ouro`
                            : (node.rewardConfig as { type: string; amount: number }).type === "xp_boost"
                              ? t("learn.xp_boost")
                              : (node.rewardConfig as { type: string; amount: number }).type === "streak_freeze"
                                ? t("learn.streak_freeze")
                                : t("learn.super_days")}
                        </Text>
                      )}
                      {!isChest && isLast && (
                        <Text style={[styles.courseLevel, { color: theme.textMuted }]}>
                          {t("learn.recap_desc")}
                        </Text>
                      )}
                    </View>
                    <ChevronRightIcon size={20} color={theme.textMuted} />
                  </View>
                </Pressable>
              );
            }}
            ListEmptyComponent={renderEmpty()}
          />
        )}
      </View>
    );
  }

  if (params.sectionId) {
    const isLoading = unitList.isLoading;
    const data = unitList.data ?? [];

    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
        {renderHeader()}
        {isLoading ? (
          <Loading message={t("learn.loading")} />
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item: unit }) => (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/tabs/learn?unitId=${unit.id}`);
                }}
              >
                <View style={[styles.courseCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                  <View style={styles.courseInfo}>
                    <Text style={[styles.courseTitle, { color: theme.text }]}>
                      {(unit.title as Record<string, string>)["pt"] ?? unit.theme}
                    </Text>
                    {unit.description && (
                      <Text style={[styles.courseLevel, { color: theme.textMuted }]} numberOfLines={1}>
                        {(unit.description as Record<string, string>)["pt"] ?? ""}
                      </Text>
                    )}
                  </View>
                  <ChevronRightIcon size={20} color={theme.textMuted} />
                </View>
              </Pressable>
            )}
            ListEmptyComponent={renderEmpty()}
          />
        )}
      </View>
    );
  }

  if (params.courseId) {
    const isLoading = sectionList.isLoading;
    const data = sectionList.data ?? [];

    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
        {renderHeader()}
        {isLoading ? (
          <Loading message={t("learn.loading")} />
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item: section }) => (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/tabs/learn?courseId=${params.courseId}&sectionId=${section.id}`);
                }}
              >
                <View style={[styles.sectionCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>
                      {section.cefrMin}{section.cefrMax !== section.cefrMin ? `-${section.cefrMax}` : ""}
                    </Text>
                  </View>
                  <View style={styles.courseInfo}>
                    <Text style={[styles.courseTitle, { color: theme.text }]}>
                      {(section.title as Record<string, string>)["pt"] ?? ""}
                    </Text>
                    {section.description && (
                      <Text style={[styles.courseLevel, { color: theme.textMuted }]} numberOfLines={2}>
                        {(section.description as Record<string, string>)["pt"] ?? ""}
                      </Text>
                    )}
                  </View>
                  <ChevronRightIcon size={20} color={theme.textMuted} />
                </View>
              </Pressable>
            )}
            ListEmptyComponent={renderEmpty()}
          />
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
      {renderHeader()}
      {courses.isLoading ? (
        <Loading message={t("learn.loading")} />
      ) : (
        <FlatList
          data={courses.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: course }) => (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/tabs/learn?courseId=${course.id}`);
              }}
            >
              <View style={[styles.courseCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <View style={styles.courseIcon}>
                  <BookIcon size={24} color={colors.primary[400]} />
                </View>
                <View style={styles.courseInfo}>
                  <Text style={[styles.courseTitle, { color: theme.text }]}>
                    {(course.title as Record<string, string>)["pt"] ?? (course.title as Record<string, string>)["en"] ?? t("learn.course_fallback")}
                  </Text>
                  <Text style={[styles.courseLevel, { color: theme.textMuted }]}>
                    {course.cefrMin} - {course.cefrMax}
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={renderEmpty()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  greeting: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  stat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  statValue: {
    fontSize: typography.sizes.md,
    fontWeight: "700",
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing["5xl"],
  },
  courseCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  sectionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    gap: spacing.md,
  },
  sectionBadge: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    minWidth: 48,
    alignItems: "center",
  },
  sectionBadgeText: {
    color: "#fff",
    fontSize: typography.sizes.xs,
    fontWeight: "700",
  },
  courseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(16,185,129,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    marginBottom: 2,
  },
  courseLevel: {
    fontSize: typography.sizes.sm,
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
  lessonNode: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    gap: spacing.md,
  },
  chestNode: {
    borderWidth: 2,
  },
  lessonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  lessonTitle: {
    fontSize: typography.sizes.md,
    fontWeight: "700",
  },
});
