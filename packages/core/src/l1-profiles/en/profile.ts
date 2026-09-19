import type { L1Profile } from "../types.js";

export const enProfile: L1Profile = {
  code: "en",
  name: "English",
  nativeName: "English",
  writingDirection: "ltr",
  hasLatinScript: true,
  transfer: {
    cognates: [
      "hospital", "animal", "hotel", "universal", "natural",
      "cultural", "musical", "central", "social", "total",
    ],
    falseFriends: [
      { word: "actually", l1Meaning: "in fact", ptMeaning: "actualmente means 'currently'" },
      { word: "pretend", l1Meaning: "to fake", ptMeaning: "pretender means 'to intend'" },
      { word: "push", l1Meaning: "to push", ptMeaning: "puxe means 'pull'" },
      { word: "fabric", l1Meaning: "cloth material", ptMeaning: "fábrica means 'factory'" },
      { word: "sensible", l1Meaning: "practical", ptMeaning: "sensível means 'sensitive'" },
      { word: "exquisite", l1Meaning: "beautiful", ptMeaning: "esquisito means 'weird'" },
    ],
    phoneticDifficulties: [
      { sound: "ão", ipa: "/ɐ̃w̃/", description: "Nasal diphthong", tip: "Say 'ow' but through your nose — no English equivalent." },
      { sound: "lh", ipa: "/ʎ/", description: "Palatal lateral", tip: "Like the 'lli' in 'million' but more forward." },
      { sound: "nh", ipa: "/ɲ/", description: "Palatal nasal", tip: "Like the 'ny' in 'canyon'." },
      { sound: "r/rr", ipa: "/ʁ/", description: "Uvular R", tip: "Initial R is like a French R — back of the throat." },
      { sound: "ã/õ", ipa: "/ɐ̃/ /õ/", description: "Nasal vowels", tip: "Let air through your nose while saying the vowel." },
    ],
    grammarGaps: [
      { concept: "Grammatical gender", explanation: "Every noun is masculine or feminine", l1Comparison: "English doesn't have this — memorize the article with each noun." },
      { concept: "Verb conjugation", explanation: "6 forms per tense", l1Comparison: "English barely conjugates — PT-EU conjugates for every person." },
      { concept: "Subjunctive mood", explanation: "Used for doubt, desire, emotion", l1Comparison: "English rarely uses it — PT-EU uses it constantly." },
      { concept: "Ser vs Estar", explanation: "Two verbs for 'to be'", l1Comparison: "English has one 'be' — PT-EU distinguishes permanent vs temporary." },
      { concept: "Object pronouns", explanation: "Placement before/after verb", l1Comparison: "English always puts them after — PT-EU has complex placement rules." },
    ],
    skipBasics: false,
    startingCEFR: "A1",
  },
};
