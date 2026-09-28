import { createServerFn } from "@tanstack/react-start";
import { ownerMiddleware } from "@/lib/owner";
import { getSql } from "@/lib/db";
import { newId } from "@/lib/utils";
import { parseDials, type DialKey } from "@/lib/voice/dials";
import type { DialLock, DomainLock, Voice } from "@/lib/voice/types";
import { mapDomainLock, mapVoice, type DomainLockRow, type VoiceRow } from "./map";
import { ensureSeeded } from "./seed";

export const listVoices = createServerFn({ method: "GET" })
  .middleware([ownerMiddleware])
  .handler(async ({ context }): Promise<Voice[]> => {
    await ensureSeeded(context.userId, context.email);
    const sql = await getSql();
    const rows = await sql<VoiceRow>`
      select id, name, kind, parent_id, source_text, anchors, dials, locks, banned, created_at, updated_at
      from voices
      where user_id = ${context.userId}
      order by case when kind = 'core' then 0 else 1 end, name asc
    `;
    return rows.map(mapVoice);
  });

export const listDomainLocks = createServerFn({ method: "GET" })
  .middleware([ownerMiddleware])
  .handler(async ({ context }): Promise<DomainLock[]> => {
    await ensureSeeded(context.userId, context.email);
    const sql = await getSql();
    const rows = await sql<DomainLockRow>`
      select id, domain, dial, max, min, reason
      from domain_locks
      where user_id = ${context.userId}
      order by domain, dial
    `;
    return rows.map(mapDomainLock);
  });

export type VoicePatch = {
  id: string;
  name?: string;
  sourceText?: string;
  anchors?: string[];
  dials?: ReturnType<typeof parseDials>;
  locks?: DialLock[];
  banned?: string[];
};

export const updateVoice = createServerFn({ method: "POST" })
  .middleware([ownerMiddleware])
  .validator((input: VoicePatch) => input)
  .handler(async ({ context, data }): Promise<Voice> => {
    const sql = await getSql();
    const rows = await sql<VoiceRow>`
      select id, name, kind, parent_id, source_text, anchors, dials, locks, banned, created_at, updated_at
      from voices where id = ${data.id} and user_id = ${context.userId} limit 1
    `;
    const current = rows[0];
    if (!current) throw new Error("Voice not found");
    const next = mapVoice(current);
    if (typeof data.name === "string") next.name = data.name.trim() || next.name;
    if (typeof data.sourceText === "string") next.sourceText = data.sourceText;
    if (data.anchors) next.anchors = data.anchors.map((a) => a.trim()).filter(Boolean);
    if (data.dials) next.dials = parseDials(data.dials);
    if (data.locks) next.locks = data.locks;
    if (data.banned) next.banned = data.banned.map((b) => b.trim()).filter(Boolean);
    const now = new Date().toISOString();
    await sql`
      update voices set
        name = ${next.name},
        source_text = ${next.sourceText},
        anchors = ${JSON.stringify(next.anchors)}::jsonb,
        dials = ${JSON.stringify(next.dials)}::jsonb,
        locks = ${JSON.stringify(next.locks)}::jsonb,
        banned = ${JSON.stringify(next.banned)}::jsonb,
        updated_at = ${now}::timestamptz
      where id = ${data.id} and user_id = ${context.userId}
    `;
    return { ...next, updatedAt: now };
  });

export const duplicateVoice = createServerFn({ method: "POST" })
  .middleware([ownerMiddleware])
  .validator((input: { id: string; name?: string }) => input)
  .handler(async ({ context, data }): Promise<Voice> => {
    const sql = await getSql();
    const rows = await sql<VoiceRow>`
      select id, name, kind, parent_id, source_text, anchors, dials, locks, banned, created_at, updated_at
      from voices where id = ${data.id} and user_id = ${context.userId} limit 1
    `;
    const src = rows[0];
    if (!src) throw new Error("Voice not found");
    const voice = mapVoice(src);
    const id = newId();
    const now = new Date().toISOString();
    const name = data.name?.trim() || `${voice.name} brand`;
    const parentId = voice.kind === "core" ? voice.id : (voice.parentId ?? voice.id);
    await sql`
      insert into voices (
        id, user_id, name, kind, parent_id, source_text, anchors, dials, locks, banned, created_at, updated_at
      ) values (
        ${id},
        ${context.userId},
        ${name},
        ${"brand"},
        ${parentId},
        ${voice.sourceText},
        ${JSON.stringify(voice.anchors)}::jsonb,
        ${JSON.stringify(voice.dials)}::jsonb,
        ${JSON.stringify(voice.locks)}::jsonb,
        ${JSON.stringify(voice.banned)}::jsonb,
        ${now}::timestamptz,
        ${now}::timestamptz
      )
    `;
    return {
      ...voice,
      id,
      name,
      kind: "brand",
      parentId,
      createdAt: now,
      updatedAt: now,
    };
  });

export const lockAsVoice = createServerFn({ method: "POST" })
  .middleware([ownerMiddleware])
  .validator(
    (input: {
      name: string;
      parentId: string;
      dials: ReturnType<typeof parseDials>;
      banned?: string[];
    }) => input,
  )
  .handler(async ({ context, data }): Promise<Voice> => {
    const sql = await getSql();
    const parentRows = await sql<VoiceRow>`
      select id, name, kind, parent_id, source_text, anchors, dials, locks, banned, created_at, updated_at
      from voices where id = ${data.parentId} and user_id = ${context.userId} limit 1
    `;
    const parent = parentRows[0];
    if (!parent) throw new Error("Base voice not found");
    const base = mapVoice(parent);
    const coreId = base.kind === "core" ? base.id : (base.parentId ?? base.id);
    const id = newId();
    const now = new Date().toISOString();
    const name = data.name.trim() || "Untitled brand";
    await sql`
      insert into voices (
        id, user_id, name, kind, parent_id, source_text, anchors, dials, locks, banned, created_at, updated_at
      ) values (
        ${id},
        ${context.userId},
        ${name},
        ${"brand"},
        ${coreId},
        ${base.sourceText},
        ${JSON.stringify(base.anchors)}::jsonb,
        ${JSON.stringify(parseDials(data.dials))}::jsonb,
        ${JSON.stringify([])}::jsonb,
        ${JSON.stringify(data.banned ?? base.banned)}::jsonb,
        ${now}::timestamptz,
        ${now}::timestamptz
      )
    `;
    return {
      id,
      name,
      kind: "brand",
      parentId: coreId,
      sourceText: base.sourceText,
      anchors: base.anchors,
      dials: parseDials(data.dials),
      locks: [],
      banned: data.banned ?? base.banned,
      createdAt: now,
      updatedAt: now,
    };
  });

export const saveDomainLock = createServerFn({ method: "POST" })
  .middleware([ownerMiddleware])
  .validator(
    (input: {
      id?: string;
      domain: string;
      dial: DialKey;
      max?: number | null;
      min?: number | null;
      reason: string;
    }) => input,
  )
  .handler(async ({ context, data }): Promise<DomainLock> => {
    const sql = await getSql();
    const id = data.id ?? newId();
    const domain = data.domain.trim().toLowerCase();
    if (!domain) throw new Error("Domain is required");
    if (data.id) {
      await sql`
        update domain_locks set
          domain = ${domain},
          dial = ${data.dial},
          max = ${data.max ?? null},
          min = ${data.min ?? null},
          reason = ${data.reason}
        where id = ${id} and user_id = ${context.userId}
      `;
    } else {
      await sql`
        insert into domain_locks (id, user_id, domain, dial, max, min, reason)
        values (${id}, ${context.userId}, ${domain}, ${data.dial}, ${data.max ?? null}, ${data.min ?? null}, ${data.reason})
      `;
    }
    return {
      id,
      domain,
      dial: data.dial,
      max: data.max ?? null,
      min: data.min ?? null,
      reason: data.reason,
    };
  });

export const deleteDomainLock = createServerFn({ method: "POST" })
  .middleware([ownerMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await sql`delete from domain_locks where id = ${id} and user_id = ${context.userId}`;
    return { ok: true as const };
  });
