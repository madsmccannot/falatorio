import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { ShieldIcon } from "@/components/icons";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

type DomainStatus = "strong" | "weak" | "unevaluated";

type Props = {
  level: string;
  confidence: number;
  strongDomains: readonly string[];
  weakDomains: readonly string[];
  unevaluatedDomains: readonly string[];
};

const DOMAIN_COLORS: Record<DomainStatus, string> = {
  strong: colors.success ?? "#22C55E",
  weak: colors.error ?? "#EF4444",
  unevaluated: "#94A3B8",
};

function ConfidenceBar({ confidence }: { confidence: number }) {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withTiming(confidence, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [confidence]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const theme = useTheme();

  return (
    <View style={[styles.barTrack, { backgroundColor: theme.bgAccent }]}>
      <Animated.View
        style={[
          styles.barFill,
          { backgroundColor: colors.primary[500] },
          fillStyle,
        ]}
      />
    </View>
  );
}

function DomainChip({
  domain,
  status,
}: {
  domain: string;
  status: DomainStatus;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const label = t(`mastery.domain.${domain}` as any);

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: theme.bgCard,
          borderColor: DOMAIN_COLORS[status],
          borderWidth: 1.5,
        },
      ]}
    >
      <View
        style={[styles.chipDot, { backgroundColor: DOMAIN_COLORS[status] }]}
      />
      <Text style={[styles.chipText, { color: theme.text }]}>{label}</Text>
    </View>
  );
}

export function MasteryDashboard({
  level,
  confidence,
  strongDomains,
  weakDomains,
  unevaluatedDomains,
}: Props) {
  const theme = useTheme();
  const { t } = useTranslation();

  const hasData = confidence > 0 || strongDomains.length > 0 || weakDomains.length > 0;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.bgCard, borderColor: theme.border },
      ]}
    >
      <View style={styles.header}>
        <ShieldIcon size={20} color={colors.primary[theme.isDark ? 400 : 600]} />
        <Text style={[styles.title, { color: theme.text }]}>
          {t("mastery.title")}
        </Text>
      </View>

      {!hasData ? (
        <Text style={[styles.noData, { color: theme.textMuted }]}>
          {t("mastery.no_data")}
        </Text>
      ) : (
        <>
          <View style={styles.levelRow}>
            <Text style={[styles.levelLabel, { color: theme.textSecondary }]}>
              {t("mastery.cefr_estimate")}
            </Text>
            <View
              style={[
                styles.levelBadge,
                {
                  backgroundColor: theme.bgAccent,
                  borderColor: theme.borderAccent,
                },
              ]}
            >
              <Text
                style={[
                  styles.levelText,
                  { color: colors.primary[theme.isDark ? 400 : 700] },
                ]}
              >
                {level}
              </Text>
            </View>
          </View>

          <View style={styles.confidenceRow}>
            <Text
              style={[styles.confidenceLabel, { color: theme.textSecondary }]}
            >
              {t("mastery.confidence")}
            </Text>
            <Text style={[styles.confidenceValue, { color: theme.text }]}>
              {Math.round(confidence * 100)}%
            </Text>
          </View>
          <ConfidenceBar confidence={confidence} />

          {strongDomains.length > 0 && (
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, { color: theme.textSecondary }]}
              >
                {t("mastery.strong_domains")}
              </Text>
              <View style={styles.chipRow}>
                {strongDomains.map((d) => (
                  <DomainChip key={d} domain={d} status="strong" />
                ))}
              </View>
            </View>
          )}

          {weakDomains.length > 0 && (
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, { color: theme.textSecondary }]}
              >
                {t("mastery.weak_domains")}
              </Text>
              <View style={styles.chipRow}>
                {weakDomains.map((d) => (
                  <DomainChip key={d} domain={d} status="weak" />
                ))}
              </View>
            </View>
          )}

          {unevaluatedDomains.length > 0 && (
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, { color: theme.textSecondary }]}
              >
                {t("mastery.unevaluated_domains")}
              </Text>
              <View style={styles.chipRow}>
                {unevaluatedDomains.map((d) => (
                  <DomainChip key={d} domain={d} status="unevaluated" />
                ))}
              </View>
            </View>
          )}

          <Text style={[styles.disclaimer, { color: theme.textMuted }]}>
            {t("mastery.disclaimer")}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: "700",
  },
  noData: {
    fontSize: typography.sizes.sm,
    textAlign: "center",
    paddingVertical: spacing.md,
  },
  levelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  levelLabel: {
    fontSize: typography.sizes.sm,
  },
  levelBadge: {
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  levelText: {
    fontSize: typography.sizes.lg,
    fontWeight: "800",
  },
  confidenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  confidenceLabel: {
    fontSize: typography.sizes.xs,
  },
  confidenceValue: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
  section: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.full ?? 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    gap: 4,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontSize: typography.sizes.xs,
    fontWeight: "500",
  },
  disclaimer: {
    fontSize: 10,
    textAlign: "center",
    marginTop: spacing.sm,
    fontStyle: "italic",
  },
});
