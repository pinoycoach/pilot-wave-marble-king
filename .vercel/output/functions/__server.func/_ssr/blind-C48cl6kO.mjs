import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { s as LoaderCircle } from "../_libs/lucide-react.mjs";
import { a as FORMAT_LABEL, i as FORMATS, l as PRESET_META, o as GENRE_PRESETS } from "./dials-C0yhxMAh.mjs";
import { t as authMiddleware } from "./middleware-CFIMLYZc.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as listDonorScans } from "./donors-hEHFOiaA.mjs";
import { i as listVoices } from "./voices-Bfr8_hyD.mjs";
import { n as Input, t as Badge } from "./input-BLivQn2L.mjs";
import { r as VerdictChip, t as Gauge } from "./gauge-85pE7Ttr.mjs";
import { t as Button } from "./button-o3RwDXu1.mjs";
import { t as Select } from "./select-k6bHngC0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/blind-C48cl6kO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var runBlindTest = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("c67645ce4734af08b334062520231c7032c1973282ac7a11e99127fbb9ffa065"));
var saveBlindRanking = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("591ca26e12b97417149437857c8c277bb47fb2a1ed868f80d354f4d30edf530a"));
function BlindPage() {
	const voices = useQuery({
		queryKey: ["voices"],
		queryFn: () => listVoices()
	});
	const donors = useQuery({
		queryKey: ["donors"],
		queryFn: () => listDonorScans()
	});
	const [voiceId, setVoiceId] = (0, import_react.useState)("");
	const [donorId, setDonorId] = (0, import_react.useState)("");
	const [topic, setTopic] = (0, import_react.useState)("");
	const [format, setFormat] = (0, import_react.useState)("x_post");
	const [preset, setPreset] = (0, import_react.useState)("none");
	const [cards, setCards] = (0, import_react.useState)(null);
	const [testId, setTestId] = (0, import_react.useState)(null);
	const [ranks, setRanks] = (0, import_react.useState)({});
	const [rewrites, setRewrites] = (0, import_react.useState)({});
	const [revealed, setRevealed] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (voices.data?.length && !voiceId) setVoiceId((voices.data.find((v) => v.kind === "core") ?? voices.data[0]).id);
	}, [voices.data, voiceId]);
	const mut = useMutation({
		mutationFn: async () => {
			const donor = donors.data?.find((d) => d.id === donorId);
			const res = await runBlindTest({ data: {
				voiceId,
				donorScanId: donorId,
				topic,
				format,
				preset,
				domain: donor?.domain ?? "",
				moveWeights: (donor?.moves ?? []).map((m) => ({
					name: m.name,
					weight: .5
				}))
			} });
			if (!res.ok) throw new Error(res.error);
			return res;
		},
		onSuccess: (res) => {
			setCards(res.cards);
			setTestId(res.testId);
			setRanks({});
			setRewrites({});
			setRevealed(false);
			toast.success("Three drafts. Labels hidden.");
		},
		onError: (err) => toast.error(err.message)
	});
	const killSignal = revealed && cards ? cards.every((c) => rewrites[c.key]) : false;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-6 sm:px-8 sm:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-widest text-subtle uppercase",
				children: "Kill-signal instrument"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl tracking-tight italic sm:text-5xl",
				children: "Blind test"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "Three drafts at blend 0 / 30 / 60, shuffled. If you would rewrite more than half of every version, the donor layer is not earning its place."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-3 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						value: voiceId,
						onChange: (e) => setVoiceId(e.target.value),
						"aria-label": "Voice",
						children: (voices.data ?? []).map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: v.id,
							children: v.name
						}, v.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: donorId,
						onChange: (e) => setDonorId(e.target.value),
						"aria-label": "Donor",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Pick a donor"
						}), (donors.data ?? []).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: d.id,
							children: [
								"@",
								d.handle,
								" · ",
								d.domain
							]
						}, d.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						value: format,
						onChange: (e) => setFormat(e.target.value),
						children: FORMATS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: f,
							children: FORMAT_LABEL[f]
						}, f))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						value: preset,
						onChange: (e) => setPreset(e.target.value),
						children: GENRE_PRESETS.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: g,
							children: PRESET_META[g].label
						}, g))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "mt-3",
				value: topic,
				onChange: (e) => setTopic(e.target.value),
				placeholder: "Topic"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "mt-4",
				disabled: mut.isPending || !voiceId || !donorId || !topic.trim(),
				onClick: () => mut.mutate(),
				children: [mut.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : null, "Run blind test · 6 Grok calls"]
			}),
			mut.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "shimmer-text mt-4 text-sm",
				children: "Writing and metering three blends"
			}) : null,
			cards ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 flex flex-col gap-6",
				children: [cards.map((card, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-lg bg-raised p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs font-medium tracking-widest text-subtle uppercase",
								children: [
									"Draft ",
									i + 1,
									revealed ? ` · blend ${card.blend}` : ""
								]
							}), revealed && card.verdict ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerdictChip, { verdict: card.verdict }) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 whitespace-pre-wrap text-sm leading-relaxed",
							children: card.draft
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap items-center gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-sm",
								children: ["Rank", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: "h-9 rounded-sm bg-bg px-2 text-sm shadow-[var(--shadow-border)]",
									value: ranks[card.key] ?? "",
									onChange: (e) => setRanks((prev) => ({
										...prev,
										[card.key]: Number(e.target.value)
									})),
									disabled: revealed,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "1",
											children: "1"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "2",
											children: "2"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "3",
											children: "3"
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: Boolean(rewrites[card.key]),
									onChange: (e) => setRewrites((prev) => ({
										...prev,
										[card.key]: e.target.checked
									})),
									disabled: revealed
								}), "I would rewrite more than half"]
							})]
						}),
						revealed && card.meters ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 grid gap-3 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, {
									label: "Drift",
									value: card.meters.identityDrift,
									reading: ""
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, {
									label: "Donor",
									value: card.meters.donorInfluence,
									reading: "",
									band: {
										from: 15,
										to: 60
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, {
									label: "Slop",
									value: card.meters.slopScore,
									reading: ""
								})
							]
						}) : null
					]
				}, card.key)), !revealed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: async () => {
						if (!testId) return;
						const ordered = [...cards].sort((a, b) => (ranks[a.key] ?? 99) - (ranks[b.key] ?? 99));
						await saveBlindRanking({ data: {
							testId,
							ranking: ordered.map((c) => c.runId),
							rewriteFlags: Object.fromEntries(cards.map((c) => [c.runId, Boolean(rewrites[c.key])]))
						} });
						setRevealed(true);
						toast.success("Revealed");
					},
					children: "Reveal blends"
				}) : killSignal ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md bg-clay-dim p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "clay",
						children: "Kill signal"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm",
						children: "Every version got the rewrite tick. This donor layer is not earning its place."
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Stored. Blend 0 is the control."
				})]
			}) : null
		]
	});
}
//#endregion
export { BlindPage as component };
