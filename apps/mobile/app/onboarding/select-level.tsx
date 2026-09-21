import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { CEFR_LEVELS, type CEFRLevel } from "@falatorio/core";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/lib/theme";
import { onboardingStyles } from "@/lib/styles";
import { useTranslation } from "@/lib/i18n";
import { spacing, radii, typography } from "@falatorio/ui/tokens";

const LEVEL_KEYS: Record<string, { label: string; desc: string }> = {
  A1: { label: "onboarding.level_a1", desc: "onboarding.level_a1_desc" },
  A2: { label: "onboarding.level_a2", desc: "onboarding.level_a2_desc" },
  B1: { label: "onboarding.level_b1", desc: "onboarding.level_b1_desc" },
  B2: { label: "onboarding.level_b2", desc: "onboarding.level_b2_desc" },
  C1: { label: "onboarding.level_c1", desc: "onboarding.level_c1_desc" },
  C2: { label: "onboarding.level_c2", desc: "onboarding.level_c2_desc" },
};

export default function SelectLevelScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();
  const shared = useMemo(() => onboardingStyles(theme), [theme.isDark]);
  const [selected, setSelected] = useState<CEFRLevel | null>(null);

  const handleSelect = (level: CEFRLevel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(level);
  };

  const handleContinue = () => {
    if (!selected) return;
    if (selected === "A1") {
      router.push("/onboarding/plan");
    } else {
      router.push("/onboarding/placement-test");
    }
  };

  return (
    <View style={[shared.screen, { paddingTop: insets.top + spacing.xl }]}>
      <Text style={shared.title}>{t("onboarding.level_title")}</Text>
      <Text style={shared.subtitle}>
        {t("onboarding.level_subtitle")}
      </Text>

      <View style={local.options}>
        {CEFR_LEVELS.map((level) => {
          const keys = LEVEL_KEYS[level]!;
          const isSelected = selected === level;
          return (
            <Pressable
              key={level}
              onPress={() => handleSelect(level)}
              style={[shared.optionCard, isSelected && shared.optionSelected]}
            >
              <View style={[local.badge, { backgroundColor: isSelected ? theme.optionSelectedBorder : theme.bgInput }]}>
                <Text style={[local.badgeText, { color: isSelected ? "#FFFFFF" : theme.textSecondary }]}>
                  {level}
                </Text>
              </View>
              <View style={local.labelContainer}>
                <Text style={[shared.optionLabel, isSelected && shared.optionLabelSelected]}>
                  {t(keys.label as any)}
                </Text>
                <Text style={shared.optionDesc}>{t(keys.desc as any)}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={[shared.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Button
          title={selected === "A1" ? t("onboarding.start_learning") : t("onboarding.take_test")}
          onPress={handleContinue}
          disabled={!selected}
          size="lg"
        />
      </View>
    </View>
  );
}

const local = StyleSheet.create({
  options: {
    flex: 1,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
  },
  labelContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
