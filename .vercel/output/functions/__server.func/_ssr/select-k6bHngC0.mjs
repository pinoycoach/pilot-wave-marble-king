import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as cn } from "./utils-DbGfHIWY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/select-k6bHngC0.js
var import_jsx_runtime = require_jsx_runtime();
function Select({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		className: cn("h-11 w-full appearance-none rounded-sm bg-raised bg-[length:12px] bg-[right_12px_center] bg-no-repeat px-3 pr-9 text-sm text-fg shadow-[var(--shadow-border)]", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg/25", "disabled:opacity-40", className),
		style: { backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%239a9890' d='M1 1l5 5 5-5'/></svg>\")" },
		...props,
		children
	});
}
//#endregion
export { Select as t };
