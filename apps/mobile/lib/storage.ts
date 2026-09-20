let storage: {
  getString(key: string): string | undefined;
  getBoolean(key: string): boolean | undefined;
  getNumber(key: string): number | undefined;
  set(key: string, value: string | boolean | number): void;
  delete(key: string): void;
  clearAll(): void;
};

try {
  const { MMKV } = require("react-native-mmkv");
  storage = new MMKV({ id: "falatorio" });
} catch {
  const map = new Map<string, string | boolean | number>();
  storage = {
    getString(key: string) {
      const v = map.get(key);
      return typeof v === "string" ? v : undefined;
    },
    getBoolean(key: string) {
      const v = map.get(key);
      return typeof v === "boolean" ? v : undefined;
    },
    getNumber(key: string) {
      const v = map.get(key);
      return typeof v === "number" ? v : undefined;
    },
    set(key: string, value: string | boolean | number) {
      map.set(key, value);
    },
    delete(key: string) {
      map.delete(key);
    },
    clearAll() {
      map.clear();
    },
  };
}

export { storage };

export function getString(key: string): string | undefined {
  return storage.getString(key);
}

export function setString(key: string, value: string): void {
  storage.set(key, value);
}

export function getBoolean(key: string): boolean {
  return storage.getBoolean(key) ?? false;
}

export function setBoolean(key: string, value: boolean): void {
  storage.set(key, value);
}

export function getNumber(key: string): number | undefined {
  return storage.getNumber(key);
}

export function setNumber(key: string, value: number): void {
  storage.set(key, value);
}

export function remove(key: string): void {
  storage.delete(key);
}

export function clearAll(): void {
  storage.clearAll();
}

const KEYS = {
  ONBOARDING_COMPLETE: "onboarding_complete",
  SELECTED_L1: "selected_l1",
  GDPR_CONSENT: "gdpr_consent",
  DARK_MODE: "dark_mode",
  API_URL: "api_url",
} as const;

export { KEYS };

export function getApiUrl(): string {
  const custom = getString(KEYS.API_URL);
  if (custom) return custom;
  return __DEV__ ? "http://localhost:3001" : "https://api.falatorio.com";
}

export function hasCompletedOnboarding(): boolean {
  return getBoolean(KEYS.ONBOARDING_COMPLETE);
}

export function setOnboardingComplete(): void {
  setBoolean(KEYS.ONBOARDING_COMPLETE, true);
}

declare const __DEV__: boolean;
