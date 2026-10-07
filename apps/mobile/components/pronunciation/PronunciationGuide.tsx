import { View, Text, FlatList, StyleSheet } from "react-native";
import type { PhoneticDifficulty } from "@falatorio/core/l1-profiles/types";
import { spacing, typography } from "@falatorio/ui/tokens";
import { useTheme } from "@/lib/theme";
import { PhonemeCard } from "./PhonemeCard";

const L1_NAMES_PT: Record<string, string> = {
  English: "Inglês",
  Spanish: "Espanhol",
  French: "Francês",
  Hindi: "Hindi",
  Urdu: "Urdu",
  Arabic: "Árabe",
  Bengali: "Bengali",
  German: "Alemão",
  Chinese: "Chinês",
  Russian: "Russo",
  Ukrainian: "Ucraniano",
  Turkish: "Turco",
  Polish: "Polaco",
  Korean: "Coreano",
  Japanese: "Japonês",
};

interface PronunciationGuideProps {
  difficulties: readonly PhoneticDifficulty[];
  l1Name: string;
}

export function PronunciationGuide({ difficulties, l1Name }: PronunciationGuideProps) {
  const theme = useTheme();
  const l1NamePt = L1_NAMES_PT[l1Name] ?? l1Name;

  if (difficulties.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>
          Sem dificuldades fonéticas registadas para falantes de {l1NamePt}.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>
        Sons difíceis para falantes de {l1NamePt}
      </Text>
      <Text style={[styles.subtitle, { color: theme.textMuted }]}>
        Toca num som para ver a posição da língua e dicas de pronúncia
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
    fontWeight: "700",
    fontSize: typography.sizes.xl,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
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
    fontSize: typography.sizes.md,
    textAlign: "center",
  },
});
