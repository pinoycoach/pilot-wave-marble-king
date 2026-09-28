import { r as createServerFn } from "./ssr.mjs";
import { i as newId, t as asJson } from "./utils-DbGfHIWY.mjs";
import { r as getSql } from "./db-DIU7Puin.mjs";
import { a as FORMAT_LABEL, l as PRESET_META, n as DIAL_KEYS, r as DIAL_META } from "./dials-C0yhxMAh.mjs";
import { a as scanSlop, i as findOverlap, n as computeVerdict, r as enabledMoves } from "./verdict-gtZZI2am.mjs";
import { t as authMiddleware } from "./middleware-CFIMLYZc.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { n as DraftSchema, o as grokJson, r as MeterJudgeSchema } from "./xai-ClZ2zT72.mjs";
import { a as mapSlop, s as mapVoice } from "./map-B95ipz73.mjs";
import { t as ensureSeeded } from "./seed-DoaEYzDg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/runs-CQ_Uz0qo.js
function formatDraft(format, parsed) {
	if (format === "x_thread") {
		const posts = (parsed.posts ?? []).map((p) => p.trim()).filter(Boolean);
		if (posts.length) return posts.join("\n\n---\n\n");
	}
	return (parsed.text ?? parsed.posts?.join("\n\n") ?? "").trim();
}
function dialBlock(dials) {
	return DIAL_KEYS.map((k) => {
		const v = dials[k];
		return `- ${DIAL_META[k].label} = ${v}/100. 0 means ${DIAL_META[k].zero}. 100 means ${DIAL_META[k].hundred}.`;
	}).join("\n");
}
async function writeTestDraft(userId, data) {
	await ensureSeeded(userId);
	const sql = await getSql();
	const voiceRow = (await sql`
    select id, name, kind, parent_id, source_text, anchors, dials, locks, banned, created_at, updated_at
    from voices where id = ${data.voiceId} and user_id = ${userId} limit 1
  `)[0];
	if (!voiceRow) return {
		ok: false,
		error: "Voice not found"
	};
	const voice = mapVoice(voiceRow);
	let donorMoves = [];
	let signature = [];
	if (data.donorScanId) {
		const donors = await sql`
      select result from donor_scans where id = ${data.donorScanId} and user_id = ${userId} limit 1
    `;
		const donor = donors[0] ? asJson(donors[0].result, {}) : {};
		donorMoves = donor.moves ?? [];
		signature = donor.signaturePhrases ?? [];
	}
	let brief = data.recipe.topic;
	if (data.trendScanId) {
		const trends = await sql`
      select result, query from trend_scans where id = ${data.trendScanId} and user_id = ${userId} limit 1
    `;
		if (trends[0]) {
			const t = asJson(trends[0].result, {});
			const angle = data.recipe.angle || t.angles?.[0] || "";
			brief = [
				`Topic: ${trends[0].query}`,
				t.headline ? `Headline: ${t.headline}` : "",
				t.crowdRead ? `Crowd: ${t.crowdRead}` : "",
				angle ? `Chosen angle: ${angle}` : "",
				t.citations?.length ? `Citations: ${t.citations.map((c) => `${c.source} — ${c.note}`).join("; ")}` : ""
			].filter(Boolean).join("\n");
		}
	}
	const enabled = enabledMoves(donorMoves, data.recipe.moveWeights);
	const moveBlock = enabled.length ? enabled.map((m) => `- ${m.move.name} (weight ${m.weight}): pattern ${m.move.pattern}. ${m.move.description}. A 0.2 weight appears at most once.`).join("\n") : "(no borrowed moves)";
	const preset = PRESET_META[data.recipe.preset];
	const never = [.../* @__PURE__ */ new Set([...voice.banned, ...signature])].filter(Boolean);
	const result = await grokJson({
		instructions: "You write test drafts for voice calibration. Output JSON only. Never name, reference, or imitate a donor as a person. Never use a signature phrase. Never quote anyone. Use only facts in the brief. If something is uncertain, leave it out. The Core anchors are non-negotiable; dials only change register and technique.",
		input: `Write a ${FORMAT_LABEL[data.recipe.format]} test draft.

VOICE SOURCE (identity — never violate):
${voice.sourceText}

CORE ANCHORS (non-negotiable):
${voice.anchors.map((a) => `- ${a}`).join("\n")}

DIALS (register and technique only):
${dialBlock(data.recipe.dials)}

GENRE: ${preset.label}${preset.note ? ` — ${preset.note}` : ""}

BORROWED STRUCTURAL MOVES (moves, not words):
${moveBlock}

NEVER USE these phrases:
${never.map((p) => `- ${p}`).join("\n") || "(none)"}

BRIEF (facts only):
${brief || "(topic only: " + data.recipe.topic + ")"}

FORMAT RULES:
${data.recipe.format === "x_thread" ? "Return {\"posts\": [\"...\", \"...\"]} each post under 280 characters, 3–8 posts." : "Return {\"text\": \"the full draft as plain text\"}."}
Label nothing. Do not mention dials, donors, or this system.`,
		schema: DraftSchema,
		maxOutputTokens: 2500
	});
	if (!result.ok) return result;
	const draft = formatDraft(data.recipe.format, result.data);
	if (!draft) return {
		ok: false,
		error: "Grok returned an empty draft."
	};
	const id = newId();
	await sql`
    insert into runs (id, user_id, voice_id, donor_scan_id, trend_scan_id, recipe, draft, meters, verdict)
    values (
      ${id},
      ${userId},
      ${data.voiceId},
      ${data.donorScanId ?? null},
      ${data.trendScanId ?? null},
      ${JSON.stringify(data.recipe)}::jsonb,
      ${draft},
      ${null},
      ${null}
    )
  `;
	return {
		ok: true,
		draft,
		runId: id,
		model: result.model
	};
}
async function scoreDraft(userId, data) {
	const sql = await getSql();
	const voiceRow = (await sql`
    select id, name, kind, parent_id, source_text, anchors, dials, locks, banned, created_at, updated_at
    from voices where id = ${data.voiceId} and user_id = ${userId} limit 1
  `)[0];
	if (!voiceRow) return {
		ok: false,
		error: "Voice not found"
	};
	const voice = mapVoice(voiceRow);
	let samples = [];
	let signature = [];
	let donorMoves = [];
	if (data.donorScanId) {
		const donors = await sql`
      select result, samples from donor_scans
      where id = ${data.donorScanId} and user_id = ${userId} limit 1
    `;
		if (donors[0]) {
			const result = asJson(donors[0].result, {});
			signature = result.signaturePhrases ?? [];
			donorMoves = (result.moves ?? []).map((m) => m.name);
			samples = asJson(donors[0].samples, []);
		}
	}
	const overlapHits = findOverlap(data.draft, samples, signature);
	const settings = await sql`
    select slop_patterns from lab_settings where user_id = ${userId} limit 1
  `;
	const patterns = settings[0] ? mapSlop(settings[0].slop_patterns) : [];
	const slop = scanSlop(data.draft, patterns);
	const judge = await grokJson({
		instructions: "You are a voice-identity judge. Score drafts against a writer's Core. Be specific about lines. Output JSON only. Never invent quotes that are not in the draft.",
		input: `Judge this test draft.

CORE ANCHORS:
${voice.anchors.map((a) => `- ${a}`).join("\n")}

VOICE SOURCE (excerpt):
${voice.sourceText.slice(0, 4e3)}

DIALS IN FORCE:
${dialBlock(data.recipe.dials)}

${data.donorScanId ? `A donor's structural moves were optionally on: ${donorMoves.join(", ") || "none"}.` : "No donor was selected."}

DETERMINISTIC HITS (trust these):
Overlap 6-grams / signature phrases: ${overlapHits.length ? overlapHits.map((h) => h.gram).join(" | ") : "none"}
Slop hits per 100 words: ${slop.perHundred.toFixed(2)}
Slop labels: ${slop.hits.map((h) => `${h.label}×${h.count}`).join(", ") || "none"}

DRAFT:
${data.draft}

Return JSON:
{
  "identityDrift": 0-100 (0 = unmistakably this writer's Core),
  "donorInfluence": 0-100 (how visible the donor's TECHNIQUE is, not their words),
  "slopScore": 0-100 (AI-fingerprint level, informed by the deterministic hits),
  "anchorsBroken": ["list each broken Core anchor; repeat an anchor if it is broken more than once"],
  "notes": "specific lines to fix"
}`,
		schema: MeterJudgeSchema,
		maxOutputTokens: 1200
	});
	if (!judge.ok) return judge;
	const meters = {
		...judge.data,
		overlapHits,
		slopHits: slop.hits,
		slopPerHundred: slop.perHundred
	};
	const verdict = computeVerdict({
		meters,
		donorSelected: Boolean(data.donorScanId)
	});
	let runId = data.runId;
	if (runId) {
		if (!(await sql`
      select id from runs where id = ${runId} and user_id = ${userId} limit 1
    `).length) runId = void 0;
	}
	if (!runId) {
		runId = newId();
		await sql`
      insert into runs (id, user_id, voice_id, donor_scan_id, trend_scan_id, recipe, draft, meters, verdict)
      values (
        ${runId},
        ${userId},
        ${data.voiceId},
        ${data.donorScanId ?? null},
        ${null},
        ${JSON.stringify(data.recipe)}::jsonb,
        ${data.draft},
        ${JSON.stringify(meters)}::jsonb,
        ${verdict}
      )
    `;
	} else await sql`
      update runs set
        draft = ${data.draft},
        recipe = ${JSON.stringify(data.recipe)}::jsonb,
        meters = ${JSON.stringify(meters)}::jsonb,
        verdict = ${verdict}
      where id = ${runId} and user_id = ${userId}
    `;
	return {
		ok: true,
		meters,
		verdict,
		runId
	};
}
var generateDraft = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("8a6c7a63fdb7e2b9b41cbac0dc9bf9ef91974eab533a2a3f2c7f843ddca91626"));
var meterDraft = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("4941f787d6237c7442337d51f93708180960df6266667e91dc47713e9d5f325a"));
var listRuns = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("f6ef8f815556f63afca6fd879b4edd5933eebbcc69494bb03fba46ab39b27282"));
var saveRunDraft = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("896c0dcc3cc1a8fbc7f3016da1e0df110c6559a0a20d83504a2e33aa94b6aea6"));
//#endregion
export { scoreDraft as a, saveRunDraft as i, listRuns as n, writeTestDraft as o, meterDraft as r, generateDraft as t };
