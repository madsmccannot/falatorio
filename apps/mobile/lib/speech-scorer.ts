export interface WordDiff {
  word: string;
  status: "match" | "missing" | "extra";
}

export interface SpeechScore {
  score: number;
  result: "correct" | "partial" | "incorrect";
  targetDiff: WordDiff[];
  transcriptDiff: WordDiff[];
}

const PT_CONTRACTIONS: Record<string, string> = {
  do: "de o", da: "de a", dos: "de os", das: "de as",
  no: "em o", na: "em a", nos: "em os", nas: "em as",
  ao: "a o", aos: "a os",
  pelo: "por o", pela: "por a", pelos: "por os", pelas: "por as",
  num: "em um", numa: "em uma",
  dum: "de um", duma: "de uma",
  neste: "em este", nesta: "em esta", nestes: "em estes", nestas: "em estas",
  nesse: "em esse", nessa: "em essa", nesses: "em esses", nessas: "em essas",
  naquele: "em aquele", naquela: "em aquela",
  deste: "de este", desta: "de esta",
  desse: "de esse", dessa: "de essa",
  nisto: "em isto", nisso: "em isso", naquilo: "em aquilo",
  disto: "de isto", disso: "de isso", daquilo: "de aquilo",
};

function stripDiacritics(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function normalize(text: string): string[] {
  let s = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "");
  s = stripDiacritics(s).replace(/\s+/g, " ").trim();
  const words = s.split(" ").filter((w) => w.length > 0);
  const expanded: string[] = [];
  for (const w of words) {
    const exp = PT_CONTRACTIONS[w];
    if (exp) expanded.push(...exp.split(" "));
    else expanded.push(w);
  }
  return expanded;
}

function lcsLength(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]! + 1;
      } else {
        dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
      }
    }
  }
  return dp;
}

function buildDiffs(
  target: string[],
  transcript: string[],
  dp: number[][],
): { targetDiff: WordDiff[]; transcriptDiff: WordDiff[] } {
  const targetDiff: WordDiff[] = [];
  const transcriptDiff: WordDiff[] = [];
  let i = target.length;
  let j = transcript.length;

  const tBuf: WordDiff[] = [];
  const sBuf: WordDiff[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && target[i - 1] === transcript[j - 1]) {
      tBuf.push({ word: target[i - 1]!, status: "match" });
      sBuf.push({ word: transcript[j - 1]!, status: "match" });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i]![j - 1]! >= dp[i - 1]![j]!)) {
      sBuf.push({ word: transcript[j - 1]!, status: "extra" });
      j--;
    } else {
      tBuf.push({ word: target[i - 1]!, status: "missing" });
      i--;
    }
  }

  tBuf.reverse().forEach((d) => targetDiff.push(d));
  sBuf.reverse().forEach((d) => transcriptDiff.push(d));
  return { targetDiff, transcriptDiff };
}

export function scoreSpeech(
  target: string,
  transcript: string,
  confidence: number,
): SpeechScore {
  const tWords = normalize(target);
  const sWords = normalize(transcript);

  if (tWords.length === 0) {
    return {
      score: 0,
      result: "incorrect",
      targetDiff: [],
      transcriptDiff: [],
    };
  }

  const dp = lcsLength(tWords, sWords);
  const matched = dp[tWords.length]![sWords.length]!;
  const maxLen = Math.max(tWords.length, sWords.length);
  const rawSimilarity = matched / maxLen;

  const clampedConfidence = Math.max(confidence, 0.5);
  const score = Math.min(rawSimilarity * clampedConfidence, 1);

  let result: SpeechScore["result"];
  if (score >= 0.8) result = "correct";
  else if (score >= 0.5) result = "partial";
  else result = "incorrect";

  const { targetDiff, transcriptDiff } = buildDiffs(tWords, sWords, dp);

  return { score, result, targetDiff, transcriptDiff };
}
