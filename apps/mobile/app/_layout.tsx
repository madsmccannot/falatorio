import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { StyleSheet, useColorScheme } from "react-native";
import { useTRPCClient } from "@/lib/trpc";
import { ToastProvider } from "@/components/ui/Toast";
import * as SecureStore from "expo-secure-store";
import { applyThemePref } from "@/lib/theme";
import { initSentry, identifyUser } from "@/lib/sentry";
import { initPostHog, identifyPostHogUser } from "@/lib/posthog";
import { getString, KEYS } from "@/lib/storage";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { checkRetentionMilestones } from "@/lib/retention-tracker";

SplashScreen.preventAutoHideAsync();
applyThemePref();
initSentry();
initPostHog();

const CLERK_KEY = process.env["EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY"] ?? "";

const tokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },
  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
};

function useStackBg() {
  const scheme = useColorScheme();
  return scheme === "dark" ? "#0C1524" : "#F8FAFC";
}

function TRPCWrapper({ children }: { children: React.ReactNode }) {
  const { trpc, trpcClient, queryClient, QueryClientProvider } = useTRPCClient();

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

function AuthInner() {
  const { useAuth, useUser } = require("@clerk/expo");
  const { isLoaded } = useAuth();
  const { user } = useUser();
  const bg = useStackBg();

  useEffect(() => {
    if (isLoaded) SplashScreen.hideAsync();
  }, [isLoaded]);

  useEffect(() => {
    if (user?.id) {
      identifyUser(user.id, getString(KEYS.SELECTED_L1) ?? undefined);
      identifyPostHogUser(user.id);
      checkRetentionMilestones();
    }
  }, [user?.id]);

  if (!isLoaded) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: bg },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="sso-callback" options={{ animation: "none" }} />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="tabs" />
      <Stack.Screen
        name="lesson"
        options={{ gestureEnabled: false, animation: "slide_from_bottom" }}
      />
      <Stack.Screen name="conversation" />
      <Stack.Screen
        name="shop"
        options={{ animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="settings"
        options={{ animation: "slide_from_right" }}
      />
    </Stack>
  );
}

function PreviewNavigator() {
  const bg = useStackBg();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: bg },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="sso-callback" options={{ animation: "none" }} />
      <Stack.Screen name="tabs" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen
        name="lesson"
        options={{ gestureEnabled: false, animation: "slide_from_bottom" }}
      />
      <Stack.Screen name="conversation" />
      <Stack.Screen
        name="shop"
        options={{ animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="settings"
        options={{ animation: "slide_from_right" }}
      />
    </Stack>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: scheme === "dark" ? "#0C1524" : "#F8FAFC" }]}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <TRPCWrapper>
            <ToastProvider>
              {children}
              <StatusBar style="auto" />
            </ToastProvider>
          </TRPCWrapper>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  if (CLERK_KEY) {
    const { ClerkProvider } = require("@clerk/expo");
    return (
      <ClerkProvider publishableKey={CLERK_KEY} tokenCache={tokenCache}>
        <AppShell>
          <AuthInner />
        </AppShell>
      </ClerkProvider>
    );
  }

  return (
    <AppShell>
      <PreviewNavigator />
    </AppShell>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
