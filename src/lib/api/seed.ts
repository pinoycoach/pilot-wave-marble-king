import { getSql } from "@/lib/db";
import { newId } from "@/lib/utils";
import { assertOwner } from "@/lib/owner";
import {
  DEFAULT_SLOP_PATTERNS,
  NAPOLEON_CORE_ANCHORS,
  NAPOLEON_CORE_DIALS,
} from "@/lib/voice/dials";
import {
  NAPOLEON_CORE_BANNED,
  NAPOLEON_VOICE_SOURCE,
  PLACEHOLDER_SOURCE,
} from "@/lib/voice/napoleon-source";

function isPlaceholderSource(text: string | null | undefined): boolean {
  const t = (text ?? "").trim();
  return !t || t === PLACEHOLDER_SOURCE;
}

function isEmptyJsonArray(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string") {
    const t = value.trim();
    return t === "" || t === "[]";
  }
  return Array.isArray(value) && value.length === 0;
}

export async function ensureSeeded(userId: string, email: string | null | undefined): Promise<void> {
  assertOwner(email);
  const sql = await getSql();
  const existing = await sql<{ id: string; source_text: string; banned: unknown }>`
    select id, source_text, banned from voices where user_id = ${userId} and kind = 'core' limit 1
  `;
  if (!existing.length) {
    const id = newId();
    const now = new Date().toISOString();
    await sql`
      insert into voices (
        id, user_id, name, kind, parent_id, source_text, anchors, dials, locks, banned, created_at, updated_at
      ) values (
        ${id},
        ${userId},
        ${"Napoleon Core"},
        ${"core"},
        ${null},
        ${NAPOLEON_VOICE_SOURCE},
        ${JSON.stringify(NAPOLEON_CORE_ANCHORS)}::jsonb,
        ${JSON.stringify(NAPOLEON_CORE_DIALS)}::jsonb,
        ${JSON.stringify([])}::jsonb,
        ${JSON.stringify(NAPOLEON_CORE_BANNED)}::jsonb,
        ${now}::timestamptz,
        ${now}::timestamptz
      )
    `;
  } else {
    const row = existing[0];
    const now = new Date().toISOString();
    if (isPlaceholderSource(row.source_text)) {
      await sql`
        update voices
        set source_text = ${NAPOLEON_VOICE_SOURCE},
            updated_at = ${now}::timestamptz
        where id = ${row.id} and user_id = ${userId}
      `;
    }
    if (isEmptyJsonArray(row.banned)) {
      await sql`
        update voices
        set banned = ${JSON.stringify(NAPOLEON_CORE_BANNED)}::jsonb,
            updated_at = ${now}::timestamptz
        where id = ${row.id} and user_id = ${userId}
      `;
    }
  }

  const locks = await sql<{ id: string }>`
    select id from domain_locks where user_id = ${userId} limit 1
  `;
  if (!locks.length) {
    await sql`
      insert into domain_locks (id, user_id, domain, dial, max, min, reason)
      values (
        ${newId()},
        ${userId},
        ${"bazi"},
        ${"commercial_pull"},
        ${15},
        ${null},
        ${"Bazi writing stays a gift. No hard ask."}
      )
    `;
  }

  const settings = await sql<{ user_id: string }>`
    select user_id from lab_settings where user_id = ${userId} limit 1
  `;
  if (!settings.length) {
    await sql`
      insert into lab_settings (user_id, slop_patterns, updated_at)
      values (
        ${userId},
        ${JSON.stringify(DEFAULT_SLOP_PATTERNS)}::jsonb,
        ${new Date().toISOString()}::timestamptz
      )
    `;
  }
}
