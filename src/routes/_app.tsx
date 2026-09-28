import { Navigate, Outlet, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { AppShell } from "@/components/app-shell";
import { checkDeskAccess } from "@/lib/api/access";
import { PRIVATE_DESK_MESSAGE } from "@/lib/owner";

export const Route = createFileRoute("/_app")({ component: AppLayout });

function AppLayout() {
  const { user, isPending } = useCurrentUserState();
  const access = useQuery({
    queryKey: ["desk-access", "v2"],
    queryFn: () => checkDeskAccess(),
    enabled: Boolean(user),
    retry: false,
  });

  if (isPending || (user && access.isPending)) {
    return (
      <div className="flex min-h-dvh flex-col bg-bg px-6 py-10 text-fg">
        <p className="text-xs font-medium tracking-widest text-subtle uppercase">Private desk</p>
        <p className="mt-2 font-display text-4xl italic">Voice Lab</p>
        <p className="shimmer-text mt-6 text-sm">Opening the lab</p>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (access.isError) {
    const message = access.error instanceof Error ? access.error.message : String(access.error);
    if (message.includes(PRIVATE_DESK_MESSAGE) || message.includes("Unauthorized")) {
      return <Navigate to="/login" />;
    }
  }
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
