import { View, Text, FlatList, StyleSheet } from "react-native";
import type { PhoneticDifficulty } from "@falatorio/core/l1-profiles/types";
import { colors, spacing, typography } from "@falatorio/ui/tokens";
import { PhonemeCard } from "./PhonemeCard";

interface PronunciationGuideProps {
  difficulties: readonly PhoneticDifficulty[];
  l1Name: string;
}

export function PronunciationGuide({ difficulties, l1Name }: PronunciationGuideProps) {
  if (difficulties.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          Sem dificuldades foneticas registadas para falantes de {l1Name}.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Sons dificeis para falantes de {l1Name}
      </Text>
      <Text style={styles.subtitle}>
        Toca num som para ver a posicao da lingua e dicas de pronuncia
      </Text>
      <FlatList
        data={difficulties as PhoneticDifficulty[]}
        keyExtractor={(item) => `${item.sound}-${item.ipa}`}
        renderItem={({ item }) => <PhonemeCard phoneme={item} />}
        scrollEnabled={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontFamily: typography.heading.fontFamily,
    fontWeight: typography.heading.fontWeight,
    fontSize: typography.sizes.xl,
    color: colors.neutral[800],
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
    marginBottom: spacing.xl,
  },
  list: {
    paddingBottom: spacing.lg,
  },
  empty: {
    padding: spacing["2xl"],
    alignItems: "center",
  },
  emptyText: {
    fontFamily: typography.body.fontFamily,
    fontSize: typography.sizes.md,
    color: colors.neutral[400],
    textAlign: "center",
  },
});
