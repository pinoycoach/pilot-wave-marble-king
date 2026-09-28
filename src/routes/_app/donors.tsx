import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { listDonorScans, runDonorScan } from "@/lib/api/donors";
import { listVoices } from "@/lib/api/voices";
import { Fingerprint } from "@/components/fingerprint";
import { QueryError } from "@/components/query-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DIAL_KEYS, DIAL_META } from "@/lib/voice/dials";
import { relativeTime } from "@/lib/utils";
import type { DonorScan } from "@/lib/voice/types";
import { failMessage } from "@/lib/fail";

type Search = { handle?: string; domain?: string };

export const Route = createFileRoute("/_app/donors")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    handle: typeof s.handle === "string" ? s.handle : undefined,
    domain: typeof s.domain === "string" ? s.domain : undefined,
  }),
  component: DonorsPage,
});

function DonorsPage() {
  const search = useSearch({ from: "/_app/donors" });
  const scans = useQuery({ queryKey: ["donors"], queryFn: () => listDonorScans() });
  const voices = useQuery({ queryKey: ["voices"], queryFn: () => listVoices() });
  const [handle, setHandle] = useState(search.handle ?? "");
  const [domain, setDomain] = useState(search.domain ?? "");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [baseId, setBaseId] = useState("");

  useEffect(() => {
    if (search.handle) setHandle(search.handle);
    if (search.domain) setDomain(search.domain);
  }, [search.handle, search.domain]);

  useEffect(() => {
    if (voices.data?.length && !baseId) {
      const core = voices.data.find((v) => v.kind === "core") ?? voices.data[0];
      setBaseId(core.id);
    }
  }, [voices.data, baseId]);

  useEffect(() => {
    if (scans.data?.length && !selectedId) setSelectedId(scans.data[0].id);
  }, [scans.data, selectedId]);

  const scanMut = useMutation({
    mutationFn: async (force: boolean) => {
      const res = await runDonorScan({ data: { handle, domain, force } });
      if (!res.ok) throw new Error(res.error);
      return res;
    },
    onSuccess: (res) => {
      toast.success(res.cached ? "Loaded from 24h cache" : "Donor scanned");
      void scans.refetch().then(() => setSelectedId(res.scan.id));
    },
    onError: (err: Error) => toast.error(failMessage(err)),
  });

  const selected = scans.data?.find((s) => s.id === selectedId) ?? null;
  const base = voices.data?.find((v) => v.id === baseId) ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
      <p className="text-xs font-medium tracking-widest text-subtle uppercase">Technique, not content</p>
      <h1 className="font-display text-4xl tracking-tight italic sm:text-5xl">Donors</h1>
      <p className="mt-3 max-w-xl text-sm text-muted">
        Measure a leading voice on the same dials. Borrow moves and positions. Never words.
      </p>

      <form
        className="mt-8 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          scanMut.mutate(false);
        }}
      >
        <Input
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="@handle"
          aria-label="X handle"
        />
        <Input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="domain — bazi, manifestation… (optional)"
          aria-label="Domain"
        />
        <Button type="submit" disabled={scanMut.isPending}>
          {scanMut.isPending ? <Loader2 className="animate-spin" /> : null}
          Scan donor
        </Button>
      </form>
      <QueryError error={scans.error} label="Donors" />
      <QueryError error={voices.error} label="Voices" />

      <div className="mt-8 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-2">
          {(scans.data ?? []).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedId(s.id)}
              className={`rounded-md p-3 text-left ${s.id === selectedId ? "bg-raised" : "hover:bg-raised/50"}`}
            >
              <p className="text-sm">@{s.handle}</p>
              <p className="text-xs text-muted">
                {s.domain} · {relativeTime(s.scannedAt)}
              </p>
            </button>
          ))}
          {!scans.data?.length && !scanMut.isPending ? (
            <p className="px-1 text-sm text-muted">No scans yet. Start with a public handle.</p>
          ) : null}
        </aside>
        {selected ? (
          <DonorDetail
            scan={selected}
            baseDials={base?.dials}
            baseId={baseId}
            voices={voices.data ?? []}
            onBase={setBaseId}
            onRescan={() => {
              setHandle(selected.handle);
              setDomain(selected.domain);
              scanMut.mutate(true);
            }}
            scanning={scanMut.isPending}
          />
        ) : scanMut.isPending ? (
          <p className="shimmer-text text-sm">Reading the last 30 days of their posts</p>
        ) : null}
      </div>
    </div>
  );
}

function DonorDetail({
  scan,
  baseDials,
  baseId,
  voices,
  onBase,
  onRescan,
  scanning,
}: {
  scan: DonorScan;
  baseDials?: DonorScan["dials"];
  baseId: string;
  voices: { id: string; name: string }[];
  onBase: (id: string) => void;
  onRescan: () => void;
  scanning: boolean;
}) {
  return (
    <div className="animate-fade-up flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-3xl tracking-tight">@{scan.handle}</h2>
            {scan.quiet ? <Badge tone="amber">Quiet</Badge> : <Badge tone="sage">{scan.sampleCount} posts</Badge>}
          </div>
          <p className="mt-1 text-sm text-muted">
            {scan.domain} · {scan.model} · {relativeTime(scan.scannedAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={baseId} onChange={(e) => onBase(e.target.value)} className="w-44">
            {voices.map((v) => (
              <option key={v.id} value={v.id}>
                vs {v.name}
              </option>
            ))}
          </Select>
          <Button variant="outline" size="sm" onClick={onRescan} disabled={scanning}>
            Rescan
          </Button>
          <Button size="sm" asChild>
            <Link to="/" search={{ donor: scan.id }}>
              Send to Mixer
            </Link>
          </Button>
        </div>
      </div>

      <Fingerprint dials={scan.dials} donor={baseDials} className="h-12" />

      <div>
        <p className="text-xs font-medium tracking-widest text-subtle uppercase">Dials vs base</p>
        <ul className="mt-3 flex flex-col gap-3">
          {DIAL_KEYS.map((key) => {
            const donor = scan.dials[key];
            const base = baseDials?.[key];
            return (
              <li key={key}>
                <div className="flex justify-between text-xs">
                  <span className="text-muted">{DIAL_META[key].label}</span>
                  <span className="tabular-nums text-subtle">
                    {typeof base === "number" ? `base ${base} · ` : ""}donor {donor}
                  </span>
                </div>
                <div className="relative mt-1.5 h-1.5 rounded-full bg-bg">
                  {typeof base === "number" ? (
                    <span
                      className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted"
                      style={{ left: `${base}%` }}
                    />
                  ) : null}
                  <span
                    className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sage"
                    style={{ left: `${donor}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
        {scan.dialNotes ? <p className="mt-3 text-sm leading-relaxed text-muted">{scan.dialNotes}</p> : null}
      </div>

      <div>
        <p className="text-xs font-medium tracking-widest text-subtle uppercase">Structural moves</p>
        <ul className="mt-3 flex flex-col gap-3">
          {scan.moves.map((m) => (
            <li key={m.name} className="rounded-md bg-raised p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm">{m.name}</p>
                <Badge tone={m.frequency === "signature" ? "sage" : "muted"}>{m.frequency}</Badge>
              </div>
              <p className="mt-1 font-mono text-xs text-muted">{m.pattern}</p>
              <p className="mt-2 text-sm text-muted">{m.description}</p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs font-medium tracking-widest text-clay uppercase">Never use</p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {scan.signaturePhrases.map((p) => (
            <li key={p}>
              <Badge tone="clay">{p}</Badge>
            </li>
          ))}
        </ul>
      </div>

      {scan.topicsNow.length ? (
        <p className="text-sm text-muted">On now: {scan.topicsNow.join(" · ")}</p>
      ) : null}

      {scan.citations.length ? (
        <div>
          <p className="text-xs font-medium tracking-widest text-subtle uppercase">Citations</p>
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
    </div>
  );
}
