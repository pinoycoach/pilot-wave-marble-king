import { Lock } from "lucide-react";
import { DIAL_META, type DialKey } from "@/lib/voice/dials";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type LockInfo = {
  max?: number | null;
  min?: number | null;
  reason: string;
};

export function DialSlider({
  dial,
  value,
  base,
  donor,
  lock,
  onChange,
}: {
  dial: DialKey;
  value: number;
  base?: number;
  donor?: number | null;
  lock?: LockInfo;
  onChange: (n: number) => void;
}) {
  const meta = DIAL_META[dial];
  const min = lock?.min ?? 0;
  const max = lock?.max ?? 100;
  const locked = value === min && value === max && min === max;

  return (
    <div className="py-2">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="text-sm text-fg">{meta.label}</p>
          {lock ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-amber">
                  <Lock className="size-3" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {lock.reason || "Locked"}
                {lock.max != null ? ` · max ${lock.max}` : ""}
                {lock.min != null ? ` · min ${lock.min}` : ""}
              </TooltipContent>
            </Tooltip>
          ) : null}
        </div>
        <span className="tabular-nums text-sm text-muted">{value}</span>
      </div>
      <p className="mt-0.5 text-xs text-subtle">
        {value <= 50 ? meta.zero : meta.hundred}
      </p>
      <div className="relative mt-2">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-raised shadow-[var(--shadow-border)]" />
        {typeof base === "number" ? (
          <span
            className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted"
            style={{ left: `${base}%` }}
            title="Base"
          />
        ) : null}
        {typeof donor === "number" ? (
          <span
            className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sage"
            style={{ left: `${donor}%` }}
            title="Donor"
          />
        ) : null}
        {lock?.max != null && lock.max < 100 ? (
          <span
            className="absolute top-0 h-full w-px bg-amber/80"
            style={{ left: `${lock.max}%` }}
          />
        ) : null}
        {lock?.min != null && lock.min > 0 ? (
          <span
            className="absolute top-0 h-full w-px bg-amber/80"
            style={{ left: `${lock.min}%` }}
          />
        ) : null}
        <input
          type="range"
          className={cn("dial-range relative z-10", locked && "opacity-60")}
          min={min}
          max={max}
          value={value}
          disabled={locked}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={meta.label}
        />
      </div>
    </div>
  );
}
