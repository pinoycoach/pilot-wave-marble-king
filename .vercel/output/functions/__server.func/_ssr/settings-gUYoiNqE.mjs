import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { r as getSql } from "./db-DIU7Puin.mjs";
import { t as DEFAULT_SLOP_PATTERNS } from "./dials-C0yhxMAh.mjs";
import { t as authMiddleware } from "./middleware-CFIMLYZc.mjs";
import { a as mapSlop } from "./map-B95ipz73.mjs";
import { t as ensureSeeded } from "./seed-DoaEYzDg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-gUYoiNqE.js
var getSlopPatterns_createServerFn_handler = createServerRpc({
	id: "62ad52aa16f969e00141b84337648fcb3553112e18ac90d8304c3a4cf394c300",
	name: "getSlopPatterns",
	filename: "src/lib/api/settings.ts"
}, (opts) => getSlopPatterns.__executeServer(opts));
var getSlopPatterns = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getSlopPatterns_createServerFn_handler, async ({ context }) => {
	await ensureSeeded(context.userId);
	const rows = await (await getSql())`
      select slop_patterns from lab_settings where user_id = ${context.userId} limit 1
    `;
	return rows[0] ? mapSlop(rows[0].slop_patterns) : DEFAULT_SLOP_PATTERNS;
});
var saveSlopPatterns_createServerFn_handler = createServerRpc({
	id: "afbffc0f86c7865843567ac0812e2e63f947cdc180e1b31087f88e2f37812735",
	name: "saveSlopPatterns",
	filename: "src/lib/api/settings.ts"
}, (opts) => saveSlopPatterns.__executeServer(opts));
var saveSlopPatterns = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(saveSlopPatterns_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const cleaned = data.map((p) => ({
		id: p.id || crypto.randomUUID(),
		label: p.label.trim(),
		pattern: p.pattern
	})).filter((p) => p.label && p.pattern);
	await sql`
      insert into lab_settings (user_id, slop_patterns, updated_at)
      values (${context.userId}, ${JSON.stringify(cleaned)}::jsonb, ${(/* @__PURE__ */ new Date()).toISOString()}::timestamptz)
      on conflict (user_id) do update set
        slop_patterns = excluded.slop_patterns,
        updated_at = excluded.updated_at
    `;
	return cleaned;
});
//#endregion
export { getSlopPatterns_createServerFn_handler, saveSlopPatterns_createServerFn_handler };
