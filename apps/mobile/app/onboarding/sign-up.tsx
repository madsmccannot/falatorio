import { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/lib/theme";
import { onboardingStyles } from "@/lib/styles";
import { useTranslation } from "@/lib/i18n";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";
import { trackScreenView, trackOnboardingStep } from "@/lib/analytics";
import { captureEvent } from "@/lib/posthog";

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();
  const shared = useMemo(() => onboardingStyles(theme), [theme.isDark]);

  const { useSSO, useSignUp } = require("@clerk/expo");
  const { startSSOFlow } = useSSO();
  const { signUp, setActive } = useSignUp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackScreenView("sign_up");
  }, []);

  const isValid = email.includes("@") && password.length >= 8;

  const handleGoogleAuth = useCallback(async () => {
    setGoogleLoading(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const { createdSessionId, setActive: setActiveSession } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: makeRedirectUri({ path: "/sso-callback" }),
        redirectUrlComplete: makeRedirectUri({ path: "/sso-callback" }),
      });

      if (createdSessionId && setActiveSession) {
        await setActiveSession({ session: createdSessionId });
        captureEvent("auth_sign_up", { method: "google" });
        trackOnboardingStep("account_created");
        router.replace("/");
      }
    } catch (err: any) {
      if (err?.message !== "ERR_REQUEST_CANCELED") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(t("auth.error_generic"));
      }
    } finally {
      setGoogleLoading(false);
    }
  }, [startSSOFlow]);

  const handleSignUp = useCallback(async () => {
    if (!isValid) return;
    setError(null);
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await signUp.create({
        emailAddress: email.trim(),
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      captureEvent("auth_sign_up", { method: "email" });
      trackOnboardingStep("account_created");

      if (signUp.status === "complete") {
        await setActive({ session: signUp.createdSessionId });
      }

      router.replace("/onboarding/select-language");
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg =
        err?.errors?.[0]?.longMessage ??
        err?.errors?.[0]?.message ??
        t("auth.error_generic");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [email, password, isValid, signUp, setActive]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={[styles.backText, { color: theme.textSecondary }]}>
            {"<"} {t("auth.back")}
          </Text>
        </Pressable>

        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={[shared.title, styles.title]}>{t("auth.sign_up_title")}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.form}>
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

          <Text style={[styles.label, { color: theme.textSecondary }]}>{t("auth.email")}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.bgInput, color: theme.text, borderColor: theme.border }]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            placeholder="name@example.com"
            placeholderTextColor={theme.textMuted}
          />

          <Text style={[styles.label, { color: theme.textSecondary }]}>{t("auth.password")}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.bgInput, color: theme.text, borderColor: theme.border }]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            placeholder="8+ characters"
            placeholderTextColor={theme.textMuted}
          />

          {error && (
            <Text style={styles.error}>{error}</Text>
          )}

          <Button
            title={loading ? t("auth.creating_account") : t("auth.create_account")}
            onPress={handleSignUp}
            disabled={!isValid || loading}
            loading={loading}
            size="lg"
            style={styles.submitBtn}
          />
        </Animated.View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            {t("auth.has_account")}{" "}
          </Text>
          <Pressable onPress={() => router.replace("/onboarding/sign-in")}>
            <Text style={styles.footerLink}>{t("auth.sign_in")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  back: {
    marginBottom: spacing.xl,
    padding: spacing.xs,
  },
  backText: {
    fontSize: typography.sizes.md,
    fontWeight: "500",
  },
  title: {
    marginBottom: spacing.xl,
  },
  form: {
    flex: 1,
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
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    minHeight: 48,
  },
  error: {
    color: colors.accent[600],
    fontSize: typography.sizes.sm,
    marginTop: spacing.sm,
  },
  submitBtn: {
    marginTop: spacing.xl,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
  footerText: {
    fontSize: typography.sizes.sm,
  },
  footerLink: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
    color: colors.primary[600],
  },
});
