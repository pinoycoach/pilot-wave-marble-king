import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { r as cn } from "./_ssr/utils-DbGfHIWY.mjs";
import { d as Check, s as LoaderCircle, t as X, u as Copy } from "./_libs/lucide-react.mjs";
import { a as FORMAT_LABEL, i as FORMATS, l as PRESET_META, n as DIAL_KEYS, o as GENRE_PRESETS } from "./_ssr/dials-C0yhxMAh.mjs";
import { n as mixDials, t as lockForDial } from "./_ssr/mix-D-btE7E5.mjs";
import { r as enabledMoves, t as buildClaudePacket } from "./_ssr/verdict-gtZZI2am.mjs";
import { i as saveRunDraft, r as meterDraft, t as generateDraft } from "./_ssr/runs-CQ_Uz0qo.mjs";
import { n as useQuery, t as useMutation } from "./_libs/tanstack__react-query.mjs";
import { a as DialogOverlay$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "./_libs/@radix-ui/react-dialog+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { n as Route$6 } from "./_ssr/router-Ctxe23Qy.mjs";
import { t as listDonorScans } from "./_ssr/donors-hEHFOiaA.mjs";
import { a as lockAsVoice, i as listVoices, r as listDomainLocks } from "./_ssr/voices-Bfr8_hyD.mjs";
import { n as Input, t as Badge } from "./_ssr/input-BLivQn2L.mjs";
import { n as HighlightedDraft, r as VerdictChip, t as Gauge } from "./_ssr/gauge-85pE7Ttr.mjs";
import { t as Button } from "./_ssr/button-o3RwDXu1.mjs";
import { t as Select } from "./_ssr/select-k6bHngC0.mjs";
import { t as Fingerprint } from "./_ssr/fingerprint-XKoIOTsr.mjs";
import { t as listTrendScans } from "./_ssr/trends-CVCTwcFb.mjs";
import { n as Textarea, t as DialSlider } from "./_ssr/textarea-BvJSp7se.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app-BvWtOPGv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CopyButton({ text, label = "Copy", disabled }) {
	const [done, setDone] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		type: "button",
		variant: "outline",
		size: "sm",
		disabled: disabled || !text,
		onClick: async () => {
			try {
				await navigator.clipboard.writeText(text);
				setDone(true);
				window.setTimeout(() => setDone(false), 1600);
			} catch {
				const blob = new Blob([text], { type: "text/plain" });
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = "claude-packet.md";
				a.click();
				URL.revokeObjectURL(url);
			}
		},
		children: [done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {}), done ? "Copied" : label]
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-xs font-medium tracking-widest text-subtle uppercase", className),
		...props
	});
}
var Dialog = Dialog$1;
function DialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
		className: cn("fixed inset-0 z-50 bg-bg/70", className),
		...props
	});
}
function DialogContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col rounded-t-xl bg-surface p-4 shadow-[var(--shadow-border)]", "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:p-6", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon",
				className: "absolute top-3 right-3 size-9",
				"aria-label": "Close",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
			})
		})]
	})] });
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("font-display text-2xl tracking-tight", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("text-sm text-muted", className),
		...props
	});
}
function MixerPage() {
	const search = Route$6.useSearch();
	const voices = useQuery({
		queryKey: ["voices"],
		queryFn: () => listVoices()
	});
	const donors = useQuery({
		queryKey: ["donors"],
		queryFn: () => listDonorScans()
	});
	const trends = useQuery({
		queryKey: ["trends"],
		queryFn: () => listTrendScans()
	});
	const locksQ = useQuery({
		queryKey: ["domain-locks"],
		queryFn: () => listDomainLocks()
	});
	const [voiceId, setVoiceId] = (0, import_react.useState)("");
	const [donorId, setDonorId] = (0, import_react.useState)("");
	const [trendId, setTrendId] = (0, import_react.useState)("");
	const [topic, setTopic] = (0, import_react.useState)("");
	const [domain, setDomain] = (0, import_react.useState)("");
	const [format, setFormat] = (0, import_react.useState)("x_post");
	const [preset, setPreset] = (0, import_react.useState)("none");
	const [blend, setBlend] = (0, import_react.useState)(0);
	const [overrides, setOverrides] = (0, import_react.useState)({});
	const [weights, setWeights] = (0, import_react.useState)({});
	const [keep, setKeep] = (0, import_react.useState)("");
	const [angle, setAngle] = (0, import_react.useState)("");
	const [draft, setDraft] = (0, import_react.useState)("");
	const [runId, setRunId] = (0, import_react.useState)(null);
	const [meters, setMeters] = (0, import_react.useState)(null);
	const [verdict, setVerdict] = (0, import_react.useState)(null);
	const [lockOpen, setLockOpen] = (0, import_react.useState)(false);
	const [brandName, setBrandName] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!voices.data?.length || voiceId) return;
		const preferred = voices.data.find((v) => v.id === search.voice) ?? voices.data.find((v) => v.kind === "core") ?? voices.data[0];
		if (preferred) setVoiceId(preferred.id);
	}, [
		voices.data,
		search.voice,
		voiceId
	]);
	(0, import_react.useEffect)(() => {
		if (search.donor) setDonorId(search.donor);
	}, [search.donor]);
	(0, import_react.useEffect)(() => {
		if (!search.trend || !trends.data) return;
		const t = trends.data.find((s) => s.id === search.trend);
		if (t) {
			setTrendId(t.id);
			setTopic(t.query);
		}
	}, [search.trend, trends.data]);
	const voice = voices.data?.find((v) => v.id === voiceId) ?? null;
	const donor = donors.data?.find((d) => d.id === donorId) ?? null;
	const trend = trends.data?.find((t) => t.id === trendId) ?? null;
	(0, import_react.useEffect)(() => {
		if (donor && !domain) setDomain(donor.domain);
	}, [donor, domain]);
	(0, import_react.useEffect)(() => {
		setOverrides({});
	}, [
		blend,
		preset,
		voiceId,
		donorId
	]);
	(0, import_react.useEffect)(() => {
		if (!donor) {
			setWeights({});
			return;
		}
		setWeights((prev) => {
			const next = {};
			for (const m of donor.moves) next[m.name] = prev[m.name] ?? 0;
			return next;
		});
	}, [donor]);
	const mixed = (0, import_react.useMemo)(() => {
		if (!voice) return null;
		return mixDials({
			base: voice.dials,
			donor: donor?.dials ?? null,
			blend: donor ? blend : 0,
			preset,
			overrides,
			voiceLocks: voice.locks,
			domainLocks: locksQ.data ?? [],
			domain
		});
	}, [
		voice,
		donor,
		blend,
		preset,
		overrides,
		locksQ.data,
		domain
	]);
	const recipe = mixed ? {
		blend: donor ? blend : 0,
		dials: mixed.dials,
		preset,
		format,
		topic: topic || trend?.query || "",
		domain,
		keep,
		angle,
		moveWeights: Object.entries(weights).map(([name, weight]) => ({
			name,
			weight
		}))
	} : null;
	const draftMut = useMutation({
		mutationFn: async () => {
			if (!voice || !recipe) throw new Error("Pick a voice first");
			const res = await generateDraft({ data: {
				voiceId: voice.id,
				donorScanId: donor?.id ?? null,
				trendScanId: trend?.id ?? null,
				recipe
			} });
			if (!res.ok) throw new Error(res.error);
			return res;
		},
		onSuccess: (res) => {
			setDraft(res.draft);
			setRunId(res.runId);
			setMeters(null);
			setVerdict(null);
			toast.success("Test draft ready");
		},
		onError: (err) => toast.error(err.message)
	});
	const meterMut = useMutation({
		mutationFn: async () => {
			if (!voice || !recipe || !draft.trim()) throw new Error("Generate or paste a draft first");
			if (runId) await saveRunDraft({ data: {
				runId,
				draft
			} });
			const res = await meterDraft({ data: {
				runId: runId ?? void 0,
				draft,
				voiceId: voice.id,
				donorScanId: donor?.id ?? null,
				recipe
			} });
			if (!res.ok) throw new Error(res.error);
			return res;
		},
		onSuccess: (res) => {
			setMeters(res.meters);
			setVerdict(res.verdict);
			setRunId(res.runId);
			toast.success("Metered");
		},
		onError: (err) => toast.error(err.message)
	});
	const lockMut = useMutation({
		mutationFn: async () => {
			if (!voice || !mixed) throw new Error("Nothing to lock");
			return await lockAsVoice({ data: {
				name: brandName,
				parentId: voice.kind === "core" ? voice.id : voice.parentId ?? voice.id,
				dials: mixed.dials,
				banned: voice.banned
			} });
		},
		onSuccess: () => {
			toast.success("Locked as a brand voice");
			setLockOpen(false);
			setBrandName("");
			voices.refetch();
		},
		onError: (err) => toast.error(err.message)
	});
	const packet = voice && mixed && recipe ? buildClaudePacket({
		voiceName: voice.name,
		keep,
		dials: mixed.dials,
		moves: enabledMoves(donor?.moves, recipe.moveWeights),
		neverUse: [...voice.banned, ...donor?.signaturePhrases ?? []],
		format,
		preset,
		topic: recipe.topic,
		trend,
		angle,
		draft
	}) : "";
	function downloadPacket() {
		if (!keep.trim()) {
			toast.error("KEEP is required before export");
			return;
		}
		const blob = new Blob([packet], { type: "text/markdown" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "claude-packet.md";
		a.click();
		URL.revokeObjectURL(url);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-widest text-subtle uppercase",
					children: "The lab"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl tracking-tight italic sm:text-5xl",
					children: "Mixer"
				})] }), mixed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-40",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fingerprint, {
						dials: mixed.dials,
						donor: donor?.dials
					})
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "flex flex-col gap-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Base voice",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: voiceId,
										onChange: (e) => setVoiceId(e.target.value),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Select a voice"
										}), (voices.data ?? []).map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: v.id,
											children: v.name
										}, v.id))]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Donor",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: donorId,
										onChange: (e) => {
											setDonorId(e.target.value);
											setBlend(e.target.value ? 30 : 0);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "None"
										}), (donors.data ?? []).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: d.id,
											children: [
												"@",
												d.handle,
												" · ",
												d.domain
											]
										}, d.id))]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Format",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
										value: format,
										onChange: (e) => setFormat(e.target.value),
										children: FORMATS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: f,
											children: FORMAT_LABEL[f]
										}, f))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Genre preset",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
										value: preset,
										onChange: (e) => setPreset(e.target.value),
										children: GENRE_PRESETS.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: g,
											children: PRESET_META[g].label
										}, g))
									})
								})
							]
						}),
						PRESET_META[preset].note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: PRESET_META[preset].note
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Topic",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: topic,
								onChange: (e) => setTopic(e.target.value),
								placeholder: "What is this piece about"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Saved trend",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: trendId,
									onChange: (e) => {
										setTrendId(e.target.value);
										const t = trends.data?.find((s) => s.id === e.target.value);
										if (t) setTopic(t.query);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "None"
									}), (trends.data ?? []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: t.id,
										children: t.headline.slice(0, 48)
									}, t.id))]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Domain",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: domain,
									onChange: (e) => setDomain(e.target.value),
									placeholder: "bazi, faith, food…"
								})
							})]
						}),
						trend?.angles.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Angle",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: angle,
								onChange: (e) => setAngle(e.target.value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Choose an angle"
								}), trend.angles.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: a,
									children: a
								}, a))]
							})
						}) : null,
						donor ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Donor blend" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums text-sm text-muted",
									children: blend
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								className: "dial-range mt-2",
								min: 0,
								max: 100,
								value: blend,
								onChange: (e) => setBlend(Number(e.target.value)),
								"aria-label": "Donor blend"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 flex justify-between text-xs text-subtle",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Base only" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Toward donor" })]
							})
						] }) : null,
						mixed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-widest text-subtle uppercase",
							children: "Dials"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 divide-y divide-border",
							children: DIAL_KEYS.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialSlider, {
								dial: key,
								value: mixed.dials[key],
								base: voice?.dials[key],
								donor: donor?.dials[key],
								lock: lockForDial(mixed.locks, key),
								onChange: (n) => setOverrides((prev) => ({
									...prev,
									[key]: n
								}))
							}, key))
						})] }) : null,
						donor?.moves.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-widest text-subtle uppercase",
								children: "Move weights"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-subtle",
								children: "Default off. Turn on only what you want to borrow."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-3 flex flex-col gap-3",
								children: donor.moves.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "rounded-md bg-raised p-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-baseline justify-between gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm",
												children: m.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "tabular-nums text-xs text-muted",
												children: (weights[m.name] ?? 0).toFixed(1)
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs text-muted",
											children: m.pattern
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "range",
											className: "dial-range mt-2",
											min: 0,
											max: 1,
											step: .1,
											value: weights[m.name] ?? 0,
											onChange: (e) => setWeights((prev) => ({
												...prev,
												[m.name]: Number(e.target.value)
											})),
											"aria-label": `${m.name} weight`
										})
									]
								}, m.name))
							})
						] }) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "flex flex-col gap-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: () => draftMut.mutate(),
									disabled: draftMut.isPending || !voice,
									children: [draftMut.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : null, "Test draft"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									onClick: () => meterMut.mutate(),
									disabled: meterMut.isPending || !draft,
									children: [meterMut.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : null, "Meter it"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: () => {
										if (!keep.trim()) {
											toast.error("KEEP is required before export");
											return;
										}
										navigator.clipboard.writeText(packet).then(() => toast.success("Claude packet copied"), () => downloadPacket());
									},
									disabled: !draft,
									children: "Export Claude packet"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									onClick: () => setLockOpen(true),
									disabled: !mixed,
									children: "Lock as new voice"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "KEEP — required for export",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: keep,
								onChange: (e) => setKeep(e.target.value),
								placeholder: "The structure or device that must not move"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-raised p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium tracking-widest text-subtle uppercase",
									children: "Test draft — for tuning, not for publishing"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyButton, { text: draft })]
							}), draftMut.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "shimmer-text mt-6 text-sm",
								children: "Writing a throwaway draft"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								className: "mt-3 min-h-64 bg-bg",
								value: draft,
								onChange: (e) => {
									setDraft(e.target.value);
									setMeters(null);
									setVerdict(null);
								},
								placeholder: "Run a test draft, then edit here and re-meter."
							})]
						}),
						meters && verdict ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-4 animate-fade-up",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium tracking-widest text-subtle uppercase",
										children: "Meters"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerdictChip, { verdict })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-3 sm:grid-cols-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, {
											label: "Identity drift",
											value: meters.identityDrift,
											reading: meters.identityDrift < 20 ? "Still you" : meters.identityDrift > 40 ? "The Core is slipping" : "Watch the edges"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, {
											label: "Donor influence",
											value: meters.donorInfluence,
											reading: !donor ? "No donor in this mix" : meters.donorInfluence < 15 ? "Donor adding nothing" : meters.donorInfluence > 60 ? "Clone risk" : "Technique visible, not a copy",
											band: donor ? {
												from: 15,
												to: 60
											} : void 0
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, {
											label: "Slop",
											value: meters.slopScore,
											reading: meters.slopScore > 35 ? "AI fingerprints showing" : `${meters.slopPerHundred.toFixed(1)} hits / 100 words`
										})
									]
								}),
								meters.overlapHits.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "clay",
									children: "Overlap blocker"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HighlightedDraft, {
										draft,
										grams: meters.overlapHits.map((h) => h.gram)
									})
								})] }) : null,
								meters.anchorsBroken.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium tracking-widest text-subtle uppercase",
									children: "Anchors broken"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 flex flex-col gap-1",
									children: meters.anchorsBroken.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
										className: "text-sm text-clay",
										children: a
									}, `${a}-${i}`))
								})] }) : null,
								meters.slopHits.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium tracking-widest text-subtle uppercase",
									children: "Slop hits"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 flex flex-col gap-1 text-sm text-muted",
									children: meters.slopHits.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
										h.label,
										" · ",
										h.count
									] }, h.label))
								})] }) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm leading-relaxed text-muted",
									children: meters.notes
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: downloadPacket,
									disabled: !keep.trim(),
									children: "Download .md"
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Test drafts are for tuning. Meter before you take anything to Claude. Nothing in this lab posts."
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: lockOpen,
				onOpenChange: setLockOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Lock as brand voice" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Saves the current dial mix as a new brand voice. Core anchors stay inherited, never dialed." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-4",
						value: brandName,
						onChange: (e) => setBrandName(e.target.value),
						placeholder: "e.g. Food house, Faith house"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "mt-4 w-full",
						onClick: () => lockMut.mutate(),
						disabled: !brandName.trim() || lockMut.isPending,
						children: [lockMut.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : null, "Save brand voice"]
					})
				] })
			})
		]
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-medium tracking-widest text-subtle uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1.5",
			children
		})]
	});
}
//#endregion
export { MixerPage as component };
