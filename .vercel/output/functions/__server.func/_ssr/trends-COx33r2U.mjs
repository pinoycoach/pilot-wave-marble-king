import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { i as newId } from "./utils-DbGfHIWY.mjs";
import { r as getSql } from "./db-DIU7Puin.mjs";
import { t as authMiddleware } from "./middleware-CFIMLYZc.mjs";
import { a as TrendScanSchema, i as RESEARCH_INSTRUCTIONS, o as grokJson, s as isoDaysAgo } from "./xai-ClZ2zT72.mjs";
import { o as mapTrend } from "./map-B95ipz73.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trends-COx33r2U.js
var CACHE_MS = 18e5;
function normalizeQuery(q) {
	return q.trim().toLowerCase().replace(/\s+/g, " ");
}
var listTrendScans_createServerFn_handler = createServerRpc({
	id: "d704364dd7d6d163b6332e15d1e89d2b46281cfffc6271b7f5126be372ff95a5",
	name: "listTrendScans",
	filename: "src/lib/api/trends.ts"
}, (opts) => listTrendScans.__executeServer(opts));
var listTrendScans = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listTrendScans_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`
      select id, query, result, model, scanned_at
      from trend_scans
      where user_id = ${context.userId}
      order by scanned_at desc
      limit 40
    `).map(mapTrend);
});
var runTrendScan_createServerFn_handler = createServerRpc({
	id: "6366da7806ec418ab65c3a8927d5f64d1d03be48ef802d0d7c6605e28dc24bac",
	name: "runTrendScan",
	filename: "src/lib/api/trends.ts"
}, (opts) => runTrendScan.__executeServer(opts));
var runTrendScan = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(runTrendScan_createServerFn_handler, async ({ context, data }) => {
	const query = data.query.trim();
	if (query.length < 2) return {
		ok: false,
		error: "Enter a topic, keyword, or domain."
	};
	const sql = await getSql();
	const key = normalizeQuery(query);
	const cached = (await sql`
        select id, query, result, model, scanned_at
        from trend_scans
        where user_id = ${context.userId} and lower(query) = ${key}
        order by scanned_at desc
        limit 1
      `)[0];
	if (cached && Date.now() - new Date(cached.scanned_at).getTime() < CACHE_MS) return {
		ok: true,
		scan: mapTrend(cached),
		cached: true
	};
	const from = isoDaysAgo(2);
	const result = await grokJson({
		instructions: RESEARCH_INSTRUCTIONS,
		input: `Scan X for what is trending around this query in the last 48 hours (since ${from}).

QUERY: ${query}

Return JSON only:
{
  "quiet": boolean,
  "headline": "one sharp sentence, max 180 chars",
  "crowdRead": "what the crowd is actually saying",
  "angles": ["1-5 angles almost nobody is taking"],
  "leadingVoices": [{"handle": "without @", "why": "why they lead this conversation"}],
  "watch": "what would move this next",
  "citations": [{"source": "handle or outlet", "url": "optional", "note": "what they said"}]
}

Rules:
- Cite real posts only. Never fabricate quotes, handles, or engagement.
- If X is thin on this, set quiet true and say so in crowdRead.
- Leading voices must be real public handles you actually found.`,
		schema: TrendScanSchema,
		tools: [{
			type: "x_search",
			from_date: from
		}, { type: "web_search" }],
		maxOutputTokens: 6e3
	});
	if (!result.ok) return result;
	const id = newId();
	const scannedAt = (/* @__PURE__ */ new Date()).toISOString();
	await sql`
        insert into trend_scans (id, user_id, query, result, model, scanned_at)
        values (
          ${id},
          ${context.userId},
          ${query},
          ${JSON.stringify(result.data)}::jsonb,
          ${result.model},
          ${scannedAt}::timestamptz
        )
      `;
	return {
		ok: true,
		cached: false,
		scan: {
			id,
			query,
			...result.data,
			model: result.model,
			scannedAt
		}
	};
});
//#endregion
export { listTrendScans_createServerFn_handler, runTrendScan_createServerFn_handler };
