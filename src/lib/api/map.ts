import { asJson } from "@/lib/utils";
import { parseDials, type DialKey } from "@/lib/voice/dials";
import type {
  DialLock,
  DonorScan,
  DomainLock,
  MeterResult,
  Recipe,
  ResultLog,
  Run,
  SlopPattern,
  TrendScan,
  Verdict,
  Voice,
} from "@/lib/voice/types";

export type VoiceRow = {
  id: string;
  name: string;
  kind: string;
  parent_id: string | null;
  source_text: string;
  anchors: unknown;
  dials: unknown;
  locks: unknown;
  banned: unknown;
  created_at: string | Date;
  updated_at: string | Date;
};

export function iso(value: string | Date): string {
  if (value instanceof Date) return value.toISOString();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toISOString();
}

export function mapVoice(row: VoiceRow): Voice {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind === "brand" ? "brand" : "core",
    parentId: row.parent_id,
    sourceText: row.source_text ?? "",
    anchors: asJson<string[]>(row.anchors, []),
    dials: parseDials(row.dials),
    locks: asJson<DialLock[]>(row.locks, []),
    banned: asJson<string[]>(row.banned, []),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

export type DomainLockRow = {
  id: string;
  domain: string;
  dial: string;
  max: number | null;
  min: number | null;
  reason: string | null;
};

export function mapDomainLock(row: DomainLockRow): DomainLock {
  return {
    id: row.id,
    domain: row.domain,
    dial: row.dial as DialKey,
    max: row.max,
    min: row.min,
    reason: row.reason ?? "",
  };
}

export type TrendRow = {
  id: string;
  query: string;
  result: unknown;
  model: string;
  scanned_at: string | Date;
};

export function mapTrend(row: TrendRow): TrendScan {
  const result = asJson<Partial<TrendScan>>(row.result, {});
  return {
    id: row.id,
    query: row.query,
    quiet: Boolean(result.quiet),
    headline: result.headline ?? "",
    crowdRead: result.crowdRead ?? "",
    angles: result.angles ?? [],
    leadingVoices: result.leadingVoices ?? [],
    watch: result.watch ?? "",
    citations: result.citations ?? [],
    model: row.model,
    scannedAt: iso(row.scanned_at),
  };
}

export type DonorRow = {
  id: string;
  handle: string;
  domain: string;
  result: unknown;
  model: string;
  scanned_at: string | Date;
};

export function mapDonor(row: DonorRow): DonorScan {
  const result = asJson<Partial<DonorScan>>(row.result, {});
  return {
    id: row.id,
    handle: row.handle,
    domain: row.domain,
    quiet: Boolean(result.quiet),
    sampleCount: result.sampleCount ?? 0,
    dials: parseDials(result.dials),
    dialNotes: result.dialNotes ?? "",
    moves: result.moves ?? [],
    signaturePhrases: result.signaturePhrases ?? [],
    topicsNow: result.topicsNow ?? [],
    citations: result.citations ?? [],
    model: row.model,
    scannedAt: iso(row.scanned_at),
  };
}

export type RunRow = {
  id: string;
  voice_id: string;
  voice_name?: string | null;
  donor_scan_id: string | null;
  donor_handle?: string | null;
  trend_scan_id: string | null;
  recipe: unknown;
  draft: string;
  meters: unknown;
  verdict: string | null;
  created_at: string | Date;
};

export function mapRun(row: RunRow): Run {
  return {
    id: row.id,
    voiceId: row.voice_id,
    voiceName: row.voice_name ?? "Voice",
    donorScanId: row.donor_scan_id,
    donorHandle: row.donor_handle ?? null,
    trendScanId: row.trend_scan_id,
    recipe: asJson<Recipe>(row.recipe, {
      blend: 0,
      dials: parseDials({}),
      preset: "none",
      format: "x_post",
      topic: "",
      domain: "",
      keep: "",
      moveWeights: [],
    }),
    draft: row.draft ?? "",
    meters: asJson<MeterResult | null>(row.meters, null),
    verdict: (row.verdict as Verdict | null) ?? null,
    createdAt: iso(row.created_at),
  };
}

export type ResultRow = {
  id: string;
  run_id: string;
  platform: string;
  posted_at: string | Date;
  views: number;
  shares: number;
  saves: number;
  replies: number;
  long_replies: number;
  recipe?: unknown;
  voice_name?: string | null;
};

export function mapResult(row: ResultRow): ResultLog {
  const recipe = row.recipe ? asJson<Recipe | null>(row.recipe, null) : null;
  const posted =
    typeof row.posted_at === "string"
      ? row.posted_at.slice(0, 10)
      : iso(row.posted_at).slice(0, 10);
  return {
    id: row.id,
    runId: row.run_id,
    platform: row.platform,
    postedAt: posted,
    views: Number(row.views) || 0,
    shares: Number(row.shares) || 0,
    saves: Number(row.saves) || 0,
    replies: Number(row.replies) || 0,
    longReplies: Number(row.long_replies) || 0,
    recipe,
    voiceName: row.voice_name ?? "Voice",
    domain: recipe?.domain ?? "",
  };
}

export function mapSlop(raw: unknown): SlopPattern[] {
  const list = asJson<SlopPattern[]>(raw, []);
  return list.filter((p) => p && typeof p.pattern === "string");
}
