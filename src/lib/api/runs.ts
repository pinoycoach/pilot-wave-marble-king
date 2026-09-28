import { createServerFn } from "@tanstack/react-start";
import { ownerMiddleware } from "@/lib/owner";
import { getSql } from "@/lib/db";
import { asJson, newId } from "@/lib/utils";
import { DIAL_KEYS, DIAL_META, FORMAT_LABEL, PRESET_META, clampDial, type DialKey, type Dials, type Format, type GenrePreset } from "@/lib/voice/dials";
import { mixDials } from "@/lib/voice/mix";
import { findOverlap } from "@/lib/voice/overlap";
import { enabledMoves } from "@/lib/voice/packet";
import { DraftSchema, MeterJudgeSchema } from "@/lib/voice/schemas";
import { scanSlop } from "@/lib/voice/slop";
import type { DonorMove, MeterResult, MoveWeight, Recipe, Run, SlopPattern, Verdict } from "@/lib/voice/types";
import { computeVerdict, slopOnlyBlocker } from "@/lib/voice/verdict";
import { grokJson } from "@/lib/xai";
import { mapDomainLock, mapDonor, mapRun, mapSlop, mapVoice, type DomainLockRow, type DonorRow, type RunRow, type VoiceRow } from "./map";
import { ensureSeeded } from "./seed";

export type DraftInput = {
  voiceId: string;
  donorScanId?: string | null;
  trendScanId?: string | null;
  recipe: Recipe;
};

export type MeterInput = {
  runId?: string;
  draft: string;
  voiceId: string;
  donorScanId?: string | null;
  recipe: Recipe;
};

function formatDraft(format: Format, parsed: { text?: string; posts?: string[] }): string {
  if (format === "x_thread") {
    const posts = (parsed.posts ?? []).map((p) => p.trim()).filter(Boolean);
    if (posts.length) return posts.join("\n\n---\n\n");
  }
  return (parsed.text ?? parsed.posts?.join("\n\n") ?? "").trim();
}

function dialBlock(dials: Dials): string {
  return DIAL_KEYS.map((k) => {
    const v = dials[k];
    return `- ${DIAL_META[k].label} = ${v}/100. 0 means ${DIAL_META[k].zero}. 100 means ${DIAL_META[k].hundred}.`;
  }).join("\n");
}

export async function writeTestDraft(
  userId: string,
  data: DraftInput,
  email: string | null | undefined,
): Promise<{ ok: true; draft: string; runId: string; model: string } | { ok: false; error: string }> {
  await ensureSeeded(userId, email);
  const sql = await getSql();
  const voices = await sql<VoiceRow>`
    select id, name, kind, parent_id, source_text, anchors, dials, locks, banned, created_at, updated_at
    from voices where id = ${data.voiceId} and user_id = ${userId} limit 1
  `;
  const voiceRow = voices[0];
  if (!voiceRow) return { ok: false, error: "Voice not found" };
  const voice = mapVoice(voiceRow);

  let donorMoves: {
    name: string;
    description: string;
    pattern: string;
    frequency: "signature" | "frequent" | "occasional";
  }[] = [];
  let signature: string[] = [];
  if (data.donorScanId) {
    const donors = await sql<{ result: unknown }>`
      select result from donor_scans where id = ${data.donorScanId} and user_id = ${userId} limit 1
    `;
    const donor = donors[0]
      ? asJson<{ moves?: typeof donorMoves; signaturePhrases?: string[] }>(donors[0].result, {})
      : {};
    donorMoves = donor.moves ?? [];
    signature = donor.signaturePhrases ?? [];
  }

  let brief = data.recipe.topic.trim();
  if (!brief) {
    brief = "A short piece from one specific ordinary moment. Invent no news and no names that need a source.";
  }
  if (data.trendScanId) {
    const trends = await sql<{ result: unknown; query: string }>`
      select result, query from trend_scans where id = ${data.trendScanId} and user_id = ${userId} limit 1
    `;
    if (trends[0]) {
      const t = asJson<{
        headline?: string;
        crowdRead?: string;
        angles?: string[];
        citations?: { source: string; note: string }[];
      }>(trends[0].result, {});
      const angle = data.recipe.angle || t.angles?.[0] || "";
      brief = [
        `Topic: ${trends[0].query}`,
        t.headline ? `Headline: ${t.headline}` : "",
        t.crowdRead ? `Crowd: ${t.crowdRead}` : "",
        angle ? `Chosen angle: ${angle}` : "",
        t.citations?.length
          ? `Citations: ${t.citations.map((c) => `${c.source} — ${c.note}`).join("; ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");
    }
  }

  const enabled = enabledMoves(donorMoves, data.recipe.moveWeights);
  const moveBlock = enabled.length
    ? enabled
        .map(
          (m) =>
            `- ${m.move.name} (weight ${m.weight}): pattern ${m.move.pattern}. ${m.move.description}. A 0.2 weight appears at most once.`,
        )
        .join("\n")
    : "(no borrowed moves)";

  const preset = PRESET_META[data.recipe.preset];
  const never = [...new Set([...voice.banned, ...signature])].filter(Boolean);

  const result = await grokJson({
    instructions:
      "You write test drafts for voice calibration. Output JSON only. Core anchors beat dials, genre, and donor. Never name or imitate a donor. Never use a signature phrase. Never quote anyone. Use only facts in the brief. If uncertain, leave it out.",
    input: `Write a ${FORMAT_LABEL[data.recipe.format]} test draft.

HARD RULES (these beat dials):
- Sentence 1 is a witnessed place, object, body, time of day, or a line someone said. Not a topic. Not a year. Not a market. Not a headline.
- At least one true scene: a room or a time, a body in it. "Someone will…" is not a scene.
- Personal door first, then the wider thing. Never the reverse.
- The object carries the feeling. Do not name emotions.
- Last line widens or stays open. It does not instruct. No "watch the X, not the Y."
- Short sentences carry the weight. No em dashes.
- Dials change cadence and density only. They never authorize a topic-first opening.

CORE ANCHORS:
${voice.anchors.map((a) => `- ${a}`).join("\n")}

BRIEF (facts only — do not add facts):
${brief}

FORMAT: ${FORMAT_LABEL[data.recipe.format]}
${
  data.recipe.format === "x_thread"
    ? 'Return {"posts": ["...", "..."]} each post under 280 characters, 3–8 posts.'
    : 'Return {"text": "the full draft as plain text"}.'
}

DIALS (register and technique only):
${dialBlock(data.recipe.dials)}

GENRE: ${preset.label}${preset.note ? ` — ${preset.note}` : ""}

BORROWED STRUCTURAL MOVES (only if listed; 0 weight means unused):
${moveBlock}

NEVER USE:
${never.map((p) => `- ${p}`).join("\n") || "(none)"}

VOICE SOURCE (identity — if anything conflicts, HARD RULES win):
${voice.sourceText}

Label nothing. Do not mention dials, donors, or this system.`,
    schema: DraftSchema,
    maxOutputTokens: 2500,
  });

  if (!result.ok) return result;
  const draft = formatDraft(data.recipe.format, result.data);
  if (!draft) return { ok: false, error: "Grok returned an empty draft." };

  const id = newId();
  await sql`
    insert into runs (id, user_id, voice_id, donor_scan_id, trend_scan_id, recipe, draft, meters, verdict)
    values (
      ${id},
      ${userId},
      ${data.voiceId},
      ${data.donorScanId ?? null},
      ${data.trendScanId ?? null},
      ${JSON.stringify(data.recipe)}::jsonb,
      ${draft},
      ${null},
      ${null}
    )
  `;

  return { ok: true, draft, runId: id, model: result.model };
}

export async function scoreDraft(
  userId: string,
  data: MeterInput,
): Promise<{ ok: true; meters: MeterResult; verdict: Verdict; runId: string } | { ok: false; error: string }> {
  const sql = await getSql();
  const voices = await sql<VoiceRow>`
    select id, name, kind, parent_id, source_text, anchors, dials, locks, banned, created_at, updated_at
    from voices where id = ${data.voiceId} and user_id = ${userId} limit 1
  `;
  const voiceRow = voices[0];
  if (!voiceRow) return { ok: false, error: "Voice not found" };
  const voice = mapVoice(voiceRow);

  let samples: string[] = [];
  let signature: string[] = [];
  let donorMoves: string[] = [];
  if (data.donorScanId) {
    const donors = await sql<{ result: unknown; samples: unknown }>`
      select result, samples from donor_scans
      where id = ${data.donorScanId} and user_id = ${userId} limit 1
    `;
    if (donors[0]) {
      const result = asJson<{ signaturePhrases?: string[]; moves?: { name: string }[] }>(
        donors[0].result,
        {},
      );
      signature = result.signaturePhrases ?? [];
      donorMoves = (result.moves ?? []).map((m) => m.name);
      samples = asJson<string[]>(donors[0].samples, []);
    }
  }

  const overlapHits = findOverlap(data.draft, samples, signature);
  const settings = await sql<{ slop_patterns: unknown }>`
    select slop_patterns from lab_settings where user_id = ${userId} limit 1
  `;
  const patterns: SlopPattern[] = settings[0] ? mapSlop(settings[0].slop_patterns) : [];
  const slop = scanSlop(data.draft, patterns);

  const judge = await grokJson({
    instructions:
      "You are a voice-identity judge. Score drafts against a writer's Core. Be specific about lines. Output JSON only. Never invent quotes that are not in the draft.",
    input: `Judge this test draft.

CORE ANCHORS:
${voice.anchors.map((a) => `- ${a}`).join("\n")}

VOICE SOURCE (identity - never violate):
${voice.sourceText}

DIALS IN FORCE:
${dialBlock(data.recipe.dials)}

${data.donorScanId ? `A donor's structural moves were optionally on: ${donorMoves.join(", ") || "none"}.` : "No donor was selected."}

DETERMINISTIC HITS (trust these):
Overlap 6-grams / signature phrases: ${overlapHits.length ? overlapHits.map((h) => h.gram).join(" | ") : "none"}
Slop hits per 100 words: ${slop.perHundred.toFixed(2)}
Slop labels: ${slop.hits.map((h) => `${h.label}×${h.count}`).join(", ") || "none"}

DRAFT:
${data.draft}

Return JSON:
{
  "identityDrift": 0-100 (0 = unmistakably this writer's Core),
  "donorInfluence": 0-100 (how visible the donor's TECHNIQUE is, not their words),
  "slopScore": 0-100 (AI-fingerprint level, informed by the deterministic hits),
  "anchorsBroken": ["list each broken Core anchor; repeat an anchor if it is broken more than once"],
  "notes": "specific lines to fix"
}`,
    schema: MeterJudgeSchema,
    maxOutputTokens: 1200,
  });

  if (!judge.ok) return judge;

  const meters: MeterResult = {
    ...judge.data,
    overlapHits,
    slopHits: slop.hits,
    slopPerHundred: slop.perHundred,
    sampleCount: samples.length,
    phraseCount: signature.length,
  };
  const verdict = computeVerdict({
    meters,
    donorSelected: Boolean(data.donorScanId),
  });

  let runId = data.runId;
  if (runId) {
    const owned = await sql<{ id: string }>`
      select id from runs where id = ${runId} and user_id = ${userId} limit 1
    `;
    if (!owned.length) runId = undefined;
  }
  if (!runId) {
    runId = newId();
    await sql`
      insert into runs (id, user_id, voice_id, donor_scan_id, trend_scan_id, recipe, draft, meters, verdict)
      values (
        ${runId},
        ${userId},
        ${data.voiceId},
        ${data.donorScanId ?? null},
        ${null},
        ${JSON.stringify(data.recipe)}::jsonb,
        ${data.draft},
        ${JSON.stringify(meters)}::jsonb,
        ${verdict}
      )
    `;
  } else {
    await sql`
      update runs set
        draft = ${data.draft},
        recipe = ${JSON.stringify(data.recipe)}::jsonb,
        meters = ${JSON.stringify(meters)}::jsonb,
        verdict = ${verdict}
      where id = ${runId} and user_id = ${userId}
    `;
  }

  return { ok: true, meters, verdict, runId };
}

const MOVE_FREQ_RANK: Record<DonorMove["frequency"], number> = {
  signature: 0,
  frequent: 1,
  occasional: 2,
};

function rankMoves(moves: DonorMove[]): DonorMove[] {
  return [...moves].sort((a, b) => MOVE_FREQ_RANK[a.frequency] - MOVE_FREQ_RANK[b.frequency]);
}

function parseNamedDial(text: string): DialKey | null {
  const hay = text.toLowerCase();
  const labels = DIAL_KEYS.map((key) => ({
    key,
    label: DIAL_META[key].label.toLowerCase(),
    raw: key.replace(/_/g, " "),
  })).sort((a, b) => b.label.length - a.label.length);
  for (const item of labels) {
    if (hay.includes(item.label) || hay.includes(item.raw) || hay.includes(item.key)) return item.key;
  }
  return null;
}

function farthestFromCore(mixed: Dials, core: Dials): DialKey {
  let best: DialKey = DIAL_KEYS[0];
  let gap = -1;
  for (const key of DIAL_KEYS) {
    const d = Math.abs(mixed[key] - core[key]);
    if (d > gap) {
      gap = d;
      best = key;
    }
  }
  return best;
}

export type AutoTuneInput = {
  voiceId: string;
  donorScanId?: string | null;
  trendScanId?: string | null;
  format: Format;
  preset: GenrePreset;
  topic: string;
  domain: string;
  keep?: string;
  angle?: string;
};

export type AutoTuneRound = {
  round: number;
  blend: number;
  verdict: Verdict;
  identityDrift: number;
  slopScore: number;
};

export type AutoTuneResult =
  | { ok: false; error: string }
  | {
      ok: true;
      draft: string;
      runId: string;
      recipe: Recipe;
      meters: MeterResult;
      verdict: Verdict;
      roundsUsed: number;
      stoppedAt: "ready" | "slop" | "exhausted";
      blockingNotes: string;
      nudgedDial: DialKey | null;
      history: AutoTuneRound[];
    };

type TuneAttempt = {
  round: number;
  recipe: Recipe;
  draft: string;
  runId: string;
  meters: MeterResult;
  verdict: Verdict;
};

function closer(a: TuneAttempt, b: TuneAttempt): TuneAttempt {
  if (a.meters.identityDrift !== b.meters.identityDrift) {
    return a.meters.identityDrift < b.meters.identityDrift ? a : b;
  }
  if (a.verdict === "adjust" && b.verdict === "stop") return a;
  if (b.verdict === "adjust" && a.verdict === "stop") return b;
  return a.meters.slopScore <= b.meters.slopScore ? a : b;
}

export async function runAutoTune(
  userId: string,
  data: AutoTuneInput,
  email: string | null | undefined,
): Promise<AutoTuneResult> {
  await ensureSeeded(userId, email);
  const sql = await getSql();
  const voiceRows = await sql<VoiceRow>`
    select id, name, kind, parent_id, source_text, anchors, dials, locks, banned, created_at, updated_at
    from voices where id = ${data.voiceId} and user_id = ${userId} limit 1
  `;
  const voiceRow = voiceRows[0];
  if (!voiceRow) return { ok: false, error: "Voice not found" };
  const voice = mapVoice(voiceRow);

  let donor = null as ReturnType<typeof mapDonor> | null;
  if (data.donorScanId) {
    const donorRows = await sql<DonorRow>`
      select id, handle, domain, result, model, scanned_at
      from donor_scans where id = ${data.donorScanId} and user_id = ${userId} limit 1
    `;
    if (donorRows[0]) donor = mapDonor(donorRows[0]);
  }

  const lockRows = await sql<DomainLockRow>`
    select id, domain, dial, max, min, reason from domain_locks where user_id = ${userId}
  `;
  const domainLocks = lockRows.map(mapDomainLock);
  const domain = data.domain.trim() || donor?.domain || "";
  const ranked = rankMoves(donor?.moves ?? []);
  const donorSelected = Boolean(donor);
  const keep = data.keep ?? "";
  const topic = data.topic.trim();

  function recipeFor(blend: number, on: DonorMove[]): Recipe {
    const mixed = mixDials({
      base: voice.dials,
      donor: donor?.dials ?? null,
      blend: donor ? blend : 0,
      preset: data.preset,
      voiceLocks: voice.locks,
      domainLocks,
      domain,
    });
    const weights: MoveWeight[] = (donor?.moves ?? []).map((m) => ({
      name: m.name,
      weight: on.some((x) => x.name === m.name) ? 0.4 : 0,
    }));
    return {
      blend: donor ? blend : 0,
      dials: mixed.dials,
      preset: data.preset,
      format: data.format,
      topic,
      domain,
      keep,
      angle: data.angle,
      moveWeights: weights,
    };
  }

  async function attempt(round: number, recipe: Recipe): Promise<TuneAttempt | { ok: false; error: string }> {
    const draftRes = await writeTestDraft(
      userId,
      {
        voiceId: voice.id,
        donorScanId: donor?.id ?? null,
        trendScanId: data.trendScanId ?? null,
        recipe,
      },
      email,
    );
    if (!draftRes.ok) return draftRes;
    const meterRes = await scoreDraft(userId, {
      runId: draftRes.runId,
      draft: draftRes.draft,
      voiceId: voice.id,
      donorScanId: donor?.id ?? null,
      recipe,
    });
    if (!meterRes.ok) return meterRes;
    return {
      round,
      recipe,
      draft: draftRes.draft,
      runId: meterRes.runId,
      meters: meterRes.meters,
      verdict: meterRes.verdict,
    };
  }

  const done: TuneAttempt[] = [];

  function pack(
    best: TuneAttempt,
    stoppedAt: "ready" | "slop" | "exhausted",
    extra?: { nudgedDial?: DialKey | null },
  ): AutoTuneResult {
    return {
      ok: true,
      draft: best.draft,
      runId: best.runId,
      recipe: best.recipe,
      meters: best.meters,
      verdict: best.verdict,
      roundsUsed: done.length,
      stoppedAt,
      blockingNotes: best.meters.notes,
      nudgedDial: extra?.nudgedDial ?? null,
      history: done.map((r) => ({
        round: r.round,
        blend: r.recipe.blend,
        verdict: r.verdict,
        identityDrift: r.meters.identityDrift,
        slopScore: r.meters.slopScore,
      })),
    };
  }

  const round1 = await attempt(1, recipeFor(0, []));
  if ("ok" in round1 && round1.ok === false) return round1;
  done.push(round1 as TuneAttempt);
  if ((round1 as TuneAttempt).verdict === "ready for Claude") {
    return pack(round1 as TuneAttempt, "ready");
  }

  if (donor && ranked.length) {
    const round2 = await attempt(2, recipeFor(30, ranked.slice(0, 1)));
    if (!("ok" in round2 && round2.ok === false)) {
      done.push(round2 as TuneAttempt);
      if ((round2 as TuneAttempt).verdict === "ready for Claude") {
        return pack(round2 as TuneAttempt, "ready");
      }
    } else if (round2.ok === false && !done.length) {
      return round2;
    }

    const last = done[done.length - 1];
    if (last?.verdict !== "ready for Claude") {
      const round3 = await attempt(3, recipeFor(60, ranked.slice(0, Math.min(2, ranked.length))));
      if (!("ok" in round3 && round3.ok === false)) {
        done.push(round3 as TuneAttempt);
        if ((round3 as TuneAttempt).verdict === "ready for Claude") {
          return pack(round3 as TuneAttempt, "ready");
        }
      }
    }
  }

  const mid = done.filter((r) => r.round === 2 || r.round === 3);
  const midAdjust = mid.filter((r) => r.verdict === "adjust");
  const bestSoFar = done.reduce(closer);
  const slopStop = slopOnlyBlocker({
    meters: bestSoFar.meters,
    verdict: bestSoFar.verdict,
    donorSelected,
  });

  if (slopStop) {
    return pack(bestSoFar, "slop");
  }

  if (midAdjust.length && done.length < 4) {
    const source = midAdjust.reduce(closer);
    const named =
      parseNamedDial(`${source.meters.notes}\n${source.meters.anchorsBroken.join("\n")}`) ??
      farthestFromCore(source.recipe.dials, voice.dials);
    const current = source.recipe.dials[named];
    const core = voice.dials[named];
    const delta = current > core ? -15 : current < core ? 15 : 0;
    const nudged = mixDials({
      base: voice.dials,
      donor: donor?.dials ?? null,
      blend: source.recipe.blend,
      preset: data.preset,
      overrides: { [named]: clampDial(current + delta) },
      voiceLocks: voice.locks,
      domainLocks,
      domain,
    });
    const round4 = await attempt(4, { ...source.recipe, dials: nudged.dials });
    if (!("ok" in round4 && round4.ok === false)) {
      done.push(round4 as TuneAttempt);
      if ((round4 as TuneAttempt).verdict === "ready for Claude") {
        return pack(round4 as TuneAttempt, "ready", { nudgedDial: named });
      }
      const best = done.reduce(closer);
      if (
        slopOnlyBlocker({
          meters: best.meters,
          verdict: best.verdict,
          donorSelected,
        })
      ) {
        return pack(best, "slop", { nudgedDial: named });
      }
      return pack(best, "exhausted", { nudgedDial: named });
    }
  }

  return pack(bestSoFar, "exhausted");
}

export const generateDraft = createServerFn({ method: "POST" })
  .middleware([ownerMiddleware])
  .validator((input: DraftInput) => input)
  .handler(async ({ context, data }) => writeTestDraft(context.userId, data, context.email));

export const autoTuneDraft = createServerFn({ method: "POST" })
  .middleware([ownerMiddleware])
  .validator((input: AutoTuneInput) => input)
  .handler(async ({ context, data }) => runAutoTune(context.userId, data, context.email));

export const meterDraft = createServerFn({ method: "POST" })
  .middleware([ownerMiddleware])
  .validator((input: MeterInput) => input)
  .handler(async ({ context, data }) => scoreDraft(context.userId, data));

export const listRuns = createServerFn({ method: "GET" })
  .middleware([ownerMiddleware])
  .handler(async ({ context }): Promise<Run[]> => {
    const sql = await getSql();
    const rows = await sql<RunRow>`
      select r.id, r.voice_id, v.name as voice_name, r.donor_scan_id, d.handle as donor_handle,
             r.trend_scan_id, r.recipe, r.draft, r.meters, r.verdict, r.created_at
      from runs r
      left join voices v on v.id = r.voice_id and v.user_id = r.user_id
      left join donor_scans d on d.id = r.donor_scan_id and d.user_id = r.user_id
      where r.user_id = ${context.userId}
      order by r.created_at desc
      limit 80
    `;
    return rows.map(mapRun);
  });

export const saveRunDraft = createServerFn({ method: "POST" })
  .middleware([ownerMiddleware])
  .validator((input: { runId: string; draft: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      update runs set draft = ${data.draft}
      where id = ${data.runId} and user_id = ${context.userId}
    `;
    return { ok: true as const };
  });
