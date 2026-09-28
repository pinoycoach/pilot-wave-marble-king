import { clamp } from "@/lib/utils";
import {
  DIAL_KEYS,
  PRESET_META,
  clampDial,
  type DialKey,
  type Dials,
  type GenrePreset,
} from "./dials";
import type { DialLock, DomainLock } from "./types";

export type ActiveLock = DialLock & { source: "voice" | "domain" | "preset" };

export function applyPreset(dials: Dials, preset: GenrePreset): Dials {
  const next = { ...dials };
  const meta = PRESET_META[preset];
  for (const key of DIAL_KEYS) {
    const delta = meta.shifts[key];
    if (typeof delta === "number") next[key] = clampDial(next[key] + delta);
  }
  return next;
}

export function blendDials(base: Dials, donor: Dials | null, blend: number): Dials {
  if (!donor || blend <= 0) return { ...base };
  const t = clamp(blend, 0, 100) / 100;
  const next = { ...base };
  for (const key of DIAL_KEYS) {
    next[key] = clampDial(base[key] + (donor[key] - base[key]) * t);
  }
  return next;
}

export function collectLocks(opts: {
  voiceLocks: DialLock[];
  domainLocks: DomainLock[];
  domain: string;
  preset: GenrePreset;
}): ActiveLock[] {
  const out: ActiveLock[] = [];
  for (const lock of opts.voiceLocks) {
    out.push({ ...lock, source: "voice" });
  }
  const domain = opts.domain.trim().toLowerCase();
  if (domain) {
    for (const lock of opts.domainLocks) {
      if (lock.domain.trim().toLowerCase() === domain) {
        out.push({ ...lock, source: "domain" });
      }
    }
  }
  if (PRESET_META[opts.preset].lockCommercialZero) {
    out.push({
      dial: "commercial_pull",
      max: 0,
      min: 0,
      reason: "Devotional preset locks commercial pull at 0",
      source: "preset",
    });
  }
  return out;
}

export function lockForDial(locks: ActiveLock[], key: DialKey): ActiveLock | undefined {
  const matches = locks.filter((l) => l.dial === key);
  if (!matches.length) return undefined;
  return matches.reduce((acc, lock) => {
    const next = { ...acc };
    if (lock.max != null) next.max = next.max == null ? lock.max : Math.min(next.max, lock.max);
    if (lock.min != null) next.min = next.min == null ? lock.min : Math.max(next.min, lock.min);
    if (lock.reason) next.reason = lock.reason;
    next.source = lock.source;
    return next;
  });
}

export function applyLocks(dials: Dials, locks: ActiveLock[]): Dials {
  const next = { ...dials };
  for (const key of DIAL_KEYS) {
    const lock = lockForDial(locks, key);
    if (!lock) continue;
    let v = next[key];
    if (lock.max != null) v = Math.min(v, lock.max);
    if (lock.min != null) v = Math.max(v, lock.min);
    next[key] = clampDial(v);
  }
  return next;
}

export function mixDials(opts: {
  base: Dials;
  donor: Dials | null;
  blend: number;
  preset: GenrePreset;
  overrides?: Partial<Dials>;
  voiceLocks: DialLock[];
  domainLocks: DomainLock[];
  domain: string;
}): { dials: Dials; locks: ActiveLock[] } {
  const presetApplied = applyPreset(opts.base, opts.preset);
  const blended = blendDials(presetApplied, opts.donor, opts.blend);
  const nudged = { ...blended, ...opts.overrides };
  const locks = collectLocks(opts);
  if (opts.preset === "commentary") {
    locks.push({
      dial: "entry_mode",
      min: opts.base.entry_mode,
      max: opts.base.entry_mode,
      reason: "Commentary: entry mode stays at the base voice",
      source: "preset",
    });
  }
  return { dials: applyLocks(nudged, locks), locks };
}
