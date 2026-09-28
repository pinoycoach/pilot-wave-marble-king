import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  AudioLines,
  EyeOff,
  FlaskConical,
  LineChart,
  UserRound,
} from "lucide-react";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Mixer", icon: FlaskConical },
  { to: "/voices", label: "Voices", icon: AudioLines },
  { to: "/donors", label: "Donors", icon: UserRound },
  { to: "/trends", label: "Trends", icon: Activity },
  { to: "/blind", label: "Blind", icon: EyeOff },
  { to: "/results", label: "Results", icon: LineChart },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isPending } = useCurrentUserState();

  return (
    <div className="flex min-h-dvh bg-bg text-fg">
      <aside className="hidden w-52 shrink-0 flex-col border-r border-border lg:flex">
        <div className="px-5 pt-6 pb-4">
          <p className="text-xs font-medium tracking-widest text-subtle uppercase">
            Private desk
          </p>
          <p className="font-display text-3xl tracking-tight italic">Voice Lab</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex h-11 items-center gap-2.5 rounded-sm px-3 text-sm",
                  active ? "bg-raised text-fg" : "text-muted hover:bg-raised/60 hover:text-fg",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border px-4 py-4">
          {isPending ? (
            <div className="h-8 w-28 animate-pulse rounded-full bg-raised" />
          ) : (
            <UserButton />
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-bg px-4 py-3 lg:hidden">
          <div>
            <p className="text-[10px] font-medium tracking-widest text-subtle uppercase">
              Private desk
            </p>
            <p className="font-display text-2xl leading-none tracking-tight italic">Voice Lab</p>
          </div>
          {isPending ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-raised" />
          ) : (
            <UserButton />
          )}
        </header>

        <main className="desk-scroll min-h-0 flex-1 overflow-y-auto pb-24 lg:pb-0">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg/95 lg:hidden">
          <div className="grid grid-cols-6">
            {NAV.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] tracking-wide uppercase",
                    active ? "text-fg" : "text-subtle",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
