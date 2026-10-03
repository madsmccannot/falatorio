import { Redirect } from "expo-router";
import { hasCompletedOnboarding } from "@/lib/storage";

const CLERK_KEY = process.env["EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY"] ?? "";

function AuthIndex() {
  const { useAuth } = require("@clerk/expo");
  const { isSignedIn } = useAuth();

  if (isSignedIn === true) {
    if (!hasCompletedOnboarding()) {
      return <Redirect href="/onboarding/select-language" />;
    }
    return <Redirect href="/tabs/learn" />;
  }

  if (__DEV__) {
    if (!hasCompletedOnboarding()) {
      return <Redirect href="/onboarding/select-language" />;
    }
    return <Redirect href="/tabs/learn" />;
  }

  return <Redirect href="/onboarding/welcome" />;
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
