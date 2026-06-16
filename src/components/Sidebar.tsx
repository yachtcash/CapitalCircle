"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/data/nav";
import { cn } from "@/lib/cn";
import { canAccessAdmin, canViewCalendar, type Role } from "@/lib/roles";
import { useMessaging } from "@/components/providers/MessagingProvider";
import NotificationBell from "@/components/notifications/NotificationBell";

const SELF_MEMBER_ID = "MEM-000001";

export default function Sidebar() {
  const pathname = usePathname();
  const { totalUnreadConversations, hydrated, currentRole, calendarGrants } = useMessaging();
  const calGranted = !!calendarGrants[SELF_MEMBER_ID];
  const visibleItems = navItems.filter((i) => {
    if (i.adminOnly && !canAccessAdmin(currentRole)) return false;
    if (i.calendarGated && !canViewCalendar(currentRole as Role, calGranted)) return false;
    return true;
  });

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col bg-navy-900 text-white border-r border-white/5 z-30">
      <div className="flex items-center justify-between gap-2 px-4 h-20 border-b border-white/5 shrink-0">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gold-500/15 ring-1 ring-gold-500/40 shrink-0">
            <span className="h-3.5 w-3.5 rounded-full bg-gold-500" />
          </span>
          <span className="flex flex-col leading-tight min-w-0">
            <span className="font-semibold tracking-wide text-white text-base truncate">
              Capital Circle
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-gold-400 truncate">
              Private Marketplace
            </span>
          </span>
        </Link>
        <NotificationBell />
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {visibleItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          const isMessages = item.href === "/messages";
          const showBadge = isMessages && hydrated && totalUnreadConversations > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                active
                  ? "bg-white/5 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/[0.03]"
              )}
            >
              <span
                className={cn(
                  "absolute -left-3 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r bg-gold-500 transition-opacity",
                  active ? "opacity-100" : "opacity-0"
                )}
              />
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  active ? "text-gold-500" : "text-white/50 group-hover:text-white/80"
                )}
                strokeWidth={1.8}
              />
              <span className="font-medium flex-1">{item.label}</span>
              {showBadge ? (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-gold-500 text-navy-900 text-[10px] font-bold">
                  {totalUnreadConversations}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-5 border-t border-white/5">
        <div className="rounded-xl p-4 bg-gradient-to-br from-navy-800 to-navy-700 ring-1 ring-white/5">
          <div className="text-[11px] uppercase tracking-[0.16em] text-gold-400 mb-1.5">
            Membership
          </div>
          <div className="text-sm font-semibold text-white">Invite-only access</div>
          <div className="text-xs text-white/60 mt-1.5 leading-relaxed">
            Vetted investors, developers, and operators only.
          </div>
        </div>
      </div>
    </aside>
  );
}
