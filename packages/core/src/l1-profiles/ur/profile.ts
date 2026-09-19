import type { L1Profile } from "../types.js";

export const urProfile: L1Profile = {
  code: "ur",
  name: "Urdu",
  nativeName: "اردو",
  writingDirection: "rtl",
  hasLatinScript: false,
  transfer: {
    cognates: [],
    falseFriends: [],
    phoneticDifficulties: [
      { sound: "ão", ipa: "/ɐ̃w̃/", description: "Nasal diphthong", tip: "Urdu has nasal vowels (nun ghunna) — use that instinct but add a glide at the end." },
      { sound: "v/b", ipa: "/v/ /b/", description: "Distinct v and b", tip: "Urdu often merges these — in PT-EU they are always different sounds." },
      { sound: "p vs b", ipa: "/p/ /b/", description: "Both exist in Urdu", tip: "Good news — Urdu has both /p/ and /b/, so 'pão' should be natural." },
      { sound: "writing direction", ipa: "LTR", description: "Left to right", tip: "Opposite to Urdu — reading speed will improve with practice." },
    ],
    grammarGaps: [
      { concept: "Articles", explanation: "Definite and indefinite articles", l1Comparison: "Urdu has no articles — you must learn o/a/um/uma." },
      { concept: "Gender", explanation: "Different gender assignments", l1Comparison: "Urdu has gender but assigns it differently — memorize with the article." },
      { concept: "Word order", explanation: "SVO", l1Comparison: "Urdu is SOV — the verb moves to the middle in PT-EU." },
      { concept: "Subjunctive", explanation: "Mood for doubt and desire", l1Comparison: "Think of it like conditional — Urdu doesn't have a direct equivalent." },
    ],
    skipBasics: false,
    startingCEFR: "A1",
  },
};
