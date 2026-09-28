import type { SlopHit, SlopPattern } from "./types";

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length || 1;
}

function excerptAround(text: string, index: number, len: number): string {
  const start = Math.max(0, index - 24);
  const end = Math.min(text.length, index + len + 24);
  return text.slice(start, end).replace(/\s+/g, " ").trim();
}

export function scanSlop(draft: string, patterns: SlopPattern[]): { hits: SlopHit[]; perHundred: number } {
  const hits: SlopHit[] = [];
  const words = wordCount(draft);
  let total = 0;

  for (const rule of patterns) {
    let re: RegExp;
    try {
      re = new RegExp(rule.pattern, "gi");
    } catch {
      continue;
    }
    const excerpts: string[] = [];
    let match: RegExpExecArray | null;
    let count = 0;
    const clone = new RegExp(re.source, re.flags);
    while ((match = clone.exec(draft)) !== null) {
      count += 1;
      if (excerpts.length < 3) excerpts.push(excerptAround(draft, match.index, match[0].length));
      if (match[0].length === 0) clone.lastIndex += 1;
    }
    if (count > 0) {
      total += count;
      hits.push({ label: rule.label, count, excerpts });
    }
  }

  const rhetorical = draft
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const rq = rhetorical.filter((p) => /^\s*[A-Z][^?]{8,80}\?\s*$/.test(p.split(/(?<=[.!?])\s/)[0] ?? ""));
  if (rq.length) {
    total += rq.length;
    hits.push({
      label: "Rhetorical-question opener",
      count: rq.length,
      excerpts: rq.slice(0, 3),
    });
  }

  const sentences = draft.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  let tripleLists = 0;
  for (let i = 0; i < sentences.length - 2; i += 1) {
    const window = sentences.slice(i, i + 3);
    if (window.every((s) => /,\s*[^,]+,\s*(and|&)\s/.test(s))) {
      tripleLists += 1;
    }
  }
  if (tripleLists > 0) {
    total += tripleLists;
    hits.push({
      label: "Three-item lists in consecutive sentences",
      count: tripleLists,
      excerpts: [],
    });
  }

  const emDashes = (draft.match(/[—–]/g) ?? []).length;
  const dashPer60 = emDashes / Math.max(1, words / 60);
  if (dashPer60 > 1) {
    total += emDashes;
    hits.push({
      label: "Em-dash density",
      count: emDashes,
      excerpts: [`${emDashes} dashes in ${words} words`],
    });
  }

  const morals = (draft.match(/(?:^|\n)\s*(?:the (?:lesson|point|moral|takeaway) is|in the end,|at the end of the day)[^\n]{0,140}/gi) ?? []);
  if (morals.length) {
    total += morals.length;
    hits.push({
      label: "Summarizing moral close",
      count: morals.length,
      excerpts: morals.slice(0, 3).map((m) => m.trim()),
    });
  }

  const perHundred = (total / words) * 100;
  return { hits, perHundred };
}
