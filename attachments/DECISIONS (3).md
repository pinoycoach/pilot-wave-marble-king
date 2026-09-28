# DECISIONS — PillarMind × Kimi interpretation

The live record of open and resolved decisions for this project. Both the planning conversation
and the coding tool read this before acting, and update it the moment something changes — never
just in chat scrollback. Keep it short: one line to open an item, one line to close it.

Format per item: `<ID> — <one-line question> — STATUS — <resolution, if any>`

---

## Blocking

- N1 — What does an ungated 六合 produce: LOCKED_PARTIAL (DAILY-CORE's definition) or LOCKED_FULL (forensic practice)? (R-DEF-1) — BLOCKING — blocks Phase 2; the resolver cannot be deterministic while the two documents disagree. `v10_0_1f_addendum_A.md` §A5 gives an inference-tier lean toward LOCKED_FULL (ch. 7, not re-fetched for this specific question) — still not a ruling. The operator rules
- N2 — Layer seniority for U8: natal > decade > annual > monthly > daily, and does a natal×decade clash count as "standing" when an annual branch arrives? (R-DEF-2) — BLOCKING — blocks Phase 2 for the same reason. No evidence yet, per anyone's read. The operator rules
- N3 — Environment, stated per Build Standard pt 8: builder OS / runner OS / deploy OS — BLOCKING — proposed: Windows / Windows / Linux (Railway). Confirm before Claude Code writes a line

## Open

- N5 — Which Kimi model for interpretation (Phase 3)? — OPEN — decide after real Phase 1 output exists, on the evidence of output quality, not on the price table
- N6 — What goes into the runtime prompt: the five-file archive, or a compiled operating text of current rules only? — OPEN — recommendation: compile. The base 0.1e handover still states overturned rulings in confident engine voice
- N7 — Build on the existing Railway Python service (the gate app) or start a new one? — OPEN — recommendation: existing service, per the 22 Aug ruling that the reasoning layer is swapped and the plumbing kept
- N8 — E-19 school declaration (格局-first vs 扶抑 strength-first) — OPEN — not blocking: without it the app escalates the taxonomy on forking charts, which is a valid output. With it, fewer charts fork
- N9 — §C7's 1 Sep exception for marriage-timing content: record in the stack, or confirm the Spouse Timing Report already sits inside terrain language? — OPEN
- N10 — 0.1f housekeeping (U5 rewritten to F1, §2.6 table inserted from PZ-0.4.1, Appendix B written, register consolidated) — OPEN — do after N1/N2, before Phase 3
- N14 — Kimi never calls `$web_search`; it prints `$web_search: "..."` as plain text instead of invoking the tool (confirmed on all three runs, independently re-read by Claude Code on 23 Sep). Likely a tool-schema declaration mismatch in `kimi_audit.py`, not a model refusal — OPEN, NOT BLOCKING. Retrieval isn't Kimi's job in this build (see N4), so this only matters if something later needs Kimi to browse. A single test call with one question and the tool enabled would isolate it, per Claude Code's own offer — do this only if curious, not as a critical-path task

## Resolved

- N0 — Does Kimi ever compute pillars, void, hidden stems, locks or clashes? — RESOLVED — No. A deterministic resolver produces the Resolved Field Map; Kimi writes prose from the map only. Reason: every production failure logged since July (live stem pairs declared absent, 丙辛 gate violations, the Category M template string) was a model doing derivation. 23 Sep 2026
- N00 — How do Kimi's audit findings enter the spec? — RESOLVED — only through the operator, only with a URL, only at full-chapter tier for CLOSED (Category K); Kimi may not adopt, reject or draft patches. 23 Sep 2026
- N000 — Credentials — RESOLVED — MOONSHOT_API_KEY from the environment only; separate dev and prod keys; never in the repo, logs or client code (pt 15). 23 Sep 2026
- N4 — Can the Kimi API do the retrieval audit? — RESOLVED — No. Three runs (k3 once; default twice, the second after the script's own rejection of a zero-search answer) made zero `$web_search` tool calls, confirmed twice: first by the script's own provenance header, then independently re-read by Claude Code on Opus on 23 Sep (`kimi_audit_result.md`, `kimi_audit_result_run1.md`, `kimi_audit_result_k3_nosearch.md` all checked — zero searches, all three). Retrieval stays with the bench, which read 18 子平真詮 chapters in full in the 0.1f round. Kimi's role is interpretation from a resolved map, which needs no search. 23 Sep 2026
- N12 — Did the API cap hit during Phase-1 resolver work? — RESOLVED — No such work exists to have been interrupted. Read-only check by Claude Code (Opus, 23 Sep, this folder): no `CLAUDE.md` present, no `resolve_six_harmony_lock` or `check_layer_seniority` anywhere, no resolver code of any kind. The cap was hit during further attempts at the retrieval-audit script (N4's task), which never had anything to build. **CLAUDE.md never reached this folder — that is the actual gap**, not a Kimi failure mid-build. Corrected copy supplied same day; Phase 1 has not yet started. 23 Sep 2026
- N13 — Stack-vs-exhibits layout matches Addendum A §A6? — RESOLVED, was NO — `v10_stack_audit_2026-09.md` was sitting in `stack/`, so `kimi_audit.py --stack ./stack` sent it to Kimi as a rule, not an exhibit; the ZX/CX handover files named in §A6 were never in the folder at all. Fix: move the stack audit to `exhibits/` (moot for Phase 1, which makes no Kimi calls — relevant again only if the audit script is revisited). 23 Sep 2026

## Revisit

- N11 — kimi-k2.6 for web-search work — REVISIT — moot until N14 is diagnosed; even fixed, retrieval stays with the bench per N4/N0

---

*When Claude Code (or any coding tool) reports "still open" items in a phase report, they should
match this file exactly — if they don't, this file is stale and gets fixed first, before more work
lands on top of a decision nobody can see the current status of.*
