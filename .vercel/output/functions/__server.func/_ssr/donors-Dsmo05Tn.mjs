import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as useSearch, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { o as relativeTime } from "./utils-DbGfHIWY.mjs";
import { s as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as DIAL_KEYS, r as DIAL_META } from "./dials-C0yhxMAh.mjs";
import { n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as runDonorScan, t as listDonorScans } from "./donors-hEHFOiaA.mjs";
import { i as listVoices } from "./voices-Bfr8_hyD.mjs";
import { n as Input, t as Badge } from "./input-BLivQn2L.mjs";
import { t as Button } from "./button-o3RwDXu1.mjs";
import { t as Select } from "./select-k6bHngC0.mjs";
import { t as Fingerprint } from "./fingerprint-XKoIOTsr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/donors-Dsmo05Tn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DonorsPage() {
	const search = useSearch({ from: "/_app/donors" });
	const scans = useQuery({
		queryKey: ["donors"],
		queryFn: () => listDonorScans()
	});
	const voices = useQuery({
		queryKey: ["voices"],
		queryFn: () => listVoices()
	});
	const [handle, setHandle] = (0, import_react.useState)(search.handle ?? "");
	const [domain, setDomain] = (0, import_react.useState)(search.domain ?? "");
	const [selectedId, setSelectedId] = (0, import_react.useState)(null);
	const [baseId, setBaseId] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (search.handle) setHandle(search.handle);
		if (search.domain) setDomain(search.domain);
	}, [search.handle, search.domain]);
	(0, import_react.useEffect)(() => {
		if (voices.data?.length && !baseId) {
			const core = voices.data.find((v) => v.kind === "core") ?? voices.data[0];
			setBaseId(core.id);
		}
	}, [voices.data, baseId]);
	(0, import_react.useEffect)(() => {
		if (scans.data?.length && !selectedId) setSelectedId(scans.data[0].id);
	}, [scans.data, selectedId]);
	const scanMut = useMutation({
		mutationFn: async (force) => {
			const res = await runDonorScan({ data: {
				handle,
				domain,
				force
			} });
			if (!res.ok) throw new Error(res.error);
			return res;
		},
		onSuccess: (res) => {
			toast.success(res.cached ? "Loaded from 24h cache" : "Donor scanned");
			scans.refetch().then(() => setSelectedId(res.scan.id));
		},
		onError: (err) => toast.error(err.message)
	});
	const selected = scans.data?.find((s) => s.id === selectedId) ?? null;
	const base = voices.data?.find((v) => v.id === baseId) ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-widest text-subtle uppercase",
				children: "Technique, not content"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl tracking-tight italic sm:text-5xl",
				children: "Donors"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-xl text-sm text-muted",
				children: "Measure a leading voice on the same dials. Borrow moves and positions. Never words."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-8 grid gap-3 sm:grid-cols-[1fr_1fr_auto]",
				onSubmit: (e) => {
					e.preventDefault();
					scanMut.mutate(false);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: handle,
						onChange: (e) => setHandle(e.target.value),
						placeholder: "@handle",
						"aria-label": "X handle"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: domain,
						onChange: (e) => setDomain(e.target.value),
						placeholder: "domain — bazi, manifestation…",
						"aria-label": "Domain"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						disabled: scanMut.isPending,
						children: [scanMut.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : null, "Scan donor"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "flex flex-col gap-2",
					children: [(scans.data ?? []).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setSelectedId(s.id),
						className: `rounded-md p-3 text-left ${s.id === selectedId ? "bg-raised" : "hover:bg-raised/50"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm",
							children: ["@", s.handle]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								s.domain,
								" · ",
								relativeTime(s.scannedAt)
							]
						})]
					}, s.id)), !scans.data?.length && !scanMut.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-1 text-sm text-muted",
						children: "No scans yet. Start with a public handle."
					}) : null]
				}), selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DonorDetail, {
					scan: selected,
					baseDials: base?.dials,
					baseId,
					voices: voices.data ?? [],
					onBase: setBaseId,
					onRescan: () => {
						setHandle(selected.handle);
						setDomain(selected.domain);
						scanMut.mutate(true);
					},
					scanning: scanMut.isPending
				}) : scanMut.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "shimmer-text text-sm",
					children: "Reading the last 30 days of their posts"
				}) : null]
			})
		]
	});
}
function DonorDetail({ scan, baseDials, baseId, voices, onBase, onRescan, scanning }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "animate-fade-up flex flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "font-display text-3xl tracking-tight",
						children: ["@", scan.handle]
					}), scan.quiet ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "amber",
						children: "Quiet"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						tone: "sage",
						children: [scan.sampleCount, " posts"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [
						scan.domain,
						" · ",
						scan.model,
						" · ",
						relativeTime(scan.scannedAt)
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
							value: baseId,
							onChange: (e) => onBase(e.target.value),
							className: "w-44",
							children: voices.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: v.id,
								children: ["vs ", v.name]
							}, v.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: onRescan,
							disabled: scanning,
							children: "Rescan"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								search: { donor: scan.id },
								children: "Send to Mixer"
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fingerprint, {
				dials: scan.dials,
				donor: baseDials,
				className: "h-12"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-widest text-subtle uppercase",
					children: "Dials vs base"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 flex flex-col gap-3",
					children: DIAL_KEYS.map((key) => {
						const donor = scan.dials[key];
						const base = baseDials?.[key];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted",
								children: DIAL_META[key].label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "tabular-nums text-subtle",
								children: [
									typeof base === "number" ? `base ${base} · ` : "",
									"donor ",
									donor
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative mt-1.5 h-1.5 rounded-full bg-bg",
							children: [typeof base === "number" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted",
								style: { left: `${base}%` }
							}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sage",
								style: { left: `${donor}%` }
							})]
						})] }, key);
					})
				}),
				scan.dialNotes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm leading-relaxed text-muted",
					children: scan.dialNotes
				}) : null
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-widest text-subtle uppercase",
				children: "Structural moves"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex flex-col gap-3",
				children: scan.moves.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-md bg-raised p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm",
								children: m.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: m.frequency === "signature" ? "sage" : "muted",
								children: m.frequency
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-mono text-xs text-muted",
							children: m.pattern
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: m.description
						})
					]
				}, m.name))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-widest text-clay uppercase",
				children: "Never use"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 flex flex-wrap gap-1.5",
				children: scan.signaturePhrases.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "clay",
					children: p
				}) }, p))
			})] }),
			scan.topicsNow.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: ["On now: ", scan.topicsNow.join(" · ")]
			}) : null,
			scan.citations.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
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
			})] }) : null
		]
	});
}
//#endregion
export { DonorsPage as component };
