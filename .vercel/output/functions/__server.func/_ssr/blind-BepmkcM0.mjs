import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { i as newId } from "./utils-DbGfHIWY.mjs";
import { r as getSql } from "./db-DIU7Puin.mjs";
import { n as mixDials } from "./mix-D-btE7E5.mjs";
import { t as authMiddleware } from "./middleware-CFIMLYZc.mjs";
import { n as mapDonor, s as mapVoice, t as mapDomainLock } from "./map-B95ipz73.mjs";
import { a as scoreDraft, o as writeTestDraft } from "./runs-CQ_Uz0qo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/blind-BepmkcM0.js
function shuffle(items) {
	const next = [...items];
	for (let i = next.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[next[i], next[j]] = [next[j], next[i]];
	}
	return next;
}
var runBlindTest_createServerFn_handler = createServerRpc({
	id: "c67645ce4734af08b334062520231c7032c1973282ac7a11e99127fbb9ffa065",
	name: "runBlindTest",
	filename: "src/lib/api/blind.ts"
}, (opts) => runBlindTest.__executeServer(opts));
var runBlindTest = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(runBlindTest_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const voiceRow = (await sql`
        select id, name, kind, parent_id, source_text, anchors, dials, locks, banned, created_at, updated_at
        from voices where id = ${data.voiceId} and user_id = ${context.userId} limit 1
      `)[0];
	if (!voiceRow) return {
		ok: false,
		error: "Voice not found"
	};
	const voice = mapVoice(voiceRow);
	const donorRow = (await sql`
        select id, handle, domain, result, model, scanned_at
        from donor_scans where id = ${data.donorScanId} and user_id = ${context.userId} limit 1
      `)[0];
	if (!donorRow) return {
		ok: false,
		error: "Donor scan not found"
	};
	const donor = mapDonor(donorRow);
	const domainLocks = (await sql`
        select id, domain, dial, max, min, reason from domain_locks where user_id = ${context.userId}
      `).map(mapDomainLock);
	const domain = data.domain.trim() || donor.domain;
	const blends = [
		0,
		30,
		60
	];
	const raw = [];
	for (const blend of blends) {
		const recipe = {
			blend,
			dials: mixDials({
				base: voice.dials,
				donor: donor.dials,
				blend,
				preset: data.preset,
				voiceLocks: voice.locks,
				domainLocks,
				domain
			}).dials,
			preset: data.preset,
			format: data.format,
			topic: data.topic,
			domain,
			keep: "",
			moveWeights: blend === 0 ? data.moveWeights.map((m) => ({
				...m,
				weight: 0
			})) : data.moveWeights
		};
		const draftRes = await writeTestDraft(context.userId, {
			voiceId: voice.id,
			donorScanId: donor.id,
			recipe
		});
		if (!draftRes.ok) return draftRes;
		const meterRes = await scoreDraft(context.userId, {
			runId: draftRes.runId,
			draft: draftRes.draft,
			voiceId: voice.id,
			donorScanId: donor.id,
			recipe
		});
		if (!meterRes.ok) return meterRes;
		raw.push({
			key: newId(),
			blend,
			draft: draftRes.draft,
			meters: meterRes.meters,
			verdict: meterRes.verdict,
			runId: meterRes.runId
		});
	}
	const cards = shuffle(raw);
	const testId = newId();
	await sql`
        insert into blind_tests (id, user_id, run_ids, ranking, rewrite_flags)
        values (
          ${testId},
          ${context.userId},
          ${JSON.stringify(cards.map((c) => c.runId))}::jsonb,
          ${null},
          ${null}
        )
      `;
	return {
		ok: true,
		cards,
		testId
	};
});
var saveBlindRanking_createServerFn_handler = createServerRpc({
	id: "591ca26e12b97417149437857c8c277bb47fb2a1ed868f80d354f4d30edf530a",
	name: "saveBlindRanking",
	filename: "src/lib/api/blind.ts"
}, (opts) => saveBlindRanking.__executeServer(opts));
var saveBlindRanking = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(saveBlindRanking_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`
      update blind_tests
      set ranking = ${JSON.stringify(data.ranking)}::jsonb,
          rewrite_flags = ${JSON.stringify(data.rewriteFlags)}::jsonb
      where id = ${data.testId} and user_id = ${context.userId}
    `;
	return { ok: true };
});
//#endregion
export { runBlindTest_createServerFn_handler, saveBlindRanking_createServerFn_handler };
