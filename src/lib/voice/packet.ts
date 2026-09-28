import { DIAL_KEYS, DIAL_META, FORMAT_LABEL, PRESET_META, dialReading, type Dials, type Format, type GenrePreset } from "./dials";
import type { DonorMove, MoveWeight, TrendScan } from "./types";

export function buildClaudePacket(opts: {
  voiceName: string;
  sourceText?: string;
  embedSkill?: boolean;
  keep: string;
  dials: Dials;
  moves: { move: DonorMove; weight: number }[];
  neverUse: string[];
  format: Format;
  preset: GenrePreset;
  topic: string;
  trend?: Pick<TrendScan, "headline" | "crowdRead" | "angles" | "citations"> | null;
  angle?: string;
  draft: string;
}): string {
  const dialLines = DIAL_KEYS.map((key) => {
    const v = opts.dials[key];
    return `  ${DIAL_META[key].label}: ${v} - ${dialReading(key, v)}`;
  }).join("\n");

  const enabled = opts.moves.filter((m) => m.weight > 0);
  const moveLines = enabled.length
    ? enabled
        .map(
          (m) =>
            `  - ${m.move.name} (weight ${m.weight.toFixed(1)}): ${m.move.pattern}\n    ${m.move.description}`,
        )
        .join("\n")
    : "  (none)";

  const never = opts.neverUse.filter((s) => s.trim()).map((s) => `  - ${s}`).join("\n") || "  (none)";
  const preset = PRESET_META[opts.preset];
  const citations = opts.trend?.citations.length
    ? opts.trend.citations
        .map((c) => `  - ${c.source}${c.url ? ` ${c.url}` : ""} - ${c.note}`)
        .join("\n")
    : "  (none)";

  const angle = opts.angle || opts.trend?.angles[0] || "(owner to choose)";
  const embed = Boolean(opts.embedSkill);
  const skill = opts.sourceText?.trim();
  const skillBlock =
    embed && skill
      ? `VOICE SKILL (source of truth. Obey this. It outranks the test draft. KEEP and NEVER USE still win.):
${skill}
`
      : "";
  const voiceLine = embed
    ? `VOICE: ${opts.voiceName} - use my voice skill as the source of truth.`
    : `VOICE: ${opts.voiceName} - use my napoleon-voice skill as the source of truth.`;
  const instruction = embed
    ? `INSTRUCTION: Write in my voice. Obey the VOICE SKILL. Keep ${opts.keep.trim() || "[KEEP]"}. Dosage Rule. Zero em dashes. Roughen by subtraction.`
    : `INSTRUCTION: Write in my voice. Use my napoleon-voice skill as the source of truth. Keep ${opts.keep.trim() || "[KEEP]"}. Dosage Rule. Zero em dashes. Roughen by subtraction.`;

  return `${voiceLine}
KEEP: ${opts.keep.trim() || "(not specified)"}
${skillBlock}DIAL SETTINGS (0-100, with meanings):
${dialLines}
BORROWED TECHNIQUES (moves, not words):
${moveLines}
NEVER USE:
${never}
FORMAT: ${FORMAT_LABEL[opts.format]}   GENRE: ${preset.label}${preset.note ? ` - ${preset.note}` : ""}
BRIEF (facts only - do not add facts):
  Topic: ${opts.topic || "(none)"}
  Headline: ${opts.trend?.headline ?? "(none)"}
  Crowd read: ${opts.trend?.crowdRead ?? "(none)"}
  Chosen angle: ${angle}
  Citations:
${citations}
TEST DRAFT (reference only, rewrite freely):
${opts.draft.trim() || "(none)"}
${instruction}
`;
}

export function enabledMoves(
  moves: DonorMove[] | undefined,
  weights: MoveWeight[],
): { move: DonorMove; weight: number }[] {
  if (!moves?.length) return [];
  const map = new Map(weights.map((w) => [w.name, w.weight]));
  return moves
    .map((move) => ({ move, weight: map.get(move.name) ?? 0 }))
    .filter((m) => m.weight > 0);
}
