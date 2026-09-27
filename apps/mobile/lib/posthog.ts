import PostHog from "posthog-react-native";
import { getString, KEYS } from "./storage";

const API_KEY = process.env["EXPO_PUBLIC_POSTHOG_API_KEY"] ?? "";
const HOST = process.env["EXPO_PUBLIC_POSTHOG_HOST"] ?? "https://eu.i.posthog.com";

let client: PostHog | null = null;

export function initPostHog(): void {
  if (!API_KEY || __DEV__) return;

  client = new PostHog(API_KEY, {
    host: HOST,
    enableSessionReplay: false,
  });
}

export function identifyPostHogUser(userId: string): void {
  if (!client) return;
  const l1 = getString(KEYS.SELECTED_L1) ?? "unknown";
  client.identify(userId, { l1 });
}

export function resetPostHogUser(): void {
  client?.reset();
}

export function captureEvent(event: string, properties?: Record<string, string | number | boolean | null>): void {
  client?.capture(event, properties);
}

export function isFeatureEnabled(flag: string): boolean {
  if (!client) return false;
  return client.isFeatureEnabled(flag) ?? false;
}

export function getFeatureFlag(flag: string): string | boolean | undefined {
  if (!client) return undefined;
  return client.getFeatureFlag(flag) ?? undefined;
}

export function reloadFeatureFlags(): void {
  client?.reloadFeatureFlags();
}

export function getPostHogClient(): PostHog | null {
  return client;
}

declare const __DEV__: boolean;
