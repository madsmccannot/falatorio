export interface PhoneticRule {
  id: string;
  pattern: RegExp;
  replacement: string;
  description: string;
}

export const PTEU_PHONETIC_RULES: readonly PhoneticRule[] = [
  {
    id: "nasal_ao",
    pattern: /ão/g,
    replacement: "ão",
    description: "Nasal diphthong -ão",
  },
  {
    id: "nasal_am",
    pattern: /am$/g,
    replacement: "am",
    description: "Final -am (distinct from -ão)",
  },
  {
    id: "lh_palatal",
    pattern: /lh/g,
    replacement: "ʎ",
    description: "Palatal lateral lh",
  },
  {
    id: "nh_palatal",
    pattern: /nh/g,
    replacement: "ɲ",
    description: "Palatal nasal nh",
  },
  {
    id: "s_final_sh",
    pattern: /s$/g,
    replacement: "ʃ",
    description: "Final -s as /ʃ/ (PT-EU specific)",
  },
  {
    id: "s_before_consonant",
    pattern: /s(?=[bcdfghjklmnpqrtvwxyz])/gi,
    replacement: "ʃ",
    description: "S before consonant as /ʃ/",
  },
  {
    id: "vowel_reduction_e",
    pattern: /e(?=[^aeiouáéíóúâêîôûãõ])/gi,
    replacement: "ɨ",
    description: "Unstressed e reduced to /ɨ/",
  },
  {
    id: "vowel_reduction_o",
    pattern: /o$/g,
    replacement: "u",
    description: "Final unstressed -o as /u/",
  },
  {
    id: "r_uvular",
    pattern: /^r|rr/g,
    replacement: "ʁ",
    description: "Initial R and RR as uvular /ʁ/",
  },
];

export function normalizeForComparison(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function arePhoneticEquivalents(a: string, b: string): boolean {
  return normalizeForComparison(a) === normalizeForComparison(b);
}
