import { createServerFn } from "@tanstack/react-start";
import { ownerMiddleware } from "@/lib/owner";
import { getSql } from "@/lib/db";
import { newId, normalizeHandle } from "@/lib/utils";
import { DIAL_KEYS, DIAL_META } from "@/lib/voice/dials";
import { DonorScanSchema } from "@/lib/voice/schemas";
import type { DonorScan } from "@/lib/voice/types";
import { grokJson, isoDaysAgo, RESEARCH_INSTRUCTIONS } from "@/lib/xai";
import { mapDonor, type DonorRow } from "./map";

const CACHE_MS = 24 * 60 * 60 * 1000;

export const listDonorScans = createServerFn({ method: "GET" })
  .middleware([ownerMiddleware])
  .handler(async ({ context }): Promise<DonorScan[]> => {
    const sql = await getSql();
    await sql`
      update donor_scans
      set samples = '[]'::jsonb
      where user_id = ${context.userId} and samples_purge_at < now()
        and samples != '[]'::jsonb
    `;
    const rows = await sql<DonorRow>`
      select id, handle, domain, result, model, scanned_at
      from donor_scans
      where user_id = ${context.userId}
      order by scanned_at desc
      limit 60
    `;
    return rows.map(mapDonor);
  });

export const runDonorScan = createServerFn({ method: "POST" })
  .middleware([ownerMiddleware])
  .validator((input: { handle: string; domain: string; force?: boolean }) => input)
  .handler(
    async ({
      context,
      data,
    }): Promise<{ ok: true; scan: DonorScan; cached: boolean } | { ok: false; error: string }> => {
      const handle = normalizeHandle(data.handle).toLowerCase();
      const domain = data.domain.trim().toLowerCase() || "general";
      if (handle.length < 2) return { ok: false, error: "Enter a public X handle." };

      const sql = await getSql();
      if (!data.force) {
        const cachedRows = await sql<DonorRow>`
          select id, handle, domain, result, model, scanned_at
          from donor_scans
          where user_id = ${context.userId} and handle = ${handle} and domain = ${domain}
          order by scanned_at desc
          limit 1
        `;
        const cached = cachedRows[0];
        if (cached && Date.now() - new Date(cached.scanned_at).getTime() < CACHE_MS) {
          return { ok: true, scan: mapDonor(cached), cached: true };
        }
      }

      const from = isoDaysAgo(30);
      const dialGuide = DIAL_KEYS.map(
        (k) => `- ${k}: 0 = ${DIAL_META[k].zero}; 100 = ${DIAL_META[k].hundred}`,
      ).join("\n");

      const toolsWithHandles: Parameters<typeof grokJson>[0]["tools"] = [
        {
          type: "x_search",
          from_date: from,
          allowed_x_handles: [handle],
        },
      ];
      const input = `Measure HOW @${handle} writes in the domain "${domain}", not what they say.

Window: their own posts from the last 30 days (since ${from}). Search from:${handle} only.

Describe technique, not content. Abstract patterns only. Never reproduce more than 8 consecutive words of any post in any field except signaturePhrases.

Score these dials 0–100:
${dialGuide}

Return JSON only:
{
  "quiet": boolean,
  "handle": "${handle}",
  "sampleCount": number,
  "dials": { ${DIAL_KEYS.map((k) => `"${k}": number`).join(", ")} },
  "dialNotes": "one line per notable dial",
  "moves": [{ "name": "short craft move", "description": "how it works", "pattern": "abstract template e.g. [common belief]. Wrong. [reframe].", "frequency": "signature"|"frequent"|"occasional" }],
  "signaturePhrases": ["exact phrases they repeat — for a never-use list"],
  "topicsNow": ["up to 6 topics they are on"],
  "citations": [{"source":"handle or url","url":"optional","note":"what the post is doing technically"}],
  "samples": ["up to 30 raw post texts, truncated, for overlap checking only"]
}

If they are quiet, set quiet true, still return at least one move describing the absence, and score dials from whatever exists.`;

      let result = await grokJson({
        instructions: RESEARCH_INSTRUCTIONS,
        input,
        schema: DonorScanSchema,
        tools: toolsWithHandles,
        maxOutputTokens: 6000,
      });

      if (!result.ok && result.status === 400) {
        result = await grokJson({
          instructions: RESEARCH_INSTRUCTIONS,
          input,
          schema: DonorScanSchema,
          tools: [{ type: "x_search", from_date: from }],
          maxOutputTokens: 6000,
        });
      }

      if (!result.ok) return result;

      const samples = (result.data.samples ?? []).slice(0, 30);
      const { samples: _drop, ...publicResult } = result.data;
      void _drop;
      const id = newId();
      const scannedAt = new Date().toISOString();
      const purgeAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      await sql`
        insert into donor_scans (
          id, user_id, handle, domain, result, samples, samples_purge_at, model, scanned_at
        ) values (
          ${id},
          ${context.userId},
          ${handle},
          ${domain},
          ${JSON.stringify(publicResult)}::jsonb,
          ${JSON.stringify(samples)}::jsonb,
          ${purgeAt}::timestamptz,
          ${result.model},
          ${scannedAt}::timestamptz
        )
      `;

      return {
        ok: true,
        cached: false,
        scan: {
          id,
          handle,
          domain,
          quiet: publicResult.quiet,
          sampleCount: publicResult.sampleCount,
          dials: publicResult.dials,
          dialNotes: publicResult.dialNotes,
          moves: publicResult.moves,
          signaturePhrases: publicResult.signaturePhrases,
          topicsNow: publicResult.topicsNow,
          citations: publicResult.citations,
          model: result.model,
          scannedAt,
        },
      };
    },
  );
