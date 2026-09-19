import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { StyleSheet } from "react-native";
import { useTRPCClient } from "@/lib/trpc";
import { ToastProvider } from "@/components/ui/Toast";
import { colors } from "@fala-pt/ui/tokens";
import * as SecureStore from "expo-secure-store";

SplashScreen.preventAutoHideAsync();

const CLERK_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

const tokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },
  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
};

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

function AppNavigator() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  if (!isLoaded) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.neutral[50] },
        animation: "slide_from_right",
      }}
    >
      {!isSignedIn ? (
        <Stack.Screen name="onboarding" />
      ) : (
        <>
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
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ClerkProvider publishableKey={CLERK_KEY} tokenCache={tokenCache}>
          <TRPCWrapper>
            <ToastProvider>
              <AppNavigator />
              <StatusBar style="auto" />
            </ToastProvider>
          </TRPCWrapper>
        </ClerkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
