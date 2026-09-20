import { Redirect } from "expo-router";
import { hasCompletedOnboarding } from "@/lib/storage";

export default function Index() {
  if (!hasCompletedOnboarding()) {
    return <Redirect href="/onboarding/select-language" />;
  }
  return <Redirect href="/tabs/learn" />;
}
