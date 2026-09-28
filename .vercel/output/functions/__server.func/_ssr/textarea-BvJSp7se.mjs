import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as cn } from "./utils-DbGfHIWY.mjs";
import { o as Lock } from "../_libs/lucide-react.mjs";
import { r as DIAL_META } from "./dials-C0yhxMAh.mjs";
import { a as TooltipTrigger, i as TooltipContent, r as Tooltip } from "./router-Ctxe23Qy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/textarea-BvJSp7se.js
var import_jsx_runtime = require_jsx_runtime();
function DialSlider({ dial, value, base, donor, lock, onChange }) {
	const meta = DIAL_META[dial];
	const min = lock?.min ?? 0;
	const max = lock?.max ?? 100;
	const locked = value === min && value === max && min === max;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "py-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-baseline justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-fg",
						children: meta.label
					}), lock ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-amber",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-3" })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipContent, { children: [
						lock.reason || "Locked",
						lock.max != null ? ` · max ${lock.max}` : "",
						lock.min != null ? ` · min ${lock.min}` : ""
					] })] }) : null]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "tabular-nums text-sm text-muted",
					children: value
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-xs text-subtle",
				children: value <= 50 ? meta.zero : meta.hundred
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mt-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-bg" }),
					typeof base === "number" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted",
						style: { left: `${base}%` },
						title: "Base"
					}) : null,
					typeof donor === "number" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sage",
						style: { left: `${donor}%` },
						title: "Donor"
					}) : null,
					lock?.max != null && lock.max < 100 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute top-0 h-full w-px bg-amber/80",
						style: { left: `${lock.max}%` }
					}) : null,
					lock?.min != null && lock.min > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute top-0 h-full w-px bg-amber/80",
						style: { left: `${lock.min}%` }
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						className: cn("dial-range relative z-10", locked && "opacity-60"),
						min,
						max,
						value,
						disabled: locked,
						onChange: (e) => onChange(Number(e.target.value)),
						"aria-label": meta.label
					})
				]
			})
		]
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-28 w-full rounded-sm bg-raised px-3 py-2.5 text-sm leading-relaxed text-fg shadow-[var(--shadow-border)]", "placeholder:text-subtle", "transition-[box-shadow] duration-150 ease-out", "focus-visible:outline-none focus-visible:shadow-[var(--shadow-border-hover)] focus-visible:ring-2 focus-visible:ring-fg/25", "disabled:opacity-40", className),
		...props
	});
}
//#endregion
export { Textarea as n, DialSlider as t };
