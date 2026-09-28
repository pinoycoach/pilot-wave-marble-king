# Phase 0 Kickoff — how to fill this in for a new project

Use this every time you bring `BUILD-STANDARD.md` and `DECISIONS.md` into a brand-new project
folder, before Claude Code writes a line of product code. Copy the block below, fill in the
bracketed parts, paste it as your first message in that folder.

The two sections that matter most, and why:

- **RESOLVED** is everything Claude Code has no other way to know, because it has no memory of
  our past conversations. If a fact lives only in my head or in old chats, and this project needs
  it, it goes here — otherwise it's invisible to the build.
- **BLOCKING** is the honest version of "what could go wrong that fengshui.mom didn't have to
  worry about." Every project has a different shape of risk — fengshui.mom's was accuracy of a
  calculation with no real-world stakes if wrong; the next one might be real facts about real
  people or companies, or money changing hands, or something else. Naming the actual risk here,
  specifically, is more useful than a generic "be careful."

---

## The template

```
This is a brand-new project. Nothing exists yet except two files I've placed here:
docs/BUILD-STANDARD.md and DECISIONS.md. Read both first.

This is a Phase 0 audit only. Do NOT write product code yet — [name what "product code" means
here: website code, calculator code, app code, whatever applies]. Set up the four files
BUILD-STANDARD.md requires (CLAUDE.md, RULES.md, GOLDEN-CASES.md, HANDOVER.md) as skeletons,
seeded with what I already know below, then stop and tell me what's missing.

Record the following in DECISIONS.md, dated today:

RESOLVED:
- [What is this project? Domain/name, one line.]
- [What does it actually do, for whom, in one or two sentences — not the full spec, just enough
  that Claude Code isn't guessing at the shape of the thing.]
- [How does it make money, if it does — or explicitly state it doesn't, the way fengshui.mom
  didn't.]
- [Any existing asset already built or decided that this project reuses — a calculation engine,
  a brand voice, a design system, a prior product it's paired with. Name it and where it lives.]
- [Anything explicitly OUT of scope for this first phase, even if it's planned later — so Claude
  Code doesn't quietly start building it.]

BLOCKING:
- [The real, specific version of "what's different about this project's stakes compared to the
  last one." Not every project needs a lawyer or an independent calculation check — but every
  project needs this question asked and answered on purpose, not defaulted.]
- [Any fact this project depends on that doesn't have a verified, independent source yet — the
  equivalent of fengshui.mom's day-pillar math needing lunar-python before anything shipped. If
  nothing like this exists yet, say so plainly and ask where it should come from — don't let
  Claude Code invent it.]

CLAUDE.md should state plainly: this project follows docs/BUILD-STANDARD.md in full, including
points 8-17, not just the original seven.

Once the four skeleton files exist and DECISIONS.md reflects the above, stop. Report what's still
missing before real building starts. If anything above is unclear or you're tempted to fill a gap
with your own guess, ask me instead of guessing.
```
