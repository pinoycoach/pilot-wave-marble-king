import type { OverlapHit } from "./types";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9'’\s]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^[’']+|[’']+$/g, ""))
    .filter((w) => w.length > 0);
}

function ngrams(words: string[], n: number): string[] {
  if (words.length < n) return [];
  const out: string[] = [];
  for (let i = 0; i <= words.length - n; i += 1) {
    out.push(words.slice(i, i + n).join(" "));
  }
  return out;
}

export function findOverlap(draft: string, samples: string[], phrases: string[]): OverlapHit[] {
  const hits: OverlapHit[] = [];
  const seen = new Set<string>();
  const draftWords = tokenize(draft);
  const draftGrams = new Set(ngrams(draftWords, 6));
  const draftText = draft.toLowerCase();

  for (const sample of samples) {
    for (const gram of ngrams(tokenize(sample), 6)) {
      if (draftGrams.has(gram) && !seen.has(gram)) {
        seen.add(gram);
        hits.push({ gram, source: "sample" });
      }
    }
  }

  for (const phrase of phrases) {
    const p = phrase.trim();
    if (p.length < 4) continue;
    const key = p.toLowerCase();
    if (draftText.includes(key) && !seen.has(`phrase:${key}`)) {
      seen.add(`phrase:${key}`);
      hits.push({ gram: p, source: "phrase" });
    }
  }

  return hits.slice(0, 24);
}
