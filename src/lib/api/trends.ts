import { createServerFn } from "@tanstack/react-start";
import { ownerMiddleware } from "@/lib/owner";
import { getSql } from "@/lib/db";
import { newId } from "@/lib/utils";
import { TrendScanSchema } from "@/lib/voice/schemas";
import type { TrendScan } from "@/lib/voice/types";
import { grokJson, isoDaysAgo, RESEARCH_INSTRUCTIONS } from "@/lib/xai";
import { mapTrend, type TrendRow } from "./map";

const CACHE_MS = 30 * 60 * 1000;

function normalizeQuery(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, " ");
}

export const listTrendScans = createServerFn({ method: "GET" })
  .middleware([ownerMiddleware])
  .handler(async ({ context }): Promise<TrendScan[]> => {
    const sql = await getSql();
    const rows = await sql<TrendRow>`
      select id, query, result, model, scanned_at
      from trend_scans
      where user_id = ${context.userId}
      order by scanned_at desc
      limit 40
    `;
    return rows.map(mapTrend);
  });

export const runTrendScan = createServerFn({ method: "POST" })
  .middleware([ownerMiddleware])
  .validator((input: { query: string }) => input)
  .handler(
    async ({
      context,
      data,
    }): Promise<{ ok: true; scan: TrendScan; cached: boolean } | { ok: false; error: string }> => {
      const query = data.query.trim();
      if (query.length < 2) return { ok: false, error: "Enter a topic, keyword, or domain." };
      const sql = await getSql();
      const key = normalizeQuery(query);
      const cachedRows = await sql<TrendRow>`
        select id, query, result, model, scanned_at
        from trend_scans
        where user_id = ${context.userId} and lower(query) = ${key}
        order by scanned_at desc
        limit 1
      `;
      const cached = cachedRows[0];
      if (cached && Date.now() - new Date(cached.scanned_at).getTime() < CACHE_MS) {
        return { ok: true, scan: mapTrend(cached), cached: true };
      }

      const from = isoDaysAgo(2);
      const result = await grokJson({
        instructions: RESEARCH_INSTRUCTIONS,
        input: `Scan X for what is trending around this query in the last 48 hours (since ${from}).

QUERY: ${query}

Return JSON only:
{
  "quiet": boolean,
  "headline": "one sharp sentence, max 180 chars",
  "crowdRead": "what the crowd is actually saying",
  "angles": ["1-5 angles almost nobody is taking"],
  "leadingVoices": [{"handle": "without @", "why": "why they lead this conversation"}],
  "watch": "what would move this next",
  "citations": [{"source": "handle or outlet", "url": "optional", "note": "what they said"}]
}

Rules:
- Cite real posts only. Never fabricate quotes, handles, or engagement.
- If X is thin on this, set quiet true and say so in crowdRead.
- Leading voices must be real public handles you actually found.`,
        schema: TrendScanSchema,
        tools: [
          { type: "x_search", from_date: from },
          { type: "web_search" },
        ],
        maxOutputTokens: 6000,
      });

      if (!result.ok) return result;

      const id = newId();
      const scannedAt = new Date().toISOString();
      await sql`
        insert into trend_scans (id, user_id, query, result, model, scanned_at)
        values (
          ${id},
          ${context.userId},
          ${query},
          ${JSON.stringify(result.data)}::jsonb,
          ${result.model},
          ${scannedAt}::timestamptz
        )
      `;

      return {
        ok: true,
        cached: false,
        scan: {
          id,
          query,
          ...result.data,
          model: result.model,
          scannedAt,
        },
      };
    },
  );
