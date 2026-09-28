# VOICE LAB — Build Handover for Grok

**Paste this whole file into a new Grok app-builder chat.** (Or drop it into the workspace as `AGENTS.project.md`.)

---

## 0. The ask, in one paragraph

Build **Voice Lab**: a private, single-owner web app for a writer who publishes across many brands. It researches what is trending on X, measures how a leading voice in a topic *writes* (not what they say), and lets the owner mix a few of that voice's structural techniques into his own voice using dials, then meters the result for drift, donor influence, and AI fingerprints before anything is written for real. Grok does research, analysis, and quick test drafts. **Final writing happens outside the app, in Claude**, via an exported "Claude packet." **Nothing ever posts automatically.**

Same design language and engineering pattern as the owner's existing app **Diverge** (a Polymarket-vs-X "crowd vs capital" desk): dark, quiet, editorial serif headings, one big number on a meter, structured JSON briefs, citations, no fabricated posts.

---

## 1. Build decisions (closed, do not re-decide)

- **Auth: ON, single owner.** Per-user data, saved across devices, and it protects the owner's xAI key from strangers. `authMiddleware` on every server function; every query scoped by the verified `context.userId`.
- **Database: ON** (Neon/Postgres per the workspace `neon` skill). Tables in §6.
- **AI: xAI Responses API** from server functions only (`XAI_API_KEY`, never client-side). Model order: try `grok-4.6`, fall back to `grok-4.5` — confirm current names at docs.x.ai.
- **Every AI call is user-initiated** (a button press). No calls on page load, no loops, no polling. Cache per §7.
- **No posting integrations.** No X write API, no scheduling. Copy buttons only.

---

## 2. The model the app is built around

Voice has two layers:

1. **Core (identity):** who is speaking and why. Stored as a pasted voice-source document (the owner's full writing-voice skill) plus a short list of *identity anchors*. **Never dialed. Never weighted.**
2. **Surface (technique):** register and craft moves. This is what the dials control.

A **donor** is a leading voice in a topic (any public X handle). The app measures the donor on the same dials and extracts their **structural moves**. The owner then borrows *moves and dial positions*, never words.

A romance writer and a suspense writer differ on the surface; a good storyteller is the same underneath. Genres are therefore **dial presets** (§3.3), not separate voices.

A mixed setting the owner likes can be **locked as a new named voice** (a brand house voice, e.g. for a food/wellness brand, a faith brand, a finance-info brand). Brand voices inherit the owner's Core.

---

## 3. The dials

### 3.1 Dial set (each 0–100)

| key | 0 means | 100 means |
|---|---|---|
| `entry_mode` | enters through a specific scene or moment | enters through a thesis or claim |
| `confession_depth` | guarded, impersonal | says the uncomfortable thing first |
| `teaching_density` | story; the lesson is implied | named framework; explicit takeaways |
| `certainty` | open, observer, questions allowed | declarative, instructive |
| `authority_source` | lived experience | system, credentials, lineage, data |
| `accessibility` | intimate; assumes shared context | mass audience; assumes nothing |
| `hook_force` | quiet entry | pattern-interrupt hook |
| `humor` | none | comic-forward |
| `rhythm_variance` | even, metered sentences | high variance: long held breaths, short hits, fragments |
| `commercial_pull` | a gift; no ask | direct offer and CTA |
| `resolution` | open, widening close | tidy, resolved takeaway |

Every dial carries its two anchor descriptions into every prompt, so the model interprets numbers the same way each time.

### 3.2 Seed profile: "Napoleon Core"

Create on first sign-in, editable:

```json
{
  "name": "Napoleon Core",
  "kind": "core",
  "dials": {
    "entry_mode": 10, "confession_depth": 80, "teaching_density": 20,
    "certainty": 35, "authority_source": 20, "accessibility": 45,
    "hook_force": 40, "humor": 35, "rhythm_variance": 75,
    "commercial_pull": 15, "resolution": 20
  },
  "anchors": [
    "Enter through a moment, never a topic",
    "Personal to universal, always that direction",
    "The object carries the feeling; no named emotions",
    "At least one true scene per piece",
    "Short sentences carry the weight; never explain what just landed",
    "Dry, observational humor that sits inside the sad thing and does not resolve it",
    "Never punches down",
    "Ends open; the line before the close widens"
  ],
  "sourceText": "(owner pastes his full voice skill here)"
}
```

The owner will re-tune these values. They are a starting point, not a measurement.

### 3.3 Genre presets (dial overrides + one convention note)

Ship these editable presets: `none`, `suspense` (hook_force +25, resolution −20, note: withhold, delay the reveal), `romance` (confession_depth +10, humor +10, note: longing before arrival), `explainer` (teaching_density +30, accessibility +25), `commentary` (certainty +15, entry_mode stays), `devotional` (certainty −10, commercial_pull locked 0). A preset shifts dials; the Core anchors stay.

### 3.4 Locks (the veto layer)

A lock pins a dial to a max or min value. Locks override donor pulls, presets, and metrics. Locks can be set per voice **and per domain**. Seed one domain lock:

- Domain `bazi` → `commercial_pull` max 15.

When a mix tries to exceed a lock, the slider stops at the lock line and shows a small lock icon with the reason.

---

## 4. Screens

Left rail navigation, Diverge style. Mobile works (single column).

### 4.1 Voices
Library of voice profiles: Core + brand voices. Edit name, source text, anchors, dials, locks, banned-phrase list. Show each voice as an 11-bar dial fingerprint. "Duplicate as brand voice."

### 4.2 Trends
Input: a topic, a keyword, or "what's trending in [domain]." Runs a **Trend Scan** (§5.1). Result card: headline, crowd read, 3–5 angles nobody is taking, leading voices (handles + why they lead), citations, "quiet" state if X is thin. Buttons: *Scan a leading voice as donor*, *Send to Mixer*.

### 4.3 Donors
Input: an X handle + a domain label (e.g. `bazi`, `manifestation`, `ph-politics`). Runs a **Donor Scan** (§5.2). Result: the donor's dial readings drawn against the selected base voice (two markers per bar, like Diverge's meter), their 5–10 structural moves with frequency, and their signature phrases shown under a red "never use" label. Cached; show scan age and a Rescan button.

### 4.4 Mixer (the lab — the main screen)
- Pick: base voice, donor (optional), topic (free text or a saved Trend Scan), format, genre preset.
- Formats: `x_post`, `x_thread`, `facebook_post`, `newsletter_section`, `podcast_segment_outline`, `book_scene`.
- **Donor blend slider (0–100):** moves every unlocked dial from the base value toward the donor value proportionally. Individual dials can then be nudged by hand. Each slider shows the base marker, donor marker, current value, and any lock line.
- **Move weights:** each donor move gets a 0–1 weight (0 = off). Default all off; the owner turns on what he wants.
- Buttons: **Test draft (Grok)**, **Meter it**, **Export Claude packet**, **Lock as new voice**.
- **Meters panel** (§5.4) with three gauges and a verdict chip.
- Draft panel is editable; re-meter after edits.

### 4.5 Blind Test
Pick a base voice, donor, topic, format. The app generates **three drafts at blend 0 / 30 / 60**, shuffles them, and hides the labels. The owner ranks them and ticks "I'd rewrite more than half" on any draft. Then reveal. Store the result. This is the kill-signal instrument: if every version gets the rewrite tick, the donor layer isn't earning its place.

### 4.6 Results
Manual log per run after it is published elsewhere: platform, posted date, views, shares, saves, replies, long replies (over one sentence). Computed: shares/views, long-replies/views. Compare to the owner's rolling baseline **for that voice + domain + platform**. A simple table: which dial settings and moves were on for the runs that beat baseline. No auto-tuning in v1; just show it clearly.

---

## 5. AI calls (server functions)

All use `POST https://api.x.ai/v1/responses`, low reasoning effort unless noted, JSON-only output, parsed by extracting the first `{…}` block, then validated with zod. On a 400/404, try the fallback model. Retry at most once. Surface errors plainly.

Research calls enable tools: `x_search` (with `from_date` set to the window start) and `web_search`. For donor scans, restrict `x_search` to the donor handle using the tool's handle filter (check docs.x.ai for the parameter name; if none exists, instruct the model to search `from:<handle>`).

**System instruction shared by all research calls:**
> You analyze how people write on X. Be specific. Cite real posts. Never fabricate posts, quotes, or engagement. If X is quiet on this, say so and set `quiet: true`. Output JSON only.

### 5.1 Trend Scan — window: last 48h

```ts
const TrendScanSchema = z.object({
  quiet: z.boolean(),
  headline: z.string().min(4).max(180),
  crowdRead: z.string().min(8).max(1200),
  angles: z.array(z.string().min(8).max(300)).min(1).max(5), // angles few are taking
  leadingVoices: z.array(z.object({
    handle: z.string(), why: z.string().max(300),
  })).max(5),
  watch: z.string().max(400), // what moves this next
  citations: z.array(z.object({
    source: z.string(), url: z.string().optional(), note: z.string(),
  })).max(8),
});
```

### 5.2 Donor Scan — window: last 30 days, their own posts

Prompt tells the model: *describe technique, not content. Abstract patterns only; never reproduce more than 8 consecutive words of any post in any field except `signaturePhrases`.*

```ts
const DIAL_KEYS = ["entry_mode","confession_depth","teaching_density","certainty",
  "authority_source","accessibility","hook_force","humor","rhythm_variance",
  "commercial_pull","resolution"] as const;
const Dials = z.object(Object.fromEntries(
  DIAL_KEYS.map(k => [k, z.number().min(0).max(100)])) as Record<typeof DIAL_KEYS[number], z.ZodNumber>);

const DonorScanSchema = z.object({
  quiet: z.boolean(),
  handle: z.string(),
  sampleCount: z.number().int().min(0),
  dials: Dials,
  dialNotes: z.string().max(1200),           // one line per notable dial
  moves: z.array(z.object({
    name: z.string().max(60),                // e.g. "Stacked list, reversed last item"
    description: z.string().max(400),
    pattern: z.string().max(200),            // abstract template, e.g. "[common belief]. Wrong. [reframe]."
    frequency: z.enum(["signature","frequent","occasional"]),
  })).min(1).max(10),
  signaturePhrases: z.array(z.string().max(80)).max(15), // stored ONLY for the overlap blocker
  topicsNow: z.array(z.string()).max(6),
  citations: z.array(z.object({
    source: z.string(), url: z.string().optional(), note: z.string(),
  })).max(8),
});
```

Also store up to 30 raw sample posts **server-side only** (never rendered in full) for the overlap check in §5.4, and purge them after 7 days.

### 5.3 Test Draft

Input: base voice (sourceText, anchors, banned list), final dial values with anchor text, enabled moves with weights, genre note, format, topic or Trend Scan brief.

Rules baked into the prompt:
- The Core anchors are non-negotiable; dials only change register and technique.
- Use enabled moves roughly in proportion to weight; a 0.2 move appears at most once.
- **Never name, reference, or imitate the donor as a person. Never use a signature phrase. Never quote the donor.**
- Use only facts present in the brief; if something is uncertain, leave it out.
- Output plain text for the format; for `x_thread` return an array of posts, each under 280 characters.

Label the result in the UI: **"Test draft — for tuning, not for publishing."**

### 5.4 Meter It (two parts)

**Part A, deterministic (code, no AI):**
- **Overlap blocker:** word 6-gram overlap between the draft and the donor's stored sample posts + signature phrases. Any hit is shown highlighted, and the verdict is forced to `adjust`.
- **Slop scan:** regex list, user-editable, seeded with common AI fingerprints: "it's not X, it's Y" constructions; "Here's the thing"; "In today's [anything]"; "delve"; "tapestry"; "navigate the"; "unlock"; "game-changer"; rhetorical-question openers; three-item lists in consecutive sentences; em-dash density above 1 per 60 words; paragraphs ending in a summarizing moral. Count hits per 100 words.

**Part B, judge call (Grok, JSON):**

```ts
const MeterSchema = z.object({
  identityDrift: z.number().min(0).max(100),   // 0 = unmistakably the base voice
  donorInfluence: z.number().min(0).max(100),  // how much the donor's technique is visible
  slopScore: z.number().min(0).max(100),       // AI-fingerprint level, informed by Part A hits
  anchorsBroken: z.array(z.string()).max(8),   // which Core anchors the draft violates
  notes: z.string().max(800),                  // specific lines to fix
});
```

**Verdict chip (computed in code):**
- `stop` if identityDrift > 40 or any anchor is broken twice or more.
- `adjust` if overlap hits > 0, or slopScore > 35, or donorInfluence > 60 (clone risk), or donorInfluence < 15 while a donor is selected (donor adding nothing).
- `ready for Claude` otherwise.

Gauges render like Diverge's divergence meter: one big number, a thin track, a one-line reading underneath. The donorInfluence gauge shows a shaded target band (15–60).

---

## 6. Data

```sql
voices(id uuid pk, user_id, name, kind text check (kind in ('core','brand')),
  parent_id uuid null, source_text text, anchors jsonb, dials jsonb,
  locks jsonb, banned jsonb, created_at, updated_at)

domain_locks(id, user_id, domain text, dial text, max int null, min int null, reason text)

trend_scans(id, user_id, query text, result jsonb, model text, scanned_at)

donor_scans(id, user_id, handle text, domain text, result jsonb,
  samples jsonb, samples_purge_at timestamptz, model text, scanned_at)

runs(id, user_id, voice_id, donor_scan_id null, trend_scan_id null,
  recipe jsonb,   -- final dials, blend, move weights, preset, format, topic
  draft text, meters jsonb, verdict text, created_at)

blind_tests(id, user_id, run_ids uuid[], ranking jsonb, rewrite_flags jsonb, created_at)

results(id, user_id, run_id, platform text, posted_at date, views int, shares int,
  saves int, replies int, long_replies int)
```

All rows owned by `user_id`; every query scoped by the verified user.

---

## 7. Cost control

- Trend Scan cache: 30 min per normalized query.
- Donor Scan cache: 24 h per handle + domain. Rescan is explicit.
- Draft and Meter: never automatic. Meter only runs on button press.
- Blind Test = 3 draft calls + 3 meter calls; show that count on the button.
- `max_output_tokens` caps: scans 6000, drafts 2500, meter 1200.

---

## 8. Export Claude packet

One button, copies to clipboard, also downloadable as `.md`. Assembled from the run:

```
VOICE: <voice name> — use my voice skill as the source of truth.
KEEP: <owner fills: the structure/device that should not move>
DIAL SETTINGS (0–100, with meanings):
  <each dial: value — plain-language reading from its anchors>
BORROWED TECHNIQUES (moves, not words):
  <enabled moves with weights and abstract patterns>
NEVER USE: <donor signature phrases + banned list>
FORMAT: <format>   GENRE: <preset + note>
BRIEF (facts only — do not add facts):
  <trend brief: headline, crowd read, chosen angle, citations>
TEST DRAFT (reference only, rewrite freely):
  <current draft>
INSTRUCTION: Write in my voice. Keep [KEEP]. Roughen.
```

The **KEEP** field is a required text input on the Mixer before export.

---

## 9. Non-negotiables

1. Nothing posts. No X write access, no scheduling. Copy and export only.
2. The app never writes *as* the donor, never names them in drafts, never uses their signature phrases, never quotes them. The overlap blocker enforces this in code.
3. No fabricated posts, quotes, or engagement in any scan. `quiet` is a valid answer.
4. Locks beat everything: donor pulls, presets, and future metric tuning.
5. The Core is never a dial.
6. Donor sample text stays server-side and is purged after 7 days.

---

## 10. Ship order

**v1 (build now):** auth + DB, Voices (with seed), Donor Scan, Mixer with dials/locks/blend/move weights, Test Draft, Meter It (both parts), Export Claude packet, Blind Test.

**v1.1:** Trend Scan screen + "send to Mixer," Results log with baseline comparison.

**Later (do not build yet):** suggested dial settings from Results, multiple donors in one mix, voice-to-voice diff view.

**Done means:** the owner can sign in, see Napoleon Core, scan one public handle, run a Blind Test at 0/30/60, see all three meters with verdict chips, and copy a Claude packet — on desktop and phone.
