import { z } from "zod";

const MODELS = ["grok-4.6", "grok-4.5"] as const;

export type XaiTool =
  | { type: "web_search" }
  | {
      type: "x_search";
      from_date?: string;
      to_date?: string;
      allowed_x_handles?: string[];
    };

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence?.[1] ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Model did not return JSON");
  return JSON.parse(candidate.slice(start, end + 1)) as unknown;
}

function extractOutputText(body: unknown): string {
  if (!body || typeof body !== "object") return "";
  const rec = body as Record<string, unknown>;
  if (typeof rec.output_text === "string" && rec.output_text.trim()) {
    return rec.output_text;
  }
  const parts: string[] = [];
  const output = Array.isArray(rec.output) ? rec.output : [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const content = Array.isArray(row.content) ? row.content : [];
    for (const block of content) {
      if (!block || typeof block !== "object") continue;
      const c = block as Record<string, unknown>;
      if (typeof c.text === "string") parts.push(c.text);
    }
    if (typeof row.text === "string") parts.push(row.text);
  }
  return parts.join("\n");
}

export function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

async function callModel(opts: {
  apiKey: string;
  model: string;
  instructions: string;
  input: string;
  tools?: XaiTool[];
  maxOutputTokens: number;
  effort?: "low" | "medium" | "high";
}): Promise<string> {
  const res = await fetch("https://api.x.ai/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model,
      instructions: opts.instructions,
      input: opts.input,
      tools: opts.tools,
      max_output_tokens: opts.maxOutputTokens,
      reasoning: { effort: opts.effort ?? "low" },
      text: { format: { type: "json_object" } },
      store: false,
    }),
    signal: AbortSignal.timeout(90_000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const err = new Error(`xAI ${res.status}${detail ? `: ${detail.slice(0, 220)}` : ""}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }

  const body: unknown = await res.json();
  return extractOutputText(body);
}

export async function grokJson<T>(opts: {
  instructions: string;
  input: string;
  schema: z.ZodType<T>;
  tools?: XaiTool[];
  maxOutputTokens: number;
  effort?: "low" | "medium" | "high";
}): Promise<{ ok: true; data: T; model: string } | { ok: false; error: string; status?: number }> {
  const apiKey = process.env.XAI_API_KEY?.trim();
  if (!apiKey) return { ok: false, error: "AI is not available in this environment" };

  let lastError = "Grok call failed";
  let lastStatus: number | undefined;

  const tryOnce = async (model: (typeof MODELS)[number]) => {
    const text = await callModel({ ...opts, apiKey, model });
    const parsed = opts.schema.parse(extractJson(text));
    return { ok: true as const, data: parsed, model };
  };

  const describe = (err: unknown) => {
    if (err instanceof z.ZodError) {
      return `Grok returned JSON we couldn't read (${err.issues
        .slice(0, 3)
        .map((i) => `${i.path.join(".") || "json"}: ${i.message}`)
        .join("; ")})`;
    }
    return err instanceof Error ? err.message : "Grok call failed";
  };

  try {
    return await tryOnce(MODELS[0]);
  } catch (err) {
    lastError = describe(err);
    lastStatus = (err as { status?: number }).status;
  }

  const fallback = lastStatus === 400 || lastStatus === 404;
  const second = fallback ? MODELS[1] : MODELS[0];
  try {
    return await tryOnce(second);
  } catch (err) {
    lastError = describe(err);
    lastStatus = (err as { status?: number }).status;
  }

  return { ok: false, error: lastError, status: lastStatus };
}

export const RESEARCH_INSTRUCTIONS =
  "You analyze how people write on X. Be specific. Cite real posts. Never fabricate posts, quotes, or engagement. If X is quiet on this, say so and set `quiet: true`. Output JSON only.";
