export type PTRegion = "lisboa" | "porto" | "algarve" | "acores" | "madeira";

export interface RegionalAudioConfig {
  region: PTRegion;
  label: Record<string, string>;
  description: Record<string, string>;
}

export const PT_REGIONS: readonly RegionalAudioConfig[] = [
  {
    region: "lisboa",
    label: { en: "Lisbon", pt: "Lisboa" },
    description: {
      en: "Standard European Portuguese accent",
      pt: "Sotaque padrão do português europeu",
    },
  },
  {
    region: "porto",
    label: { en: "Porto", pt: "Porto" },
    description: {
      en: "Northern Portuguese accent",
      pt: "Sotaque do norte de Portugal",
    },
  },
  {
    region: "algarve",
    label: { en: "Algarve", pt: "Algarve" },
    description: {
      en: "Southern Portuguese accent",
      pt: "Sotaque do sul de Portugal",
    },
  },
  {
    region: "acores",
    label: { en: "Azores", pt: "Açores" },
    description: {
      en: "Azorean Portuguese accent",
      pt: "Sotaque açoriano",
    },
  },
  {
    region: "madeira",
    label: { en: "Madeira", pt: "Madeira" },
    description: {
      en: "Madeiran Portuguese accent",
      pt: "Sotaque madeirense",
    },
  },
] as const;

const ALL_REGIONS: readonly PTRegion[] = PT_REGIONS.map((r) => r.region);

export function selectRegionalAudio(
  audioUrls: Record<PTRegion, string | null>,
  preferred?: PTRegion,
): string | null {
  if (preferred && audioUrls[preferred]) {
    return audioUrls[preferred];
  }

  if (audioUrls.lisboa) {
    return audioUrls.lisboa;
  }

  for (const region of ALL_REGIONS) {
    if (audioUrls[region]) {
      return audioUrls[region];
    }
  }

  return null;
}

export function getRandomRegion(): PTRegion {
  return ALL_REGIONS[Math.floor(Math.random() * ALL_REGIONS.length)]!;
}
