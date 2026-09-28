import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { addResult, listResults } from "@/lib/api/results";
import { listRuns } from "@/lib/api/runs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QueryError } from "@/components/query-error";
import { Select } from "@/components/ui/select";
import { DIAL_META, DIAL_KEYS } from "@/lib/voice/dials";
import type { ResultLog } from "@/lib/voice/types";
import { failMessage } from "@/lib/fail";

export const Route = createFileRoute("/_app/results")({ component: ResultsPage });

function ratio(num: number, den: number): number {
  if (!den) return 0;
  return num / den;
}

function ResultsPage() {
  const results = useQuery({ queryKey: ["results"], queryFn: () => listResults() });
  const runs = useQuery({ queryKey: ["runs"], queryFn: () => listRuns() });
  const [runId, setRunId] = useState("");
  const [platform, setPlatform] = useState("x");
  const [postedAt, setPostedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [views, setViews] = useState("0");
  const [shares, setShares] = useState("0");
  const [saves, setSaves] = useState("0");
  const [replies, setReplies] = useState("0");
  const [longReplies, setLongReplies] = useState("0");

  const mut = useMutation({
    mutationFn: () =>
      addResult({
        data: {
          runId,
          platform,
          postedAt,
          views: Number(views) || 0,
          shares: Number(shares) || 0,
          saves: Number(saves) || 0,
          replies: Number(replies) || 0,
          longReplies: Number(longReplies) || 0,
        },
      }),
    onSuccess: () => {
      toast.success("Logged");
      void results.refetch();
    },
    onError: (err: Error) => toast.error(failMessage(err)),
  });

  const rows = results.data ?? [];
  const beaters = useMemo(() => findBeaters(rows), [rows]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
      <p className="text-xs font-medium tracking-widest text-subtle uppercase">After it ships elsewhere</p>
      <h1 className="font-display text-4xl tracking-tight italic sm:text-5xl">Results</h1>
      <p className="mt-3 max-w-xl text-sm text-muted">
        Log the numbers by hand. Compared to your rolling baseline for that voice + domain +
        platform. No auto-tuning.
      </p>
      <QueryError error={results.error} label="Results" />
      <QueryError error={runs.error} label="Runs" />

      <form
        className="mt-8 grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          mut.mutate();
        }}
      >
        <Select value={runId} onChange={(e) => setRunId(e.target.value)} required>
          <option value="">Select a run</option>
          {(runs.data ?? []).map((r) => (
            <option key={r.id} value={r.id}>
              {r.voiceName} · {r.recipe.format} · {r.createdAt.slice(0, 16).replace("T", " ")}
            </option>
          ))}
        </Select>
        <Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
          <option value="x">X</option>
          <option value="facebook">Facebook</option>
          <option value="newsletter">Newsletter</option>
          <option value="other">Other</option>
        </Select>
        <Input type="date" value={postedAt} onChange={(e) => setPostedAt(e.target.value)} />
        <Input inputMode="numeric" value={views} onChange={(e) => setViews(e.target.value)} placeholder="views" />
        <Input inputMode="numeric" value={shares} onChange={(e) => setShares(e.target.value)} placeholder="shares" />
        <Input inputMode="numeric" value={saves} onChange={(e) => setSaves(e.target.value)} placeholder="saves" />
        <Input inputMode="numeric" value={replies} onChange={(e) => setReplies(e.target.value)} placeholder="replies" />
        <Input
          inputMode="numeric"
          value={longReplies}
          onChange={(e) => setLongReplies(e.target.value)}
          placeholder="long replies"
        />
        <Button type="submit" disabled={!runId || mut.isPending} className="sm:col-span-2">
          Log result
        </Button>
      </form>

      <div className="desk-scroll mt-10 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs tracking-widest text-subtle uppercase">
            <tr>
              <th className="py-2 pr-3 font-medium">Posted</th>
              <th className="py-2 pr-3 font-medium">Voice</th>
              <th className="py-2 pr-3 font-medium">Platform</th>
              <th className="py-2 pr-3 font-medium">Share rate</th>
              <th className="py-2 pr-3 font-medium">Long reply rate</th>
              <th className="py-2 font-medium">Vs baseline</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const shareRate = ratio(r.shares, r.views);
              const longRate = ratio(r.longReplies, r.views);
              const beat = beaters.has(r.id);
              return (
                <tr key={r.id} className="border-t border-border">
                  <td className="py-3 pr-3 tabular-nums">{r.postedAt}</td>
                  <td className="py-3 pr-3">{r.voiceName}</td>
                  <td className="py-3 pr-3">{r.platform}</td>
                  <td className="py-3 pr-3 tabular-nums">{(shareRate * 100).toFixed(2)}%</td>
                  <td className="py-3 pr-3 tabular-nums">{(longRate * 100).toFixed(2)}%</td>
                  <td className="py-3">{beat ? <Badge tone="sage">Beat</Badge> : <Badge>Baseline</Badge>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!rows.length ? <p className="mt-6 text-sm text-muted">No logs yet.</p> : null}
      </div>

      {beaters.size ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl tracking-tight">What beat baseline</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {rows
              .filter((r) => beaters.has(r.id))
              .map((r) => (
                <li key={r.id} className="rounded-md bg-raised p-4 text-sm">
                  <p>
                    {r.voiceName} · {r.domain || "no domain"} · {r.platform}
                  </p>
                  {r.recipe ? (
                    <p className="mt-2 text-xs leading-relaxed text-muted">
                      {DIAL_KEYS.map((k) => `${DIAL_META[k].label} ${r.recipe!.dials[k]}`).join(" · ")}
                    </p>
                  ) : null}
                  {r.recipe?.moveWeights.filter((m) => m.weight > 0).length ? (
                    <p className="mt-1 text-xs text-muted">
                      Moves: {r.recipe.moveWeights.filter((m) => m.weight > 0).map((m) => m.name).join(", ")}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-subtle">No borrowed moves</p>
                  )}
                </li>
              ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function findBeaters(rows: ResultLog[]): Set<string> {
  const groups = new Map<string, ResultLog[]>();
  for (const row of rows) {
    const key = `${row.voiceName}|${row.domain}|${row.platform}`;
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }
  const beat = new Set<string>();
  for (const list of groups.values()) {
    const sorted = [...list].sort((a, b) => a.postedAt.localeCompare(b.postedAt));
    for (let i = 0; i < sorted.length; i += 1) {
      const prior = sorted.slice(0, i);
      if (!prior.length) continue;
      const baseShare =
        prior.reduce((s, r) => s + ratio(r.shares, r.views), 0) / prior.length;
      const baseLong =
        prior.reduce((s, r) => s + ratio(r.longReplies, r.views), 0) / prior.length;
      const row = sorted[i];
      if (ratio(row.shares, row.views) > baseShare || ratio(row.longReplies, row.views) > baseLong) {
        beat.add(row.id);
      }
    }
  }
  return beat;
}
