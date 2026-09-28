import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-DbGfHIWY.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function asJson(value, fallback) {
	if (value == null) return fallback;
	if (typeof value === "string") try {
		return JSON.parse(value);
	} catch {
		return fallback;
	}
	return value;
}
function clamp(n, min, max) {
	return Math.min(max, Math.max(min, n));
}
function newId() {
	return crypto.randomUUID();
}
function normalizeHandle(raw) {
	return raw.trim().replace(/^@/, "").replace(/^https?:\/\/(x|twitter)\.com\//i, "").split(/[/?]/)[0] ?? "";
}
function relativeTime(input) {
	const date = typeof input === "string" ? new Date(input) : input;
	const delta = Date.now() - date.getTime();
	const mins = Math.round(delta / 6e4);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins}m ago`;
	const hours = Math.round(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.round(hours / 24);
	if (days < 14) return `${days}d ago`;
	return date.toLocaleDateString();
}
//#endregion
export { normalizeHandle as a, newId as i, clamp as n, relativeTime as o, cn as r, asJson as t };
