import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Verdict } from "@/lib/voice/types";

export function Gauge({
  label,
  value,
  reading,
  band,
}: {
  label: string;
  value: number;
  reading: string;
  band?: { from: number; to: number };
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="rounded-lg bg-raised p-4">
      <p className="text-xs font-medium tracking-widest text-subtle uppercase">{label}</p>
      <p className="mt-1 font-display text-5xl leading-none tracking-tight tabular-nums">
        {Math.round(clamped)}
      </p>
      <p className="mt-3 text-sm text-muted">{reading}</p>
      <div className="relative mt-5">
        <div className="h-1.5 overflow-hidden rounded-full bg-bg">
          {band ? (
            <div
              className="h-full bg-sage/35"
              style={{
                marginLeft: `${band.from}%`,
                width: `${Math.max(0, band.to - band.from)}%`,
              }}
            />
          ) : (
            <div className="h-full bg-fg/20" style={{ width: `${clamped}%` }} />
          )}
        </div>
        <div
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg shadow-[var(--shadow-border)] transition-[left] duration-500 ease-[var(--ease-out)]"
          style={{ left: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export function VerdictChip({ verdict }: { verdict: Verdict }) {
  const tone = verdict === "ready for Claude" ? "sage" : verdict === "stop" ? "clay" : "amber";
  return <Badge tone={tone}>{verdict}</Badge>;
}

export function HighlightedDraft({
  draft,
  grams,
}: {
  draft: string;
  grams: string[];
}) {
  if (!grams.length) {
    return <p className="whitespace-pre-wrap text-sm leading-relaxed">{draft}</p>;
  }
  const escaped = grams
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map((g) => g.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!escaped.length) {
    return <p className="whitespace-pre-wrap text-sm leading-relaxed">{draft}</p>;
  }
  const re = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = draft.split(re);
  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className={cn("rounded-xs bg-clay-dim text-clay")}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </p>
  );
}
