import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as cn } from "./utils-DbGfHIWY.mjs";
import { t as Badge } from "./input-BLivQn2L.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gauge-85pE7Ttr.js
var import_jsx_runtime = require_jsx_runtime();
function Gauge({ label, value, reading, band }) {
	const clamped = Math.max(0, Math.min(100, value));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-raised p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-widest text-subtle uppercase",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-display text-5xl leading-none tracking-tight tabular-nums",
				children: Math.round(clamped)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: reading
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-1.5 overflow-hidden rounded-full bg-bg",
					children: band ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full bg-sage/35",
						style: {
							marginLeft: `${band.from}%`,
							width: `${Math.max(0, band.to - band.from)}%`
						}
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full bg-fg/20",
						style: { width: `${clamped}%` }
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg shadow-[var(--shadow-border)] transition-[left] duration-500 ease-[var(--ease-out)]",
					style: { left: `${clamped}%` }
				})]
			})
		]
	});
}
function VerdictChip({ verdict }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: verdict === "ready for Claude" ? "sage" : verdict === "stop" ? "clay" : "amber",
		children: verdict
	});
}
function HighlightedDraft({ draft, grams }) {
	if (!grams.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "whitespace-pre-wrap text-sm leading-relaxed",
		children: draft
	});
	const escaped = grams.filter(Boolean).sort((a, b) => b.length - a.length).map((g) => g.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
	if (!escaped.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "whitespace-pre-wrap text-sm leading-relaxed",
		children: draft
	});
	const re = new RegExp(`(${escaped.join("|")})`, "gi");
	const parts = draft.split(re);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "whitespace-pre-wrap text-sm leading-relaxed",
		children: parts.map((part, i) => i % 2 === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mark", {
			className: cn("rounded-xs bg-clay-dim text-clay"),
			children: part
		}, i) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: part }, i))
	});
}
//#endregion
export { HighlightedDraft as n, VerdictChip as r, Gauge as t };
