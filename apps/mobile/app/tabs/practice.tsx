import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFSRS } from "@/hooks/useFSRS";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { StreakIcon, BookIcon, ChatIcon, StarIcon } from "@/components/icons";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";
import Svg, { Path } from "react-native-svg";

function MicIcon({ size = 20, color = "#94A3B8" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const PRACTICE_MODES = [
  {
    id: "review",
    titleKey: "practice.review_title" as const,
    descKey: "practice.review_desc" as const,
    iconComponent: "streak",
    color: colors.primary[500],
    route: "/lesson/review" as const,
  },
  {
    id: "speak",
    titleKey: "practice.speak_title" as const,
    descKey: "practice.speak_desc" as const,
    iconComponent: "mic",
    color: colors.streak,
    route: "/lesson/speak" as const,
  },
  {
    id: "conversation",
    titleKey: "practice.conversation_title" as const,
    descKey: "practice.conversation_desc" as const,
    iconComponent: "chat",
    color: colors.info,
    route: "/conversation" as const,
  },
  {
    id: "mistakes",
    titleKey: "practice.mistakes_title" as const,
    descKey: "practice.mistakes_desc" as const,
    iconComponent: "book",
    color: colors.accent[500],
    route: "/lesson/mistakes" as const,
  },
];

function PracticeModeIcon({ type, size, color }: { type: string; size: number; color: string }) {
  switch (type) {
    case "streak": return <StreakIcon size={size} color={color} />;
    case "mic": return <MicIcon size={size} color={color} />;
    case "chat": return <ChatIcon size={size} color={color} />;
    case "book": return <BookIcon size={size} color={color} />;
    default: return <StarIcon size={size} color={color} />;
  }
}

export default function PracticeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const { dueCount, isLoading } = useFSRS();

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{t("practice.title")}</Text>
      </View>

      {dueCount > 0 && (
        <View style={[styles.dueCard, { backgroundColor: theme.dueCard, borderColor: theme.dueBorder }]}>
          <View style={styles.dueTop}>
            <StreakIcon size={24} color={colors.primary[400]} />
            <Text style={[styles.dueCount, { color: colors.primary[theme.isDark ? 400 : 600] }]}>
              {dueCount}
            </Text>
            <Text style={[styles.dueLabel, { color: theme.textSecondary }]}>
              {dueCount === 1 ? t("practice.item_one") : t("practice.items_other")}
            </Text>
          </View>
          <Button
            title={t("practice.start_review")}
            onPress={() => router.push("/lesson/review")}
            size="lg"
            style={styles.startButton}
          />
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{t("practice.modes_title")}</Text>
      <View style={styles.modesGrid}>
        {PRACTICE_MODES.map(mode => (
          <Pressable
            key={mode.id}
            onPress={() => router.push(mode.route)}
            style={[styles.modeCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
          >
            <View style={[styles.modeIconBg, { backgroundColor: mode.color + "20" }]}>
              <PracticeModeIcon type={mode.iconComponent} size={24} color={mode.color} />
            </View>
            <Text style={[styles.modeTitle, { color: theme.text }]}>{t(mode.titleKey)}</Text>
            <Text style={[styles.modeDesc, { color: theme.textMuted }]} numberOfLines={2}>{t(mode.descKey)}</Text>
          </Pressable>
        ))}
      </View>

      {isLoading && <Loading message={t("practice.loading")} />}

      {!isLoading && dueCount === 0 && (
        <View style={[styles.emptyCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <StarIcon size={24} color={colors.primary[400]} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>{t("practice.caught_up_title")}</Text>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            {t("practice.caught_up_text")}
          </Text>
        </View>
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
  },
  title: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "700",
  },
  dueCard: {
    marginHorizontal: spacing.lg,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  dueTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dueCount: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "800",
  },
  dueLabel: {
    fontSize: typography.sizes.sm,
  },
  startButton: {
    width: "100%",
  },
  sectionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    letterSpacing: 0.5,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  modesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  modeCard: {
    width: "48%",
    flexGrow: 1,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  modeIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  modeTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    marginBottom: 4,
  },
  modeDesc: {
    fontSize: typography.sizes.xs,
    lineHeight: 16,
  },
  emptyCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.lg,
    borderWidth: 1,
    alignItems: "center",
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.sizes.md,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    textAlign: "center",
    lineHeight: 20,
  },
});
