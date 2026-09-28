import { createServerFn } from "@tanstack/react-start";
import { ownerMiddleware } from "@/lib/owner";

export const checkDeskAccess = createServerFn({ method: "GET" })
  .middleware([ownerMiddleware])
  .handler(async () => ({ ok: true as const }));
