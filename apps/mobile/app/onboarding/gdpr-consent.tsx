import { useState, useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/lib/theme";
import { onboardingStyles } from "@/lib/styles";
import { useTranslation } from "@/lib/i18n";
import { spacing } from "@falatorio/ui/tokens";
import { setBoolean, KEYS } from "@/lib/storage";

export default function GDPRConsentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();
  const shared = useMemo(() => onboardingStyles(theme), [theme.isDark]);
  const [loading, setLoading] = useState(false);

  const handleAccept = () => {
    setLoading(true);
    setBoolean(KEYS.GDPR_CONSENT, true);
    router.push("/onboarding/select-goal");
  };

  const handleDecline = () => {
    setBoolean(KEYS.GDPR_CONSENT, false);
    router.push("/onboarding/select-goal");
  };

  return (
    <View style={[shared.screen, { paddingTop: insets.top + spacing.xl }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <Text style={shared.title}>{t("onboarding.gdpr_title")}</Text>
        <Text style={[shared.subtitle, { fontSize: 15, lineHeight: 22 }]}>
          {t("onboarding.gdpr_subtitle")}
        </Text>

        <View style={shared.card}>
          <Text style={shared.cardTitle}>{t("onboarding.gdpr_collect_title")}</Text>
          <Text style={shared.cardText}>
            {t("onboarding.gdpr_collect_text")}
          </Text>
        </View>

        <View style={shared.card}>
          <Text style={shared.cardTitle}>{t("onboarding.gdpr_ads_title")}</Text>
          <Text style={shared.cardText}>
            {t("onboarding.gdpr_ads_text")}
          </Text>
        </View>

        <View style={shared.card}>
          <Text style={shared.cardTitle}>{t("onboarding.gdpr_rights_title")}</Text>
          <Text style={shared.cardText}>
            {t("onboarding.gdpr_rights_text")}
          </Text>
        </View>
      </ScrollView>

      <View style={[shared.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Button
          title={t("onboarding.gdpr_accept")}
          onPress={handleAccept}
          loading={loading}
          size="lg"
        />
        <Button
          title={t("onboarding.gdpr_decline")}
          onPress={handleDecline}
          variant="ghost"
          size="md"
          style={{ marginTop: spacing.sm }}
        />
      </View>
    </View>
  );
}
