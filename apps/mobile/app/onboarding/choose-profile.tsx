import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/lib/theme";
import { onboardingStyles } from "@/lib/styles";
import { useTranslation } from "@/lib/i18n";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";
import { trackScreenView, trackOnboardingStep } from "@/lib/analytics";
import { setString, getApiUrl, KEYS } from "@/lib/storage";

const CLERK_KEY = process.env["EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY"] ?? "";

const USERNAME_RE = /^[a-z][a-z0-9_]{2,29}$/;
const DEBOUNCE_MS = 500;

function extractNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  return local
    .replace(/[._-]/g, " ")
    .replace(/\d+/g, "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
    .trim();
}

function suggestUsername(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 20);
}

function ClerkPrefill({ onPrefill }: { onPrefill: (name: string, uname: string) => void }) {
  const { useUser } = require("@clerk/expo");
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      const clerkName =
        [user.firstName, user.lastName].filter(Boolean).join(" ") || "";
      const email =
        user.primaryEmailAddress?.emailAddress ??
        user.emailAddresses?.[0]?.emailAddress ??
        "";
      const prefillName = clerkName || extractNameFromEmail(email);
      onPrefill(prefillName, suggestUsername(prefillName));
    }
  }, [user]);

  return null;
}

export default function ChooseProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();
  const shared = useMemo(() => onboardingStyles(theme), [theme.isDark]);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const [nameInitialized, setNameInitialized] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    trackScreenView("onboarding_choose_profile");
  }, []);

  const checkUsernameAvailability = useCallback(
    async (value: string) => {
      if (!USERNAME_RE.test(value)) {
        setUsernameStatus("invalid");
        return;
      }

      setUsernameStatus("checking");

      try {
        const res = await fetch(
          `${getApiUrl()}/trpc/auth.checkUsername?input=${encodeURIComponent(
            JSON.stringify({ json: { username: value } }),
          )}`,
        );
        const data = await res.json();
        const result = data?.result?.data?.json;

        if (result?.available) {
          setUsernameStatus("available");
        } else {
          setUsernameStatus("taken");
        }
      } catch {
        setUsernameStatus("available");
      }
    },
    [],
  );

  const handleUsernameChange = useCallback(
    (value: string) => {
      const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
      setUsername(cleaned);
      setUsernameStatus("idle");

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (cleaned.length >= 3) {
        debounceRef.current = setTimeout(() => {
          checkUsernameAvailability(cleaned);
        }, DEBOUNCE_MS);
      }
    },
    [checkUsernameAvailability],
  );

  const isValid =
    displayName.trim().length >= 1 &&
    USERNAME_RE.test(username) &&
    usernameStatus === "available";

  const handleContinue = useCallback(() => {
    if (!isValid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setString(KEYS.DISPLAY_NAME, displayName.trim());
    setString(KEYS.USERNAME, username);
    trackOnboardingStep("profile_chosen", username);
    router.push("/onboarding/gdpr-consent");
  }, [displayName, username, isValid]);

  const usernameHint = () => {
    switch (usernameStatus) {
      case "checking":
        return null;
      case "available":
        return { text: t("auth.username_available"), color: colors.success[600] };
      case "taken":
        return { text: t("auth.username_taken"), color: colors.accent[600] };
      case "invalid":
        return { text: t("auth.username_invalid"), color: colors.accent[600] };
      default:
        return null;
    }
  };

  const hint = usernameHint();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {CLERK_KEY && !nameInitialized && (
        <ClerkPrefill
          onPrefill={(name, uname) => {
            setDisplayName(name);
            setUsername(uname);
            setNameInitialized(true);
          }}
        />
      )}
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={shared.title}>{t("auth.profile_title")}</Text>
          <Text style={[shared.subtitle, styles.subtitle]}>
            {t("auth.profile_subtitle")}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.form}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            {t("auth.display_name")}
          </Text>
          <Text style={[styles.hint, { color: theme.textMuted }]}>
            {t("auth.display_name_hint")}
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.bgInput, color: theme.text, borderColor: theme.border }]}
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            placeholder={t("auth.display_name_placeholder")}
            placeholderTextColor={theme.textMuted}
            maxLength={255}
          />

          <Text style={[styles.label, { color: theme.textSecondary, marginTop: spacing.xl }]}>
            {t("auth.username_label")}
          </Text>
          <Text style={[styles.hint, { color: theme.textMuted }]}>
            {t("auth.username_hint")}
          </Text>
          <View style={styles.usernameRow}>
            <Text style={[styles.atSign, { color: theme.textMuted }]}>@</Text>
            <TextInput
              style={[
                styles.input,
                styles.usernameInput,
                {
                  backgroundColor: theme.bgInput,
                  color: theme.text,
                  borderColor:
                    usernameStatus === "available"
                      ? colors.success[600]
                      : usernameStatus === "taken" || usernameStatus === "invalid"
                        ? colors.accent[600]
                        : theme.border,
                },
              ]}
              value={username}
              onChangeText={handleUsernameChange}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username-new"
              textContentType="username"
              placeholder="username"
              placeholderTextColor={theme.textMuted}
              maxLength={30}
            />
            {usernameStatus === "checking" && (
              <ActivityIndicator
                size="small"
                color={theme.textMuted}
                style={styles.spinner}
              />
            )}
          </View>
          {hint && (
            <Text style={[styles.statusText, { color: hint.color }]}>
              {hint.text}
            </Text>
          )}
        </Animated.View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Button
            title={t("onboarding.continue")}
            onPress={handleContinue}
            disabled={!isValid}
            size="lg"
          />
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
  subtitle: {
    marginBottom: spacing.xl,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
    marginBottom: 2,
  },
  hint: {
    fontSize: typography.sizes.xs,
    marginBottom: spacing.xs,
    lineHeight: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    minHeight: 48,
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  atSign: {
    fontSize: typography.sizes.lg,
    fontWeight: "600",
    marginRight: spacing.xs,
  },
  usernameInput: {
    flex: 1,
  },
  spinner: {
    position: "absolute",
    right: spacing.md,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
    fontWeight: "500",
  },
  footer: {
    paddingTop: spacing.xl,
  },
});
