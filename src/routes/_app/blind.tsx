import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { runBlindTest, saveBlindRanking } from "@/lib/api/blind";
import { listDonorScans } from "@/lib/api/donors";
import { listVoices } from "@/lib/api/voices";
import { Gauge, VerdictChip } from "@/components/gauge";
import { QueryError } from "@/components/query-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FORMAT_LABEL, FORMATS, GENRE_PRESETS, PRESET_META, type Format, type GenrePreset } from "@/lib/voice/dials";
import type { BlindCard } from "@/lib/voice/types";
import { failMessage } from "@/lib/fail";

export const Route = createFileRoute("/_app/blind")({ component: BlindPage });

function BlindPage() {
  const voices = useQuery({ queryKey: ["voices"], queryFn: () => listVoices() });
  const donors = useQuery({ queryKey: ["donors"], queryFn: () => listDonorScans() });
  const [voiceId, setVoiceId] = useState("");
  const [donorId, setDonorId] = useState("");
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState<Format>("x_post");
  const [preset, setPreset] = useState<GenrePreset>("none");
  const [cards, setCards] = useState<BlindCard[] | null>(null);
  const [testId, setTestId] = useState<string | null>(null);
  const [ranks, setRanks] = useState<Record<string, number>>({});
  const [rewrites, setRewrites] = useState<Record<string, boolean>>({});
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (voices.data?.length && !voiceId) {
      setVoiceId((voices.data.find((v) => v.kind === "core") ?? voices.data[0]).id);
    }
  }, [voices.data, voiceId]);

  const mut = useMutation({
    mutationFn: async () => {
      const donor = donors.data?.find((d) => d.id === donorId);
      const res = await runBlindTest({
        data: {
          voiceId,
          donorScanId: donorId,
          topic,
          format,
          preset,
          domain: donor?.domain ?? "",
          moveWeights: (donor?.moves ?? []).map((m) => ({ name: m.name, weight: 0.5 })),
        },
      });
      if (!res.ok) throw new Error(res.error);
      return res;
    },
    onSuccess: (res) => {
      setCards(res.cards);
      setTestId(res.testId);
      setRanks({});
      setRewrites({});
      setRevealed(false);
      toast.success("Three drafts. Labels hidden.");
    },
    onError: (err: Error) => toast.error(failMessage(err)),
  });

  const killSignal =
    revealed && cards ? cards.every((c) => rewrites[c.key]) : false;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-8 sm:py-10">
      <p className="text-xs font-medium tracking-widest text-subtle uppercase">Kill-signal instrument</p>
      <h1 className="font-display text-4xl tracking-tight italic sm:text-5xl">Blind test</h1>
      <p className="mt-3 text-sm text-muted">
        Three drafts at blend 0 / 30 / 60, shuffled. If you would rewrite more than half of every
        version, the donor layer is not earning its place.
      </p>
      <QueryError error={voices.error} label="Voices" />
      <QueryError error={donors.error} label="Donors" />

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Select value={voiceId} onChange={(e) => setVoiceId(e.target.value)} aria-label="Voice">
          {(voices.data ?? []).map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </Select>
        <Select value={donorId} onChange={(e) => setDonorId(e.target.value)} aria-label="Donor">
          <option value="">Pick a donor</option>
          {(donors.data ?? []).map((d) => (
            <option key={d.id} value={d.id}>
              @{d.handle} · {d.domain}
            </option>
          ))}
        </Select>
        <Select value={format} onChange={(e) => setFormat(e.target.value as Format)}>
          {FORMATS.map((f) => (
            <option key={f} value={f}>
              {FORMAT_LABEL[f]}
            </option>
          ))}
        </Select>
        <Select value={preset} onChange={(e) => setPreset(e.target.value as GenrePreset)}>
          {GENRE_PRESETS.map((g) => (
            <option key={g} value={g}>
              {PRESET_META[g].label}
            </option>
          ))}
        </Select>
      </div>
      <Input
        className="mt-3"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Topic"
      />
      <Button
        className="mt-4"
        disabled={mut.isPending || !voiceId || !donorId || !topic.trim()}
        onClick={() => mut.mutate()}
      >
        {mut.isPending ? <Loader2 className="animate-spin" /> : null}
        Run blind test · 6 Grok calls
      </Button>
      {mut.isPending ? (
        <p className="shimmer-text mt-4 text-sm">Writing and metering three blends</p>
      ) : null}

      {cards ? (
        <div className="mt-10 flex flex-col gap-6">
          {cards.map((card, i) => (
            <article key={card.key} className="rounded-lg bg-raised p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium tracking-widest text-subtle uppercase">
                  Draft {i + 1}
                  {revealed ? ` · blend ${card.blend}` : ""}
                </p>
                {revealed && card.verdict ? <VerdictChip verdict={card.verdict} /> : null}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{card.draft}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  Rank
                  <select
                    className="h-9 rounded-sm bg-bg px-2 text-sm shadow-[var(--shadow-border)]"
                    value={ranks[card.key] ?? ""}
                    onChange={(e) =>
                      setRanks((prev) => ({ ...prev, [card.key]: Number(e.target.value) }))
                    }
                    disabled={revealed}
                  >
                    <option value="">—</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(rewrites[card.key])}
                    onChange={(e) =>
                      setRewrites((prev) => ({ ...prev, [card.key]: e.target.checked }))
                    }
                    disabled={revealed}
                  />
                  I would rewrite more than half
                </label>
              </div>
              {revealed && card.meters ? (
                <div className="mt-4 flex flex-col gap-3">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Gauge label="Drift" value={card.meters.identityDrift} reading="" />
                    <Gauge label="Donor" value={card.meters.donorInfluence} reading="" band={{ from: 15, to: 60 }} />
                    <Gauge label="Slop" value={card.meters.slopScore} reading="" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {(card.meters.sampleCount ?? 0) === 0 ? <Badge tone="amber">limited</Badge> : null}
                    <p className="text-xs text-muted">
                      Checked against {card.meters.sampleCount ?? 0} model-returned samples +{" "}
                      {card.meters.phraseCount ?? 0} signature phrases.
                    </p>
                  </div>
                </div>
              ) : null}
            </article>
          ))}

          {!revealed ? (
            <Button
              onClick={async () => {
                if (!testId) return;
                const ordered = [...cards].sort(
                  (a, b) => (ranks[a.key] ?? 99) - (ranks[b.key] ?? 99),
                );
                await saveBlindRanking({
                  data: {
                    testId,
                    ranking: ordered.map((c) => c.runId),
                    rewriteFlags: Object.fromEntries(cards.map((c) => [c.runId, Boolean(rewrites[c.key])])),
                  },
                });
                setRevealed(true);
                toast.success("Revealed");
              }}
            >
              Reveal blends
            </Button>
          ) : killSignal ? (
            <div className="rounded-md bg-clay-dim p-4">
              <Badge tone="clay">Kill signal</Badge>
              <p className="mt-2 text-sm">
                Every version got the rewrite tick. This donor layer is not earning its place.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted">Stored. Blend 0 is the control.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
