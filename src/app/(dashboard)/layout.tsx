"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import * as Icons from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { NAV_BY_ROLE, NAV_ICON_BY_LABEL, ROLE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SECTION_ROOTS = ["owner", "tenant", "manager", "admin"] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthActions();
  const { user, isLoading } = useCurrentUser();

  const currentSection = SECTION_ROOTS.find((s) => pathname.startsWith(`/${s}`));

  useEffect(() => {
    if (isLoading || !user) return;
    if (currentSection && currentSection !== user.role) {
      router.replace(`/${user.role}`);
    }
  }, [isLoading, user, currentSection, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-sm text-ink-faint">Loading…</p>
      </div>
    );
  }

  const nav = NAV_BY_ROLE[user.role] ?? [];
  const unread = useQuery(api.notifications.listMyNotifications, { unreadOnly: true });
  const unreadMessageCount = unread?.filter((n) => n.type === "message").length ?? 0;

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="flex w-64 flex-col border-r border-line bg-white">
        <div className="flex items-center gap-2.5 border-b border-line px-6 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brass to-violet text-white shadow-card">
            <Icons.Home size={18} strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-display text-base font-bold text-ink">Rentaly</p>
            <p className="text-xs text-ink-faint">{ROLE_LABELS[user.role]}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {nav.map((item) => {
            const active = pathname === item.href;
            const iconName = NAV_ICON_BY_LABEL[item.label] ?? "Circle";
            const Icon = (Icons as any)[iconName] ?? Icons.Circle;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-gradient-to-r from-brass to-violet text-white shadow-card"
                    : "text-ink-faint hover:bg-paper-dim hover:text-ink",
                )}
              >
                <Icon size={18} strokeWidth={2} />
                {item.label}
                {item.label === "Messages" && unreadMessageCount > 0 && (
                  <span
                    className={cn(
                      "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold",
                      active ? "bg-white/25 text-white" : "bg-rust text-white",
                    )}
                  >
                    {unreadMessageCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line px-5 py-4">
          <p className="truncate text-sm font-medium text-ink">{user.name ?? user.email}</p>
          <button
            onClick={() => void signOut()}
            className="mt-1.5 text-xs font-medium text-ink-faint hover:text-rust"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 px-10 py-10">{children}</main>
    </div>
  );
}