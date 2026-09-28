import type { DialKey, Dials, Format, GenrePreset } from "./dials";

export type VoiceKind = "core" | "brand";

export type DialLock = {
  dial: DialKey;
  max?: number | null;
  min?: number | null;
  reason: string;
};

export type Voice = {
  id: string;
  name: string;
  kind: VoiceKind;
  parentId: string | null;
  sourceText: string;
  anchors: string[];
  dials: Dials;
  locks: DialLock[];
  banned: string[];
  createdAt: string;
  updatedAt: string;
};

export type DomainLock = {
  id: string;
  domain: string;
  dial: DialKey;
  max: number | null;
  min: number | null;
  reason: string;
};

export type Citation = {
  source: string;
  url?: string;
  note: string;
};

export type TrendScan = {
  id: string;
  query: string;
  quiet: boolean;
  headline: string;
  crowdRead: string;
  angles: string[];
  leadingVoices: { handle: string; why: string }[];
  watch: string;
  citations: Citation[];
  model: string;
  scannedAt: string;
};

export type DonorMove = {
  name: string;
  description: string;
  pattern: string;
  frequency: "signature" | "frequent" | "occasional";
};

export type DonorScan = {
  id: string;
  handle: string;
  domain: string;
  quiet: boolean;
  sampleCount: number;
  dials: Dials;
  dialNotes: string;
  moves: DonorMove[];
  signaturePhrases: string[];
  topicsNow: string[];
  citations: Citation[];
  model: string;
  scannedAt: string;
};

export type MoveWeight = {
  name: string;
  weight: number;
};

export type Recipe = {
  blend: number;
  dials: Dials;
  preset: GenrePreset;
  format: Format;
  topic: string;
  domain: string;
  keep: string;
  moveWeights: MoveWeight[];
  angle?: string;
};

export type OverlapHit = {
  gram: string;
  source: "sample" | "phrase";
};

export type SlopHit = {
  label: string;
  count: number;
  excerpts: string[];
};

export type MeterResult = {
  identityDrift: number;
  donorInfluence: number;
  slopScore: number;
  anchorsBroken: string[];
  notes: string;
  overlapHits: OverlapHit[];
  slopHits: SlopHit[];
  slopPerHundred: number;
  sampleCount: number;
  phraseCount: number;
};

export type Verdict = "stop" | "adjust" | "ready for Claude";

export type Run = {
  id: string;
  voiceId: string;
  voiceName: string;
  donorScanId: string | null;
  donorHandle: string | null;
  trendScanId: string | null;
  recipe: Recipe;
  draft: string;
  meters: MeterResult | null;
  verdict: Verdict | null;
  createdAt: string;
};

export type BlindCard = {
  key: string;
  blend: number;
  draft: string;
  meters: MeterResult | null;
  verdict: Verdict | null;
  runId: string;
};

export type ResultLog = {
  id: string;
  runId: string;
  platform: string;
  postedAt: string;
  views: number;
  shares: number;
  saves: number;
  replies: number;
  longReplies: number;
  recipe: Recipe | null;
  voiceName: string;
  domain: string;
};

export type SlopPattern = {
  id: string;
  label: string;
  pattern: string;
};
