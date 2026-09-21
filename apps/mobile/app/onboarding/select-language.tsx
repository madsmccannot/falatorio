import { useState, useMemo } from "react";
import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { L1_CODES, type L1Code } from "@falatorio/core";
import { Button } from "@/components/ui/Button";
import { FlagIcon, CheckIcon } from "@/components/icons";
import { useTheme } from "@/lib/theme";
import { onboardingStyles } from "@/lib/styles";
import { useTranslation } from "@/lib/i18n";
import { spacing } from "@falatorio/ui/tokens";
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
  const theme = useTheme();
  const { t } = useTranslation();
  const shared = useMemo(() => onboardingStyles(theme), [theme.isDark]);
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
    <View style={[shared.screen, { paddingTop: insets.top + spacing.xl }]}>
      <Text style={shared.title}>{t("onboarding.i_speak")}</Text>
      <Text style={shared.subtitle}>
        {t("onboarding.i_speak_desc")}
      </Text>

      <FlatList
        data={[...L1_CODES]}
        keyExtractor={(item) => item}
        contentContainerStyle={local.list}
        renderItem={({ item: code }) => {
          const label = L1_LABELS[code];
          const isSelected = selected === code;
          return (
            <Pressable
              onPress={() => handleSelect(code)}
              style={[shared.optionCard, isSelected && shared.optionSelected]}
            >
              <FlagIcon code={label.flag} size={36} />
              <View style={local.labelContainer}>
                <Text style={[shared.optionLabel, isSelected && shared.optionLabelSelected]}>
                  {label.native}
                </Text>
                <Text style={shared.optionDesc}>{label.name}</Text>
              </View>
              {isSelected && (
                <View style={shared.checkmark}>
                  <CheckIcon size={14} color="#FFFFFF" />
                </View>
              )}
            </Pressable>
          );
        }}
      />

      <View style={[shared.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Button
          title={t("onboarding.continue")}
          onPress={handleContinue}
          disabled={!selected}
          size="lg"
        />
      </View>
    </View>
  );
}

const local = StyleSheet.create({
  list: {
    paddingBottom: spacing["3xl"],
  },
  labelContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
});
