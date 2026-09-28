import { i as newId } from "./utils-DbGfHIWY.mjs";
import { r as getSql } from "./db-DIU7Puin.mjs";
import { c as NAPOLEON_CORE_DIALS, s as NAPOLEON_CORE_ANCHORS, t as DEFAULT_SLOP_PATTERNS } from "./dials-C0yhxMAh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/seed-DoaEYzDg.js
async function ensureSeeded(userId) {
	const sql = await getSql();
	if (!(await sql`
    select id from voices where user_id = ${userId} and kind = 'core' limit 1
  `).length) {
		const id = newId();
		const now = (/* @__PURE__ */ new Date()).toISOString();
		await sql`
      insert into voices (
        id, user_id, name, kind, parent_id, source_text, anchors, dials, locks, banned, created_at, updated_at
      ) values (
        ${id},
        ${userId},
        ${"Napoleon Core"},
        ${"core"},
        ${null},
        ${"(owner pastes his full voice skill here)"},
        ${JSON.stringify(NAPOLEON_CORE_ANCHORS)}::jsonb,
        ${JSON.stringify(NAPOLEON_CORE_DIALS)}::jsonb,
        ${JSON.stringify([])}::jsonb,
        ${JSON.stringify([])}::jsonb,
        ${now}::timestamptz,
        ${now}::timestamptz
      )
    `;
	}
	if (!(await sql`
    select id from domain_locks where user_id = ${userId} limit 1
  `).length) await sql`
      insert into domain_locks (id, user_id, domain, dial, max, min, reason)
      values (
        ${newId()},
        ${userId},
        ${"bazi"},
        ${"commercial_pull"},
        ${15},
        ${null},
        ${"Bazi writing stays a gift. No hard ask."}
      )
    `;
	if (!(await sql`
    select user_id from lab_settings where user_id = ${userId} limit 1
  `).length) await sql`
      insert into lab_settings (user_id, slop_patterns, updated_at)
      values (
        ${userId},
        ${JSON.stringify(DEFAULT_SLOP_PATTERNS)}::jsonb,
        ${(/* @__PURE__ */ new Date()).toISOString()}::timestamptz
      )
    `;
}
//#endregion
export { ensureSeeded as t };
