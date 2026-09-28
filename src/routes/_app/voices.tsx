import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteDomainLock,
  duplicateVoice,
  listDomainLocks,
  listVoices,
  saveDomainLock,
  updateVoice,
} from "@/lib/api/voices";
import { getSlopPatterns, saveSlopPatterns } from "@/lib/api/settings";
import { Fingerprint } from "@/components/fingerprint";
import { DialSlider } from "@/components/dial-slider";
import { QueryError } from "@/components/query-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DIAL_KEYS, DIAL_META, type DialKey } from "@/lib/voice/dials";
import type { DialLock, SlopPattern, Voice } from "@/lib/voice/types";
import { failMessage } from "@/lib/fail";

export const Route = createFileRoute("/_app/voices")({ component: VoicesPage });

function VoicesPage() {
  const voices = useQuery({ queryKey: ["voices"], queryFn: () => listVoices() });
  const locks = useQuery({ queryKey: ["domain-locks"], queryFn: () => listDomainLocks() });
  const slop = useQuery({ queryKey: ["slop"], queryFn: () => getSlopPatterns() });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!voices.data?.length) return;
    if (!selectedId || !voices.data.some((v) => v.id === selectedId)) {
      setSelectedId(voices.data[0].id);
    }
  }, [voices.data, selectedId]);

  const voice = voices.data?.find((v) => v.id === selectedId) ?? null;

  const saveMut = useMutation({
    mutationFn: (patch: Parameters<typeof updateVoice>[0]["data"]) => updateVoice({ data: patch }),
    onSuccess: () => {
      toast.success("Saved");
      void voices.refetch();
    },
    onError: (err: Error) => toast.error(failMessage(err)),
  });

  const dupMut = useMutation({
    mutationFn: (id: string) => duplicateVoice({ data: { id } }),
    onSuccess: (v) => {
      toast.success("Duplicated as brand voice");
      void voices.refetch().then(() => setSelectedId(v.id));
    },
    onError: (err: Error) => toast.error(failMessage(err)),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
      <p className="text-xs font-medium tracking-widest text-subtle uppercase">Library</p>
      <h1 className="font-display text-4xl tracking-tight italic sm:text-5xl">Voices</h1>
      <p className="mt-3 max-w-xl text-sm text-muted">
        Core is identity. Brand voices inherit it. Dials are surface. Never weight the Core.
      </p>
      <QueryError error={voices.error} label="Voices" />
      <QueryError error={locks.error} label="Locks" />

      <div className="mt-8 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-2">
          {(voices.data ?? []).map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelectedId(v.id)}
              className={`rounded-md p-3 text-left ${v.id === selectedId ? "bg-raised" : "hover:bg-raised/50"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm">{v.name}</span>
                <Badge tone={v.kind === "core" ? "sage" : "muted"}>{v.kind}</Badge>
              </div>
              <Fingerprint dials={v.dials} className="mt-3 h-8" />
            </button>
          ))}
        </aside>

        {voice ? (
          <VoiceEditor
            voice={voice}
            saving={saveMut.isPending}
            onSave={(patch) => saveMut.mutate(patch)}
            onDuplicate={() => dupMut.mutate(voice.id)}
          />
        ) : (
          <p className="text-sm text-muted">Sign in to seed Napoleon Core.</p>
        )}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl tracking-tight">Domain locks</h2>
        <p className="mt-1 text-sm text-muted">Locks beat donor pulls, presets, and future metric tuning.</p>
        <DomainLockList
          locks={locks.data ?? []}
          onRefresh={() => void locks.refetch()}
        />
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl tracking-tight">Slop list</h2>
        <p className="mt-1 text-sm text-muted">Editable regex fingerprints used by Meter It. Case-insensitive.</p>
        <SlopEditor
          patterns={slop.data ?? []}
          onSave={async (next) => {
            await saveSlopPatterns({ data: next });
            toast.success("Slop list saved");
            void slop.refetch();
          }}
        />
      </section>
    </div>
  );
}

function VoiceEditor({
  voice,
  saving,
  onSave,
  onDuplicate,
}: {
  voice: Voice;
  saving: boolean;
  onSave: (patch: { id: string; name: string; sourceText: string; anchors: string[]; dials: Voice["dials"]; locks: DialLock[]; banned: string[] }) => void;
  onDuplicate: () => void;
}) {
  const [name, setName] = useState(voice.name);
  const [sourceText, setSourceText] = useState(voice.sourceText);
  const [anchors, setAnchors] = useState(voice.anchors.join("\n"));
  const [banned, setBanned] = useState(voice.banned.join("\n"));
  const [dials, setDials] = useState(voice.dials);
  const [locks, setLocks] = useState(voice.locks);

  useEffect(() => {
    setName(voice.name);
    setSourceText(voice.sourceText);
    setAnchors(voice.anchors.join("\n"));
    setBanned(voice.banned.join("\n"));
    setDials(voice.dials);
    setLocks(voice.locks);
  }, [voice]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input value={name} onChange={(e) => setName(e.target.value)} className="max-w-sm" />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/" search={{ voice: voice.id }}>
              Send to Mixer
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={onDuplicate}>
            Duplicate as brand voice
          </Button>
          <Button
            size="sm"
            disabled={saving}
            onClick={() =>
              onSave({
                id: voice.id,
                name,
                sourceText,
                anchors: anchors.split("\n").map((s) => s.trim()).filter(Boolean),
                banned: banned.split("\n").map((s) => s.trim()).filter(Boolean),
                dials,
                locks,
              })
            }
          >
            {saving ? <Loader2 className="animate-spin" /> : null}
            Save
          </Button>
        </div>
      </div>

      <label className="block">
        <span className="text-xs font-medium tracking-widest text-subtle uppercase">Voice source — the skill</span>
        <Textarea className="mt-1.5 min-h-80 font-mono text-xs leading-relaxed" value={sourceText} onChange={(e) => setSourceText(e.target.value)} />
      </label>
      <label className="block">
        <span className="text-xs font-medium tracking-widest text-subtle uppercase">Identity anchors — one per line, never dialed</span>
        <Textarea className="mt-1.5" value={anchors} onChange={(e) => setAnchors(e.target.value)} />
      </label>
      <label className="block">
        <span className="text-xs font-medium tracking-widest text-subtle uppercase">Banned phrases</span>
        <Textarea className="mt-1.5 min-h-20" value={banned} onChange={(e) => setBanned(e.target.value)} />
      </label>

      <div>
        <p className="text-xs font-medium tracking-widest text-subtle uppercase">Surface dials</p>
        <div className="mt-1 divide-y divide-border">
          {DIAL_KEYS.map((key) => (
            <DialSlider
              key={key}
              dial={key}
              value={dials[key]}
              lock={locks.find((l) => l.dial === key)}
              onChange={(n) => setDials((d) => ({ ...d, [key]: n }))}
            />
          ))}
        </div>
      </div>

      <VoiceLocks locks={locks} onChange={setLocks} />
    </div>
  );
}

function VoiceLocks({ locks, onChange }: { locks: DialLock[]; onChange: (next: DialLock[]) => void }) {
  const [dial, setDial] = useState<DialKey>("commercial_pull");
  const [max, setMax] = useState("15");
  const [reason, setReason] = useState("");
  return (
    <div>
      <p className="text-xs font-medium tracking-widest text-subtle uppercase">Voice locks</p>
      <ul className="mt-2 flex flex-col gap-2">
        {locks.map((lock, i) => (
          <li key={`${lock.dial}-${i}`} className="flex items-center justify-between gap-3 rounded-md bg-raised px-3 py-2 text-sm">
            <span>
              {DIAL_META[lock.dial].label}
              {lock.max != null ? ` · max ${lock.max}` : ""}
              {lock.min != null ? ` · min ${lock.min}` : ""}
              {lock.reason ? ` — ${lock.reason}` : ""}
            </span>
            <button
              type="button"
              className="text-subtle hover:text-clay"
              onClick={() => onChange(locks.filter((_, j) => j !== i))}
              aria-label="Remove lock"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_96px_1fr_auto]">
        <Select value={dial} onChange={(e) => setDial(e.target.value as DialKey)}>
          {DIAL_KEYS.map((k) => (
            <option key={k} value={k}>
              {DIAL_META[k].label}
            </option>
          ))}
        </Select>
        <Input value={max} onChange={(e) => setMax(e.target.value)} placeholder="max" inputMode="numeric" />
        <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="reason" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const n = Number(max);
            onChange([
              ...locks,
              { dial, max: Number.isFinite(n) ? n : null, min: null, reason: reason.trim() },
            ]);
            setReason("");
          }}
        >
          <Plus className="size-4" />
          Add
        </Button>
      </div>
    </div>
  );
}

function DomainLockList({
  locks,
  onRefresh,
}: {
  locks: { id: string; domain: string; dial: DialKey; max: number | null; min: number | null; reason: string }[];
  onRefresh: () => void;
}) {
  const [domain, setDomain] = useState("bazi");
  const [dial, setDial] = useState<DialKey>("commercial_pull");
  const [max, setMax] = useState("15");
  const [reason, setReason] = useState("");

  return (
    <div className="mt-4">
      <ul className="flex flex-col gap-2">
        {locks.map((lock) => (
          <li key={lock.id} className="flex items-center justify-between gap-3 rounded-md bg-raised px-3 py-2 text-sm">
            <span>
              <span className="text-fg">{lock.domain}</span>
              {" · "}
              {DIAL_META[lock.dial].label}
              {lock.max != null ? ` max ${lock.max}` : ""}
              {lock.min != null ? ` min ${lock.min}` : ""}
              {lock.reason ? ` — ${lock.reason}` : ""}
            </span>
            <button
              type="button"
              className="text-subtle hover:text-clay"
              onClick={async () => {
                await deleteDomainLock({ data: lock.id });
                onRefresh();
              }}
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 grid gap-2 sm:grid-cols-4">
        <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="domain" />
        <Select value={dial} onChange={(e) => setDial(e.target.value as DialKey)}>
          {DIAL_KEYS.map((k) => (
            <option key={k} value={k}>
              {DIAL_META[k].label}
            </option>
          ))}
        </Select>
        <Input value={max} onChange={(e) => setMax(e.target.value)} placeholder="max" />
        <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="reason" />
      </div>
      <Button
        className="mt-2"
        variant="outline"
        size="sm"
        onClick={async () => {
          const n = Number(max);
          await saveDomainLock({
            data: {
              domain,
              dial,
              max: Number.isFinite(n) ? n : null,
              reason,
            },
          });
          toast.success("Lock saved");
          onRefresh();
        }}
      >
        Add domain lock
      </Button>
    </div>
  );
}

function SlopEditor({
  patterns,
  onSave,
}: {
  patterns: SlopPattern[];
  onSave: (next: SlopPattern[]) => Promise<void>;
}) {
  const [text, setText] = useState("");
  useEffect(() => {
    setText(patterns.map((p) => `${p.label} | ${p.pattern}`).join("\n"));
  }, [patterns]);
  return (
    <div className="mt-3">
      <Textarea
        className="min-h-40 font-mono text-xs"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button
        className="mt-2"
        variant="outline"
        size="sm"
        onClick={() =>
          onSave(
            text
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line) => {
                const [label, pattern] = line.split("|").map((s) => s.trim());
                return {
                  id: crypto.randomUUID(),
                  label: label || "pattern",
                  pattern: pattern || label || "",
                };
              }),
          )
        }
      >
        Save slop list
      </Button>
    </div>
  );
}
