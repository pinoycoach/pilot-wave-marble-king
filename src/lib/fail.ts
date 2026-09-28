/** Unwrap TanStack / fetch / Grok errors into a short line for toasts and banners. */
export function failMessage(err: unknown): string {
  if (!err) return "Request failed";
  if (typeof err === "string" && err.trim()) return err.slice(0, 280);
  if (err && typeof err === "object") {
    const rec = err as { data?: unknown; cause?: unknown; message?: unknown };
    if (typeof rec.data === "string" && rec.data.trim()) return rec.data.slice(0, 280);
    if (rec.data && typeof rec.data === "object" && "message" in rec.data) {
      const m = (rec.data as { message?: unknown }).message;
      if (typeof m === "string" && m.trim()) return m.slice(0, 280);
    }
    if (rec.cause) return failMessage(rec.cause);
    if (typeof rec.message === "string" && rec.message.trim()) {
      const m = rec.message.replace(/^.*?Error:\s*/, "").trim();
      if (m && m !== "Internal Server Error") return m.slice(0, 280);
    }
  }
  return "Request failed";
}
