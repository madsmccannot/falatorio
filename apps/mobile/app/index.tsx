import { Redirect } from "expo-router";
import { hasCompletedOnboarding } from "@/lib/storage";

const CLERK_KEY = process.env["EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY"] ?? "";

export default function Index() {
  let isSignedIn = false;

  if (CLERK_KEY) {
    const { useAuth } = require("@clerk/clerk-expo");
    const auth = useAuth();
    isSignedIn = auth.isSignedIn === true;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding/welcome" />;
  }

  if (!hasCompletedOnboarding()) {
    return <Redirect href="/onboarding/select-language" />;
  }

  return <Redirect href="/tabs/learn" />;
}
