import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { i as newId } from "./utils-DbGfHIWY.mjs";
import { r as getSql } from "./db-DIU7Puin.mjs";
import { t as authMiddleware } from "./middleware-CFIMLYZc.mjs";
import { r as mapResult } from "./map-B95ipz73.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/results-DkAy2Bbi.js
var listResults_createServerFn_handler = createServerRpc({
	id: "5241fd3bda0995c4dada051c1cc685ba453643401556f4a58f0573c55f267e3d",
	name: "listResults",
	filename: "src/lib/api/results.ts"
}, (opts) => listResults.__executeServer(opts));
var listResults = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listResults_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`
      select res.id, res.run_id, res.platform, res.posted_at, res.views, res.shares,
             res.saves, res.replies, res.long_replies, r.recipe, v.name as voice_name
      from results res
      left join runs r on r.id = res.run_id and r.user_id = res.user_id
      left join voices v on v.id = r.voice_id and v.user_id = res.user_id
      where res.user_id = ${context.userId}
      order by res.posted_at desc
      limit 200
    `).map(mapResult);
});
var addResult_createServerFn_handler = createServerRpc({
	id: "245e107d6b057ecade9a0909b75bc7a243fcebbc2b461b998b4850602ae81315",
	name: "addResult",
	filename: "src/lib/api/results.ts"
}, (opts) => addResult.__executeServer(opts));
var addResult = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(addResult_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (!(await sql`
      select id from runs where id = ${data.runId} and user_id = ${context.userId} limit 1
    `).length) throw new Error("Run not found");
	const id = newId();
	await sql`
      insert into results (id, user_id, run_id, platform, posted_at, views, shares, saves, replies, long_replies)
      values (
        ${id},
        ${context.userId},
        ${data.runId},
        ${data.platform.trim()},
        ${data.postedAt},
        ${Math.max(0, Math.round(data.views))},
        ${Math.max(0, Math.round(data.shares))},
        ${Math.max(0, Math.round(data.saves))},
        ${Math.max(0, Math.round(data.replies))},
        ${Math.max(0, Math.round(data.longReplies))}
      )
    `;
	const rows = await sql`
      select res.id, res.run_id, res.platform, res.posted_at, res.views, res.shares,
             res.saves, res.replies, res.long_replies, r.recipe, v.name as voice_name
      from results res
      left join runs r on r.id = res.run_id and r.user_id = res.user_id
      left join voices v on v.id = r.voice_id and v.user_id = res.user_id
      where res.id = ${id} and res.user_id = ${context.userId}
      limit 1
    `;
	if (!rows[0]) throw new Error("Could not save result");
	return mapResult(rows[0]);
});
//#endregion
export { addResult_createServerFn_handler, listResults_createServerFn_handler };
