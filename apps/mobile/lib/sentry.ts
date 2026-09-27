import * as Sentry from "@sentry/react-native";
import * as Application from "expo-application";
import * as Device from "expo-device";
import { Platform } from "react-native";

const DSN = process.env["EXPO_PUBLIC_SENTRY_DSN"] ?? "";

export function initSentry() {
  if (!DSN) return;

  Sentry.init({
    dsn: DSN,
    release: Application.nativeApplicationVersion ?? "0.1.0",
    dist: Application.nativeBuildVersion ?? "1",
    environment: __DEV__ ? "development" : "production",
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    enableAutoSessionTracking: true,
    attachScreenshot: !__DEV__,
    enabled: !__DEV__,
  });

  Sentry.setContext("device_info", {
    brand: Device.brand,
    modelName: Device.modelName,
    osName: Device.osName,
    osVersion: Device.osVersion,
    platform: Platform.OS,
  });
}

export function identifyUser(userId: string, l1?: string) {
  Sentry.setUser({ id: userId });
  if (l1) {
    Sentry.setTag("l1", l1);
  }
}

export function clearUser() {
  Sentry.setUser(null);
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (context) {
    Sentry.withScope((scope) => {
      scope.setExtras(context);
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>,
) {
  Sentry.addBreadcrumb({ category, message, data, level: "info" });
}

export { Sentry };
