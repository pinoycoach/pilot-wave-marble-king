import type { MeterResult, Verdict } from "./types";

export function computeVerdict(opts: {
  meters: MeterResult;
  donorSelected: boolean;
}): Verdict {
  const { meters, donorSelected } = opts;
  const counts = new Map<string, number>();
  for (const a of meters.anchorsBroken) {
    const key = a.trim().toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const twiceBroken = [...counts.values()].some((n) => n >= 2);
  if (meters.identityDrift > 40 || twiceBroken) return "stop";
  if (meters.overlapHits.length > 0) return "adjust";
  if (meters.slopScore > 35) return "adjust";
  if (meters.donorInfluence > 60) return "adjust";
  if (donorSelected && meters.donorInfluence < 15) return "adjust";
  return "ready for Claude";
}

/** Adjust only because slop is hot. Do not auto-rewrite that. */
export function slopOnlyBlocker(opts: {
  meters: MeterResult;
  verdict: Verdict;
  donorSelected: boolean;
}): boolean {
  const { meters, verdict, donorSelected } = opts;
  if (verdict !== "adjust") return false;
  if (meters.slopScore <= 35) return false;
  if (meters.overlapHits.length > 0) return false;
  if (meters.identityDrift > 40) return false;
  if (meters.donorInfluence > 60) return false;
  if (donorSelected && meters.donorInfluence < 15) return false;
  return true;
}
