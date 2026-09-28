import { createServerFn } from "@tanstack/react-start";
import { ownerMiddleware } from "@/lib/owner";
import { getSql } from "@/lib/db";
import { newId } from "@/lib/utils";
import type { ResultLog } from "@/lib/voice/types";
import { mapResult, type ResultRow } from "./map";

export const listResults = createServerFn({ method: "GET" })
  .middleware([ownerMiddleware])
  .handler(async ({ context }): Promise<ResultLog[]> => {
    const sql = await getSql();
    const rows = await sql<ResultRow>`
      select res.id, res.run_id, res.platform, res.posted_at, res.views, res.shares,
             res.saves, res.replies, res.long_replies, r.recipe, v.name as voice_name
      from results res
      left join runs r on r.id = res.run_id and r.user_id = res.user_id
      left join voices v on v.id = r.voice_id and v.user_id = res.user_id
      where res.user_id = ${context.userId}
      order by res.posted_at desc
      limit 200
    `;
    return rows.map(mapResult);
  });

export const addResult = createServerFn({ method: "POST" })
  .middleware([ownerMiddleware])
  .validator(
    (input: {
      runId: string;
      platform: string;
      postedAt: string;
      views: number;
      shares: number;
      saves: number;
      replies: number;
      longReplies: number;
    }) => input,
  )
  .handler(async ({ context, data }): Promise<ResultLog> => {
    const sql = await getSql();
    const owned = await sql<{ id: string }>`
      select id from runs where id = ${data.runId} and user_id = ${context.userId} limit 1
    `;
    if (!owned.length) throw new Error("Run not found");
    const id = newId();
    await sql`
      insert into results (id, user_id, run_id, platform, posted_at, views, shares, saves, replies, long_replies)
      values (
        ${id},
        ${context.userId},
        ${data.runId},
        ${data.platform.trim()},
        ${data.postedAt},
        ${Math.max(0, Math.round(data.views))},
        ${Math.max(0, Math.round(data.shares))},
        ${Math.max(0, Math.round(data.saves))},
        ${Math.max(0, Math.round(data.replies))},
        ${Math.max(0, Math.round(data.longReplies))}
      )
    `;
    const rows = await sql<ResultRow>`
      select res.id, res.run_id, res.platform, res.posted_at, res.views, res.shares,
             res.saves, res.replies, res.long_replies, r.recipe, v.name as voice_name
      from results res
      left join runs r on r.id = res.run_id and r.user_id = res.user_id
      left join voices v on v.id = r.voice_id and v.user_id = res.user_id
      where res.id = ${id} and res.user_id = ${context.userId}
      limit 1
    `;
    if (!rows[0]) throw new Error("Could not save result");
    return mapResult(rows[0]);
  });
