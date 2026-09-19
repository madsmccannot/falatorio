import type { CEFRLevel, L1Code } from "../constants.js";

export interface L1Profile {
  code: L1Code;
  name: string;
  nativeName: string;
  writingDirection: "ltr" | "rtl";
  hasLatinScript: boolean;
  transfer: TransferProfile;
}

export interface TransferProfile {
  cognates: readonly string[];
  falseFriends: readonly FalseFriend[];
  phoneticDifficulties: readonly PhoneticDifficulty[];
  grammarGaps: readonly GrammarGap[];
  skipBasics: boolean;
  startingCEFR: CEFRLevel;
}

export interface FalseFriend {
  word: string;
  l1Meaning: string;
  ptMeaning: string;
}

export interface PhoneticDifficulty {
  sound: string;
  ipa: string;
  description: string;
  tip: string;
}

export interface GrammarGap {
  concept: string;
  explanation: string;
  l1Comparison: string;
}

export interface CulturalRef {
  id: string;
  type: "joke" | "expression" | "meme" | "reference";
  contentPt: string;
  contentL1: string;
  explanation: string;
  cefrMin: CEFRLevel;
  tags: readonly string[];
}
