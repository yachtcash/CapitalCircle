"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItemsForRole } from "@/data/nav";
import { cn } from "@/lib/cn";
import { experienceForRole } from "@/lib/roles";
import { PlusCircle, LogIn } from "lucide-react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import NotificationBell from "@/components/notifications/NotificationBell";
import CapitalCircleMark from "@/components/brand/CapitalCircleMark";
import RoleSwitcherCompact from "@/components/dev/RoleSwitcherCompact";

const SELF_MEMBER_ID = "MEM-000001";

export default function Sidebar() {
  const pathname = usePathname();
  const { totalUnreadConversations, hydrated, currentRole, calendarGrants } = useMessaging();
  const calGranted = !!calendarGrants[SELF_MEMBER_ID];
  const experience = experienceForRole(currentRole);
  const visibleItems = navItemsForRole(currentRole, calGranted);

  const subtitle =
    experience === "guest"
      ? "Private Marketplace"
      : experience === "operations"
        ? "Operations Platform"
        : "Investment Portal";

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col bg-navy-900 text-white border-r border-white/5 z-30">
      <div className="flex items-center justify-between gap-2 px-4 h-20 border-b border-white/5 shrink-0">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <CapitalCircleMark className="h-9 w-9 shrink-0" />
          <span className="flex flex-col leading-tight min-w-0">
            <span className="font-semibold tracking-tight text-white text-[15px] truncate">
              Capital Circle
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-gold-400/90 truncate">
              {subtitle}
            </span>
          </span>
        </Link>
        {experience !== "guest" ? <NotificationBell /> : null}
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          const isMessages = item.href === "/messages";
          const showBadge = isMessages && hydrated && totalUnreadConversations > 0;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors",
                  active
                    ? "bg-gold-400 text-navy-900"
                    : "bg-gold-500 text-navy-900 hover:bg-gold-400"
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2.2} />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          }

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

      <div className="px-5 py-5 border-t border-white/5 space-y-4">
        {experience === "guest" ? (
          <>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-4 py-2.5 text-sm transition-colors"
            >
              <LogIn className="h-4 w-4" strokeWidth={2.2} />
              Member Login
            </Link>
            <div className="rounded-xl p-4 bg-gradient-to-br from-navy-800 to-navy-700 ring-1 ring-white/5">
              <div className="text-[11px] uppercase tracking-[0.16em] text-gold-400 mb-1.5">
                Membership
              </div>
              <div className="text-sm font-semibold text-white">Invite-only access</div>
              <div className="text-xs text-white/60 mt-1.5 leading-relaxed">
                Members message sponsors, save deals, and raise capital.
              </div>
            </div>
          </>
        ) : experience === "operations" ? (
          <>
            <Link
              href="/create-listing"
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-4 py-2.5 text-sm transition-colors"
            >
              <PlusCircle className="h-4 w-4" strokeWidth={2.2} />
              Create Listing
            </Link>
            <div className="rounded-xl p-4 bg-gradient-to-br from-navy-800 to-navy-700 ring-1 ring-white/5">
              <div className="text-[11px] uppercase tracking-[0.16em] text-gold-400 mb-1.5">
                Operations
              </div>
              <div className="text-sm font-semibold text-white">Platform command</div>
              <div className="text-xs text-white/60 mt-1.5 leading-relaxed">
                Full marketplace, deal, and member administration.
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl p-4 bg-gradient-to-br from-navy-800 to-navy-700 ring-1 ring-white/5">
            <div className="text-[11px] uppercase tracking-[0.16em] text-gold-400 mb-1.5">
              Membership
            </div>
            <div className="text-sm font-semibold text-white">Invite-only access</div>
            <div className="text-xs text-white/60 mt-1.5 leading-relaxed">
              Vetted investors, developers, and operators only.
            </div>
          </div>
        )}
        <RoleSwitcherCompact />
      </div>
    </aside>
  );
}
