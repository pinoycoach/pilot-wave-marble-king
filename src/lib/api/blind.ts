import { createServerFn } from "@tanstack/react-start";
import { ownerMiddleware } from "@/lib/owner";
import { getSql } from "@/lib/db";
import { newId } from "@/lib/utils";
import { mixDials } from "@/lib/voice/mix";
import type { BlindCard, Recipe } from "@/lib/voice/types";
import { scoreDraft, writeTestDraft } from "./runs";
import { mapDomainLock, mapDonor, mapVoice, type DomainLockRow, type DonorRow, type VoiceRow } from "./map";

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export const runBlindTest = createServerFn({ method: "POST" })
  .middleware([ownerMiddleware])
  .validator(
    (input: {
      voiceId: string;
      donorScanId: string;
      topic: string;
      format: Recipe["format"];
      preset: Recipe["preset"];
      domain: string;
      moveWeights: Recipe["moveWeights"];
    }) => input,
  )
  .handler(
    async ({
      context,
      data,
    }): Promise<{ ok: true; cards: BlindCard[]; testId: string } | { ok: false; error: string }> => {
      const sql = await getSql();
      const voices = await sql<VoiceRow>`
        select id, name, kind, parent_id, source_text, anchors, dials, locks, banned, created_at, updated_at
        from voices where id = ${data.voiceId} and user_id = ${context.userId} limit 1
      `;
      const voiceRow = voices[0];
      if (!voiceRow) return { ok: false, error: "Voice not found" };
      const voice = mapVoice(voiceRow);

      const donors = await sql<DonorRow>`
        select id, handle, domain, result, model, scanned_at
        from donor_scans where id = ${data.donorScanId} and user_id = ${context.userId} limit 1
      `;
      const donorRow = donors[0];
      if (!donorRow) return { ok: false, error: "Donor scan not found" };
      const donor = mapDonor(donorRow);

      const lockRows = await sql<DomainLockRow>`
        select id, domain, dial, max, min, reason from domain_locks where user_id = ${context.userId}
      `;
      const domainLocks = lockRows.map(mapDomainLock);
      const domain = data.domain.trim() || donor.domain;

      const blends = [0, 30, 60];
      const raw: BlindCard[] = [];

      const built = await Promise.all(
        blends.map(async (blend) => {
          const mixed = mixDials({
            base: voice.dials,
            donor: donor.dials,
            blend,
            preset: data.preset,
            voiceLocks: voice.locks,
            domainLocks,
            domain,
          });
          const recipe: Recipe = {
            blend,
            dials: mixed.dials,
            preset: data.preset,
            format: data.format,
            topic: data.topic,
            domain,
            keep: "",
            moveWeights: blend === 0 ? data.moveWeights.map((m) => ({ ...m, weight: 0 })) : data.moveWeights,
          };
          const draftRes = await writeTestDraft(
            context.userId,
            {
              voiceId: voice.id,
              donorScanId: donor.id,
              recipe,
            },
            context.email,
          );
          if (!draftRes.ok) return draftRes;
          const meterRes = await scoreDraft(context.userId, {
            runId: draftRes.runId,
            draft: draftRes.draft,
            voiceId: voice.id,
            donorScanId: donor.id,
            recipe,
          });
          if (!meterRes.ok) return meterRes;
          return {
            ok: true as const,
            card: {
              key: newId(),
              blend,
              draft: draftRes.draft,
              meters: meterRes.meters,
              verdict: meterRes.verdict,
              runId: meterRes.runId,
            } satisfies BlindCard,
          };
        }),
      );

      for (const item of built) {
        if (!item.ok) return item;
        raw.push(item.card);
      }

      const cards = shuffle(raw);
      const testId = newId();
      await sql`
        insert into blind_tests (id, user_id, run_ids, ranking, rewrite_flags)
        values (
          ${testId},
          ${context.userId},
          ${JSON.stringify(cards.map((c) => c.runId))}::jsonb,
          ${null},
          ${null}
        )
      `;

      return { ok: true, cards, testId };
    },
  );

export const saveBlindRanking = createServerFn({ method: "POST" })
  .middleware([ownerMiddleware])
  .validator(
    (input: {
      testId: string;
      ranking: string[];
      rewriteFlags: Record<string, boolean>;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      update blind_tests
      set ranking = ${JSON.stringify(data.ranking)}::jsonb,
          rewrite_flags = ${JSON.stringify(data.rewriteFlags)}::jsonb
      where id = ${data.testId} and user_id = ${context.userId}
    `;
    return { ok: true as const };
  });
