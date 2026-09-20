import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";
import { useHearts } from "@/hooks/useHearts";
import { useStreak } from "@/hooks/useStreak";
import { useCrystals } from "@/hooks/useCrystals";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { HeartIcon, StreakIcon, GoldPrisms, BookIcon } from "@/components/icons";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

export default function LearnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { hearts, unlimited } = useHearts();
  const { currentDays } = useStreak();
  const { balance } = useCrystals();
  const { t } = useTranslation();
  const courses = trpc.content.getCourses.useQuery();

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
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
            <Text style={[styles.statValue, { color: colors.crystal }]}>{balance}</Text>
          </View>
        </View>
      </View>

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
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.bgCard }]}>
                <BookIcon size={48} color={theme.textMuted} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {t("learn.empty_title")}
              </Text>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                {t("learn.empty_text")}
              </Text>
            </View>
          }
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
});
