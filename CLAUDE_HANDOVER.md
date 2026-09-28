# Voice Lab — Handover to Claude

Paste this whole file into a Claude chat. It is the as-built report of the app Grok shipped, plus the contract for how Claude should write from a packet.

The original spec Grok built from is `attachments/VOICE_LAB_HANDOVER.md`. This document is the reverse: **what actually exists now**.

---

## 0. One paragraph

**Voice Lab** is a private, single-owner writer's desk. It researches what is trending on X, measures how a leading public voice *writes* (technique, not content), and lets the owner mix a few of that voice's structural moves into his own Core using 11 dials. Grok writes throwaway test drafts and meters them for identity drift, donor influence, and AI fingerprints. **Final writing happens here, in Claude, from an exported packet.** Nothing in the app posts, schedules, or talks to an X write API.

Owner: Vitruviano / Napoleon. Same design language as **Diverge**: dark, quiet, editorial serif headings, one big number on a meter, structured JSON briefs, citations, no fabricated posts.

---

## 1. What shipped (as-built)

Auth ON. Database ON. Every server function uses `authMiddleware` and scopes by verified `userId`. xAI Responses API from the server only (`grok-4.6` then `grok-4.5`). Every AI call is a button press. No calls on page load.

### Screens (left rail + mobile 6-tab bar)

| Route | Screen | What it does |
|---|---|---|
| `/` | **Mixer** | The lab. Pick voice, optional donor, optional saved trend, format, genre preset. Blend slider + 11 dials + move weights. Test draft → Meter → Export Claude packet → Lock as brand voice. |
| `/voices` | **Voices** | Library of Core + brand voices. Edit name, source text, anchors, dials, per-voice locks, banned phrases. Duplicate as brand voice. Domain locks. Editable slop-pattern list. |
| `/donors` | **Donors** | Scan a public X handle + domain. Dial fingerprint vs chosen base voice. 5–10 structural moves, signature phrases under a never-use label. 24h cache, explicit Rescan. Send to Mixer. |
| `/trends` | **Trends** | 48h X trend scan. Headline, crowd read, 3–5 unused angles, leading voices, citations, quiet flag. Send to Mixer / scan a leading voice as donor. 30 min cache. |
| `/blind` | **Blind** | Three drafts at blend 0 / 30 / 60, shuffled, labels hidden. Rank them. Tick “I’d rewrite more than half.” Reveal. Kill-signal if every version gets the rewrite tick. |
| `/results` | **Results** | Manual post-hoc log (platform, date, views, shares, saves, replies, long replies). Share rate and long-reply rate vs rolling baseline for that voice + domain + platform. No auto-tuning. |
| `/login` | **Login** | Grok sign-in. Gate-signed-in viewers skip this. |

### Seeded on first sign-in

- Voice **Napoleon Core** (`kind: core`) with the 11 seed dials, 8 identity anchors, and the full **napoleon-voice v3.1** skill as `sourceText` (SKILL.md + contrast calibration). Banned list seeded from the skill's explicit never-lines.
- Domain lock: `bazi` → `commercial_pull` max 15, reason “Bazi writing stays a gift. No hard ask.”
- Domain lock: `bazi` → `commercial_pull` max 15, reason “Bazi writing stays a gift. No hard ask.”
- Default slop regex list (It’s not X it’s Y, Here’s the thing, In today’s…, delve, tapestry, navigate the, unlock, game-changer) plus hardcoded scans for rhetorical-question openers, consecutive three-item lists, em-dash density, summarizing moral closes.

### Formats

`x_post` · `x_thread` · `facebook_post` · `newsletter_section` · `podcast_segment_outline` · `book_scene`

For `x_thread`, Grok returns JSON `{ posts: string[] }` (each ≤280 chars) and the Mixer joins them with `---`.

### Genre presets (dial shifts, Core untouched)

| Preset | Shift | Note |
|---|---|---|
| none | — | |
| suspense | hook_force +25, resolution −20 | Withhold. Delay the reveal. |
| romance | confession_depth +10, humor +10 | Longing before arrival. |
| explainer | teaching_density +30, accessibility +25 | Name the framework. Assume less. |
| commentary | certainty +15 | More declarative. Entry mode stays. |
| devotional | certainty −10, commercial_pull locked to 0 | No ask. Soften the verdict. |

---

## 2. The voice model (do not re-decide)

Voice has two layers:

1. **Core (identity)** — who is speaking and why. Source document + identity anchors. **Never dialed. Never weighted. Never borrowed from a donor.**
2. **Surface (technique)** — the 11 dials and borrowed *moves*. This is what the Mixer changes.

A **donor** is a leading public X handle in a domain. The app measures them on the same dials and extracts structural moves (abstract patterns). The owner borrows *moves and dial positions*, never words, never their persona, never their signature phrases.

Brand voices inherit Core source + anchors. Only dials (and banned list) differ.

### Dials (0–100)

| key | 0 | 100 | Napoleon Core seed |
|---|---|---|---|
| `entry_mode` | scene / moment | thesis / claim | 10 |
| `confession_depth` | guarded, impersonal | says the uncomfortable thing first | 80 |
| `teaching_density` | story; lesson implied | named framework; explicit takeaways | 20 |
| `certainty` | open, observer | declarative, instructive | 35 |
| `authority_source` | lived experience | system, credentials, lineage, data | 20 |
| `accessibility` | intimate, shared context | mass audience, assumes nothing | 45 |
| `hook_force` | quiet entry | pattern-interrupt hook | 40 |
| `humor` | none | comic-forward | 35 |
| `rhythm_variance` | even, metered | long breaths, short hits, fragments | 75 |
| `commercial_pull` | a gift; no ask | direct offer and CTA | 15 |
| `resolution` | open, widening close | tidy, resolved takeaway | 20 |

### Core anchors (non-negotiable)

1. Enter through a moment, never a topic
2. Personal to universal, always that direction
3. The object carries the feeling; no named emotions
4. At least one true scene per piece
5. Short sentences carry the weight; never explain what just landed
6. Dry, observational humor that sits inside the sad thing and does not resolve it
7. Never punches down
8. Ends open; the line before the close widens

Locks beat everything: donor blend, presets, hand nudges. Slider stops at the lock line.

---

## 3. What the app can do, end to end

Typical loop:

1. Sign in. Napoleon Core is there.
2. **Voices** — paste the real voice skill into `sourceText`. Tune anchors/dials/locks/banned if needed. Duplicate into brand houses (food, faith, finance, etc.).
3. **Trends** (optional) — scan “what’s trending in [domain]”. Pick an unused angle. Send to Mixer, or scan a leading handle as a donor.
4. **Donors** — scan `@handle` + domain (e.g. `bazi`). Read their dials against Core. Note the structural moves. Signature phrases are for the never-use list only. Send to Mixer.
5. **Mixer** — pick base voice, donor, topic/trend, format, preset. Blend 0–100 moves every unlocked dial from base toward donor. Turn on only the moves you want (default 0). Nudge individual dials. **Test draft (Grok)** — labeled “for tuning, not for publishing.” Edit. **Meter it.**
6. Meters:
   - **Identity drift** 0–100 (0 = unmistakably Core). Stop if >40.
   - **Donor influence** 0–100, target band 15–60. Adjust if clone (>60) or donor adding nothing (<15 with a donor selected).
   - **Slop** 0–100. Adjust if >35.
   - Overlap blocker: 6-gram overlap vs donor samples + signature phrases → forced `adjust`, hits highlighted.
   - Verdict chip: `stop` / `adjust` / `ready for Claude`.
7. Fill **KEEP** (required) — the structure/device that must not move.
8. **Export Claude packet** — copies to clipboard, also downloadable as `claude-packet.md`.
9. **Blind** if you want a kill-signal on the donor layer (3 draft + 3 meter Grok calls).
10. After publishing *elsewhere*, **Results** — log numbers by hand. See which dials/moves beat baseline.

**It cannot:** post, schedule, auto-tune dials from results, mix multiple donors at once, or write the final piece. That last one is Claude’s job.

---

## 4. The Claude packet (what you will actually receive)

Assembled in `src/lib/voice/packet.ts`. Shape:

```
VOICE: <voice name> - use my voice skill as the source of truth.
KEEP: <the structure/device that must not move>
VOICE SKILL (source of truth):
  <full napoleon-voice v3.1 + contrast calibration>
DIAL SETTINGS (0-100, with meanings):
  <each dial: value - plain-language reading from its anchors>
BORROWED TECHNIQUES (moves, not words):
  - <move name> (weight 0.0-1.0): <abstract pattern>
    <description>
NEVER USE:
  - <banned phrases + donor signature phrases>
FORMAT: <human label>   GENRE: <preset + note>
BRIEF (facts only - do not add facts):
  Topic: …
  Headline: …
  Crowd read: …
  Chosen angle: …
  Citations:
  - …
TEST DRAFT (reference only, rewrite freely):
  <Grok's throwaway draft>
INSTRUCTION: Write in my voice. Obey the VOICE SKILL. Keep <KEEP>. Dosage Rule. Zero em dashes. Roughen by subtraction.
```

`KEEP` is required in the Mixer before copy/download. If a packet still says `(not specified)`, ask the owner; do not invent a KEEP.

Dial readings in the packet:
- ≤20 → the 0-anchor sentence
- ≥80 → the 100-anchor sentence
- otherwise → `0-anchor → 100-anchor (value)`

A 0.2-weight move should appear at most once. Weight 0 means the move is off — it will not be listed.

---

## 5. How Claude should write from a packet

You are the final writer. Grok already did research, technique extraction, and a throwaway draft. Treat the packet as a brief, not as copy to polish.

### Do

- Write in the owner’s voice. The **VOICE SKILL** in the packet is the source of truth (napoleon-voice v3.1). It outranks the test draft. KEEP and NEVER USE still win.
- Obey **KEEP**. If KEEP and a dial conflict, KEEP wins.
- Use **BORROWED TECHNIQUES** as structural moves only: cadence, entry shape, list-then-reverse, withhold, etc. Never the donor’s wording, persona, or biography.
- Stay inside **BRIEF**. If a fact is not there, leave it out. Do not invent posts, quotes, handles, stats, or engagement.
- Hit the **FORMAT**. X post = one post. X thread = posts that can stand as a thread, each under 280 characters. Newsletter = a section, not a whole issue. Podcast = outline. Book scene = a scene.
- Let the dials set *register*, not identity. High `rhythm_variance` means uneven sentence length, not a different person. Low `commercial_pull` means no ask.
- Roughen. The last instruction is literal. Prefer the slightly too-plain line over the smooth one. Cut the summarizing moral. Do not explain what just landed.
- End open unless `resolution` is high (80+). The line before the close should widen.

### Do not

- Name, reference, or imitate the donor as a person. The Mixer never tells you who they are; do not try to guess.
- Use anything under **NEVER USE**, even if it would sound good.
- Quote the test draft. Rewrite freely. If the test draft already sounds like Grok (smooth, “here’s the thing”, three-item lists, em-dash heavy, tidy takeaway), that is the thing to kill, not keep.
- Add facts, citations, or “as everyone on X is saying” unless the brief contains it.
- Punch down. Name emotions instead of letting the object carry them. Enter through a topic instead of a moment (unless `entry_mode` is high).
- Produce a version that is 90% the test draft with adjectives swapped. If you cannot beat the draft, say so and write a different entry.

### Quality bar before you hand copy back

- A stranger who knows the owner’s work would still recognize it.
- A stranger who knows the donor would *not* think this is them, even if a structural move is visible.
- No signature phrases, no 6-gram overlap with the donor, no AI-fingerprint constructions from the slop list in §1.
- KEEP is intact.
- Format constraints held (especially 280 for thread posts).
- You did not add a fact.

If the owner also pastes meter notes (`anchorsBroken`, overlap hits, slop labels, Grok’s `notes` field), treat those as a punch list. Fix them in the rewrite; do not argue with them.

---

## 6. Engineering map (if Claude is also continuing the build)

Stack: TanStack Start + React 19 + Tailwind v4 + Neon/Postgres + Better Auth + xAI Responses API. App builder sandbox; preview on `:8080`; `startup.sh` owns revive.

| Area | Files |
|---|---|
| Dials, presets, slop seeds | `src/lib/voice/dials.ts` |
| Blend / locks | `src/lib/voice/mix.ts` |
| Packet | `src/lib/voice/packet.ts` |
| Overlap 6-gram | `src/lib/voice/overlap.ts` |
| Slop scan | `src/lib/voice/slop.ts` |
| Verdict | `src/lib/voice/verdict.ts` |
| Zod schemas | `src/lib/voice/schemas.ts` |
| xAI client | `src/lib/xai.ts` |
| Server functions | `src/lib/api/{voices,donors,trends,runs,blind,results,settings,seed,map}.ts` |
| Mixer | `src/routes/_app/index.tsx` |
| Shell / nav | `src/components/app-shell.tsx` |
| Schema | `migrations/0002_schema.sql` |
| Auth routes | `src/routes/login.tsx`, `src/routes/api/auth/$.ts` |

Tables: `voices`, `domain_locks`, `trend_scans`, `donor_scans` (samples JSON, purge after 7 days, never rendered in full), `runs`, `blind_tests`, `results`, `lab_settings`.

Caches: trend 30 min / normalized query; donor 24h / handle+domain. Caps: scans 6000 tokens, drafts 2500, meter 1200. Blind = 3+3 calls.

Verdict in code (`computeVerdict`):
- `stop` if identityDrift > 40 or any Core anchor listed twice in `anchorsBroken`
- `adjust` if overlap hits, slopScore > 35, donorInfluence > 60, or donor selected and donorInfluence < 15
- else `ready for Claude`

### Non-negotiables (still in force)

1. Nothing posts.
2. Never write *as* the donor, never name them in drafts, never use signature phrases, never quote them. Overlap blocker enforces this in code.
3. No fabricated posts, quotes, or engagement. `quiet: true` is valid.
4. Locks beat donor pulls, presets, and future metric tuning.
5. The Core is never a dial.
6. Donor sample text stays server-side and is purged after 7 days.

### Explicitly not built (do not add unless asked)

- Suggested dial settings from Results
- Multiple donors in one mix
- Voice-to-voice diff view
- Any posting / scheduling integration

### Owner still needs to do in the running app

1. Confirm Napoleon Core on Voices shows the v3.1 skill (Soul, Nine Moves, Music, Roughening Pass, Dosage Rule). Re-tune seed dials only if they are wrong.
2. Run one real donor scan, one Mixer pass, one Blind test, one packet export — that is the original “done” loop.

The Claude packet now embeds the full voice skill under `VOICE SKILL`. That section outranks the test draft. KEEP and NEVER USE still win.

---

## 7. If no packet is attached

If the owner pasted this handover without a Mixer export, you have the product and the voice model, not a piece to write. Ask for:

- the Claude packet from Mixer, or
- KEEP + format + topic + any donor moves they want on

Do not invent a trend brief or a donor.

If they want engineering work instead of a draft, start from §6 and the original spec in `attachments/VOICE_LAB_HANDOVER.md`. Prefer editing in place. Do not re-litigate auth, posting, or the Core-vs-surface split.
