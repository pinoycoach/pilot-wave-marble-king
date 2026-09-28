import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { a as normalizeHandle, i as newId } from "./utils-DbGfHIWY.mjs";
import { r as getSql } from "./db-DIU7Puin.mjs";
import { n as DIAL_KEYS, r as DIAL_META } from "./dials-C0yhxMAh.mjs";
import { t as authMiddleware } from "./middleware-CFIMLYZc.mjs";
import { i as RESEARCH_INSTRUCTIONS, o as grokJson, s as isoDaysAgo, t as DonorScanSchema } from "./xai-ClZ2zT72.mjs";
import { n as mapDonor } from "./map-B95ipz73.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/donors-CG_z6Ln_.js
var CACHE_MS = 864e5;
var listDonorScans_createServerFn_handler = createServerRpc({
	id: "9ea5f4c4f50f90fbbf0847682e10f2c6a6aa0248925501bea473a23246de58d7",
	name: "listDonorScans",
	filename: "src/lib/api/donors.ts"
}, (opts) => listDonorScans.__executeServer(opts));
var listDonorScans = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listDonorScans_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await sql`
      update donor_scans
      set samples = '[]'::jsonb
      where user_id = ${context.userId} and samples_purge_at < now()
        and samples != '[]'::jsonb
    `;
	return (await sql`
      select id, handle, domain, result, model, scanned_at
      from donor_scans
      where user_id = ${context.userId}
      order by scanned_at desc
      limit 60
    `).map(mapDonor);
});
var runDonorScan_createServerFn_handler = createServerRpc({
	id: "8b4a073858070580b1471d56266f6f3b372868a0d631e81d5afb87c55c230761",
	name: "runDonorScan",
	filename: "src/lib/api/donors.ts"
}, (opts) => runDonorScan.__executeServer(opts));
var runDonorScan = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(runDonorScan_createServerFn_handler, async ({ context, data }) => {
	const handle = normalizeHandle(data.handle).toLowerCase();
	const domain = data.domain.trim().toLowerCase();
	if (handle.length < 2) return {
		ok: false,
		error: "Enter a public X handle."
	};
	if (domain.length < 2) return {
		ok: false,
		error: "Label a domain (e.g. bazi, manifestation)."
	};
	const sql = await getSql();
	if (!data.force) {
		const cached = (await sql`
          select id, handle, domain, result, model, scanned_at
          from donor_scans
          where user_id = ${context.userId} and handle = ${handle} and domain = ${domain}
          order by scanned_at desc
          limit 1
        `)[0];
		if (cached && Date.now() - new Date(cached.scanned_at).getTime() < CACHE_MS) return {
			ok: true,
			scan: mapDonor(cached),
			cached: true
		};
	}
	const from = isoDaysAgo(30);
	const dialGuide = DIAL_KEYS.map((k) => `- ${k}: 0 = ${DIAL_META[k].zero}; 100 = ${DIAL_META[k].hundred}`).join("\n");
	const result = await grokJson({
		instructions: RESEARCH_INSTRUCTIONS,
		input: `Measure HOW @${handle} writes in the domain "${domain}", not what they say.

Window: their own posts from the last 30 days (since ${from}). Search from:${handle} only.

Describe technique, not content. Abstract patterns only. Never reproduce more than 8 consecutive words of any post in any field except signaturePhrases.

Score these dials 0–100:
${dialGuide}

Return JSON only:
{
  "quiet": boolean,
  "handle": "${handle}",
  "sampleCount": number,
  "dials": { ${DIAL_KEYS.map((k) => `"${k}": number`).join(", ")} },
  "dialNotes": "one line per notable dial",
  "moves": [{ "name": "short craft move", "description": "how it works", "pattern": "abstract template e.g. [common belief]. Wrong. [reframe].", "frequency": "signature"|"frequent"|"occasional" }],
  "signaturePhrases": ["exact phrases they repeat — for a never-use list"],
  "topicsNow": ["up to 6 topics they are on"],
  "citations": [{"source":"handle or url","url":"optional","note":"what the post is doing technically"}],
  "samples": ["up to 30 raw post texts, truncated, for overlap checking only"]
}

If they are quiet, set quiet true, still return at least one move describing the absence, and score dials from whatever exists.`,
		schema: DonorScanSchema,
		tools: [{
			type: "x_search",
			from_date: from,
			allowed_x_handles: [handle]
		}],
		maxOutputTokens: 6e3
	});
	if (!result.ok) return result;
	const samples = (result.data.samples ?? []).slice(0, 30);
	const { samples: _drop, ...publicResult } = result.data;
	const id = newId();
	const scannedAt = (/* @__PURE__ */ new Date()).toISOString();
	const purgeAt = new Date(Date.now() + 6048e5).toISOString();
	await sql`
        insert into donor_scans (
          id, user_id, handle, domain, result, samples, samples_purge_at, model, scanned_at
        ) values (
          ${id},
          ${context.userId},
          ${handle},
          ${domain},
          ${JSON.stringify(publicResult)}::jsonb,
          ${JSON.stringify(samples)}::jsonb,
          ${purgeAt}::timestamptz,
          ${result.model},
          ${scannedAt}::timestamptz
        )
      `;
	return {
		ok: true,
		cached: false,
		scan: {
			id,
			handle,
			domain,
			quiet: publicResult.quiet,
			sampleCount: publicResult.sampleCount,
			dials: publicResult.dials,
			dialNotes: publicResult.dialNotes,
			moves: publicResult.moves,
			signaturePhrases: publicResult.signaturePhrases,
			topicsNow: publicResult.topicsNow,
			citations: publicResult.citations,
			model: result.model,
			scannedAt
		}
	};
});
//#endregion
export { listDonorScans_createServerFn_handler, runDonorScan_createServerFn_handler };
