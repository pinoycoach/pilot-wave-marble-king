import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { listDomainLocks, listVoices, lockAsVoice } from "@/lib/api/voices";
import { listDonorScans } from "@/lib/api/donors";
import { listTrendScans } from "@/lib/api/trends";
import { generateDraft, meterDraft, saveRunDraft, autoTuneDraft } from "@/lib/api/runs";
import { CopyButton } from "@/components/copy-button";
import { DialSlider } from "@/components/dial-slider";
import { Fingerprint } from "@/components/fingerprint";
import { Gauge, HighlightedDraft, VerdictChip } from "@/components/gauge";
import { QueryError } from "@/components/query-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { DIAL_KEYS, DIAL_META, FORMAT_LABEL, FORMATS, GENRE_PRESETS, PRESET_META, type DialKey, type Format, type GenrePreset } from "@/lib/voice/dials";
import { lockForDial, mixDials } from "@/lib/voice/mix";
import { buildClaudePacket, enabledMoves } from "@/lib/voice/packet";
import type { MeterResult, MoveWeight, Recipe, Verdict } from "@/lib/voice/types";
import { failMessage } from "@/lib/fail";

type Search = { voice?: string; donor?: string; trend?: string };

export const Route = createFileRoute("/_app/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    voice: typeof s.voice === "string" ? s.voice : undefined,
    donor: typeof s.donor === "string" ? s.donor : undefined,
    trend: typeof s.trend === "string" ? s.trend : undefined,
  }),
  component: MixerPage,
});

function MixerPage() {
  const search = Route.useSearch();
  const voices = useQuery({ queryKey: ["voices"], queryFn: () => listVoices() });
  const donors = useQuery({ queryKey: ["donors"], queryFn: () => listDonorScans() });
  const trends = useQuery({ queryKey: ["trends"], queryFn: () => listTrendScans() });
  const locksQ = useQuery({ queryKey: ["domain-locks"], queryFn: () => listDomainLocks() });

  const [voiceId, setVoiceId] = useState("");
  const [donorId, setDonorId] = useState("");
  const [trendId, setTrendId] = useState("");
  const [topic, setTopic] = useState("");
  const [domain, setDomain] = useState("");
  const [format, setFormat] = useState<Format>("x_post");
  const [preset, setPreset] = useState<GenrePreset>("none");
  const [blend, setBlend] = useState(0);
  const [overrides, setOverrides] = useState<Partial<Record<(typeof DIAL_KEYS)[number], number>>>({});
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [keep, setKeep] = useState("");
  const [embedSkill, setEmbedSkill] = useState(false);
  const [angle, setAngle] = useState("");
  const [draft, setDraft] = useState("");
  const [runId, setRunId] = useState<string | null>(null);
  const [meters, setMeters] = useState<MeterResult | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [lockOpen, setLockOpen] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [tuneInfo, setTuneInfo] = useState<{
    roundsUsed: number;
    stoppedAt: "ready" | "slop" | "exhausted";
    blockingNotes: string;
    nudgedDial: DialKey | null;
  } | null>(null);
  const skipOverrideReset = useRef(false);

  useEffect(() => {
    if (!voices.data?.length || voiceId) return;
    const preferred = voices.data.find((v) => v.id === search.voice) ?? voices.data.find((v) => v.kind === "core") ?? voices.data[0];
    if (preferred) setVoiceId(preferred.id);
  }, [voices.data, search.voice, voiceId]);

  useEffect(() => {
    if (search.donor) setDonorId(search.donor);
  }, [search.donor]);

  useEffect(() => {
    if (!search.trend || !trends.data) return;
    const t = trends.data.find((s) => s.id === search.trend);
    if (t) {
      setTrendId(t.id);
      setTopic(t.query);
    }
  }, [search.trend, trends.data]);

  const voice = voices.data?.find((v) => v.id === voiceId) ?? null;
  const donor = donors.data?.find((d) => d.id === donorId) ?? null;
  const trend = trends.data?.find((t) => t.id === trendId) ?? null;

  useEffect(() => {
    if (donor && !domain) setDomain(donor.domain);
  }, [donor, domain]);

  useEffect(() => {
    if (skipOverrideReset.current) {
      skipOverrideReset.current = false;
      return;
    }
    setOverrides({});
  }, [blend, preset, voiceId, donorId]);

  useEffect(() => {
    if (!donor) {
      setWeights({});
      return;
    }
    setWeights((prev) => {
      const next: Record<string, number> = {};
      for (const m of donor.moves) next[m.name] = prev[m.name] ?? 0;
      return next;
    });
  }, [donor]);

  const mixed = useMemo(() => {
    if (!voice) return null;
    return mixDials({
      base: voice.dials,
      donor: donor?.dials ?? null,
      blend: donor ? blend : 0,
      preset,
      overrides,
      voiceLocks: voice.locks,
      domainLocks: locksQ.data ?? [],
      domain,
    });
  }, [voice, donor, blend, preset, overrides, locksQ.data, domain]);

  const recipe: Recipe | null = mixed
    ? {
        blend: donor ? blend : 0,
        dials: mixed.dials,
        preset,
        format,
        topic: topic || trend?.query || "",
        domain,
        keep,
        angle,
        moveWeights: Object.entries(weights).map(([name, weight]) => ({ name, weight }) satisfies MoveWeight),
      }
    : null;

  const draftMut = useMutation({
    mutationFn: async () => {
      if (!voice || !recipe) throw new Error("Pick a voice first");
      const res = await generateDraft({
        data: {
          voiceId: voice.id,
          donorScanId: donor?.id ?? null,
          trendScanId: trend?.id ?? null,
          recipe,
        },
      });
      if (!res.ok) throw new Error(res.error);
      return res;
    },
    onSuccess: (res) => {
      setDraft(res.draft);
      setRunId(res.runId);
      setMeters(null);
      setVerdict(null);
      setTuneInfo(null);
      toast.success("Test draft ready");
    },
    onError: (err: Error) => toast.error(failMessage(err)),
  });

  const meterMut = useMutation({
    mutationFn: async () => {
      if (!voice || !recipe || !draft.trim()) throw new Error("Generate or paste a draft first");
      if (runId) await saveRunDraft({ data: { runId, draft } });
      const res = await meterDraft({
        data: {
          runId: runId ?? undefined,
          draft,
          voiceId: voice.id,
          donorScanId: donor?.id ?? null,
          recipe,
        },
      });
      if (!res.ok) throw new Error(res.error);
      return res;
    },
    onSuccess: (res) => {
      setMeters(res.meters);
      setVerdict(res.verdict);
      setRunId(res.runId);
      toast.success("Metered");
    },
    onError: (err: Error) => toast.error(failMessage(err)),
  });

  const tuneMut = useMutation({
    mutationFn: async () => {
      if (!voice) throw new Error("Pick a voice first");
      const res = await autoTuneDraft({
        data: {
          voiceId: voice.id,
          donorScanId: donor?.id ?? null,
          trendScanId: trend?.id ?? null,
          format,
          preset,
          topic: topic || trend?.query || "",
          domain,
          keep,
          angle,
        },
      });
      if (!res.ok) throw new Error(res.error);
      return res;
    },
    onSuccess: (res) => {
      skipOverrideReset.current = true;
      setBlend(res.recipe.blend);
      const nextWeights: Record<string, number> = {};
      for (const w of res.recipe.moveWeights) nextWeights[w.name] = w.weight;
      setWeights(nextWeights);
      setOverrides(res.recipe.dials);
      setDraft(res.draft);
      setRunId(res.runId);
      setMeters(res.meters);
      setVerdict(res.verdict);
      setTuneInfo({
        roundsUsed: res.roundsUsed,
        stoppedAt: res.stoppedAt,
        blockingNotes: res.blockingNotes,
        nudgedDial: res.nudgedDial,
      });
      if (res.stoppedAt === "ready") toast.success(`Ready for Claude · ${res.roundsUsed} of 4 rounds`);
      else if (res.stoppedAt === "slop") toast.error("Slop is the only blocker. Edit that by hand.");
      else toast.message(`Closest of ${res.roundsUsed} rounds. Core still blocked.`);
    },
    onError: (err: Error) => toast.error(failMessage(err)),
  });

  const lockMut = useMutation({
    mutationFn: async () => {
      if (!voice || !mixed) throw new Error("Nothing to lock");
      const res = await lockAsVoice({
        data: {
          name: brandName,
          parentId: voice.kind === "core" ? voice.id : (voice.parentId ?? voice.id),
          dials: mixed.dials,
          banned: voice.banned,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Locked as a brand voice");
      setLockOpen(false);
      setBrandName("");
      void voices.refetch();
    },
    onError: (err: Error) => toast.error(failMessage(err)),
  });

  const packet =
    voice && mixed && recipe
      ? buildClaudePacket({
          voiceName: voice.name,
          sourceText: voice.sourceText,
          embedSkill,
          keep,
          dials: mixed.dials,
          moves: enabledMoves(donor?.moves, recipe.moveWeights),
          neverUse: [...voice.banned, ...(donor?.signaturePhrases ?? [])],
          format,
          preset,
          topic: recipe.topic,
          trend,
          angle,
          draft,
        })
      : "";

  function downloadPacket() {
    if (!keep.trim()) {
      toast.error("KEEP is required before export");
      return;
    }
    const blob = new Blob([packet], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "claude-packet.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-widest text-subtle uppercase">The lab</p>
          <h1 className="font-display text-4xl tracking-tight italic sm:text-5xl">Mixer</h1>
        </div>
        {mixed ? (
          <div className="w-40">
            <Fingerprint dials={mixed.dials} donor={donor?.dials} />
          </div>
        ) : null}
      </div>
      <QueryError error={voices.error} label="Voices" />
      <QueryError error={donors.error} label="Donors" />
      <QueryError error={trends.error} label="Trends" />
      {voices.isPending ? <p className="shimmer-text mt-6 text-sm">Loading Napoleon Core</p> : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="flex flex-col gap-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Base voice">
              <Select value={voiceId} onChange={(e) => setVoiceId(e.target.value)}>
                <option value="">Select a voice</option>
                {(voices.data ?? []).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Donor">
              <Select
                value={donorId}
                onChange={(e) => {
                  setDonorId(e.target.value);
                  setBlend(e.target.value ? 30 : 0);
                }}
              >
                <option value="">None</option>
                {(donors.data ?? []).map((d) => (
                  <option key={d.id} value={d.id}>
                    @{d.handle} · {d.domain}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Format">
              <Select value={format} onChange={(e) => setFormat(e.target.value as Format)}>
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {FORMAT_LABEL[f]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Genre preset">
              <Select value={preset} onChange={(e) => setPreset(e.target.value as GenrePreset)}>
                {GENRE_PRESETS.map((g) => (
                  <option key={g} value={g}>
                    {PRESET_META[g].label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          {PRESET_META[preset].note ? (
            <p className="text-xs text-muted">{PRESET_META[preset].note}</p>
          ) : null}

          <Field label="Topic">
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What is this piece about — or leave blank" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Saved trend">
              <Select
                value={trendId}
                onChange={(e) => {
                  setTrendId(e.target.value);
                  const t = trends.data?.find((s) => s.id === e.target.value);
                  if (t) setTopic(t.query);
                }}
              >
                <option value="">None</option>
                {(trends.data ?? []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.headline.slice(0, 48)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Domain">
              <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="bazi, faith, food…" />
            </Field>
          </div>
          {trend?.angles.length ? (
            <Field label="Angle">
              <Select value={angle} onChange={(e) => setAngle(e.target.value)}>
                <option value="">Choose an angle</option>
                {trend.angles.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}

          {donor ? (
            <div>
              <div className="flex items-baseline justify-between">
                <Label>Donor blend</Label>
                <span className="tabular-nums text-sm text-muted">{blend}</span>
              </div>
              <input
                type="range"
                className="dial-range mt-2"
                min={0}
                max={100}
                value={blend}
                onChange={(e) => setBlend(Number(e.target.value))}
                aria-label="Donor blend"
              />
              <div className="mt-1 flex justify-between text-xs text-subtle">
                <span>Base only</span>
                <span>Toward donor</span>
              </div>
            </div>
          ) : null}

          {mixed ? (
            <div>
              <p className="text-xs font-medium tracking-widest text-subtle uppercase">Dials</p>
              <div className="mt-1 divide-y divide-border">
                {DIAL_KEYS.map((key) => (
                  <DialSlider
                    key={key}
                    dial={key}
                    value={mixed.dials[key]}
                    base={voice?.dials[key]}
                    donor={donor?.dials[key]}
                    lock={lockForDial(mixed.locks, key)}
                    onChange={(n) => setOverrides((prev) => ({ ...prev, [key]: n }))}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {donor?.moves.length ? (
            <div>
              <p className="text-xs font-medium tracking-widest text-subtle uppercase">
                Move weights
              </p>
              <p className="mt-1 text-xs text-subtle">Default off. Turn on only what you want to borrow.</p>
              <ul className="mt-3 flex flex-col gap-3">
                {donor.moves.map((m) => (
                  <li key={m.name} className="rounded-md bg-raised p-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm">{m.name}</p>
                      <span className="tabular-nums text-xs text-muted">
                        {(weights[m.name] ?? 0).toFixed(1)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted">{m.pattern}</p>
                    <input
                      type="range"
                      className="dial-range mt-2"
                      min={0}
                      max={1}
                      step={0.1}
                      value={weights[m.name] ?? 0}
                      onChange={(e) =>
                        setWeights((prev) => ({ ...prev, [m.name]: Number(e.target.value) }))
                      }
                      aria-label={`${m.name} weight`}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => draftMut.mutate()}
              disabled={draftMut.isPending || tuneMut.isPending || !voice}
            >
              {draftMut.isPending ? <Loader2 className="animate-spin" /> : null}
              Test draft
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => tuneMut.mutate()}
              disabled={tuneMut.isPending || draftMut.isPending || !voice}
            >
              {tuneMut.isPending ? <Loader2 className="animate-spin" /> : null}
              Auto-tune
            </Button>
            <Button type="button" variant="outline" onClick={() => meterMut.mutate()} disabled={meterMut.isPending || tuneMut.isPending || !draft}>
              {meterMut.isPending ? <Loader2 className="animate-spin" /> : null}
              Meter it
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (!keep.trim()) {
                  toast.error("KEEP is required before export");
                  return;
                }
                void navigator.clipboard.writeText(packet).then(
                  () => toast.success("Claude packet copied"),
                  () => downloadPacket(),
                );
              }}
              disabled={!draft}
            >
              Export Claude packet
            </Button>
            <Button variant="ghost" onClick={() => setLockOpen(true)} disabled={!mixed}>
              Lock as new voice
            </Button>
          </div>

          <Field label="KEEP — required for export">
            <Input
              value={keep}
              onChange={(e) => setKeep(e.target.value)}
              placeholder="The structure or device that must not move"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              className="size-4 accent-fg"
              checked={embedSkill}
              onChange={(e) => setEmbedSkill(e.target.checked)}
            />
            Embed full voice skill
          </label>

          {draftMut.isError ? (
            <p className="text-sm text-clay">{failMessage(draftMut.error)}</p>
          ) : null}
          {tuneMut.isError ? (
            <p className="text-sm text-clay">{failMessage(tuneMut.error)}</p>
          ) : null}
          {meterMut.isError ? (
            <p className="text-sm text-clay">{failMessage(meterMut.error)}</p>
          ) : null}

          <div className="rounded-lg bg-raised p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium tracking-widest text-subtle uppercase">
                Test draft — for tuning, not for publishing
              </p>
              <CopyButton text={draft} />
            </div>
            {draftMut.isPending || tuneMut.isPending ? (
              <p className="shimmer-text mt-6 text-sm">
                {tuneMut.isPending ? "Auto-tuning — up to 4 rounds" : "Writing a throwaway draft"}
              </p>
            ) : (
              <Textarea
                className="mt-3 min-h-64 bg-bg"
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setMeters(null);
                  setVerdict(null);
                }}
                placeholder="Run a test draft, then edit here and re-meter."
              />
            )}
          </div>

          {meters && verdict ? (
            <div className="flex flex-col gap-4 animate-fade-up">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium tracking-widest text-subtle uppercase">Meters</p>
                <div className="flex flex-wrap items-center gap-2">
                  {tuneInfo ? (
                    <span className="text-xs text-muted">used {tuneInfo.roundsUsed} of 4 rounds</span>
                  ) : null}
                  <VerdictChip verdict={verdict} />
                </div>
              </div>
              {tuneInfo?.stoppedAt === "slop" ? (
                <p className="text-sm text-amber">
                  Slop is the only blocker. Auto-tune will not rewrite that — edit the draft by hand.
                </p>
              ) : null}
              {tuneInfo?.stoppedAt === "exhausted" ? (
                <p className="text-sm text-muted">
                  Nothing cleared in {tuneInfo.roundsUsed} rounds. Closest by identity drift is below.
                  {tuneInfo.nudgedDial ? ` Nudged ${DIAL_META[tuneInfo.nudgedDial].label} toward Core.` : ""}
                </p>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-3">
                <Gauge
                  label="Identity drift"
                  value={meters.identityDrift}
                  reading={meters.identityDrift < 20 ? "Still you" : meters.identityDrift > 40 ? "The Core is slipping" : "Watch the edges"}
                />
                <Gauge
                  label="Donor influence"
                  value={meters.donorInfluence}
                  reading={
                    !donor
                      ? "No donor in this mix"
                      : meters.donorInfluence < 15
                        ? "Donor adding nothing"
                        : meters.donorInfluence > 60
                          ? "Clone risk"
                          : "Technique visible, not a copy"
                  }
                  band={donor ? { from: 15, to: 60 } : undefined}
                />
                <Gauge
                  label="Slop"
                  value={meters.slopScore}
                  reading={
                    meters.slopScore > 35
                      ? "AI fingerprints showing"
                      : `${meters.slopPerHundred.toFixed(1)} hits / 100 words`
                  }
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(meters.sampleCount ?? 0) === 0 ? <Badge tone="amber">limited</Badge> : null}
                <p className="text-xs text-muted">
                  Checked against {meters.sampleCount ?? 0} model-returned samples + {meters.phraseCount ?? 0}{" "}
                  signature phrases.
                </p>
              </div>
              {meters.overlapHits.length ? (
                <div>
                  <Badge tone="clay">Overlap blocker</Badge>
                  <div className="mt-3">
                    <HighlightedDraft draft={draft} grams={meters.overlapHits.map((h) => h.gram)} />
                  </div>
                </div>
              ) : null}
              {meters.anchorsBroken.length ? (
                <div>
                  <p className="text-xs font-medium tracking-widest text-subtle uppercase">Anchors broken</p>
                  <ul className="mt-2 flex flex-col gap-1">
                    {meters.anchorsBroken.map((a, i) => (
                      <li key={`${a}-${i}`} className="text-sm text-clay">
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {meters.slopHits.length ? (
                <div>
                  <p className="text-xs font-medium tracking-widest text-subtle uppercase">Slop hits</p>
                  <ul className="mt-2 flex flex-col gap-1 text-sm text-muted">
                    {meters.slopHits.map((h) => (
                      <li key={h.label}>
                        {h.label} · {h.count}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <p className="text-sm leading-relaxed text-muted">{meters.notes}</p>
              <Button variant="outline" size="sm" onClick={downloadPacket} disabled={!keep.trim()}>
                Download .md
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted">
              Test drafts are for tuning. Meter before you take anything to Claude. Nothing in this
              lab posts.
            </p>
          )}
        </section>
      </div>

      <Dialog open={lockOpen} onOpenChange={setLockOpen}>
        <DialogContent>
          <DialogTitle>Lock as brand voice</DialogTitle>
          <DialogDescription>
            Saves the current dial mix as a new brand voice. Core anchors stay inherited, never dialed.
          </DialogDescription>
          <Input
            className="mt-4"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="e.g. Food house, Faith house"
          />
          <Button className="mt-4 w-full" onClick={() => lockMut.mutate()} disabled={!brandName.trim() || lockMut.isPending}>
            {lockMut.isPending ? <Loader2 className="animate-spin" /> : null}
            Save brand voice
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium tracking-widest text-subtle uppercase">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
