"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Building2,
  HandCoins,
  ListChecks,
  Briefcase,
  UserPlus,
  Flag,
  ShieldAlert,
  ScrollText,
  CalendarDays,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { canAccessAdmin, canReviewQueue, ROLES, type Role } from "@/lib/roles";
import AdminGlobalSearch from "./AdminGlobalSearch";
import { cn } from "@/lib/cn";

const SECTIONS: { label: string; href: string; icon: LucideIcon; exact?: boolean }[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Members", href: "/admin/members", icon: Users },
  { label: "Companies", href: "/admin/companies", icon: Building2 },
  { label: "Opportunities", href: "/admin/opportunities", icon: HandCoins },
  { label: "Listings", href: "/admin/listings", icon: ListChecks },
  { label: "Deals", href: "/admin/deals", icon: Briefcase },
  { label: "Introductions", href: "/admin/introductions", icon: UserPlus },
  { label: "Moderation", href: "/admin/moderation", icon: Flag },
  { label: "Calendar", href: "/admin/calendar", icon: CalendarDays },
  { label: "Audit Log", href: "/admin/audit", icon: ScrollText },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

/**
 * Frame for every /admin page: gold-on-navy command header with the role
 * switcher, the section subnav, and an access gate. The switcher renders
 * even when access is denied so an impersonating Super Admin can always
 * switch back — otherwise testing lower roles would lock you out.
 */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const { currentRole } = useMessaging();
  // Admin+ get the whole control center. Moderator/Editor get the Moderation
  // Center only — they can reach /admin/moderation but no other admin route.
  const fullAccess = canAccessAdmin(currentRole);
  const isModerationPath = pathname.startsWith("/admin/moderation");
  const moderationOnly = !fullAccess && canReviewQueue(currentRole);
  const allowed = fullAccess || (moderationOnly && isModerationPath);
  const sections = fullAccess
    ? SECTIONS
    : SECTIONS.filter((s) => s.href === "/admin/moderation");

  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)]">
      <header className="bg-navy-900 text-white">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-5 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-gold-400 font-bold inline-flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.4} />
              Admin Control Center
            </div>
            <h1 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight">
              Platform Command
            </h1>
          </div>
          <RoleSwitcher />
        </div>
        {allowed ? (
          <nav className="max-w-[1400px] mx-auto px-5 md:px-10 flex items-stretch gap-0.5 overflow-x-auto">
            {sections.map(({ label, href, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative inline-flex items-center gap-1.5 px-3.5 py-3 text-sm font-semibold whitespace-nowrap transition-colors",
                    active ? "text-white" : "text-white/55 hover:text-white"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
                  {label}
                  <span
                    className={cn(
                      "absolute inset-x-2 bottom-0 h-0.5 rounded-full transition-opacity bg-gold-500",
                      active ? "opacity-100" : "opacity-0"
                    )}
                  />
                </Link>
              );
            })}
          </nav>
        ) : null}
      </header>

      {allowed ? (
        <>
          <div className="max-w-[1400px] mx-auto px-5 md:px-10 pt-5">
            <AdminGlobalSearch />
          </div>
          {children}
        </>
      ) : (
        <div className="max-w-xl mx-auto px-5 py-20 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-navy-900 text-gold-500 ring-4 ring-navy-900/10">
            <ShieldAlert className="h-6 w-6" strokeWidth={2} />
          </span>
          <h2 className="mt-5 text-2xl font-semibold text-navy-900 tracking-tight">
            Admin access required
          </h2>
          <p className="mt-2 text-sm text-navy-700/70 leading-relaxed">
            Your current role is <span className="font-semibold text-navy-900">{currentRole}</span>.
            The Admin Control Center requires Admin or Super Admin. Use the role
            switcher above to switch back.
          </p>
          {moderationOnly ? (
            <Link
              href="/admin/moderation"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-5 py-2.5 text-sm transition-colors"
            >
              Open Moderation Center
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}

/** Super Admin impersonation switcher — testing only, persisted locally. */
export function RoleSwitcher() {
  const { currentRole, setCurrentRole } = useMessaging();
  return (
    <label className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] font-semibold text-white/70">
      Current Role
      <select
        value={currentRole}
        onChange={(e) => setCurrentRole(e.target.value as Role)}
        className="rounded-full bg-white/10 ring-1 ring-white/20 hover:ring-gold-500/60 text-white px-3.5 py-2 text-xs uppercase tracking-[0.12em] font-bold transition-shadow [&>option]:text-navy-900"
      >
        {ROLES.slice().reverse().map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
    </label>
  );
}

// ---- Shared admin-table primitives ----

export function AdminPage({
  title,
  subtitle,
  count,
  children,
}: {
  title: string;
  subtitle?: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-8 space-y-5">
      <header>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-navy-900">
          {title}
          {count !== undefined ? (
            <span className="ml-2 text-base font-semibold text-navy-700/55 tabular-nums">
              ({count})
            </span>
          ) : null}
        </h2>
        {subtitle ? (
          <p className="mt-1.5 text-sm text-navy-700/70 max-w-2xl">{subtitle}</p>
        ) : null}
      </header>
      {children}
    </div>
  );
}

export function TableShell({ children, minWidth = 1100 }: { children: React.ReactNode; minWidth?: number }) {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-navy-900/[0.06] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth }}>
          {children}
        </table>
      </div>
    </div>
  );
}

export function THead({ cols, leading }: { cols: string[]; leading?: React.ReactNode }) {
  return (
    <thead className="bg-bone/60">
      <tr className="text-[10px] uppercase tracking-[0.14em] text-navy-700/65 font-bold">
        {leading !== undefined ? (
          <th className="px-3 py-3 text-left w-10">{leading}</th>
        ) : null}
        {cols.map((c) => (
          <th key={c} className={cn("px-3 py-3 text-left", c === "Actions" && "text-right")}>
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function ActBtn({
  onClick,
  children,
  tone = "default",
  href,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  tone?: "default" | "gold" | "rose" | "emerald";
  href?: string;
}) {
  const cls = cn(
    "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] font-bold ring-1 transition-colors whitespace-nowrap",
    tone === "gold" && "bg-gold-500 hover:bg-gold-400 text-navy-900 ring-gold-500",
    tone === "rose" && "bg-white hover:bg-rose-500/10 text-rose-700 ring-rose-500/40",
    tone === "emerald" && "bg-emerald-500 hover:bg-emerald-400 text-white ring-emerald-500",
    tone === "default" && "bg-white hover:bg-bone text-navy-900 ring-navy-900/10"
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "emerald" | "amber" | "rose" | "navy" | "gold" | "sky";
}) {
  const map = {
    emerald: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30",
    amber: "bg-amber-500/15 text-amber-700 ring-amber-500/30",
    rose: "bg-rose-500/15 text-rose-700 ring-rose-500/30",
    navy: "bg-navy-900/[0.06] text-navy-700 ring-navy-900/15",
    gold: "bg-gold-500/20 text-gold-700 ring-gold-500/40",
    sky: "bg-sky-500/15 text-sky-700 ring-sky-500/30",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-bold rounded-full px-2 py-0.5 ring-1 whitespace-nowrap",
        map[tone]
      )}
    >
      {label}
    </span>
  );
}
