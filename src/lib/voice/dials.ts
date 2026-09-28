export const DIAL_KEYS = [
  "entry_mode",
  "confession_depth",
  "teaching_density",
  "certainty",
  "authority_source",
  "accessibility",
  "hook_force",
  "humor",
  "rhythm_variance",
  "commercial_pull",
  "resolution",
] as const;

export type DialKey = (typeof DIAL_KEYS)[number];

export type Dials = Record<DialKey, number>;

export const DIAL_META: Record<
  DialKey,
  { label: string; zero: string; hundred: string }
> = {
  entry_mode: {
    label: "Entry mode",
    zero: "enters through a specific scene or moment",
    hundred: "enters through a thesis or claim",
  },
  confession_depth: {
    label: "Confession depth",
    zero: "guarded, impersonal",
    hundred: "says the uncomfortable thing first",
  },
  teaching_density: {
    label: "Teaching density",
    zero: "story; the lesson is implied",
    hundred: "named framework; explicit takeaways",
  },
  certainty: {
    label: "Certainty",
    zero: "open, observer, questions allowed",
    hundred: "declarative, instructive",
  },
  authority_source: {
    label: "Authority source",
    zero: "lived experience",
    hundred: "system, credentials, lineage, data",
  },
  accessibility: {
    label: "Accessibility",
    zero: "intimate; assumes shared context",
    hundred: "mass audience; assumes nothing",
  },
  hook_force: {
    label: "Hook force",
    zero: "quiet entry",
    hundred: "pattern-interrupt hook",
  },
  humor: {
    label: "Humor",
    zero: "none",
    hundred: "comic-forward",
  },
  rhythm_variance: {
    label: "Rhythm variance",
    zero: "even, metered sentences",
    hundred: "high variance: long held breaths, short hits, fragments",
  },
  commercial_pull: {
    label: "Commercial pull",
    zero: "a gift; no ask",
    hundred: "direct offer and CTA",
  },
  resolution: {
    label: "Resolution",
    zero: "open, widening close",
    hundred: "tidy, resolved takeaway",
  },
};

export const NAPOLEON_CORE_DIALS: Dials = {
  entry_mode: 10,
  confession_depth: 80,
  teaching_density: 20,
  certainty: 35,
  authority_source: 20,
  accessibility: 45,
  hook_force: 40,
  humor: 35,
  rhythm_variance: 75,
  commercial_pull: 15,
  resolution: 20,
};

export const NAPOLEON_CORE_ANCHORS = [
  "Enter through a moment, never a topic",
  "Personal to universal, always that direction",
  "The object carries the feeling; no named emotions",
  "At least one true scene per piece",
  "Short sentences carry the weight; never explain what just landed",
  "Dry, observational humor that sits inside the sad thing and does not resolve it",
  "Never punches down",
  "Ends open; the line before the close widens",
];

export const FORMATS = [
  "x_post",
  "x_thread",
  "facebook_post",
  "newsletter_section",
  "podcast_segment_outline",
  "book_scene",
] as const;

export type Format = (typeof FORMATS)[number];

export const FORMAT_LABEL: Record<Format, string> = {
  x_post: "X post",
  x_thread: "X thread",
  facebook_post: "Facebook post",
  newsletter_section: "Newsletter section",
  podcast_segment_outline: "Podcast outline",
  book_scene: "Book scene",
};

export const GENRE_PRESETS = [
  "none",
  "suspense",
  "romance",
  "explainer",
  "commentary",
  "devotional",
] as const;

export type GenrePreset = (typeof GENRE_PRESETS)[number];

export const PRESET_META: Record<
  GenrePreset,
  { label: string; note: string; shifts: Partial<Dials>; lockCommercialZero?: boolean }
> = {
  none: { label: "None", note: "", shifts: {} },
  suspense: {
    label: "Suspense",
    note: "Withhold. Delay the reveal.",
    shifts: { hook_force: 25, resolution: -20 },
  },
  romance: {
    label: "Romance",
    note: "Longing before arrival.",
    shifts: { confession_depth: 10, humor: 10 },
  },
  explainer: {
    label: "Explainer",
    note: "Name the framework. Assume less.",
    shifts: { teaching_density: 30, accessibility: 25 },
  },
  commentary: {
    label: "Commentary",
    note: "More declarative. Entry mode stays.",
    shifts: { certainty: 15 },
  },
  devotional: {
    label: "Devotional",
    note: "No ask. Soften the verdict.",
    shifts: { certainty: -10 },
    lockCommercialZero: true,
  },
};

export const DEFAULT_SLOP_PATTERNS: { id: string; label: string; pattern: string }[] = [
  { id: "not-x-its-y", label: "It's not X, it's Y", pattern: "it['’]?s not\\s+.{0,40},\\s*it['’]?s\\s+" },
  { id: "heres-the-thing", label: "Here's the thing", pattern: "here['’]?s the thing" },
  { id: "in-todays", label: "In today's …", pattern: "in today['’]?s\\s+\\w+" },
  { id: "delve", label: "delve", pattern: "\\bdelve[sd]?\\b" },
  { id: "tapestry", label: "tapestry", pattern: "\\btapestry\\b" },
  { id: "navigate-the", label: "navigate the", pattern: "\\bnavigate the\\b" },
  { id: "unlock", label: "unlock", pattern: "\\bunlock(?:s|ed|ing)?\\b" },
  { id: "game-changer", label: "game-changer", pattern: "\\bgame[- ]changer\\b" },
];

export function emptyDials(): Dials {
  return { ...NAPOLEON_CORE_DIALS };
}

export function clampDial(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

export function parseDials(raw: unknown): Dials {
  const src = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const next = { ...NAPOLEON_CORE_DIALS };
  for (const key of DIAL_KEYS) {
    const v = src[key];
    if (typeof v === "number") next[key] = clampDial(v);
  }
  return next;
}

export function dialReading(key: DialKey, value: number): string {
  const meta = DIAL_META[key];
  const v = clampDial(value);
  if (v <= 20) return meta.zero;
  if (v >= 80) return meta.hundred;
  return `${meta.zero} → ${meta.hundred} (${v})`;
}
