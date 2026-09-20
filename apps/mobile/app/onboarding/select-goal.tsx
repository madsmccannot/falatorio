import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { USER_GOALS, type UserGoal } from "@falatorio/core";
import { Button } from "@/components/ui/Button";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

const GOAL_INFO: Record<UserGoal, { label: string; description: string }> = {
  tourism: {
    label: "Tourism",
    description: "Visiting Portugal for holidays or short stays",
  },
  residency: {
    label: "Residency",
    description: "Moving to Portugal or already living there",
  },
  work: {
    label: "Work",
    description: "Working in Portugal or with Portuguese-speaking colleagues",
  },
  citizenship: {
    label: "Citizenship",
    description: "Preparing for the A2 citizenship language exam",
  },
  family: {
    label: "Family",
    description: "Learning for a Portuguese-speaking partner or family",
  },
  academic: {
    label: "Academic",
    description: "Studying Portuguese at university or for research",
  },
};

export default function SelectGoalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<UserGoal | null>(null);

  const handleSelect = (goal: UserGoal) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(goal);
  };

  const handleContinue = () => {
    if (!selected) return;
    router.push("/onboarding/select-level");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
      <Text style={styles.title}>Why are you learning?</Text>
      <Text style={styles.subtitle}>
        This helps us prioritize the right vocabulary and scenarios for you.
      </Text>

      <View style={styles.options}>
        {USER_GOALS.map((goal) => {
          const info = GOAL_INFO[goal];
          const isSelected = selected === goal;
          return (
            <Pressable
              key={goal}
              onPress={() => handleSelect(goal)}
              style={[styles.option, isSelected && styles.optionSelected]}
            >
              <Text style={[styles.optionLabel, isSelected && styles.labelSelected]}>
                {info.label}
              </Text>
              <Text style={styles.optionDesc}>{info.description}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Button
          title="Continue"
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
    backgroundColor: colors.neutral[0],
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  optionSelected: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  optionLabel: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
    color: colors.neutral[900],
    marginBottom: 2,
  },
  labelSelected: {
    color: colors.primary[700],
  },
  optionDesc: {
    fontSize: typography.sizes.xs,
    color: colors.neutral[500],
    lineHeight: 18,
  },
  footer: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});
