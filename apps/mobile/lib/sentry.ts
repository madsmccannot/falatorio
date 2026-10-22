import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";

const DSN = Constants.expoConfig?.extra?.sentryDsn as string | undefined;

export function initSentry() {
  if (!DSN) return;
  Sentry.init({
    dsn: DSN,
    tracesSampleRate: 0.2,
    environment: __DEV__ ? "development" : "production",
    enabled: !__DEV__,
  });
}

export function identifyUser(userId: string, l1?: string) {
  if (!DSN) return;
  Sentry.setUser({ id: userId, l1 });
}

export function clearUser() {
  if (!DSN) return;
  Sentry.setUser(null);
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (!DSN) return;
  Sentry.captureException(error, { extra: context });
}

export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>,
) {
  if (!DSN) return;
  Sentry.addBreadcrumb({ category, message, data, level: "info" });
}
