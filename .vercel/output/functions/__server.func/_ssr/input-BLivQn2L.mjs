import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { r as cn } from "./utils-DbGfHIWY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/input-BLivQn2L.js
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tracking-wide uppercase", {
	variants: { tone: {
		muted: "bg-raised text-muted",
		sage: "bg-sage-dim text-sage",
		clay: "bg-clay-dim text-clay",
		amber: "bg-amber-dim text-amber",
		paper: "bg-fg/10 text-fg"
	} },
	defaultVariants: { tone: "muted" }
});
function Badge({ className, tone, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ tone }), className),
		...props
	});
}
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("flex h-11 w-full rounded-sm bg-raised px-3 text-sm text-fg shadow-[var(--shadow-border)]", "placeholder:text-subtle", "transition-[box-shadow] duration-150 ease-out", "focus-visible:outline-none focus-visible:shadow-[var(--shadow-border-hover)] focus-visible:ring-2 focus-visible:ring-fg/25", "disabled:opacity-40", className),
		...props
	});
}
//#endregion
export { Input as n, Badge as t };
