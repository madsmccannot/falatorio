import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="welcome" options={{ gestureEnabled: false }} />
      <Stack.Screen name="select-language" />
      <Stack.Screen name="choose-profile" />
      <Stack.Screen name="select-goal" />
      <Stack.Screen name="daily-goal" />
      <Stack.Screen name="select-level" />
      <Stack.Screen name="placement-test" options={{ gestureEnabled: false }} />
      <Stack.Screen name="plan" options={{ gestureEnabled: false }} />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="gdpr-consent" />
      <Stack.Screen name="l1-intro" />
    </Stack>
  );
}
