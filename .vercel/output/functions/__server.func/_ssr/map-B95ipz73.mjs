import { t as asJson } from "./utils-DbGfHIWY.mjs";
import { f as parseDials } from "./dials-C0yhxMAh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/map-B95ipz73.js
function iso(value) {
	if (value instanceof Date) return value.toISOString();
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? String(value) : d.toISOString();
}
function mapVoice(row) {
	return {
		id: row.id,
		name: row.name,
		kind: row.kind === "brand" ? "brand" : "core",
		parentId: row.parent_id,
		sourceText: row.source_text ?? "",
		anchors: asJson(row.anchors, []),
		dials: parseDials(row.dials),
		locks: asJson(row.locks, []),
		banned: asJson(row.banned, []),
		createdAt: iso(row.created_at),
		updatedAt: iso(row.updated_at)
	};
}
function mapDomainLock(row) {
	return {
		id: row.id,
		domain: row.domain,
		dial: row.dial,
		max: row.max,
		min: row.min,
		reason: row.reason ?? ""
	};
}
function mapTrend(row) {
	const result = asJson(row.result, {});
	return {
		id: row.id,
		query: row.query,
		quiet: Boolean(result.quiet),
		headline: result.headline ?? "",
		crowdRead: result.crowdRead ?? "",
		angles: result.angles ?? [],
		leadingVoices: result.leadingVoices ?? [],
		watch: result.watch ?? "",
		citations: result.citations ?? [],
		model: row.model,
		scannedAt: iso(row.scanned_at)
	};
}
function mapDonor(row) {
	const result = asJson(row.result, {});
	return {
		id: row.id,
		handle: row.handle,
		domain: row.domain,
		quiet: Boolean(result.quiet),
		sampleCount: result.sampleCount ?? 0,
		dials: parseDials(result.dials),
		dialNotes: result.dialNotes ?? "",
		moves: result.moves ?? [],
		signaturePhrases: result.signaturePhrases ?? [],
		topicsNow: result.topicsNow ?? [],
		citations: result.citations ?? [],
		model: row.model,
		scannedAt: iso(row.scanned_at)
	};
}
function mapRun(row) {
	return {
		id: row.id,
		voiceId: row.voice_id,
		voiceName: row.voice_name ?? "Voice",
		donorScanId: row.donor_scan_id,
		donorHandle: row.donor_handle ?? null,
		trendScanId: row.trend_scan_id,
		recipe: asJson(row.recipe, {
			blend: 0,
			dials: parseDials({}),
			preset: "none",
			format: "x_post",
			topic: "",
			domain: "",
			keep: "",
			moveWeights: []
		}),
		draft: row.draft ?? "",
		meters: asJson(row.meters, null),
		verdict: row.verdict ?? null,
		createdAt: iso(row.created_at)
	};
}
function mapResult(row) {
	const recipe = row.recipe ? asJson(row.recipe, null) : null;
	const posted = typeof row.posted_at === "string" ? row.posted_at.slice(0, 10) : iso(row.posted_at).slice(0, 10);
	return {
		id: row.id,
		runId: row.run_id,
		platform: row.platform,
		postedAt: posted,
		views: Number(row.views) || 0,
		shares: Number(row.shares) || 0,
		saves: Number(row.saves) || 0,
		replies: Number(row.replies) || 0,
		longReplies: Number(row.long_replies) || 0,
		recipe,
		voiceName: row.voice_name ?? "Voice",
		domain: recipe?.domain ?? ""
	};
}
function mapSlop(raw) {
	return asJson(raw, []).filter((p) => p && typeof p.pattern === "string");
}
//#endregion
export { mapSlop as a, mapRun as i, mapDonor as n, mapTrend as o, mapResult as r, mapVoice as s, mapDomainLock as t };
