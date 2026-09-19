import type { L1Profile } from "../types.js";

export const arProfile: L1Profile = {
  code: "ar",
  name: "Arabic",
  nativeName: "العربية",
  writingDirection: "rtl",
  hasLatinScript: false,
  transfer: {
    cognates: [],
    falseFriends: [],
    phoneticDifficulties: [
      { sound: "vowels", ipa: "/a e i o u/", description: "Full vowel system", tip: "Arabic has 3 vowels — PT-EU has many more. Pay attention to e vs i and o vs u." },
      { sound: "p", ipa: "/p/", description: "The P sound", tip: "Arabic doesn't have /p/ — don't substitute /b/. 'Pão' (bread) is not 'bão'." },
      { sound: "reduced vowels", ipa: "/ɨ/", description: "Unstressed vowels", tip: "Unstressed vowels almost disappear in PT-EU — similar to how Arabic short vowels are often unwritten." },
      { sound: "ão", ipa: "/ɐ̃w̃/", description: "Nasal diphthong", tip: "No Arabic equivalent — practice nasalizing while adding a glide." },
    ],
    grammarGaps: [
      { concept: "Word order", explanation: "SVO in PT-EU", l1Comparison: "Arabic is VSO — in PT-EU the subject comes first." },
      { concept: "Articles", explanation: "Definite: o/a, indefinite: um/uma", l1Comparison: "Arabic has 'al-' — PT-EU has gendered articles that change." },
      { concept: "Writing direction", explanation: "Left to right", l1Comparison: "The opposite of Arabic — this affects your reading speed initially." },
      { concept: "Subjunctive", explanation: "Used for doubt, desire, emotion", l1Comparison: "Similar to Arabic mansoub mood — but triggered differently." },
      { concept: "Verb conjugation", explanation: "Present, past, future with 6 persons", l1Comparison: "Arabic conjugates heavily too — the concept is familiar but the forms are different." },
    ],
    skipBasics: false,
    startingCEFR: "A1",
  },
};
