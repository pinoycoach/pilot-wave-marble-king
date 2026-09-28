import { createServerFn } from "@tanstack/react-start";
import { ownerMiddleware } from "@/lib/owner";
import { getSql } from "@/lib/db";
import { DEFAULT_SLOP_PATTERNS } from "@/lib/voice/dials";
import type { SlopPattern } from "@/lib/voice/types";
import { mapSlop } from "./map";
import { ensureSeeded } from "./seed";

export const getSlopPatterns = createServerFn({ method: "GET" })
  .middleware([ownerMiddleware])
  .handler(async ({ context }): Promise<SlopPattern[]> => {
    await ensureSeeded(context.userId, context.email);
    const sql = await getSql();
    const rows = await sql<{ slop_patterns: unknown }>`
      select slop_patterns from lab_settings where user_id = ${context.userId} limit 1
    `;
    return rows[0] ? mapSlop(rows[0].slop_patterns) : DEFAULT_SLOP_PATTERNS;
  });

export const saveSlopPatterns = createServerFn({ method: "POST" })
  .middleware([ownerMiddleware])
  .validator((input: SlopPattern[]) => input)
  .handler(async ({ context, data }): Promise<SlopPattern[]> => {
    const sql = await getSql();
    const cleaned = data
      .map((p) => ({
        id: p.id || crypto.randomUUID(),
        label: p.label.trim(),
        pattern: p.pattern,
      }))
      .filter((p) => p.label && p.pattern);
    await sql`
      insert into lab_settings (user_id, slop_patterns, updated_at)
      values (${context.userId}, ${JSON.stringify(cleaned)}::jsonb, ${new Date().toISOString()}::timestamptz)
      on conflict (user_id) do update set
        slop_patterns = excluded.slop_patterns,
        updated_at = excluded.updated_at
    `;
    return cleaned;
  });
