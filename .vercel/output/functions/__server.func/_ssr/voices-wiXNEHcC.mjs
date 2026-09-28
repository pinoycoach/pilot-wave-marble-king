import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { i as newId } from "./utils-DbGfHIWY.mjs";
import { r as getSql } from "./db-DIU7Puin.mjs";
import { f as parseDials } from "./dials-C0yhxMAh.mjs";
import { t as authMiddleware } from "./middleware-CFIMLYZc.mjs";
import { s as mapVoice, t as mapDomainLock } from "./map-B95ipz73.mjs";
import { t as ensureSeeded } from "./seed-DoaEYzDg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/voices-wiXNEHcC.js
var listVoices_createServerFn_handler = createServerRpc({
	id: "84915468fd4c5f600e67c1b25b7ed0b19d463d0fef1b9c93f047144287e2dab9",
	name: "listVoices",
	filename: "src/lib/api/voices.ts"
}, (opts) => listVoices.__executeServer(opts));
var listVoices = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listVoices_createServerFn_handler, async ({ context }) => {
	await ensureSeeded(context.userId);
	return (await (await getSql())`
      select id, name, kind, parent_id, source_text, anchors, dials, locks, banned, created_at, updated_at
      from voices
      where user_id = ${context.userId}
      order by case when kind = 'core' then 0 else 1 end, name asc
    `).map(mapVoice);
});
var listDomainLocks_createServerFn_handler = createServerRpc({
	id: "d807120f000e37e3e09ef2fdf167d32eed8d94ddbe9d319e03ecf3d6d0c4d7c5",
	name: "listDomainLocks",
	filename: "src/lib/api/voices.ts"
}, (opts) => listDomainLocks.__executeServer(opts));
var listDomainLocks = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listDomainLocks_createServerFn_handler, async ({ context }) => {
	await ensureSeeded(context.userId);
	return (await (await getSql())`
      select id, domain, dial, max, min, reason
      from domain_locks
      where user_id = ${context.userId}
      order by domain, dial
    `).map(mapDomainLock);
});
var updateVoice_createServerFn_handler = createServerRpc({
	id: "41d64e43b6e3362dd635aa823be08e71d3db0ed80914aa06d8a3684cabad024f",
	name: "updateVoice",
	filename: "src/lib/api/voices.ts"
}, (opts) => updateVoice.__executeServer(opts));
var updateVoice = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(updateVoice_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const current = (await sql`
      select id, name, kind, parent_id, source_text, anchors, dials, locks, banned, created_at, updated_at
      from voices where id = ${data.id} and user_id = ${context.userId} limit 1
    `)[0];
	if (!current) throw new Error("Voice not found");
	const next = mapVoice(current);
	if (typeof data.name === "string") next.name = data.name.trim() || next.name;
	if (typeof data.sourceText === "string") next.sourceText = data.sourceText;
	if (data.anchors) next.anchors = data.anchors.map((a) => a.trim()).filter(Boolean);
	if (data.dials) next.dials = parseDials(data.dials);
	if (data.locks) next.locks = data.locks;
	if (data.banned) next.banned = data.banned.map((b) => b.trim()).filter(Boolean);
	const now = (/* @__PURE__ */ new Date()).toISOString();
	await sql`
      update voices set
        name = ${next.name},
        source_text = ${next.sourceText},
        anchors = ${JSON.stringify(next.anchors)}::jsonb,
        dials = ${JSON.stringify(next.dials)}::jsonb,
        locks = ${JSON.stringify(next.locks)}::jsonb,
        banned = ${JSON.stringify(next.banned)}::jsonb,
        updated_at = ${now}::timestamptz
      where id = ${data.id} and user_id = ${context.userId}
    `;
	return {
		...next,
		updatedAt: now
	};
});
var duplicateVoice_createServerFn_handler = createServerRpc({
	id: "7ffd18e81ac6aba9ab4551bc51c93481bb4eb66d8144aa987cce9a928c379940",
	name: "duplicateVoice",
	filename: "src/lib/api/voices.ts"
}, (opts) => duplicateVoice.__executeServer(opts));
var duplicateVoice = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(duplicateVoice_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const src = (await sql`
      select id, name, kind, parent_id, source_text, anchors, dials, locks, banned, created_at, updated_at
      from voices where id = ${data.id} and user_id = ${context.userId} limit 1
    `)[0];
	if (!src) throw new Error("Voice not found");
	const voice = mapVoice(src);
	const id = newId();
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const name = data.name?.trim() || `${voice.name} brand`;
	const parentId = voice.kind === "core" ? voice.id : voice.parentId ?? voice.id;
	await sql`
      insert into voices (
        id, user_id, name, kind, parent_id, source_text, anchors, dials, locks, banned, created_at, updated_at
      ) values (
        ${id},
        ${context.userId},
        ${name},
        ${"brand"},
        ${parentId},
        ${voice.sourceText},
        ${JSON.stringify(voice.anchors)}::jsonb,
        ${JSON.stringify(voice.dials)}::jsonb,
        ${JSON.stringify(voice.locks)}::jsonb,
        ${JSON.stringify(voice.banned)}::jsonb,
        ${now}::timestamptz,
        ${now}::timestamptz
      )
    `;
	return {
		...voice,
		id,
		name,
		kind: "brand",
		parentId,
		createdAt: now,
		updatedAt: now
	};
});
var lockAsVoice_createServerFn_handler = createServerRpc({
	id: "cd2e91107bd62bd631a193b114e869f07df5f0817175f0278220685a7e1dc8d2",
	name: "lockAsVoice",
	filename: "src/lib/api/voices.ts"
}, (opts) => lockAsVoice.__executeServer(opts));
var lockAsVoice = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(lockAsVoice_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const parent = (await sql`
      select id, name, kind, parent_id, source_text, anchors, dials, locks, banned, created_at, updated_at
      from voices where id = ${data.parentId} and user_id = ${context.userId} limit 1
    `)[0];
	if (!parent) throw new Error("Base voice not found");
	const base = mapVoice(parent);
	const coreId = base.kind === "core" ? base.id : base.parentId ?? base.id;
	const id = newId();
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const name = data.name.trim() || "Untitled brand";
	await sql`
      insert into voices (
        id, user_id, name, kind, parent_id, source_text, anchors, dials, locks, banned, created_at, updated_at
      ) values (
        ${id},
        ${context.userId},
        ${name},
        ${"brand"},
        ${coreId},
        ${base.sourceText},
        ${JSON.stringify(base.anchors)}::jsonb,
        ${JSON.stringify(parseDials(data.dials))}::jsonb,
        ${JSON.stringify([])}::jsonb,
        ${JSON.stringify(data.banned ?? base.banned)}::jsonb,
        ${now}::timestamptz,
        ${now}::timestamptz
      )
    `;
	return {
		id,
		name,
		kind: "brand",
		parentId: coreId,
		sourceText: base.sourceText,
		anchors: base.anchors,
		dials: parseDials(data.dials),
		locks: [],
		banned: data.banned ?? base.banned,
		createdAt: now,
		updatedAt: now
	};
});
var saveDomainLock_createServerFn_handler = createServerRpc({
	id: "737c379bc03adcf1e548837bf047170d72a6fa3bbce537f8c5a1163be3699fb4",
	name: "saveDomainLock",
	filename: "src/lib/api/voices.ts"
}, (opts) => saveDomainLock.__executeServer(opts));
var saveDomainLock = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(saveDomainLock_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const id = data.id ?? newId();
	const domain = data.domain.trim().toLowerCase();
	if (!domain) throw new Error("Domain is required");
	if (data.id) await sql`
        update domain_locks set
          domain = ${domain},
          dial = ${data.dial},
          max = ${data.max ?? null},
          min = ${data.min ?? null},
          reason = ${data.reason}
        where id = ${id} and user_id = ${context.userId}
      `;
	else await sql`
        insert into domain_locks (id, user_id, domain, dial, max, min, reason)
        values (${id}, ${context.userId}, ${domain}, ${data.dial}, ${data.max ?? null}, ${data.min ?? null}, ${data.reason})
      `;
	return {
		id,
		domain,
		dial: data.dial,
		max: data.max ?? null,
		min: data.min ?? null,
		reason: data.reason
	};
});
var deleteDomainLock_createServerFn_handler = createServerRpc({
	id: "dcfa9a728bf75e69483fe41c63e8b10b660894977a73adff2cdeb2c8f495ab9b",
	name: "deleteDomainLock",
	filename: "src/lib/api/voices.ts"
}, (opts) => deleteDomainLock.__executeServer(opts));
var deleteDomainLock = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(deleteDomainLock_createServerFn_handler, async ({ context, data: id }) => {
	await (await getSql())`delete from domain_locks where id = ${id} and user_id = ${context.userId}`;
	return { ok: true };
});
//#endregion
export { deleteDomainLock_createServerFn_handler, duplicateVoice_createServerFn_handler, listDomainLocks_createServerFn_handler, listVoices_createServerFn_handler, lockAsVoice_createServerFn_handler, saveDomainLock_createServerFn_handler, updateVoice_createServerFn_handler };
