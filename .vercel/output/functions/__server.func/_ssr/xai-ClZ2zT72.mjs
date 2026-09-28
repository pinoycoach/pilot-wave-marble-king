import { Dt as boolean, Et as array, Ft as string, Mt as object, jt as number, wt as _enum } from "../_libs/@better-auth/core+[...].mjs";
import { n as DIAL_KEYS } from "./dials-C0yhxMAh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/xai-ClZ2zT72.js
var dialShape = Object.fromEntries(DIAL_KEYS.map((k) => [k, number().min(0).max(100)]));
var DialsSchema = object(dialShape);
var CitationSchema = object({
	source: string(),
	url: string().optional(),
	note: string()
});
var TrendScanSchema = object({
	quiet: boolean(),
	headline: string().min(4).max(180),
	crowdRead: string().min(8).max(1200),
	angles: array(string().min(8).max(300)).min(1).max(5),
	leadingVoices: array(object({
		handle: string(),
		why: string().max(300)
	})).max(5),
	watch: string().max(400),
	citations: array(CitationSchema).max(8)
});
var DonorScanSchema = object({
	quiet: boolean(),
	handle: string(),
	sampleCount: number().int().min(0),
	dials: DialsSchema,
	dialNotes: string().max(1200),
	moves: array(object({
		name: string().max(60),
		description: string().max(400),
		pattern: string().max(200),
		frequency: _enum([
			"signature",
			"frequent",
			"occasional"
		])
	})).min(1).max(10),
	signaturePhrases: array(string().max(80)).max(15),
	topicsNow: array(string()).max(6),
	citations: array(CitationSchema).max(8),
	samples: array(string().max(2e3)).max(30).optional()
});
var DraftSchema = object({
	text: string().max(8e3).optional(),
	posts: array(string().max(280)).max(12).optional()
});
var MeterJudgeSchema = object({
	identityDrift: number().min(0).max(100),
	donorInfluence: number().min(0).max(100),
	slopScore: number().min(0).max(100),
	anchorsBroken: array(string()).max(8),
	notes: string().max(800)
});
var MODELS = ["grok-4.6", "grok-4.5"];
function extractJson(text) {
	const trimmed = text.trim();
	const candidate = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1] ?? trimmed;
	const start = candidate.indexOf("{");
	const end = candidate.lastIndexOf("}");
	if (start < 0 || end <= start) throw new Error("Model did not return JSON");
	return JSON.parse(candidate.slice(start, end + 1));
}
function extractOutputText(body) {
	if (!body || typeof body !== "object") return "";
	const rec = body;
	if (typeof rec.output_text === "string" && rec.output_text.trim()) return rec.output_text;
	const parts = [];
	const output = Array.isArray(rec.output) ? rec.output : [];
	for (const item of output) {
		if (!item || typeof item !== "object") continue;
		const row = item;
		const content = Array.isArray(row.content) ? row.content : [];
		for (const block of content) {
			if (!block || typeof block !== "object") continue;
			const c = block;
			if (typeof c.text === "string") parts.push(c.text);
		}
		if (typeof row.text === "string") parts.push(row.text);
	}
	return parts.join("\n");
}
function isoDaysAgo(days) {
	const d = /* @__PURE__ */ new Date();
	d.setUTCDate(d.getUTCDate() - days);
	return d.toISOString().slice(0, 10);
}
async function callModel(opts) {
	const res = await fetch("https://api.x.ai/v1/responses", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${opts.apiKey}`
		},
		body: JSON.stringify({
			model: opts.model,
			instructions: opts.instructions,
			input: opts.input,
			tools: opts.tools,
			max_output_tokens: opts.maxOutputTokens,
			reasoning: { effort: opts.effort ?? "low" },
			store: false
		}),
		signal: AbortSignal.timeout(9e4)
	});
	if (!res.ok) {
		const detail = await res.text().catch(() => "");
		const err = /* @__PURE__ */ new Error(`xAI ${res.status}${detail ? `: ${detail.slice(0, 220)}` : ""}`);
		err.status = res.status;
		throw err;
	}
	return extractOutputText(await res.json());
}
async function grokJson(opts) {
	const apiKey = process.env.XAI_API_KEY?.trim();
	if (!apiKey) return {
		ok: false,
		error: "AI is not available in this environment"
	};
	let lastError = "Grok call failed";
	for (const model of MODELS) for (let attempt = 0; attempt < 2; attempt += 1) try {
		const text = await callModel({
			...opts,
			apiKey,
			model
		});
		return {
			ok: true,
			data: opts.schema.parse(extractJson(text)),
			model
		};
	} catch (err) {
		lastError = err instanceof Error ? err.message : "Grok call failed";
		const status = err.status;
		if (status === 400 || status === 404) break;
		if (attempt === 0) continue;
	}
	return {
		ok: false,
		error: lastError
	};
}
var RESEARCH_INSTRUCTIONS = "You analyze how people write on X. Be specific. Cite real posts. Never fabricate posts, quotes, or engagement. If X is quiet on this, say so and set `quiet: true`. Output JSON only.";
//#endregion
export { TrendScanSchema as a, RESEARCH_INSTRUCTIONS as i, DraftSchema as n, grokJson as o, MeterJudgeSchema as r, isoDaysAgo as s, DonorScanSchema as t };
