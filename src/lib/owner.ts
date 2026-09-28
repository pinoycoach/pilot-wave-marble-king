import { createMiddleware } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export const PRIVATE_DESK_MESSAGE = "This desk is private.";

const FALLBACK_OWNER_EMAILS = ["whileinmanila@gmail.com"];

export class PrivateDeskError extends Error {
  readonly status = 403;
  constructor() {
    super(PRIVATE_DESK_MESSAGE);
    this.name = "PrivateDeskError";
  }
}

export function ownerEmails(): string[] {
  const fromEnv = (process.env.OWNER_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return fromEnv.length ? fromEnv : FALLBACK_OWNER_EMAILS;
}

function deployed(): boolean {
  return Boolean(process.env.GROK_PROJECT_ID?.trim());
}

export function isOwnerEmail(email: string | null | undefined): boolean {
  // Live preview is only visible to the builder. Grok already signed that
  // person in (often with a non-Gmail identity), and Sign out is a no-op.
  if (!deployed()) return true;
  if (!email) return false;
  return ownerEmails().includes(email.trim().toLowerCase());
}

export function assertOwner(email: string | null | undefined): void {
  if (!isOwnerEmail(email)) throw new PrivateDeskError();
}

/**
 * Wraps authMiddleware. Verified session is not enough: the email must be on
 * OWNER_EMAILS. Throws PrivateDeskError otherwise. Does not touch server.ts.
 */
export const ownerMiddleware = createMiddleware({ type: "function" })
  .middleware([authMiddleware])
  .client(async ({ next }) => {
    const { getBearerToken } = await import("@/lib/auth/client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    const { getSessionUser } = await import("@/lib/auth/verify.server");
    const bearer =
      typeof context === "object" && context && "bearerToken" in context
        ? (context.bearerToken as string | undefined)
        : undefined;
    const user = await getSessionUser(bearer);
    const email = user?.email ?? null;
    assertOwner(email);
    return next({
      context: {
        userId: context.userId,
        email,
      },
    });
  });
