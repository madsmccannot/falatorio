import type { L1Code } from "../constants.js";
import type { L1Profile, CulturalRef } from "./types.js";

import { enProfile } from "./en/profile.js";
import { enCulturalRefs } from "./en/cultural.js";
import { esProfile } from "./es/profile.js";
import { esCulturalRefs } from "./es/cultural.js";
import { frProfile } from "./fr/profile.js";
import { frCulturalRefs } from "./fr/cultural.js";
import { hiProfile } from "./hi/profile.js";
import { hiCulturalRefs } from "./hi/cultural.js";
import { urProfile } from "./ur/profile.js";
import { urCulturalRefs } from "./ur/cultural.js";
import { arProfile } from "./ar/profile.js";
import { arCulturalRefs } from "./ar/cultural.js";
import { bnProfile } from "./bn/profile.js";
import { bnCulturalRefs } from "./bn/cultural.js";
import { deProfile } from "./de/profile.js";
import { deCulturalRefs } from "./de/cultural.js";
import { zhProfile } from "./zh/profile.js";
import { zhCulturalRefs } from "./zh/cultural.js";
import { ruProfile } from "./ru/profile.js";
import { ruCulturalRefs } from "./ru/cultural.js";
import { ukProfile } from "./uk/profile.js";
import { ukCulturalRefs } from "./uk/cultural.js";
import { trProfile } from "./tr/profile.js";
import { trCulturalRefs } from "./tr/cultural.js";
import { plProfile } from "./pl/profile.js";
import { plCulturalRefs } from "./pl/cultural.js";
import { koProfile } from "./ko/profile.js";
import { koCulturalRefs } from "./ko/cultural.js";
import { jaProfile } from "./ja/profile.js";
import { jaCulturalRefs } from "./ja/cultural.js";

const PROFILES: Record<L1Code, L1Profile> = {
  en: enProfile,
  es: esProfile,
  fr: frProfile,
  hi: hiProfile,
  ur: urProfile,
  ar: arProfile,
  bn: bnProfile,
  de: deProfile,
  zh: zhProfile,
  ru: ruProfile,
  uk: ukProfile,
  tr: trProfile,
  pl: plProfile,
  ko: koProfile,
  ja: jaProfile,
};

const CULTURAL_REFS: Record<L1Code, readonly CulturalRef[]> = {
  en: enCulturalRefs,
  es: esCulturalRefs,
  fr: frCulturalRefs,
  hi: hiCulturalRefs,
  ur: urCulturalRefs,
  ar: arCulturalRefs,
  bn: bnCulturalRefs,
  de: deCulturalRefs,
  zh: zhCulturalRefs,
  ru: ruCulturalRefs,
  uk: ukCulturalRefs,
  tr: trCulturalRefs,
  pl: plCulturalRefs,
  ko: koCulturalRefs,
  ja: jaCulturalRefs,
};

export function getProfile(l1: L1Code): L1Profile {
  return PROFILES[l1];
}

export function getCulturalRefs(l1: L1Code): readonly CulturalRef[] {
  return CULTURAL_REFS[l1];
}

export function getAllProfiles(): readonly L1Profile[] {
  return Object.values(PROFILES);
}

export { type L1Profile, type CulturalRef, type TransferProfile } from "./types.js";
