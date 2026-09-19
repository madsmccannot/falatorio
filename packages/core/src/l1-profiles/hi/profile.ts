import type { L1Profile } from "../types.js";

export const hiProfile: L1Profile = {
  code: "hi",
  name: "Hindi",
  nativeName: "हिन्दी",
  writingDirection: "ltr",
  hasLatinScript: false,
  transfer: {
    cognates: [],
    falseFriends: [],
    phoneticDifficulties: [
      { sound: "ão", ipa: "/ɐ̃w̃/", description: "Nasal diphthong", tip: "Hindi has nasal vowels (chandrabindu) — use that instinct but add a glide." },
      { sound: "r/rr", ipa: "/ʁ/", description: "Uvular R", tip: "Not like Hindi र (ra) — this is a back-of-throat sound." },
      { sound: "gender articles", ipa: "o/a", description: "Articles indicate gender", tip: "Hindi has gender but no articles — in PT-EU, 'o' is masculine, 'a' is feminine." },
      { sound: "v/b", ipa: "/v/ /b/", description: "Distinct v and b", tip: "Hindi often merges v/b — in PT-EU they are always distinct." },
    ],
    grammarGaps: [
      { concept: "Articles", explanation: "Definite and indefinite articles", l1Comparison: "Hindi has no articles — you must learn when to use o/a/um/uma." },
      { concept: "Grammatical gender", explanation: "Different from Hindi gender", l1Comparison: "Hindi has gender but assigns it differently — 'mesa' (table) is feminine in PT but wouldn't be in Hindi." },
      { concept: "Verb conjugation", explanation: "6 forms per tense", l1Comparison: "Hindi conjugates differently — PT-EU has unique forms for each person." },
      { concept: "Subjunctive", explanation: "Mood for doubt and desire", l1Comparison: "No direct Hindi equivalent — think of it as a conditional feeling." },
      { concept: "Word order", explanation: "SVO (Subject-Verb-Object)", l1Comparison: "Hindi is SOV — PT-EU puts the verb before the object." },
    ],
    skipBasics: false,
    startingCEFR: "A1",
  },
};
