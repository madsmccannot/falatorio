import type { L1Profile } from "../types.js";

export const esProfile: L1Profile = {
  code: "es",
  name: "Spanish",
  nativeName: "Español",
  writingDirection: "ltr",
  hasLatinScript: true,
  transfer: {
    cognates: [
      "familia", "importante", "diferente", "momento", "problema",
      "forma", "parte", "punto", "mejor", "ejemplo",
    ],
    falseFriends: [
      { word: "oficina", l1Meaning: "office", ptMeaning: "oficina means 'workshop/garage'" },
      { word: "polvo", l1Meaning: "dust/powder", ptMeaning: "polvo means 'octopus'" },
      { word: "exquisito", l1Meaning: "exquisite/delicious", ptMeaning: "esquisito means 'weird'" },
      { word: "largo", l1Meaning: "long", ptMeaning: "largo means 'wide' (long = comprido)" },
      { word: "borracha", l1Meaning: "drunk (f)", ptMeaning: "borracha means 'rubber/eraser'" },
      { word: "taza", l1Meaning: "cup", ptMeaning: "taça means 'trophy/wine glass'" },
      { word: "salsa", l1Meaning: "sauce", ptMeaning: "salsa means 'parsley'" },
    ],
    phoneticDifficulties: [
      { sound: "b/v", ipa: "/b/ /v/", description: "Distinct b and v", tip: "Unlike Spanish, PT-EU distinguishes b (bilabial) from v (labiodental). 'Vaca' has a clear V." },
      { sound: "ão", ipa: "/ɐ̃w̃/", description: "Nasal diphthong", tip: "Spanish doesn't have nasal vowels — this is the hardest PT-EU sound for Spanish speakers." },
      { sound: "lh", ipa: "/ʎ/", description: "Palatal lateral", tip: "Similar to the old Spanish 'll' (before yeísmo). Keep the lateral quality." },
      { sound: "reduced vowels", ipa: "/ɨ/", description: "Unstressed vowels", tip: "PT-EU swallows unstressed vowels — Spanish pronounces them all. Listen for the rhythm difference." },
    ],
    grammarGaps: [
      { concept: "Personal infinitive", explanation: "Infinitive conjugated for person", l1Comparison: "Doesn't exist in Spanish — unique to Portuguese." },
      { concept: "Continuous tenses", explanation: "'Estar a + infinitive'", l1Comparison: "Spanish uses gerund (estoy haciendo) — PT-EU uses 'estou a fazer'." },
      { concept: "Object pronoun placement", explanation: "Different enclisis/proclisis rules", l1Comparison: "Similar concept but different triggers — PT-EU is stricter." },
      { concept: "Haver vs Ter", explanation: "'Ter' for possession AND auxiliary", l1Comparison: "Spanish uses 'haber' as auxiliary — PT-EU uses 'ter'." },
    ],
    skipBasics: true,
    startingCEFR: "A2",
  },
};
