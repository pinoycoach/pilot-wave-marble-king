import { DIAL_KEYS } from "@/lib/voice/dials";
import type { Dials } from "@/lib/voice/dials";
import { cn } from "@/lib/utils";

export function Fingerprint({
  dials,
  donor,
  className,
}: {
  dials: Dials;
  donor?: Dials | null;
  className?: string;
}) {
  return (
    <div className={cn("flex h-10 items-end gap-0.5", className)} aria-hidden>
      {DIAL_KEYS.map((key) => (
        <div key={key} className="relative flex h-full flex-1 items-end">
          <div
            className="w-full rounded-sm bg-fg/70"
            style={{ height: `${Math.max(8, dials[key])}%` }}
          />
          {donor ? (
            <div
              className="absolute bottom-0 left-0 w-full rounded-sm bg-sage/50"
              style={{ height: `${Math.max(6, donor[key])}%` }}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
