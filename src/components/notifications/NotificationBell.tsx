"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  MessageSquare,
  Paperclip,
  GitCommitVertical,
  Sparkles,
  CalendarClock,
  AlarmClock,
  CalendarX,
  type LucideIcon,
} from "lucide-react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { formatRelative, type Notification } from "@/data/messages";
import { cn } from "@/lib/cn";

const KIND_ICON: Record<Notification["kind"], LucideIcon> = {
  message: MessageSquare,
  attachment: Paperclip,
  negotiation_update: GitCommitVertical,
  company_response: Sparkles,
  calendar_event: CalendarClock,
  calendar_deadline: CalendarX,
  calendar_overdue: CalendarX,
  calendar_reminder: AlarmClock,
};

type Props = {
  className?: string;
};

export default function NotificationBell({ className }: Props) {
  const {
    notifications,
    totalUnreadNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    hydrated,
  } = useMessaging();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const sorted = [...notifications].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
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
        {hydrated && totalUnreadNotifications > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-gold-500 text-navy-900 text-[10px] font-bold ring-2 ring-navy-900">
            {totalUnreadNotifications}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute top-full right-0 mt-2 w-[min(360px,calc(100vw-2rem))] bg-white rounded-2xl ring-1 ring-navy-900/10 shadow-xl shadow-navy-900/15 overflow-hidden z-40 max-h-[70vh] flex flex-col"
        >
          <header className="flex items-center justify-between px-4 py-3 border-b border-navy-900/[0.06]">
            <div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-gold-600 font-semibold">
                Notifications
              </div>
              <div className="text-xs text-navy-700/65 mt-0.5">
                {totalUnreadNotifications} unread
              </div>
            </div>
            {totalUnreadNotifications > 0 ? (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="text-[11px] uppercase tracking-[0.14em] font-semibold text-navy-900 hover:text-gold-700 transition-colors"
              >
                Mark all read
              </button>
            ) : null}
          </header>

          <ul className="flex-1 overflow-y-auto divide-y divide-navy-900/[0.06]">
            {sorted.length === 0 ? (
              <li className="px-4 py-10 text-center text-sm text-navy-700/55">
                You&apos;re all caught up.
              </li>
            ) : null}
            {sorted.map((n) => {
              const Icon = KIND_ICON[n.kind];
              const rowClass = cn(
                "w-full text-left flex gap-3 px-4 py-3 hover:bg-bone/60 transition-colors",
                !n.read && "bg-gold-500/[0.05]"
              );
              const inner = (
                <>
                  <span
                    className={cn(
                      "shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-full",
                      n.read
                        ? "bg-navy-900/[0.05] text-navy-700"
                        : "bg-navy-900 text-gold-500 ring-1 ring-navy-900/10"
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.9} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-navy-900 leading-snug truncate">
                      {n.title}
                    </div>
                    <p className="mt-0.5 text-xs text-navy-700/75 leading-snug line-clamp-2">
                      {n.body}
                    </p>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-navy-700/50 font-semibold">
                      {formatRelative(n.createdAt)}
                    </div>
                  </div>
                  {!n.read ? (
                    <span
                      className="self-start mt-1.5 h-2 w-2 rounded-full bg-gold-500"
                      aria-label="Unread"
                    />
                  ) : null}
                </>
              );
              return (
                <li key={n.id}>
                  {n.href ? (
                    <Link
                      href={n.href}
                      onClick={() => {
                        markNotificationRead(n.id);
                        setOpen(false);
                      }}
                      className={rowClass}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(n.id)}
                      className={rowClass}
                    >
                      {inner}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
