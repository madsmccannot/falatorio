import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";
import { useEntitlements } from "@/hooks/useEntitlements";
import { Card } from "@/components/ui/Card";
import { useTranslation } from "@/lib/i18n";
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
  const { t } = useTranslation();
  const { isSuper } = useEntitlements();
  const session = trpc.auth.getSession.useQuery();
  const userLevel = session.data?.cefrLevel ?? "A1";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("scenarios.title")}</Text>
        <Text style={styles.subtitle}>
          {t("scenarios.subtitle")}
        </Text>
        {!isSuper && (
          <View style={styles.limitBadge}>
            <Text style={styles.limitText}>{t("scenarios.limit")}</Text>
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
              <Card elevated style={styles.scenarioCard}>
                <View style={styles.scenarioHeader}>
                  <Text style={styles.scenarioTitle}>{item.title}</Text>
                  <View style={styles.cefrBadge}>
                    <Text style={styles.cefrText}>{item.cefrMin}+</Text>
                  </View>
                </View>
                <Text style={styles.scenarioDesc}>{item.description}</Text>
                {locked && (
                  <Text style={styles.lockedText}>
                    {t("scenarios.unlock").replace("{{level}}", item.cefrMin)}
                  </Text>
                )}
              </Card>
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
    backgroundColor: colors.neutral[50],
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "700",
    color: colors.neutral[900],
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  limitBadge: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    backgroundColor: colors.accent[50],
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  limitText: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
    color: colors.accent[700],
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["5xl"],
  },
  scenarioCard: {
    marginBottom: spacing.md,
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
    color: colors.neutral[900],
    flex: 1,
  },
  cefrBadge: {
    backgroundColor: colors.primary[50],
    borderRadius: radii.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
  },
  cefrText: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
    color: colors.primary[700],
  },
  scenarioDesc: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
    lineHeight: 20,
  },
  lockedText: {
    fontSize: typography.sizes.xs,
    color: colors.neutral[400],
    marginTop: spacing.xs,
    fontStyle: "italic",
  },
});
