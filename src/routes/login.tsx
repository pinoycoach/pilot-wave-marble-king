import { useSyncExternalStore } from "react";
import { Navigate, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { GROK_PROVIDERS, authEnabled, signIn, signOut } from "@/lib/auth/client";
import { hasGateSessionMarker } from "@/lib/auth/gate-session-marker";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { checkDeskAccess } from "@/lib/api/access";
import { PRIVATE_DESK_MESSAGE } from "@/lib/owner";

export const Route = createFileRoute("/login")({ component: Login });

function isPrivateDeskError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err ?? "");
  return message.includes(PRIVATE_DESK_MESSAGE);
}

function Login() {
  const { user, isPending } = useCurrentUserState();
  const access = useQuery({
    queryKey: ["desk-access", "v2"],
    queryFn: () => checkDeskAccess(),
    enabled: Boolean(user),
    retry: false,
  });
  const gateSession = useSyncExternalStore(
    () => () => {},
    hasGateSessionMarker,
    () => false,
  );

  if (isPending || (user && access.isPending)) {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg px-6 text-fg">
        <p className="shimmer-text text-sm">Opening the lab</p>
      </main>
    );
  }

  if (user && access.isSuccess) return <Navigate to="/" />;

  const denied = Boolean(user && access.isError && isPrivateDeskError(access.error));

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6 text-fg">
      <div className="w-full max-w-sm">
        <p className="text-xs font-medium tracking-widest text-subtle uppercase">Private desk</p>
        <h1 className="mt-2 font-display text-5xl tracking-tight italic">Voice Lab</h1>
        {denied ? (
          <>
            <p className="mt-4 text-sm leading-relaxed text-muted">{PRIVATE_DESK_MESSAGE}</p>
            {user?.primaryEmail ? (
              <p className="mt-2 text-xs text-subtle">Signed in as {user.primaryEmail}</p>
            ) : (
              <p className="mt-2 text-xs text-subtle">This Grok session is not on the owner list.</p>
            )}
            {!gateSession ? (
              <Button
                className="mt-8"
                type="button"
                variant="outline"
                onClick={() => void signOut()}
              >
                Sign out
              </Button>
            ) : null}
          </>
        ) : (
          <>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Measure how a leading voice writes. Mix the moves. Meter the drift. Final writing
              happens in Claude. Nothing posts.
            </p>
            <div className="mt-8 flex flex-col gap-2">
              {authEnabled ? (
                GROK_PROVIDERS.map((p) => (
                  <Button
                    key={p.providerId}
                    type="button"
                    variant="outline"
                    onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                  >
                    Continue with {p.label}
                  </Button>
                ))
              ) : (
                <p className="text-sm text-muted">Sign-in is disabled.</p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
