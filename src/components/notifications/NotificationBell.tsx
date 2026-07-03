"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { NOTIFICATION_ICONS, TONE_TILE } from "./notificationUi";
import { timeAgo } from "@/lib/home/format";
import { cn } from "@/lib/cn";

type Props = {
  className?: string;
};

/**
 * Top-navigation bell — driven by the centralized notification engine.
 * Shows the unread count with a subtle pulse; the dropdown lists the latest
 * ten notifications with Mark All Read and a View All link into the full
 * Notification Center.
 */
export default function NotificationBell({ className }: Props) {
  const {
    centerNotifications,
    totalUnreadCenterNotifications,
    markCenterNotificationRead,
    markAllCenterNotificationsRead,
    hydrated,
  } = useMessaging();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    // Dialog focus contract: move focus into the panel on open; Escape
    // returns it to the bell. Outside clicks let focus follow the click.
    panelRef.current?.focus();
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        bellRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const latest = useMemo(
    () =>
      centerNotifications
        .filter((n) => !n.archived && !n.dismissed)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 10),
    [centerNotifications]
  );

  const unread = hydrated ? totalUnreadCenterNotifications : 0;
  const nowMs = hydrated ? Date.now() : 0;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        ref={bellRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unread > 0 ? `Notifications — ${unread} unread` : "Notifications"}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "relative h-9 w-9 inline-flex items-center justify-center rounded-full transition-colors",
          open
            ? "bg-white/10 text-white"
            : "text-white/70 hover:text-white hover:bg-white/[0.06]"
        )}
      >
        <Bell className="h-4 w-4" strokeWidth={2} />
        {unread > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 flex">
            <span className="absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-50 animate-ping" />
            <span className="relative inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold ring-2 ring-navy-900">
              {unread > 99 ? "99+" : unread}
            </span>
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-label="Notifications"
          className="absolute top-full right-0 mt-2 w-[min(380px,calc(100vw-2rem))] bg-white rounded-2xl ring-1 ring-navy-900/10 shadow-xl shadow-navy-900/15 overflow-hidden z-40 max-h-[70vh] flex flex-col outline-none"
        >
          <header className="flex items-center justify-between px-4 py-3 border-b border-navy-900/[0.06]">
            <div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-gold-600 font-semibold">
                Notifications
              </div>
              <div className="text-xs text-navy-700/65 mt-0.5">{unread} unread</div>
            </div>
            {unread > 0 ? (
              <button
                type="button"
                onClick={() => {
                  markAllCenterNotificationsRead();
                  // This button unmounts once unread hits zero — keep focus
                  // inside the dialog instead of dropping it to <body>.
                  panelRef.current?.focus();
                }}
                className="text-[11px] uppercase tracking-[0.14em] font-semibold text-navy-900 hover:text-gold-700 transition-colors"
              >
                Mark all read
              </button>
            ) : null}
          </header>

          <ul className="flex-1 overflow-y-auto divide-y divide-navy-900/[0.06]">
            {latest.length === 0 ? (
              <li className="px-4 py-10 text-center text-sm text-navy-700/55">
                You&apos;re all caught up.
              </li>
            ) : null}
            {latest.map((n) => {
              const Icon = NOTIFICATION_ICONS[n.icon];
              return (
                <li key={n.id}>
                  <Link
                    href={n.targetUrl ?? "/notifications"}
                    onClick={() => {
                      markCenterNotificationRead(n.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full text-left flex gap-3 px-4 py-3 hover:bg-bone/60 transition-colors",
                      !n.read && "bg-gold-500/[0.05]"
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-lg ring-1",
                        TONE_TILE[n.tone]
                      )}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.9} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-navy-900 leading-snug truncate">
                        {n.title}
                      </div>
                      {n.description ? (
                        <p className="mt-0.5 text-xs text-navy-700/75 leading-snug line-clamp-2">
                          {n.description}
                        </p>
                      ) : null}
                      <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-navy-700/50 font-semibold">
                        {hydrated ? timeAgo(n.createdAt, nowMs) : "·"}
                      </div>
                    </div>
                    {!n.read ? (
                      <span
                        className="self-start mt-1.5 h-2 w-2 rounded-full bg-gold-500"
                        aria-label="Unread"
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>

          <footer className="border-t border-navy-900/[0.06] bg-bone/30 px-4 py-2.5">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-[11px] uppercase tracking-[0.14em] font-semibold text-navy-900 hover:text-gold-700 transition-colors"
            >
              View all notifications
            </Link>
          </footer>
        </div>
      ) : null}
    </div>
  );
}
