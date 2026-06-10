"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/data/nav";
import { cn } from "@/lib/cn";
import { canAccessAdmin } from "@/lib/roles";
import { useMessaging } from "@/components/providers/MessagingProvider";

export default function BottomNav() {
  const pathname = usePathname();
  const { totalUnreadConversations, hydrated, currentRole } = useMessaging();
  const mobileItems = navItems.filter(
    (i) => !i.hideOnMobile && (!i.adminOnly || canAccessAdmin(currentRole))
  );

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-navy-900/95 backdrop-blur-lg border-t border-white/5 pb-[env(safe-area-inset-bottom)]">
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${mobileItems.length}, minmax(0, 1fr))` }}
      >
        {mobileItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          const isMessages = item.href === "/messages";
          const showBadge = isMessages && hydrated && totalUnreadConversations > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium tracking-wide uppercase transition-colors",
                active ? "text-gold-500" : "text-white/55 hover:text-white"
              )}
            >
              <span className="relative">
                <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2 : 1.6} />
                {showBadge ? (
                  <span
                    className="absolute -top-1.5 -right-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-gold-500 text-navy-900 text-[10px] font-bold ring-2 ring-navy-900"
                    aria-label={`${totalUnreadConversations} unread`}
                  >
                    {totalUnreadConversations}
                  </span>
                ) : active ? (
                  <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-gold-500" />
                ) : null}
              </span>
              <span>{item.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
