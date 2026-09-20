import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { CEFR_LEVELS, type CEFRLevel } from "@falatorio/core";
import { Button } from "@/components/ui/Button";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

const LEVEL_INFO: Record<string, { label: string; description: string }> = {
  A1: { label: "Complete beginner", description: "I know little to no Portuguese" },
  A2: { label: "Elementary", description: "I can handle simple everyday situations" },
  B1: { label: "Intermediate", description: "I can follow conversations and express opinions" },
  B2: { label: "Upper intermediate", description: "I can interact fluently with native speakers" },
  C1: { label: "Advanced", description: "I can express myself fluently on complex topics" },
  C2: { label: "Proficient", description: "I understand virtually everything I read or hear" },
};

export default function SelectLevelScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
      <Text style={styles.title}>Your level</Text>
      <Text style={styles.subtitle}>
        How much Portuguese do you already know? We'll fine-tune with a quick test next.
      </Text>

      <View style={styles.options}>
        {CEFR_LEVELS.map((level) => {
          const info = LEVEL_INFO[level]!;
          const isSelected = selected === level;
          return (
            <Pressable
              key={level}
              onPress={() => handleSelect(level)}
              style={[styles.option, isSelected && styles.optionSelected]}
            >
              <View style={[styles.badge, isSelected && styles.badgeSelected]}>
                <Text style={[styles.badgeText, isSelected && styles.badgeTextSelected]}>
                  {level}
                </Text>
              </View>
              <View style={styles.labelContainer}>
                <Text style={[styles.optionLabel, isSelected && styles.labelSelected]}>
                  {info.label}
                </Text>
                <Text style={styles.optionDesc}>{info.description}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Button
          title={selected === "A1" ? "Start learning" : "Take placement test"}
          onPress={handleContinue}
          disabled={!selected}
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  options: {
    flex: 1,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral[0],
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  optionSelected: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
  },
  badgeSelected: {
    backgroundColor: colors.primary[600],
  },
  badgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    color: colors.neutral[600],
  },
  badgeTextSelected: {
    color: "#FFFFFF",
  },
  labelContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  optionLabel: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
    color: colors.neutral[900],
  },
  labelSelected: {
    color: colors.primary[700],
  },
  optionDesc: {
    fontSize: typography.sizes.xs,
    color: colors.neutral[500],
    marginTop: 1,
  },
  footer: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});
