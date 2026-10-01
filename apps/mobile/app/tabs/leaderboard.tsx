import { View, Text, FlatList, ScrollView, Pressable, Image, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";
import { Loading } from "@/components/ui/Loading";
import { TrophyIcon, StarIcon } from "@/components/icons";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import type { TKey } from "@/lib/i18n";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";
import { LEAGUE } from "@falatorio/core";
import Svg, { Path } from "react-native-svg";

const L1_LABELS: Record<string, string> = {
  en: "EN", es: "ES", fr: "FR", hi: "HI", ur: "UR", ar: "AR", bn: "BN",
  de: "DE", zh: "ZH", ru: "RU", uk: "UK", tr: "TR", pl: "PL", ko: "KO", ja: "JA",
};

const LEAGUE_TIERS: { nameKey: TKey; color: string; accent: string }[] = [
  { nameKey: "leaderboard.tier_bronze", color: "#CD7F32", accent: "#8B5E23" },
  { nameKey: "leaderboard.tier_silver", color: "#C0C0C0", accent: "#808080" },
  { nameKey: "leaderboard.tier_gold", color: "#FFD700", accent: "#B8960F" },
  { nameKey: "leaderboard.tier_sapphire", color: "#0EA5E9", accent: "#0369A1" },
  { nameKey: "leaderboard.tier_ruby", color: "#EF4444", accent: "#B91C1C" },
  { nameKey: "leaderboard.tier_emerald", color: "#10B981", accent: "#047857" },
  { nameKey: "leaderboard.tier_diamond", color: "#A78BFA", accent: "#6D28D9" },
];

function ShieldIcon({ size = 24, color, accent }: { size?: number; color: string; accent: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L4 6v5c0 5.25 3.4 10.15 8 11.3 4.6-1.15 8-6.05 8-11.3V6l-8-4z" fill={color} />
      <Path d="M12 2L4 6v5c0 5.25 3.4 10.15 8 11.3V2z" fill={accent} opacity={0.3} />
      <Path d="M10 13l2 2 4-4" stroke="#FFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function LockIconLocal({ size = 16, color = "#64748B" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function Avatar({ url, size = 36, name }: { url?: string | null; size?: number; name?: string | null }) {
  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }
  const initials = (name ?? "?").slice(0, 1).toUpperCase();
  return (
    <View style={[styles.avatarPlaceholder, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarInitial, { fontSize: size * 0.4 }]}>{initials}</Text>
    </View>
  );
}

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const leaderboard = trpc.gamification.getLeaderboard.useQuery();
  const data = leaderboard.data;

  const handleUserPress = (userId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/profile/${userId}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{t("leaderboard.title")}</Text>
        {data?.tier && (
          <View style={[styles.tierBadge, { backgroundColor: LEAGUE_TIERS.find((_, i) => ["bronze","silver","gold","sapphire","ruby","emerald","diamond"][i] === data.tier)?.color ?? colors.primary[600] }]}>
            <Text style={styles.tierText}>
              {data.tier.charAt(0).toUpperCase() + data.tier.slice(1)}
            </Text>
          </View>
        )}
      </View>

      {leaderboard.isLoading ? (
        <Loading message={t("leaderboard.loading")} />
      ) : !data || data.entries.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <View style={[styles.emptyCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <TrophyIcon size={40} color={colors.xp} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {t("leaderboard.weekly")}
            </Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              {t("leaderboard.empty_text")}
            </Text>
          </View>

          <Text style={[styles.tiersTitle, { color: theme.textSecondary }]}>{t("leaderboard.tiers_title")}</Text>
          <View style={[styles.tiersCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            {LEAGUE_TIERS.map((tier, i) => (
              <View key={tier.nameKey}>
                <View style={styles.tierRow}>
                  <ShieldIcon size={28} color={tier.color} accent={tier.accent} />
                  <Text style={[styles.tierName, { color: theme.text }]}>{t(tier.nameKey)}</Text>
                  {i > 0 && <LockIconLocal size={16} color={theme.textMuted} />}
                  {i === 0 && (
                    <Text style={[styles.tierHint, { color: colors.primary[theme.isDark ? 400 : 600] }]}>
                      {t("leaderboard.unlock")}
                    </Text>
                  )}
                </View>
                {i < LEAGUE_TIERS.length - 1 && (
                  <View style={[styles.tierDivider, { backgroundColor: theme.border }]} />
                )}
              </View>
            ))}
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme.dueCard, borderColor: theme.dueBorder }]}>
            <StarIcon size={20} color={colors.xp} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: theme.text }]}>{t("leaderboard.how_title")}</Text>
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                {t("leaderboard.how_desc")}
              </Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={data.entries}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.list}
          renderItem={({ item: entry }) => {
            const isMe = entry.rank === data.myRank;
            const isPromo = entry.rank <= LEAGUE.PROMOTE_TOP;
            const isDemo = entry.rank > data.entries.length - LEAGUE.DEMOTE_BOTTOM;

            return (
              <Pressable
                onPress={() => handleUserPress(entry.userId)}
              >
                <View
                  style={[
                    styles.row,
                    { backgroundColor: theme.bgCard, borderColor: theme.border },
                    isMe && { borderColor: colors.primary[500], backgroundColor: theme.dueCard },
                    isPromo && { borderLeftWidth: 3, borderLeftColor: colors.success },
                    isDemo && { borderLeftWidth: 3, borderLeftColor: colors.accent[400] },
                  ]}
                >
                  <View style={[
                    styles.rankCircle,
                    isPromo && { backgroundColor: "rgba(5,150,105,0.15)" },
                    isDemo && { backgroundColor: "rgba(239,68,68,0.15)" },
                  ]}>
                    <Text style={[
                      styles.rank,
                      { color: theme.textMuted },
                      isPromo && { color: colors.success },
                      isDemo && { color: colors.accent[500] },
                    ]}>
                      {entry.rank}
                    </Text>
                  </View>

                  <Avatar url={entry.avatarUrl} size={36} name={entry.name} />

                  <View style={styles.entryInfo}>
                    <Text
                      style={[
                        styles.entryName,
                        { color: theme.text },
                        isMe && { fontWeight: "700", color: colors.primary[theme.isDark ? 400 : 700] },
                      ]}
                      numberOfLines={1}
                    >
                      {entry.name ?? t("leaderboard.anon")}
                    </Text>
                    {entry.l1 && (
                      <Text style={[styles.entryL1, { color: theme.textMuted }]}>
                        {L1_LABELS[entry.l1] ?? entry.l1.toUpperCase()}
                      </Text>
                    )}
                  </View>

                  <Text style={styles.xp}>{entry.weeklyXp} XP</Text>
                </View>
              </Pressable>
            );
          }}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "700",
  },
  tierBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  tierText: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["5xl"],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    gap: spacing.md,
  },
  rankCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  rank: {
    fontSize: typography.sizes.md,
    fontWeight: "700",
  },
  avatarPlaceholder: {
    backgroundColor: colors.neutral[300],
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  entryInfo: {
    flex: 1,
    gap: 2,
  },
  entryName: {
    fontSize: typography.sizes.md,
    fontWeight: "500",
  },
  entryL1: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  xp: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
    color: colors.xp,
  },
  emptyContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["5xl"],
  },
  emptyCard: {
    alignItems: "center",
    padding: spacing["2xl"],
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    textAlign: "center",
    lineHeight: 20,
  },
  tiersTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  tiersCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  tierRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  tierName: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: "600",
  },
  tierHint: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
  },
  tierDivider: {
    height: 1,
    marginLeft: spacing.lg + 28 + spacing.md,
  },
  infoCard: {
    flexDirection: "row",
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    marginBottom: 4,
  },
  infoText: {
    fontSize: typography.sizes.xs,
    lineHeight: 18,
  },
});
