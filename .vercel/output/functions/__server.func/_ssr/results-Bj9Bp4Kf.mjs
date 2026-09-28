import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { n as DIAL_KEYS, r as DIAL_META } from "./dials-C0yhxMAh.mjs";
import { t as authMiddleware } from "./middleware-CFIMLYZc.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { n as listRuns } from "./runs-CQ_Uz0qo.mjs";
import { n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Input, t as Badge } from "./input-BLivQn2L.mjs";
import { t as Button } from "./button-o3RwDXu1.mjs";
import { t as Select } from "./select-k6bHngC0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/results-Bj9Bp4Kf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var listResults = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("5241fd3bda0995c4dada051c1cc685ba453643401556f4a58f0573c55f267e3d"));
var addResult = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("245e107d6b057ecade9a0909b75bc7a243fcebbc2b461b998b4850602ae81315"));
function ratio(num, den) {
	if (!den) return 0;
	return num / den;
}
function ResultsPage() {
	const results = useQuery({
		queryKey: ["results"],
		queryFn: () => listResults()
	});
	const runs = useQuery({
		queryKey: ["runs"],
		queryFn: () => listRuns()
	});
	const [runId, setRunId] = (0, import_react.useState)("");
	const [platform, setPlatform] = (0, import_react.useState)("x");
	const [postedAt, setPostedAt] = (0, import_react.useState)(() => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
	const [views, setViews] = (0, import_react.useState)("0");
	const [shares, setShares] = (0, import_react.useState)("0");
	const [saves, setSaves] = (0, import_react.useState)("0");
	const [replies, setReplies] = (0, import_react.useState)("0");
	const [longReplies, setLongReplies] = (0, import_react.useState)("0");
	const mut = useMutation({
		mutationFn: () => addResult({ data: {
			runId,
			platform,
			postedAt,
			views: Number(views) || 0,
			shares: Number(shares) || 0,
			saves: Number(saves) || 0,
			replies: Number(replies) || 0,
			longReplies: Number(longReplies) || 0
		} }),
		onSuccess: () => {
			toast.success("Logged");
			results.refetch();
		},
		onError: (err) => toast.error(err.message)
	});
	const rows = results.data ?? [];
	const beaters = (0, import_react.useMemo)(() => findBeaters(rows), [rows]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-widest text-subtle uppercase",
				children: "After it ships elsewhere"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl tracking-tight italic sm:text-5xl",
				children: "Results"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-xl text-sm text-muted",
				children: "Log the numbers by hand. Compared to your rolling baseline for that voice + domain + platform. No auto-tuning."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-8 grid gap-3 sm:grid-cols-2",
				onSubmit: (e) => {
					e.preventDefault();
					mut.mutate();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: runId,
						onChange: (e) => setRunId(e.target.value),
						required: true,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Select a run"
						}), (runs.data ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: r.id,
							children: [
								r.voiceName,
								" · ",
								r.recipe.format,
								" · ",
								r.createdAt.slice(0, 16).replace("T", " ")
							]
						}, r.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: platform,
						onChange: (e) => setPlatform(e.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "x",
								children: "X"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "facebook",
								children: "Facebook"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "newsletter",
								children: "Newsletter"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "other",
								children: "Other"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "date",
						value: postedAt,
						onChange: (e) => setPostedAt(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "numeric",
						value: views,
						onChange: (e) => setViews(e.target.value),
						placeholder: "views"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "numeric",
						value: shares,
						onChange: (e) => setShares(e.target.value),
						placeholder: "shares"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "numeric",
						value: saves,
						onChange: (e) => setSaves(e.target.value),
						placeholder: "saves"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "numeric",
						value: replies,
						onChange: (e) => setReplies(e.target.value),
						placeholder: "replies"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "numeric",
						value: longReplies,
						onChange: (e) => setLongReplies(e.target.value),
						placeholder: "long replies"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: !runId || mut.isPending,
						className: "sm:col-span-2",
						children: "Log result"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "desk-scroll mt-10 overflow-x-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[720px] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-xs tracking-widest text-subtle uppercase",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3 font-medium",
								children: "Posted"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3 font-medium",
								children: "Voice"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3 font-medium",
								children: "Platform"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3 font-medium",
								children: "Share rate"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3 font-medium",
								children: "Long reply rate"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "Vs baseline"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((r) => {
						const shareRate = ratio(r.shares, r.views);
						const longRate = ratio(r.longReplies, r.views);
						const beat = beaters.has(r.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 pr-3 tabular-nums",
									children: r.postedAt
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 pr-3",
									children: r.voiceName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 pr-3",
									children: r.platform
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "py-3 pr-3 tabular-nums",
									children: [(shareRate * 100).toFixed(2), "%"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "py-3 pr-3 tabular-nums",
									children: [(longRate * 100).toFixed(2), "%"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3",
									children: beat ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: "sage",
										children: "Beat"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Baseline" })
								})
							]
						}, r.id);
					}) })]
				}), !rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-sm text-muted",
					children: "No logs yet."
				}) : null]
			}),
			beaters.size ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl tracking-tight",
					children: "What beat baseline"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 flex flex-col gap-3",
					children: rows.filter((r) => beaters.has(r.id)).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-md bg-raised p-4 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								r.voiceName,
								" · ",
								r.domain || "no domain",
								" · ",
								r.platform
							] }),
							r.recipe ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs leading-relaxed text-muted",
								children: DIAL_KEYS.map((k) => `${DIAL_META[k].label} ${r.recipe.dials[k]}`).join(" · ")
							}) : null,
							r.recipe?.moveWeights.filter((m) => m.weight > 0).length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted",
								children: ["Moves: ", r.recipe.moveWeights.filter((m) => m.weight > 0).map((m) => m.name).join(", ")]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-subtle",
								children: "No borrowed moves"
							})
						]
					}, r.id))
				})]
			}) : null
		]
	});
}
function findBeaters(rows) {
	const groups = /* @__PURE__ */ new Map();
	for (const row of rows) {
		const key = `${row.voiceName}|${row.domain}|${row.platform}`;
		const list = groups.get(key) ?? [];
		list.push(row);
		groups.set(key, list);
	}
	const beat = /* @__PURE__ */ new Set();
	for (const list of groups.values()) {
		const sorted = [...list].sort((a, b) => a.postedAt.localeCompare(b.postedAt));
		for (let i = 0; i < sorted.length; i += 1) {
			const prior = sorted.slice(0, i);
			if (!prior.length) continue;
			const baseShare = prior.reduce((s, r) => s + ratio(r.shares, r.views), 0) / prior.length;
			const baseLong = prior.reduce((s, r) => s + ratio(r.longReplies, r.views), 0) / prior.length;
			const row = sorted[i];
			if (ratio(row.shares, row.views) > baseShare || ratio(row.longReplies, row.views) > baseLong) beat.add(row.id);
		}
	}
	return beat;
}
//#endregion
export { ResultsPage as component };
