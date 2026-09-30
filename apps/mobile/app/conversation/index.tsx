import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";
import { useEntitlements } from "@/hooks/useEntitlements";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { LockIcon } from "@/components/icons";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

const SCENARIOS = [
  { id: "cafe", title: "At the cafe", description: "Order a coffee and pastry in Lisbon", cefrMin: "A1", icon: "cafe" },
  { id: "market", title: "At the market", description: "Buy groceries and haggle at the feira", cefrMin: "A2", icon: "cart" },
  { id: "doctor", title: "At the doctor", description: "Describe symptoms and understand instructions", cefrMin: "B1", icon: "medical" },
  { id: "job-interview", title: "Job interview", description: "Present yourself professionally in Portuguese", cefrMin: "B1", icon: "briefcase" },
  { id: "landlord", title: "Talking to landlord", description: "Discuss rental contract and house issues", cefrMin: "B1", icon: "home" },
  { id: "bank", title: "At the bank", description: "Open an account and discuss services", cefrMin: "B2", icon: "card" },
  { id: "debate", title: "Casual debate", description: "Discuss opinions on culture and current events", cefrMin: "B2", icon: "chatbubbles" },
  { id: "bureaucracy", title: "Government office", description: "Handle documents at Financas or SEF", cefrMin: "B1", icon: "document" },
] as const;

export default function ScenariosScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const { isSuper } = useEntitlements();
  const session = trpc.auth.getSession.useQuery();
  const userLevel = session.data?.cefrLevel ?? "A1";
  const { data: lessonGate, isLoading: gateLoading } = trpc.lesson.hasCompletedLesson.useQuery();

  if (gateLoading) {
    return <Loading fullScreen message="" />;
  }

  if (!lessonGate?.hasCompleted) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
        <LockIcon size={48} color={theme.textMuted} />
        <Text style={[styles.lockedTitle, { color: theme.text }]}>
          {t("practice.locked_title")}
        </Text>
        <Text style={[styles.lockedSubtitle, { color: theme.textMuted }]}>
          {t("practice.locked_text")}
        </Text>
        <Button
          title={t("lesson.go_back")}
          onPress={() => router.back()}
          variant="outline"
          style={{ marginTop: spacing.xl }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{t("scenarios.title")}</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          {t("scenarios.subtitle")}
        </Text>
        {!isSuper && (
          <View style={[styles.limitBadge, { backgroundColor: theme.isDark ? "#3B1A1A" : colors.accent[50] }]}>
            <Text style={[styles.limitText, { color: theme.isDark ? "#F87171" : colors.accent[700] }]}>
              {t("scenarios.limit")}
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={SCENARIOS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const levelOrder = ["A1", "A2", "B1", "B2", "C1", "C2"];
          const userIdx = levelOrder.indexOf(userLevel);
          const scenarioIdx = levelOrder.indexOf(item.cefrMin);
          const locked = scenarioIdx > userIdx + 1;

          return (
            <Pressable
              onPress={() => {
                if (locked) return;
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/conversation/${item.id}`);
              }}
              style={{ opacity: locked ? 0.5 : 1 }}
            >
              <View style={[styles.scenarioCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <View style={styles.scenarioHeader}>
                  <Text style={[styles.scenarioTitle, { color: theme.text }]}>{item.title}</Text>
                  <View style={[styles.cefrBadge, { backgroundColor: theme.isDark ? colors.primary[900] : colors.primary[50] }]}>
                    <Text style={[styles.cefrText, { color: theme.isDark ? colors.primary[300] : colors.primary[700] }]}>
                      {item.cefrMin}+
                    </Text>
                  </View>
                </View>
                <Text style={[styles.scenarioDesc, { color: theme.textMuted }]}>{item.description}</Text>
                {locked && (
                  <Text style={[styles.lockedText, { color: theme.textMuted }]}>
                    {t("scenarios.unlock").replace("{{level}}", item.cefrMin)}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        }}
      />
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
  },
  title: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "700",
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  limitBadge: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  limitText: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["5xl"],
  },
  scenarioCard: {
    marginBottom: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  scenarioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  scenarioTitle: {
    fontSize: typography.sizes.md,
    fontWeight: "700",
    flex: 1,
  },
  cefrBadge: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
  },
  cefrText: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
  },
  scenarioDesc: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  lockedText: {
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
    fontStyle: "italic",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  lockedTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  lockedSubtitle: {
    fontSize: typography.sizes.sm,
    textAlign: "center",
    lineHeight: 20,
  },
});
