import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as cn } from "./utils-DbGfHIWY.mjs";
import { n as DIAL_KEYS } from "./dials-C0yhxMAh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fingerprint-XKoIOTsr.js
var import_jsx_runtime = require_jsx_runtime();
function Fingerprint({ dials, donor, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex h-10 items-end gap-0.5", className),
		"aria-hidden": true,
		children: DIAL_KEYS.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex h-full flex-1 items-end",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-full rounded-sm bg-fg/70",
				style: { height: `${Math.max(8, dials[key])}%` }
			}), donor ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute bottom-0 left-0 w-full rounded-sm bg-sage/50",
				style: { height: `${Math.max(6, donor[key])}%` }
			}) : null]
		}, key))
	});
}
//#endregion
export { Fingerprint as t };
