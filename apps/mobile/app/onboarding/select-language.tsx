import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { L1_CODES, type L1Code } from "@fala-pt/core";
import { Button } from "@/components/ui/Button";
import { colors, spacing, radii, typography } from "@fala-pt/ui/tokens";
import { setString, KEYS } from "@/lib/storage";

const L1_LABELS: Record<L1Code, { name: string; native: string; flag: string }> = {
  en: { name: "English", native: "English", flag: "GB" },
  es: { name: "Spanish", native: "Español", flag: "ES" },
  fr: { name: "French", native: "Français", flag: "FR" },
  hi: { name: "Hindi", native: "हिन्दी", flag: "IN" },
  ur: { name: "Urdu", native: "اردو", flag: "PK" },
  ar: { name: "Arabic", native: "العربية", flag: "SA" },
  bn: { name: "Bengali", native: "বাংলা", flag: "BD" },
  de: { name: "German", native: "Deutsch", flag: "DE" },
  zh: { name: "Chinese", native: "中文", flag: "CN" },
  ru: { name: "Russian", native: "Русский", flag: "RU" },
  uk: { name: "Ukrainian", native: "Українська", flag: "UA" },
  tr: { name: "Turkish", native: "Türkçe", flag: "TR" },
  pl: { name: "Polish", native: "Polski", flag: "PL" },
  ko: { name: "Korean", native: "한국어", flag: "KR" },
  ja: { name: "Japanese", native: "日本語", flag: "JP" },
};

export default function SelectLanguageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<L1Code | null>(null);

  const handleSelect = (code: L1Code) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(code);
  };

  const handleContinue = () => {
    if (!selected) return;
    setString(KEYS.SELECTED_L1, selected);
    router.push("/onboarding/gdpr-consent");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
      <Text style={styles.title}>I speak...</Text>
      <Text style={styles.subtitle}>
        Choose your native language. This personalizes your entire learning experience.
      </Text>

      <FlatList
        data={[...L1_CODES]}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.list}
        renderItem={({ item: code }) => {
          const label = L1_LABELS[code];
          const isSelected = selected === code;
          return (
            <Pressable
              onPress={() => handleSelect(code)}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
              ]}
            >
              <Text style={styles.flag}>{label.flag}</Text>
              <View style={styles.labelContainer}>
                <Text style={[styles.name, isSelected && styles.nameSelected]}>
                  {label.native}
                </Text>
                <Text style={styles.englishName}>{label.name}</Text>
              </View>
              {isSelected && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </Pressable>
          );
        }}
      />

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
  list: {
    paddingBottom: spacing["3xl"],
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
  flag: {
    fontSize: 20,
    width: 36,
    textAlign: "center",
  },
  labelContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  name: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
    color: colors.neutral[900],
  },
  nameSelected: {
    color: colors.primary[700],
  },
  englishName: {
    fontSize: typography.sizes.xs,
    color: colors.neutral[400],
    marginTop: 1,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[600],
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  footer: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});
