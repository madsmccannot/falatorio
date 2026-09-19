import type { L1Profile } from "../types.js";

export const frProfile: L1Profile = {
  code: "fr",
  name: "French",
  nativeName: "Français",
  writingDirection: "ltr",
  hasLatinScript: true,
  transfer: {
    cognates: [
      "important", "différent", "moment", "problème", "forme",
      "culture", "nature", "structure", "situation", "possible",
    ],
    falseFriends: [
      { word: "souper", l1Meaning: "dinner/supper", ptMeaning: "sopa means 'soup'" },
      { word: "bras", l1Meaning: "arm", ptMeaning: "braço means 'arm' (similar but spelling differs)" },
      { word: "bureau", l1Meaning: "office/desk", ptMeaning: "burro means 'donkey'" },
    ],
    phoneticDifficulties: [
      { sound: "ão", ipa: "/ɐ̃w̃/", description: "Nasal diphthong", tip: "French has nasal vowels too, but -ão has a glide — it's not like -on." },
      { sound: "lh", ipa: "/ʎ/", description: "Palatal lateral", tip: "Like the old French 'ill' in 'fille' — tongue on the palate." },
      { sound: "reduced vowels", ipa: "/ɨ/", description: "Unstressed vowels", tip: "Similar to French schwa — unstressed vowels almost disappear." },
    ],
    grammarGaps: [
      { concept: "Subjunctive triggers", explanation: "Different triggers from French", l1Comparison: "French subjonctif exists — but PT-EU triggers are different." },
      { concept: "Personal infinitive", explanation: "Conjugated infinitive", l1Comparison: "French doesn't have this — unique to Portuguese." },
      { concept: "Ser vs Estar", explanation: "Two verbs for 'être'", l1Comparison: "French has one 'être' — PT-EU splits permanent vs temporary." },
    ],
    skipBasics: false,
    startingCEFR: "A1",
  },
};
