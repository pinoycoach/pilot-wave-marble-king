import { n as clamp } from "./utils-DbGfHIWY.mjs";
import { l as PRESET_META, n as DIAL_KEYS, u as clampDial } from "./dials-C0yhxMAh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mix-D-btE7E5.js
function applyPreset(dials, preset) {
	const next = { ...dials };
	const meta = PRESET_META[preset];
	for (const key of DIAL_KEYS) {
		const delta = meta.shifts[key];
		if (typeof delta === "number") next[key] = clampDial(next[key] + delta);
	}
	return next;
}
function blendDials(base, donor, blend) {
	if (!donor || blend <= 0) return { ...base };
	const t = clamp(blend, 0, 100) / 100;
	const next = { ...base };
	for (const key of DIAL_KEYS) next[key] = clampDial(base[key] + (donor[key] - base[key]) * t);
	return next;
}
function collectLocks(opts) {
	const out = [];
	for (const lock of opts.voiceLocks) out.push({
		...lock,
		source: "voice"
	});
	const domain = opts.domain.trim().toLowerCase();
	if (domain) {
		for (const lock of opts.domainLocks) if (lock.domain.trim().toLowerCase() === domain) out.push({
			...lock,
			source: "domain"
		});
	}
	if (PRESET_META[opts.preset].lockCommercialZero) out.push({
		dial: "commercial_pull",
		max: 0,
		min: 0,
		reason: "Devotional preset locks commercial pull at 0",
		source: "preset"
	});
	return out;
}
function lockForDial(locks, key) {
	const matches = locks.filter((l) => l.dial === key);
	if (!matches.length) return void 0;
	return matches.reduce((acc, lock) => {
		const next = { ...acc };
		if (lock.max != null) next.max = next.max == null ? lock.max : Math.min(next.max, lock.max);
		if (lock.min != null) next.min = next.min == null ? lock.min : Math.max(next.min, lock.min);
		if (lock.reason) next.reason = lock.reason;
		next.source = lock.source;
		return next;
	});
}
function applyLocks(dials, locks) {
	const next = { ...dials };
	for (const key of DIAL_KEYS) {
		const lock = lockForDial(locks, key);
		if (!lock) continue;
		let v = next[key];
		if (lock.max != null) v = Math.min(v, lock.max);
		if (lock.min != null) v = Math.max(v, lock.min);
		next[key] = clampDial(v);
	}
	return next;
}
function mixDials(opts) {
	const nudged = {
		...blendDials(applyPreset(opts.base, opts.preset), opts.donor, opts.blend),
		...opts.overrides
	};
	const locks = collectLocks(opts);
	return {
		dials: applyLocks(nudged, locks),
		locks
	};
}
//#endregion
export { mixDials as n, lockForDial as t };
