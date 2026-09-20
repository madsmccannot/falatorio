import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";
import { useHearts } from "@/hooks/useHearts";
import { useStreak } from "@/hooks/useStreak";
import { useCrystals } from "@/hooks/useCrystals";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { HeartIcon, StreakIcon, GoldPrisms } from "@/components/icons";
import { colors, spacing, typography } from "@falatorio/ui/tokens";

export default function LearnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { hearts, unlimited } = useHearts();
  const { currentDays } = useStreak();
  const { balance } = useCrystals();
  const courses = trpc.content.getCourses.useQuery();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <HeartIcon size={18} />
            <Text style={styles.statValue}>
              {unlimited ? "∞" : hearts}
            </Text>
          </View>
          <View style={styles.stat}>
            <StreakIcon size={18} color={colors.streak} />
            <Text style={styles.statValue}>{currentDays}</Text>
          </View>
          <View style={styles.stat}>
            <GoldPrisms size={18} />
            <Text style={styles.statValue}>{balance}</Text>
          </View>
        </View>
      </View>

      {courses.isLoading ? (
        <Loading message="Loading courses..." />
      ) : (
        <FlatList
          data={courses.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: course }) => (
            <CourseCard
              title={(course.title as Record<string, string>)["en"] ?? "Course"}
              cefrRange={`${course.cefrMin} - ${course.cefrMax}`}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/tabs/learn?courseId=${course.id}`);
              }}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No courses yet</Text>
              <Text style={styles.emptyText}>
                Courses will appear here once content is published.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function CourseCard({
  title,
  cefrRange,
  onPress,
}: {
  title: string;
  cefrRange: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <Card elevated style={styles.courseCard}>
        <Text style={styles.courseTitle}>{title}</Text>
        <Text style={styles.courseLevel}>{cefrRange}</Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  statValue: {
    fontSize: typography.sizes.md,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing["5xl"],
  },
  courseCard: {
    marginBottom: spacing.md,
  },
  courseTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  courseLevel: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
  },
  empty: {
    alignItems: "center",
    paddingTop: spacing["5xl"],
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: "600",
    color: colors.neutral[700],
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[400],
    textAlign: "center",
  },
});
