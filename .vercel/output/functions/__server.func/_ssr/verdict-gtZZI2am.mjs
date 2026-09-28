import { a as FORMAT_LABEL, d as dialReading, l as PRESET_META, n as DIAL_KEYS, r as DIAL_META } from "./dials-C0yhxMAh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/verdict-gtZZI2am.js
function tokenize(text) {
	return text.toLowerCase().replace(/https?:\/\/\S+/g, " ").replace(/[^a-z0-9'’\s]/g, " ").split(/\s+/).map((w) => w.replace(/^[’']+|[’']+$/g, "")).filter((w) => w.length > 0);
}
function ngrams(words, n) {
	if (words.length < n) return [];
	const out = [];
	for (let i = 0; i <= words.length - n; i += 1) out.push(words.slice(i, i + n).join(" "));
	return out;
}
function findOverlap(draft, samples, phrases) {
	const hits = [];
	const seen = /* @__PURE__ */ new Set();
	const draftWords = tokenize(draft);
	const draftGrams = new Set(ngrams(draftWords, 6));
	const draftText = draft.toLowerCase();
	for (const sample of samples) for (const gram of ngrams(tokenize(sample), 6)) if (draftGrams.has(gram) && !seen.has(gram)) {
		seen.add(gram);
		hits.push({
			gram,
			source: "sample"
		});
	}
	for (const phrase of phrases) {
		const p = phrase.trim();
		if (p.length < 4) continue;
		const key = p.toLowerCase();
		if (draftText.includes(key) && !seen.has(`phrase:${key}`)) {
			seen.add(`phrase:${key}`);
			hits.push({
				gram: p,
				source: "phrase"
			});
		}
	}
	return hits.slice(0, 24);
}
function buildClaudePacket(opts) {
	const dialLines = DIAL_KEYS.map((key) => {
		const v = opts.dials[key];
		return `  ${DIAL_META[key].label}: ${v} — ${dialReading(key, v)}`;
	}).join("\n");
	const enabled = opts.moves.filter((m) => m.weight > 0);
	const moveLines = enabled.length ? enabled.map((m) => `  - ${m.move.name} (weight ${m.weight.toFixed(1)}): ${m.move.pattern}\n    ${m.move.description}`).join("\n") : "  (none)";
	const never = opts.neverUse.filter((s) => s.trim()).map((s) => `  - ${s}`).join("\n") || "  (none)";
	const preset = PRESET_META[opts.preset];
	const citations = opts.trend?.citations.length ? opts.trend.citations.map((c) => `  - ${c.source}${c.url ? ` ${c.url}` : ""} — ${c.note}`).join("\n") : "  (none)";
	const angle = opts.angle || opts.trend?.angles[0] || "(owner to choose)";
	return `VOICE: ${opts.voiceName} — use my voice skill as the source of truth.
KEEP: ${opts.keep.trim() || "(not specified)"}
DIAL SETTINGS (0–100, with meanings):
${dialLines}
BORROWED TECHNIQUES (moves, not words):
${moveLines}
NEVER USE:
${never}
FORMAT: ${FORMAT_LABEL[opts.format]}   GENRE: ${preset.label}${preset.note ? ` — ${preset.note}` : ""}
BRIEF (facts only — do not add facts):
  Topic: ${opts.topic || "(none)"}
  Headline: ${opts.trend?.headline ?? "(none)"}
  Crowd read: ${opts.trend?.crowdRead ?? "(none)"}
  Chosen angle: ${angle}
  Citations:
${citations}
TEST DRAFT (reference only, rewrite freely):
${opts.draft.trim() || "(none)"}
INSTRUCTION: Write in my voice. Keep ${opts.keep.trim() || "[KEEP]"}. Roughen.
`;
}
function enabledMoves(moves, weights) {
	if (!moves?.length) return [];
	const map = new Map(weights.map((w) => [w.name, w.weight]));
	return moves.map((move) => ({
		move,
		weight: map.get(move.name) ?? 0
	})).filter((m) => m.weight > 0);
}
function wordCount(text) {
	return text.trim().split(/\s+/).filter(Boolean).length || 1;
}
function excerptAround(text, index, len) {
	const start = Math.max(0, index - 24);
	const end = Math.min(text.length, index + len + 24);
	return text.slice(start, end).replace(/\s+/g, " ").trim();
}
function scanSlop(draft, patterns) {
	const hits = [];
	const words = wordCount(draft);
	let total = 0;
	for (const rule of patterns) {
		let re;
		try {
			re = new RegExp(rule.pattern, "gi");
		} catch {
			continue;
		}
		const excerpts = [];
		let match;
		let count = 0;
		const clone = new RegExp(re.source, re.flags);
		while ((match = clone.exec(draft)) !== null) {
			count += 1;
			if (excerpts.length < 3) excerpts.push(excerptAround(draft, match.index, match[0].length));
			if (match[0].length === 0) clone.lastIndex += 1;
		}
		if (count > 0) {
			total += count;
			hits.push({
				label: rule.label,
				count,
				excerpts
			});
		}
	}
	const rq = draft.split(/\n+/).map((p) => p.trim()).filter(Boolean).filter((p) => /^\s*[A-Z][^?]{8,80}\?\s*$/.test(p.split(/(?<=[.!?])\s/)[0] ?? ""));
	if (rq.length) {
		total += rq.length;
		hits.push({
			label: "Rhetorical-question opener",
			count: rq.length,
			excerpts: rq.slice(0, 3)
		});
	}
	const sentences = draft.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
	let tripleLists = 0;
	for (let i = 0; i < sentences.length - 2; i += 1) if (sentences.slice(i, i + 3).every((s) => /,\s*[^,]+,\s*(and|&)\s/.test(s))) tripleLists += 1;
	if (tripleLists > 0) {
		total += tripleLists;
		hits.push({
			label: "Three-item lists in consecutive sentences",
			count: tripleLists,
			excerpts: []
		});
	}
	const emDashes = (draft.match(/[—–]/g) ?? []).length;
	if (emDashes / Math.max(1, words / 60) > 1) {
		total += emDashes;
		hits.push({
			label: "Em-dash density",
			count: emDashes,
			excerpts: [`${emDashes} dashes in ${words} words`]
		});
	}
	const morals = draft.match(/(?:^|\n)\s*(?:the (?:lesson|point|moral|takeaway) is|in the end,|at the end of the day)[^\n]{0,140}/gi) ?? [];
	if (morals.length) {
		total += morals.length;
		hits.push({
			label: "Summarizing moral close",
			count: morals.length,
			excerpts: morals.slice(0, 3).map((m) => m.trim())
		});
	}
	return {
		hits,
		perHundred: total / words * 100
	};
}
function computeVerdict(opts) {
	const { meters, donorSelected } = opts;
	const counts = /* @__PURE__ */ new Map();
	for (const a of meters.anchorsBroken) {
		const key = a.trim().toLowerCase();
		counts.set(key, (counts.get(key) ?? 0) + 1);
	}
	const twiceBroken = [...counts.values()].some((n) => n >= 2);
	if (meters.identityDrift > 40 || twiceBroken) return "stop";
	if (meters.overlapHits.length > 0) return "adjust";
	if (meters.slopScore > 35) return "adjust";
	if (meters.donorInfluence > 60) return "adjust";
	if (donorSelected && meters.donorInfluence < 15) return "adjust";
	return "ready for Claude";
}
//#endregion
export { scanSlop as a, findOverlap as i, computeVerdict as n, enabledMoves as r, buildClaudePacket as t };
