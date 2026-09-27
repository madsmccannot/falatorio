import { useMemo, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/lib/theme";
import { onboardingStyles } from "@/lib/styles";
import { useTranslation } from "@/lib/i18n";
import { getString, KEYS } from "@/lib/storage";
import { trackScreenView, trackOnboardingStep } from "@/lib/analytics";
import { spacing, typography } from "@falatorio/ui/tokens";
import type { L1Code } from "@falatorio/core";

type L1Group = "romance" | "cjk" | "indic" | "rtl_adjacent" | "cyrillic" | "general";

function getL1Group(l1: L1Code): L1Group {
  if (l1 === "es" || l1 === "fr") return "romance";
  if (l1 === "zh" || l1 === "ja" || l1 === "ko") return "cjk";
  if (l1 === "hi" || l1 === "bn") return "indic";
  if (l1 === "ar" || l1 === "ur") return "rtl_adjacent";
  if (l1 === "ru" || l1 === "uk") return "cyrillic";
  return "general";
}

interface IntroContent {
  titleKey: string;
  sections: Array<{ heading: string; body: string }>;
}

function getIntroContent(_l1: L1Code, group: L1Group, t: (k: any) => string): IntroContent {
  switch (group) {
    case "romance":
      return {
        titleKey: t("onboarding.l1_intro_romance_title"),
        sections: [
          {
            heading: t("onboarding.l1_intro_romance_advantage"),
            body: t("onboarding.l1_intro_romance_advantage_text"),
          },
          {
            heading: t("onboarding.l1_intro_romance_traps"),
            body: t("onboarding.l1_intro_romance_traps_text"),
          },
          {
            heading: t("onboarding.l1_intro_romance_sounds"),
            body: t("onboarding.l1_intro_romance_sounds_text"),
          },
        ],
      };
    case "cjk":
      return {
        titleKey: t("onboarding.l1_intro_cjk_title"),
        sections: [
          {
            heading: t("onboarding.l1_intro_cjk_alphabet"),
            body: t("onboarding.l1_intro_cjk_alphabet_text"),
          },
          {
            heading: t("onboarding.l1_intro_cjk_sounds"),
            body: t("onboarding.l1_intro_cjk_sounds_text"),
          },
          {
            heading: t("onboarding.l1_intro_cjk_grammar"),
            body: t("onboarding.l1_intro_cjk_grammar_text"),
          },
        ],
      };
    case "indic":
      return {
        titleKey: t("onboarding.l1_intro_indic_title"),
        sections: [
          {
            heading: t("onboarding.l1_intro_indic_alphabet"),
            body: t("onboarding.l1_intro_indic_alphabet_text"),
          },
          {
            heading: t("onboarding.l1_intro_indic_sounds"),
            body: t("onboarding.l1_intro_indic_sounds_text"),
          },
          {
            heading: t("onboarding.l1_intro_indic_gender"),
            body: t("onboarding.l1_intro_indic_gender_text"),
          },
        ],
      };
    case "rtl_adjacent":
      return {
        titleKey: t("onboarding.l1_intro_rtl_title"),
        sections: [
          {
            heading: t("onboarding.l1_intro_rtl_direction"),
            body: t("onboarding.l1_intro_rtl_direction_text"),
          },
          {
            heading: t("onboarding.l1_intro_rtl_vowels"),
            body: t("onboarding.l1_intro_rtl_vowels_text"),
          },
          {
            heading: t("onboarding.l1_intro_rtl_gender"),
            body: t("onboarding.l1_intro_rtl_gender_text"),
          },
        ],
      };
    case "cyrillic":
      return {
        titleKey: t("onboarding.l1_intro_cyrillic_title"),
        sections: [
          {
            heading: t("onboarding.l1_intro_cyrillic_alphabet"),
            body: t("onboarding.l1_intro_cyrillic_alphabet_text"),
          },
          {
            heading: t("onboarding.l1_intro_cyrillic_sounds"),
            body: t("onboarding.l1_intro_cyrillic_sounds_text"),
          },
          {
            heading: t("onboarding.l1_intro_cyrillic_grammar"),
            body: t("onboarding.l1_intro_cyrillic_grammar_text"),
          },
        ],
      };
    default:
      return {
        titleKey: t("onboarding.l1_intro_general_title"),
        sections: [
          {
            heading: t("onboarding.l1_intro_general_sounds"),
            body: t("onboarding.l1_intro_general_sounds_text"),
          },
          {
            heading: t("onboarding.l1_intro_general_grammar"),
            body: t("onboarding.l1_intro_general_grammar_text"),
          },
        ],
      };
  }
}

export default function L1IntroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();
  const shared = useMemo(() => onboardingStyles(theme), [theme.isDark]);

  const l1 = (getString(KEYS.SELECTED_L1) ?? "en") as L1Code;
  const group = getL1Group(l1);
  const content = getIntroContent(l1, group, t);

  useEffect(() => {
    trackScreenView("onboarding_l1_intro");
    trackOnboardingStep("l1_intro_shown", `${l1}:${group}`);
  }, []);

  return (
    <View style={[shared.screen, { paddingTop: insets.top + spacing.xl }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <Text style={shared.title}>{content.titleKey}</Text>
        <Text style={shared.subtitle}>
          {t("onboarding.l1_intro_subtitle")}
        </Text>

        {content.sections.map((section, i) => (
          <View key={i} style={[shared.card, local.section]}>
            <View style={[local.badge, { backgroundColor: theme.isDark ? "#1E2D45" : "#EFF6FF" }]}>
              <Text style={[local.badgeText, { color: theme.isDark ? "#93C5FD" : "#2563EB" }]}>
                {i + 1}
              </Text>
            </View>
            <Text style={shared.cardTitle}>{section.heading}</Text>
            <Text style={shared.cardText}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={[shared.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Button
          title={t("onboarding.continue")}
          onPress={() => router.push("/onboarding/select-goal")}
          size="lg"
        />
      </View>
    </View>
  );
}

const local = StyleSheet.create({
  section: {
    flexDirection: "column",
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  badgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
  },
});
