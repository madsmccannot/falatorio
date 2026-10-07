import { useEffect, useCallback, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/Button";
import { GoldPrisms } from "@/components/icons";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import { colors, spacing, typography } from "@falatorio/ui/tokens";
import { trackScreenView } from "@/lib/analytics";
import { captureEvent } from "@/lib/posthog";

WebBrowser.maybeCompleteAuthSession();

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();
  const [googleLoading, setGoogleLoading] = useState(false);

  const { useSSO } = require("@clerk/expo");
  const { startSSOFlow } = useSSO();

  useEffect(() => {
    trackScreenView("welcome");
  }, []);

  const handleGoogleAuth = useCallback(async () => {
    setGoogleLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const { createdSessionId, setActive, signUp } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: makeRedirectUri({ path: "/sso-callback" }),
        redirectUrlComplete: makeRedirectUri({ path: "/sso-callback" }),
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        captureEvent("auth_sign_in", { method: "google" });

        if (signUp?.createdUserId) {
          captureEvent("auth_sign_up", { method: "google" });
        }

        router.replace("/");
      }
    } catch (err: any) {
      if (err?.message !== "ERR_REQUEST_CANCELED") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setGoogleLoading(false);
    }
  }, [startSSOFlow]);

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      <View style={[styles.hero, { paddingTop: insets.top + spacing["3xl"] }]}>
        <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.logoWrap}>
          <GoldPrisms size={88} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <Text style={[styles.appName, { color: theme.text }]}>Falatório</Text>
          <Text style={[styles.title, { color: theme.text }]}>
            {t("auth.welcome_title")}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t("auth.welcome_subtitle")}
          </Text>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInDown.delay(700).duration(500)}
        style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}
      >
        <Button
          title={googleLoading ? t("auth.signing_in") : t("auth.continue_google")}
          onPress={handleGoogleAuth}
          variant="outline"
          size="lg"
          loading={googleLoading}
          style={styles.googleBtn}
        />

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          <Text style={[styles.dividerText, { color: theme.textMuted }]}>
            {t("auth.or_continue_with")}
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        </View>

        <Button
          title={t("auth.create_account")}
          onPress={() => router.push("/onboarding/sign-up")}
          size="lg"
          style={styles.primaryBtn}
        />

        <Button
          title={t("auth.sign_in")}
          onPress={() => router.push("/onboarding/sign-in")}
          variant="ghost"
          size="lg"
          style={styles.secondaryBtn}
        />

        <Text style={[styles.terms, { color: theme.textMuted }]}>
          {t("auth.terms_prefix")}{" "}
          <Text style={styles.termsLink}>{t("auth.terms_link")}</Text>
          {" "}{t("auth.terms_separator")}{" "}
          <Text style={styles.termsLink}>{t("auth.privacy_link")}</Text>
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrap: {
    marginBottom: spacing.xl,
  },
  appName: {
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  footer: {
    paddingTop: spacing.lg,
  },
  googleBtn: {
    marginBottom: spacing.md,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: typography.sizes.xs,
    marginHorizontal: spacing.sm,
  },
  primaryBtn: {
    marginBottom: spacing.sm,
  },
  secondaryBtn: {
    marginBottom: spacing.lg,
  },
  terms: {
    fontSize: typography.sizes.xs,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: spacing.lg,
  },
  termsLink: {
    color: colors.primary[600],
    fontWeight: "500",
  },
});
