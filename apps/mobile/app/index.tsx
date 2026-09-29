import { Redirect } from "expo-router";
import { hasCompletedOnboarding } from "@/lib/storage";

const CLERK_KEY = process.env["EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY"] ?? "";

function AuthIndex() {
  const { useAuth } = require("@clerk/expo");
  const { isSignedIn } = useAuth();

  if (isSignedIn !== true) {
    return <Redirect href="/onboarding/welcome" />;
  }

  if (!hasCompletedOnboarding()) {
    return <Redirect href="/onboarding/select-language" />;
  }

  return <Redirect href="/tabs/learn" />;
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
