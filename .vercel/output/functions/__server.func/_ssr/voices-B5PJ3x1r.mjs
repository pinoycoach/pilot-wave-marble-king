import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { a as Plus, i as Trash2, s as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as DIAL_KEYS, r as DIAL_META } from "./dials-C0yhxMAh.mjs";
import { t as authMiddleware } from "./middleware-CFIMLYZc.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as listVoices, n as duplicateVoice, o as saveDomainLock, r as listDomainLocks, s as updateVoice, t as deleteDomainLock } from "./voices-Bfr8_hyD.mjs";
import { n as Input, t as Badge } from "./input-BLivQn2L.mjs";
import { t as Button } from "./button-o3RwDXu1.mjs";
import { t as Select } from "./select-k6bHngC0.mjs";
import { t as Fingerprint } from "./fingerprint-XKoIOTsr.mjs";
import { n as Textarea, t as DialSlider } from "./textarea-BvJSp7se.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/voices-B5PJ3x1r.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var getSlopPatterns = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("62ad52aa16f969e00141b84337648fcb3553112e18ac90d8304c3a4cf394c300"));
var saveSlopPatterns = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("afbffc0f86c7865843567ac0812e2e63f947cdc180e1b31087f88e2f37812735"));
function VoicesPage() {
	const voices = useQuery({
		queryKey: ["voices"],
		queryFn: () => listVoices()
	});
	const locks = useQuery({
		queryKey: ["domain-locks"],
		queryFn: () => listDomainLocks()
	});
	const slop = useQuery({
		queryKey: ["slop"],
		queryFn: () => getSlopPatterns()
	});
	const [selectedId, setSelectedId] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!voices.data?.length) return;
		if (!selectedId || !voices.data.some((v) => v.id === selectedId)) setSelectedId(voices.data[0].id);
	}, [voices.data, selectedId]);
	const voice = voices.data?.find((v) => v.id === selectedId) ?? null;
	const saveMut = useMutation({
		mutationFn: (patch) => updateVoice({ data: patch }),
		onSuccess: () => {
			toast.success("Saved");
			voices.refetch();
		},
		onError: (err) => toast.error(err.message)
	});
	const dupMut = useMutation({
		mutationFn: (id) => duplicateVoice({ data: { id } }),
		onSuccess: (v) => {
			toast.success("Duplicated as brand voice");
			voices.refetch().then(() => setSelectedId(v.id));
		},
		onError: (err) => toast.error(err.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-widest text-subtle uppercase",
				children: "Library"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl tracking-tight italic sm:text-5xl",
				children: "Voices"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-xl text-sm text-muted",
				children: "Core is identity. Brand voices inherit it. Dials are surface. Never weight the Core."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "flex flex-col gap-2",
					children: (voices.data ?? []).map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setSelectedId(v.id),
						className: `rounded-md p-3 text-left ${v.id === selectedId ? "bg-raised" : "hover:bg-raised/50"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm",
								children: v.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: v.kind === "core" ? "sage" : "muted",
								children: v.kind
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fingerprint, {
							dials: v.dials,
							className: "mt-3 h-8"
						})]
					}, v.id))
				}), voice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoiceEditor, {
					voice,
					saving: saveMut.isPending,
					onSave: (patch) => saveMut.mutate(patch),
					onDuplicate: () => dupMut.mutate(voice.id)
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Sign in to seed Napoleon Core."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl tracking-tight",
						children: "Domain locks"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Locks beat donor pulls, presets, and future metric tuning."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DomainLockList, {
						locks: locks.data ?? [],
						onRefresh: () => void locks.refetch()
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl tracking-tight",
						children: "Slop list"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Editable regex fingerprints used by Meter It. Case-insensitive."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlopEditor, {
						patterns: slop.data ?? [],
						onSave: async (next) => {
							await saveSlopPatterns({ data: next });
							toast.success("Slop list saved");
							slop.refetch();
						}
					})
				]
			})
		]
	});
}
function VoiceEditor({ voice, saving, onSave, onDuplicate }) {
	const [name, setName] = (0, import_react.useState)(voice.name);
	const [sourceText, setSourceText] = (0, import_react.useState)(voice.sourceText);
	const [anchors, setAnchors] = (0, import_react.useState)(voice.anchors.join("\n"));
	const [banned, setBanned] = (0, import_react.useState)(voice.banned.join("\n"));
	const [dials, setDials] = (0, import_react.useState)(voice.dials);
	const [locks, setLocks] = (0, import_react.useState)(voice.locks);
	(0, import_react.useEffect)(() => {
		setName(voice.name);
		setSourceText(voice.sourceText);
		setAnchors(voice.anchors.join("\n"));
		setBanned(voice.banned.join("\n"));
		setDials(voice.dials);
		setLocks(voice.locks);
	}, [voice]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: name,
					onChange: (e) => setName(e.target.value),
					className: "max-w-sm"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								search: { voice: voice.id },
								children: "Send to Mixer"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: onDuplicate,
							children: "Duplicate as brand voice"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							disabled: saving,
							onClick: () => onSave({
								id: voice.id,
								name,
								sourceText,
								anchors: anchors.split("\n").map((s) => s.trim()).filter(Boolean),
								banned: banned.split("\n").map((s) => s.trim()).filter(Boolean),
								dials,
								locks
							}),
							children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : null, "Save"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-medium tracking-widest text-subtle uppercase",
					children: "Voice source"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					className: "mt-1.5 min-h-40",
					value: sourceText,
					onChange: (e) => setSourceText(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-medium tracking-widest text-subtle uppercase",
					children: "Identity anchors — one per line, never dialed"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					className: "mt-1.5",
					value: anchors,
					onChange: (e) => setAnchors(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-medium tracking-widest text-subtle uppercase",
					children: "Banned phrases"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					className: "mt-1.5 min-h-20",
					value: banned,
					onChange: (e) => setBanned(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-widest text-subtle uppercase",
				children: "Surface dials"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 divide-y divide-border",
				children: DIAL_KEYS.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialSlider, {
					dial: key,
					value: dials[key],
					lock: locks.find((l) => l.dial === key),
					onChange: (n) => setDials((d) => ({
						...d,
						[key]: n
					}))
				}, key))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoiceLocks, {
				locks,
				onChange: setLocks
			})
		]
	});
}
function VoiceLocks({ locks, onChange }) {
	const [dial, setDial] = (0, import_react.useState)("commercial_pull");
	const [max, setMax] = (0, import_react.useState)("15");
	const [reason, setReason] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium tracking-widest text-subtle uppercase",
			children: "Voice locks"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-2 flex flex-col gap-2",
			children: locks.map((lock, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center justify-between gap-3 rounded-md bg-raised px-3 py-2 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					DIAL_META[lock.dial].label,
					lock.max != null ? ` · max ${lock.max}` : "",
					lock.min != null ? ` · min ${lock.min}` : "",
					lock.reason ? ` — ${lock.reason}` : ""
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-subtle hover:text-clay",
					onClick: () => onChange(locks.filter((_, j) => j !== i)),
					"aria-label": "Remove lock",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
				})]
			}, `${lock.dial}-${i}`))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 grid gap-2 sm:grid-cols-[1fr_96px_1fr_auto]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
					value: dial,
					onChange: (e) => setDial(e.target.value),
					children: DIAL_KEYS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: k,
						children: DIAL_META[k].label
					}, k))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: max,
					onChange: (e) => setMax(e.target.value),
					placeholder: "max",
					inputMode: "numeric"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: reason,
					onChange: (e) => setReason(e.target.value),
					placeholder: "reason"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					size: "sm",
					onClick: () => {
						const n = Number(max);
						onChange([...locks, {
							dial,
							max: Number.isFinite(n) ? n : null,
							min: null,
							reason: reason.trim()
						}]);
						setReason("");
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Add"]
				})
			]
		})
	] });
}
function DomainLockList({ locks, onRefresh }) {
	const [domain, setDomain] = (0, import_react.useState)("bazi");
	const [dial, setDial] = (0, import_react.useState)("commercial_pull");
	const [max, setMax] = (0, import_react.useState)("15");
	const [reason, setReason] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: locks.map((lock) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-3 rounded-md bg-raised px-3 py-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg",
							children: lock.domain
						}),
						" · ",
						DIAL_META[lock.dial].label,
						lock.max != null ? ` max ${lock.max}` : "",
						lock.min != null ? ` min ${lock.min}` : "",
						lock.reason ? ` — ${lock.reason}` : ""
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-subtle hover:text-clay",
						onClick: async () => {
							await deleteDomainLock({ data: lock.id });
							onRefresh();
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
					})]
				}, lock.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-2 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: domain,
						onChange: (e) => setDomain(e.target.value),
						placeholder: "domain"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						value: dial,
						onChange: (e) => setDial(e.target.value),
						children: DIAL_KEYS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: k,
							children: DIAL_META[k].label
						}, k))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: max,
						onChange: (e) => setMax(e.target.value),
						placeholder: "max"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: reason,
						onChange: (e) => setReason(e.target.value),
						placeholder: "reason"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-2",
				variant: "outline",
				size: "sm",
				onClick: async () => {
					const n = Number(max);
					await saveDomainLock({ data: {
						domain,
						dial,
						max: Number.isFinite(n) ? n : null,
						reason
					} });
					toast.success("Lock saved");
					onRefresh();
				},
				children: "Add domain lock"
			})
		]
	});
}
function SlopEditor({ patterns, onSave }) {
	const [text, setText] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setText(patterns.map((p) => `${p.label} | ${p.pattern}`).join("\n"));
	}, [patterns]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
			className: "min-h-40 font-mono text-xs",
			value: text,
			onChange: (e) => setText(e.target.value)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "mt-2",
			variant: "outline",
			size: "sm",
			onClick: () => onSave(text.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
				const [label, pattern] = line.split("|").map((s) => s.trim());
				return {
					id: crypto.randomUUID(),
					label: label || "pattern",
					pattern: pattern || label || ""
				};
			})),
			children: "Save slop list"
		})]
	});
}
//#endregion
export { VoicesPage as component };
