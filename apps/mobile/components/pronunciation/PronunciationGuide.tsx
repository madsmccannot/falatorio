import { View, Text, FlatList, StyleSheet } from "react-native";
import type { PhoneticDifficulty } from "@falatorio/core/l1-profiles/types";
import { spacing, typography } from "@falatorio/ui/tokens";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import { PhonemeCard } from "./PhonemeCard";

interface PronunciationGuideProps {
  difficulties: readonly PhoneticDifficulty[];
  l1Name?: string;
}

export function PronunciationGuide({ difficulties }: PronunciationGuideProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  if (difficulties.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>
          {t("reference.phonetics_empty")}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
