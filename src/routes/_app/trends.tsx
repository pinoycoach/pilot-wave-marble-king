import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { listTrendScans, runTrendScan } from "@/lib/api/trends";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QueryError } from "@/components/query-error";
import { relativeTime } from "@/lib/utils";
import type { TrendScan } from "@/lib/voice/types";
import { failMessage } from "@/lib/fail";

export const Route = createFileRoute("/_app/trends")({ component: TrendsPage });

function TrendsPage() {
  const scans = useQuery({ queryKey: ["trends"], queryFn: () => listTrendScans() });
  const [query, setQuery] = useState("");
  const [current, setCurrent] = useState<TrendScan | null>(null);

  const mut = useMutation({
    mutationFn: async () => {
      const res = await runTrendScan({ data: { query } });
      if (!res.ok) throw new Error(res.error);
      return res;
    },
    onSuccess: (res) => {
      setCurrent(res.scan);
      toast.success(res.cached ? "Loaded from 30-minute cache" : "Trend scan complete");
      void scans.refetch();
    },
    onError: (err: Error) => toast.error(failMessage(err)),
  });

  const shown = current ?? scans.data?.[0] ?? null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-8 sm:py-10">
      <p className="text-xs font-medium tracking-widest text-subtle uppercase">Last 48 hours on X</p>
      <h1 className="font-display text-4xl tracking-tight italic sm:text-5xl">Trends</h1>
      <p className="mt-3 text-sm text-muted">
        A topic, a keyword, or “what’s trending in [domain].” Quiet is a valid answer.
      </p>

      <form
        className="mt-8 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          mut.mutate();
        }}
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="what’s trending in bazi"
          aria-label="Trend query"
        />
        <Button type="submit" disabled={mut.isPending} className="sm:w-40">
          {mut.isPending ? <Loader2 className="animate-spin" /> : null}
          Scan
        </Button>
      </form>
      <QueryError error={scans.error} label="Trends" />

      {mut.isPending ? (
        <p className="shimmer-text mt-8 text-sm">Searching X for the last 48 hours</p>
      ) : null}

      {shown && !mut.isPending ? <TrendCard scan={shown} /> : null}

      {(scans.data ?? []).length > 1 ? (
        <div className="mt-10">
          <p className="text-xs font-medium tracking-widest text-subtle uppercase">Recent</p>
          <ul className="mt-3 flex flex-col gap-2">
            {scans.data!.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className="w-full rounded-md px-3 py-2 text-left hover:bg-raised"
                  onClick={() => setCurrent(s)}
                >
                  <p className="text-sm">{s.headline}</p>
                  <p className="text-xs text-subtle">
                    {s.query} · {relativeTime(s.scannedAt)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function TrendCard({ scan }: { scan: TrendScan }) {
  return (
    <article className="mt-8 animate-fade-up">
      <div className="flex items-center gap-2">
        {scan.quiet ? <Badge tone="amber">Quiet</Badge> : <Badge tone="sage">Live</Badge>}
        <span className="text-xs text-subtle">
          {scan.model} · {relativeTime(scan.scannedAt)}
        </span>
      </div>
      <h2 className="mt-4 font-display text-3xl leading-snug tracking-tight">{scan.headline}</h2>
      <p className="mt-4 text-sm leading-relaxed text-muted">{scan.crowdRead}</p>

      <h3 className="mt-8 text-xs font-medium tracking-widest text-subtle uppercase">
        Angles few are taking
      </h3>
      <ul className="mt-2 flex flex-col gap-1.5">
        {scan.angles.map((a) => (
          <li key={a} className="text-sm before:mr-2 before:text-subtle before:content-['–']">
            {a}
          </li>
        ))}
      </ul>

      {scan.leadingVoices.length ? (
        <div className="mt-8">
          <h3 className="text-xs font-medium tracking-widest text-subtle uppercase">Leading voices</h3>
          <ul className="mt-3 flex flex-col gap-3">
            {scan.leadingVoices.map((v) => (
              <li key={v.handle} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-raised px-3 py-3">
                <div>
                  <p className="text-sm">@{v.handle.replace(/^@/, "")}</p>
                  <p className="text-xs text-muted">{v.why}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link
                    to="/donors"
                    search={{ handle: v.handle.replace(/^@/, ""), domain: scan.query }}
                  >
                    Scan as donor
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {scan.watch ? (
        <p className="mt-6 text-sm">
          <span className="text-subtle">Watch · </span>
          {scan.watch}
        </p>
      ) : null}

      {scan.citations.length ? (
        <div className="mt-6">
          <h3 className="text-xs font-medium tracking-widest text-subtle uppercase">Citations</h3>
          <ul className="mt-2 flex flex-col gap-1">
            {scan.citations.map((c, i) => (
              <li key={`${c.source}-${i}`} className="text-xs text-muted">
                {c.url ? (
                  <a href={c.url} target="_blank" rel="noreferrer" className="text-fg underline decoration-border-strong underline-offset-2">
                    {c.source}
                  </a>
                ) : (
                  <span className="text-fg">{c.source}</span>
                )}
                {c.note ? ` — ${c.note}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-8">
        <Button asChild>
          <Link to="/" search={{ trend: scan.id }}>
            Send to Mixer
          </Link>
        </Button>
      </div>
    </article>
  );
}
