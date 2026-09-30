import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { trpc } from "@/lib/trpc";
import { ChestIcon, GoldPrisms, BoltIcon, FlameIcon, CrownIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { useTheme } from "@/lib/theme";
import { useTranslation, type TKey } from "@/lib/i18n";
import { colors, spacing, typography } from "@falatorio/ui/tokens";

function RewardIcon({ type, size = 48 }: { type: string; size?: number }) {
  switch (type) {
    case "ouro":
      return <GoldPrisms size={size} />;
    case "xp_boost":
      return <BoltIcon size={size} color={colors.info} />;
    case "streak_freeze":
      return <FlameIcon size={size} color={colors.streak} />;
    case "super_days":
      return <CrownIcon size={size} color={colors.primary[500]} />;
    default:
      return <GoldPrisms size={size} />;
  }
}

function rewardLabel(type: string, amount: number, t: (key: TKey) => string): string {
  switch (type) {
    case "ouro":
      return `+${amount} ouro`;
    case "xp_boost":
      return t("chest.xp_boost_label");
    case "streak_freeze":
      return t("chest.streak_freeze_label");
    case "super_days":
      return t("chest.super_days_label");
    default:
      return `+${amount}`;
  }
}

export default function ChestScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();
  const utils = trpc.useUtils();

  const [opened, setOpened] = useState(false);
  const [reward, setReward] = useState<{ type: string; amount: number; alreadyOpened: boolean } | null>(null);

  const chestScale = useSharedValue(1);
  const chestRotate = useSharedValue(0);
  const rewardOpacity = useSharedValue(0);
  const rewardScale = useSharedValue(0.3);

  const openChest = trpc.lesson.openChest.useMutation({
    onSuccess: (data) => {
      setReward(data);
      if (data.alreadyOpened) {
        setOpened(true);
        rewardOpacity.value = 1;
        rewardScale.value = 1;
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      chestScale.value = withSequence(
        withSpring(1.2, { damping: 4, stiffness: 200 }),
        withSpring(0.8, { damping: 6 }),
        withTiming(0, { duration: 200 }),
      );
      chestRotate.value = withSequence(
        withSpring(-10, { damping: 4 }),
        withSpring(10, { damping: 4 }),
        withSpring(-5, { damping: 4 }),
        withSpring(0, { damping: 8 }),
      );
      rewardOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
      rewardScale.value = withDelay(400, withSpring(1, { damping: 6, stiffness: 120 }));
      setTimeout(() => runOnJS(setOpened)(true), 400);
      utils.auth.getSession.invalidate();
    },
  });

  const chestAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: chestScale.value },
      { rotate: `${chestRotate.value}deg` },
    ],
  }));

  const rewardAnimStyle = useAnimatedStyle(() => ({
    opacity: rewardOpacity.value,
    transform: [{ scale: rewardScale.value }],
  }));

  const handleOpen = () => {
    if (!lessonId || openChest.isPending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    openChest.mutate({ lessonId });
  };

  if (openChest.isPending && !reward) {
    return <Loading fullScreen message="" />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: theme.bg }]}>
      <View style={styles.content}>
        {!opened && (
          <Animated.View style={[styles.chestContainer, chestAnimStyle]}>
            <View style={[styles.chestGlow, { backgroundColor: colors.ouro + "15" }]}>
              <ChestIcon size={96} />
            </View>
          </Animated.View>
        )}

        {opened && reward && (
          <Animated.View style={[styles.rewardContainer, rewardAnimStyle]}>
            <View style={[styles.rewardGlow, { backgroundColor: colors.ouro + "15" }]}>
              <RewardIcon type={reward.type} size={64} />
            </View>
            <Text style={[styles.rewardAmount, { color: theme.text }]}>
              {rewardLabel(reward.type, reward.amount, t)}
            </Text>
            {reward.alreadyOpened && (
              <Text style={[styles.alreadyOpened, { color: theme.textMuted }]}>
                {t("chest.already_opened")}
              </Text>
            )}
          </Animated.View>
        )}

        {!opened && !reward && (
          <>
            <Text style={[styles.title, { color: theme.text }]}>
              {t("chest.title")}
            </Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              {t("chest.subtitle")}
            </Text>
          </>
        )}
      </View>

      <View style={styles.footer}>
        {!opened ? (
          <Button
            title={t("chest.open")}
            onPress={handleOpen}
            style={{ width: "100%" }}
          />
        ) : (
          <Button
            title={t("chest.continue")}
            onPress={() => router.back()}
            style={{ width: "100%" }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  chestContainer: {
    marginBottom: spacing["2xl"],
  },
  chestGlow: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  rewardContainer: {
    alignItems: "center",
    gap: spacing.lg,
  },
  rewardGlow: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  rewardAmount: {
    fontSize: typography.sizes["3xl"],
    fontWeight: "800",
  },
  alreadyOpened: {
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  title: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "700",
    textAlign: "center",
    marginTop: spacing.xl,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
