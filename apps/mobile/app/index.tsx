import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { hasCompletedOnboarding, setOnboardingComplete, setString, KEYS, getApiUrl } from "@/lib/storage";

const CLERK_KEY = process.env["EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY"] ?? "";

function AuthIndex() {
  const { useAuth } = require("@clerk/expo");
  const { isSignedIn, getToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn === undefined) return;

    if (!isSignedIn) {
      router.replace("/onboarding/welcome");
      return;
    }

    if (hasCompletedOnboarding()) {
      router.replace("/tabs/learn");
      return;
    }

    (async () => {
      try {
        const token = await getToken();
        if (token) {
          const res = await fetch(`${getApiUrl()}/trpc/auth.checkAccount`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          const result = data?.result?.data?.json;
          if (result?.exists) {
            setOnboardingComplete();
            if (result.l1) setString(KEYS.SELECTED_L1, result.l1);
            router.replace("/tabs/learn");
            return;
          }
        }
      } catch {}
      router.replace("/onboarding/select-language");
    })();
  }, [isSignedIn]);

  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#059669" />
    </View>
  );
}

function PreviewIndex() {
  if (!hasCompletedOnboarding()) {
    return <Redirect href="/onboarding/select-language" />;
  }
  return <Redirect href="/tabs/learn" />;
}

export default function Index() {
  return CLERK_KEY ? <AuthIndex /> : <PreviewIndex />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
