import { useCallback } from "react";
import { getString, KEYS } from "@/lib/storage";
import { lookupPtToL1, lookupL1ToPt, lookupGenderPair } from "@/lib/word-dictionary";

export type TranslationDirection = "pt-to-l1" | "l1-to-pt";

export function useWordTranslation() {
  const l1 = getString(KEYS.SELECTED_L1) ?? "en";

  const translatePtToL1 = useCallback(
    (word: string): string[] => lookupPtToL1(word, l1),
    [l1],
  );

  const translateL1ToPt = useCallback(
    (word: string): string[] => lookupL1ToPt(word, l1),
    [l1],
  );

  const translate = useCallback(
    (word: string, direction: TranslationDirection = "pt-to-l1"): string[] =>
      direction === "pt-to-l1" ? translatePtToL1(word) : translateL1ToPt(word),
    [translatePtToL1, translateL1ToPt],
  );

  const getGenderPair = useCallback(
    (word: string) => lookupGenderPair(word),
    [],
  );

  return { translate, translatePtToL1, translateL1ToPt, l1, getGenderPair };
}
