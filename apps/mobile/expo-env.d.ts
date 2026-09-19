/// <reference types="expo/types" />

// Ambient module declarations for packages without types in this workspace
declare module "@react-navigation/native" {
  export function useFocusEffect(effect: () => void | (() => void)): void;
}

declare module "expo-file-system" {
  export const documentDirectory: string | null;
  export const cacheDirectory: string | null;
  export function readAsStringAsync(fileUri: string, options?: { encoding?: string }): Promise<string>;
  export function writeAsStringAsync(fileUri: string, contents: string, options?: { encoding?: string }): Promise<void>;
  export function deleteAsync(fileUri: string, options?: { idempotent?: boolean }): Promise<void>;
  export function getInfoAsync(fileUri: string): Promise<{ exists: boolean; size?: number; uri: string }>;
  export const EncodingType: { UTF8: string; Base64: string };
}
