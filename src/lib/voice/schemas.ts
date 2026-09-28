import { z } from "zod";
import { DIAL_KEYS, NAPOLEON_CORE_DIALS } from "./dials";

const unit = z.coerce.number().transform((n) => {
  const v = Number.isFinite(n) ? n : 0;
  return Math.max(0, Math.min(100, v));
});

const dialShape: Record<(typeof DIAL_KEYS)[number], z.ZodType<number>> = {
  entry_mode: unit.catch(NAPOLEON_CORE_DIALS.entry_mode),
  confession_depth: unit.catch(NAPOLEON_CORE_DIALS.confession_depth),
  teaching_density: unit.catch(NAPOLEON_CORE_DIALS.teaching_density),
  certainty: unit.catch(NAPOLEON_CORE_DIALS.certainty),
  authority_source: unit.catch(NAPOLEON_CORE_DIALS.authority_source),
  accessibility: unit.catch(NAPOLEON_CORE_DIALS.accessibility),
  hook_force: unit.catch(NAPOLEON_CORE_DIALS.hook_force),
  humor: unit.catch(NAPOLEON_CORE_DIALS.humor),
  rhythm_variance: unit.catch(NAPOLEON_CORE_DIALS.rhythm_variance),
  commercial_pull: unit.catch(NAPOLEON_CORE_DIALS.commercial_pull),
  resolution: unit.catch(NAPOLEON_CORE_DIALS.resolution),
};

export const DialsSchema = z.object(dialShape);

export const CitationSchema = z.object({
  source: z.string().max(200).catch(""),
  url: z.string().max(500).optional(),
  note: z.string().max(400).catch(""),
});

export const TrendScanSchema = z.object({
  quiet: z.boolean().catch(false),
  headline: z.string().min(1).max(240).catch("Quiet on X"),
  crowdRead: z.string().min(1).max(2000).catch("Not enough public posts to read the crowd."),
  angles: z.array(z.string().max(400)).max(5).catch([]),
  leadingVoices: z
    .array(
      z.object({
        handle: z.string().max(80).catch(""),
        why: z.string().max(400).catch(""),
      }),
    )
    .max(5)
    .catch([]),
  watch: z.string().max(600).catch(""),
  citations: z.array(CitationSchema).max(8).catch([]),
});

export const DonorScanSchema = z.object({
  quiet: z.boolean().catch(false),
  handle: z.string().max(80).catch(""),
  sampleCount: z.coerce.number().int().min(0).catch(0),
  dials: DialsSchema,
  dialNotes: z.string().max(2000).catch(""),
  moves: z
    .array(
      z.object({
        name: z.string().max(80).catch("unnamed move"),
        description: z.string().max(600).catch(""),
        pattern: z.string().max(300).catch(""),
        frequency: z.enum(["signature", "frequent", "occasional"]).catch("occasional"),
      }),
    )
    .max(10)
    .catch([
      {
        name: "quiet presence",
        description: "Not enough public posts to isolate a repeating move.",
        pattern: "[observation]. That's it.",
        frequency: "occasional" as const,
      },
    ]),
  signaturePhrases: z.array(z.string().max(120)).max(15).catch([]),
  topicsNow: z.array(z.string().max(80)).max(6).catch([]),
  citations: z.array(CitationSchema).max(8).catch([]),
  samples: z.array(z.string().max(2000)).max(30).optional(),
});

export const DraftSchema = z.object({
  text: z.string().max(8000).optional(),
  posts: z.array(z.string().max(280)).max(12).optional(),
});

export const MeterJudgeSchema = z.object({
  identityDrift: unit,
  donorInfluence: unit,
  slopScore: unit,
  anchorsBroken: z.array(z.string().max(300)).max(8).catch([]),
  notes: z.string().max(1200).catch(""),
});
