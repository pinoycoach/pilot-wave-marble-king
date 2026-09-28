import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { o as relativeTime } from "./utils-DbGfHIWY.mjs";
import { s as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Input, t as Badge } from "./input-BLivQn2L.mjs";
import { t as Button } from "./button-o3RwDXu1.mjs";
import { n as runTrendScan, t as listTrendScans } from "./trends-CVCTwcFb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trends-BvSxYqvd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TrendsPage() {
	const scans = useQuery({
		queryKey: ["trends"],
		queryFn: () => listTrendScans()
	});
	const [query, setQuery] = (0, import_react.useState)("");
	const [current, setCurrent] = (0, import_react.useState)(null);
	const mut = useMutation({
		mutationFn: async () => {
			const res = await runTrendScan({ data: { query } });
			if (!res.ok) throw new Error(res.error);
			return res;
		},
		onSuccess: (res) => {
			setCurrent(res.scan);
			toast.success(res.cached ? "Loaded from 30-minute cache" : "Trend scan complete");
			scans.refetch();
		},
		onError: (err) => toast.error(err.message)
	});
	const shown = current ?? scans.data?.[0] ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-6 sm:px-8 sm:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-widest text-subtle uppercase",
				children: "Last 48 hours on X"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl tracking-tight italic sm:text-5xl",
				children: "Trends"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "A topic, a keyword, or “what’s trending in [domain].” Quiet is a valid answer."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-8 flex flex-col gap-3 sm:flex-row",
				onSubmit: (e) => {
					e.preventDefault();
					mut.mutate();
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: query,
					onChange: (e) => setQuery(e.target.value),
					placeholder: "what’s trending in bazi",
					"aria-label": "Trend query"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "submit",
					disabled: mut.isPending,
					className: "sm:w-40",
					children: [mut.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : null, "Scan"]
				})]
			}),
			mut.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "shimmer-text mt-8 text-sm",
				children: "Searching X for the last 48 hours"
			}) : null,
			shown && !mut.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendCard, { scan: shown }) : null,
			(scans.data ?? []).length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-widest text-subtle uppercase",
					children: "Recent"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 flex flex-col gap-2",
					children: scans.data.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "w-full rounded-md px-3 py-2 text-left hover:bg-raised",
						onClick: () => setCurrent(s),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm",
							children: s.headline
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-subtle",
							children: [
								s.query,
								" · ",
								relativeTime(s.scannedAt)
							]
						})]
					}) }, s.id))
				})]
			}) : null
		]
	});
}
function TrendCard({ scan }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "mt-8 animate-fade-up",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [scan.quiet ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "amber",
					children: "Quiet"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "sage",
					children: "Live"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-subtle",
					children: [
						scan.model,
						" · ",
						relativeTime(scan.scannedAt)
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-4 font-display text-3xl leading-snug tracking-tight",
				children: scan.headline
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm leading-relaxed text-muted",
				children: scan.crowdRead
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-8 text-xs font-medium tracking-widest text-subtle uppercase",
				children: "Angles few are taking"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 flex flex-col gap-1.5",
				children: scan.angles.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-sm before:mr-2 before:text-subtle before:content-['–']",
					children: a
				}, a))
			}),
			scan.leadingVoices.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-xs font-medium tracking-widest text-subtle uppercase",
					children: "Leading voices"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 flex flex-col gap-3",
					children: scan.leadingVoices.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-wrap items-center justify-between gap-2 rounded-md bg-raised px-3 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm",
							children: ["@", v.handle.replace(/^@/, "")]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: v.why
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/donors",
								search: {
									handle: v.handle.replace(/^@/, ""),
									domain: scan.query
								},
								children: "Scan as donor"
							})
						})]
					}, v.handle))
				})]
			}) : null,
			scan.watch ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-6 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-subtle",
					children: "Watch · "
				}), scan.watch]
			}) : null,
			scan.citations.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-xs font-medium tracking-widest text-subtle uppercase",
					children: "Citations"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 flex flex-col gap-1",
					children: scan.citations.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-xs text-muted",
						children: [c.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: c.url,
							target: "_blank",
							rel: "noreferrer",
							className: "text-fg underline decoration-border-strong underline-offset-2",
							children: c.source
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg",
							children: c.source
						}), c.note ? ` — ${c.note}` : ""]
					}, `${c.source}-${i}`))
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						search: { trend: scan.id },
						children: "Send to Mixer"
					})
				})
			})
		]
	});
}
//#endregion
export { TrendsPage as component };
