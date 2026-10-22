import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function parseI18nKeys(src: string): Map<string, Set<string>> {
  const blocks = [...src.matchAll(/^const (\w+)(?:\s*:\s*Record<string,\s*string>)?\s*=\s*\{/gm)];
  const result = new Map<string, Set<string>>();

  for (const block of blocks) {
    const name = block[1]!;
    if (name === "ALL") continue;
    const startIdx = block.index! + block[0].length;
    let depth = 1;
    let i = startIdx;
    while (i < src.length && depth > 0) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") depth--;
      i++;
    }
    const body = src.slice(startIdx, i - 1);
    const keys = [...body.matchAll(/^\s+"([^"]+)":/gm)].map((m) => m[1]!);
    result.set(name, new Set(keys));
  }

  return result;
}

describe("i18n dictionary parity", () => {
  const i18nPath = resolve(__dirname, "../../../apps/mobile/lib/i18n.ts");
  const src = readFileSync(i18nPath, "utf8");
  const dicts = parseI18nKeys(src);
  const enKeys = dicts.get("en")!;

  it("has 16 dictionaries", () => {
    expect(dicts.size).toBe(16);
  });

  it("en dictionary has all expected keys", () => {
    expect(enKeys.size).toBeGreaterThan(400);
  });

  for (const [lang, keys] of dicts) {
    if (lang === "en") continue;

    it(`${lang} has same key count as en`, () => {
      expect(keys.size).toBe(enKeys.size);
    });

    it(`${lang} has no missing keys`, () => {
      const missing = [...enKeys].filter((k) => !keys.has(k));
      expect(missing).toEqual([]);
    });

    it(`${lang} has no extra keys`, () => {
      const extra = [...keys].filter((k) => !enKeys.has(k));
      expect(extra).toEqual([]);
    });
  }
});
