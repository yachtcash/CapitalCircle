"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellRing,
  AlertTriangle,
  CalendarDays,
  CalendarRange,
  Pin,
  PinOff,
  Archive,
  ArchiveRestore,
  X,
  CheckCheck,
  Settings2,
  ExternalLink,
  Inbox,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PRIORITIES,
  type CcNotification,
} from "@/data/notifications/types";
import { NOTIFICATION_ICONS, TONE_TILE, PRIORITY_BADGE_TONE, PRIORITY_RANK } from "./notificationUi";
import { visibleNotificationsForRole } from "./roleVisibility";
import NotificationPreferencesModal from "./NotificationPreferencesModal";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import StatCard, { StatGrid } from "@/components/ui/StatCard";
import SearchField from "@/components/ui/SearchField";
import { FilterBar, FilterSelect } from "@/components/ui/FilterBar";
import EmptyState from "@/components/ui/EmptyState";
import { timeAgo } from "@/lib/home/format";
import { cn } from "@/lib/cn";

type StatusFilter = "inbox" | "unread" | "read" | "pinned" | "archived" | "dismissed";
type TimeFilter = "all" | "today" | "7d" | "30d";
type GroupKey = "none" | "date" | "category" | "priority" | "entity";
type SortKey = "newest" | "oldest" | "priority" | "unread" | "pinned";

const DAY_MS = 24 * 60 * 60 * 1000;

function isExpired(n: CcNotification, nowMs: number): boolean {
  return !!n.expiresAt && nowMs > 0 && Date.parse(n.expiresAt) < nowMs;
}

export default function NotificationCenterClient() {
  const router = useRouter();
  const {
    centerNotifications,
    markCenterNotificationRead,
    markAllCenterNotificationsRead,
    toggleCenterNotificationPinned,
    archiveCenterNotification,
    restoreCenterNotification,
    dismissCenterNotification,
    currentRole,
    hydrated,
  } = useMessaging();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("inbox");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");
  const [actor, setActor] = useState("all");
  const [time, setTime] = useState<TimeFilter>("all");
  const [group, setGroup] = useState<GroupKey>("none");
  const [sort, setSort] = useState<SortKey>("newest");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [prefsOpen, setPrefsOpen] = useState(false);

  const nowMs = hydrated ? Date.now() : 0;

  // ---- Summary (role-aware: members never see Admin / Moderation) ----
  const live = useMemo(
    () =>
      visibleNotificationsForRole(centerNotifications, currentRole).filter(
        (n) => !isExpired(n, nowMs)
      ),
    [centerNotifications, currentRole, nowMs]
  );
  const summary = useMemo(() => {
    const inbox = live.filter((n) => !n.archived && !n.dismissed);
    return {
      total: inbox.length,
      unread: inbox.filter((n) => !n.read).length,
      critical: inbox.filter((n) => n.priority === "Critical").length,
      today: nowMs ? inbox.filter((n) => nowMs - Date.parse(n.createdAt) < DAY_MS).length : 0,
      week: nowMs ? inbox.filter((n) => nowMs - Date.parse(n.createdAt) < 7 * DAY_MS).length : 0,
      pinned: inbox.filter((n) => n.pinned).length,
      archived: live.filter((n) => n.archived).length,
    };
  }, [live, nowMs]);

  const actors = useMemo(
    () => [...new Set(live.map((n) => n.actorName))].sort(),
    [live]
  );

  // ---- Filter + sort ----
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = live.filter((n) => {
      switch (status) {
        case "inbox":
          if (n.archived || n.dismissed) return false;
          break;
        case "unread":
          if (n.read || n.archived || n.dismissed) return false;
          break;
        case "read":
          if (!n.read || n.archived || n.dismissed) return false;
          break;
        case "pinned":
          if (!n.pinned || n.archived || n.dismissed) return false;
          break;
        case "archived":
          if (!n.archived) return false;
          break;
        case "dismissed":
          if (!n.dismissed) return false;
          break;
      }
      if (priority !== "all" && n.priority !== priority) return false;
      if (category !== "all" && n.category !== category) return false;
      if (actor !== "all" && n.actorName !== actor) return false;
      if (time !== "all" && nowMs) {
        const age = nowMs - Date.parse(n.createdAt);
        if (time === "today" && age >= DAY_MS) return false;
        if (time === "7d" && age >= 7 * DAY_MS) return false;
        if (time === "30d" && age >= 30 * DAY_MS) return false;
      }
      if (!q) return true;
      const hay = [
        n.id,
        n.title,
        n.description ?? "",
        n.actorName,
        n.targetName ?? "",
        n.targetId,
        n.category,
        n.generatedBy,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return a.createdAt.localeCompare(b.createdAt);
        case "priority":
          return (
            PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
            b.createdAt.localeCompare(a.createdAt)
          );
        case "unread":
          return (
            Number(a.read) - Number(b.read) || b.createdAt.localeCompare(a.createdAt)
          );
        case "pinned":
          return (
            Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt)
          );
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });
    return list;
  }, [live, query, status, priority, category, actor, time, sort, nowMs]);

  // ---- Grouping ----
  const groups = useMemo(() => {
    if (group === "none") return [{ label: null as string | null, items: filtered }];
    const buckets = new Map<string, CcNotification[]>();
    const push = (key: string, n: CcNotification) => {
      const arr = buckets.get(key) ?? [];
      arr.push(n);
      buckets.set(key, arr);
    };
    for (const n of filtered) {
      if (group === "category") push(n.category, n);
      else if (group === "priority") push(n.priority, n);
      else if (group === "entity") push(n.targetName ?? n.groupId, n);
      else {
        // date
        const age = nowMs ? nowMs - Date.parse(n.createdAt) : Infinity;
        push(
          age < DAY_MS ? "Today" : age < 7 * DAY_MS ? "This week" : "Earlier",
          n
        );
      }
    }
    return [...buckets.entries()].map(([label, items]) => ({ label, items }));
  }, [filtered, group, nowMs]);

  const selected = selectedId
    ? centerNotifications.find((n) => n.id === selectedId) ?? null
    : null;

  const openRow = (n: CcNotification) => {
    if (!n.read) markCenterNotificationRead(n.id);
    setSelectedId(n.id);
  };

  const openRecord = (n: CcNotification) => {
    markCenterNotificationRead(n.id);
    if (n.targetUrl) router.push(n.targetUrl);
  };

  const resetFilters = () => {
    setQuery("");
    setStatus("inbox");
    setPriority("all");
    setCategory("all");
    setActor("all");
    setTime("all");
  };

  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)]">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-8 md:py-10">
        <PageHeader
          eyebrow="Notification Center"
          title="Everything that needs your attention"
          subtitle="Deal movement, introductions, listings, documents, and platform activity — one institutional inbox."
          actions={
            <>
              <Button
                variant="outline"
                size="sm"
                iconLeft={<CheckCheck className="h-3.5 w-3.5" strokeWidth={2.2} />}
                onClick={markAllCenterNotificationsRead}
                disabled={!hydrated || summary.unread === 0}
              >
                Mark all read
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconLeft={<Settings2 className="h-3.5 w-3.5" strokeWidth={2.2} />}
                onClick={() => setPrefsOpen(true)}
              >
                Preferences
              </Button>
            </>
          }
        />

        {/* Summary cards */}
        <StatGrid columns="grid-cols-2 md:grid-cols-4 lg:grid-cols-7" className="mb-6">
          <StatCard icon={Inbox} label="Total" value={summary.total} dense />
          <StatCard icon={BellRing} label="Unread" value={hydrated ? summary.unread : "—"} dense />
          <StatCard icon={AlertTriangle} label="Critical" value={summary.critical} dense />
          <StatCard icon={CalendarDays} label="Today" value={hydrated ? summary.today : "—"} dense />
          <StatCard icon={CalendarRange} label="This Week" value={hydrated ? summary.week : "—"} dense />
          <StatCard icon={Pin} label="Pinned" value={summary.pinned} dense />
          <StatCard icon={Archive} label="Archived" value={summary.archived} dense />
        </StatGrid>

        {/* Toolbar */}
        <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-3 md:p-4 mb-5 space-y-3">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search title, description, company, member, deal, category, or ID…"
          />
          <FilterBar count={filtered.length} countNoun="notifications" onReset={resetFilters}>
            <FilterSelect
              value={status}
              onChange={(v) => setStatus(v as StatusFilter)}
              options={["inbox", "unread", "read", "pinned", "archived", "dismissed"]}
              labels={{
                inbox: "Inbox",
                unread: "Unread",
                read: "Read",
                pinned: "Pinned",
                archived: "Archived",
                dismissed: "Dismissed",
              }}
            />
            <FilterSelect
              value={priority}
              onChange={setPriority}
              options={["all", ...NOTIFICATION_PRIORITIES]}
              allLabel="All priorities"
            />
            <FilterSelect
              value={category}
              onChange={setCategory}
              options={["all", ...NOTIFICATION_CATEGORIES]}
              allLabel="All categories"
            />
            <FilterSelect
              value={actor}
              onChange={setActor}
              options={["all", ...actors]}
              allLabel="All actors"
            />
            <FilterSelect
              value={time}
              onChange={(v) => setTime(v as TimeFilter)}
              options={["all", "today", "7d", "30d"]}
              labels={{ all: "All time", today: "Today", "7d": "7 days", "30d": "30 days" }}
            />
            <FilterSelect
              value={group}
              onChange={(v) => setGroup(v as GroupKey)}
              options={["none", "date", "category", "priority", "entity"]}
              labels={{
                none: "No grouping",
                date: "Group: Date",
                category: "Group: Category",
                priority: "Group: Priority",
                entity: "Group: Entity",
              }}
            />
            <FilterSelect
              value={sort}
              onChange={(v) => setSort(v as SortKey)}
              options={["newest", "oldest", "priority", "unread", "pinned"]}
              labels={{
                newest: "Sort: Newest",
                oldest: "Sort: Oldest",
                priority: "Sort: Priority",
                unread: "Sort: Unread first",
                pinned: "Sort: Pinned first",
              }}
            />
          </FilterBar>
        </div>

        {/* List + detail */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-5 items-start">
          <div className="space-y-5 min-w-0">
            {filtered.length === 0 ? (
              <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06]">
                <EmptyState
                  Icon={Bell}
                  title="No notifications match"
                  description="Adjust the filters or check the archive — anything new will land here the moment it happens."
                  action={{ label: "Reset filters", onClick: resetFilters }}
                />
              </div>
            ) : (
              groups.map((g) => (
                <section key={g.label ?? "all"}>
                  {g.label ? (
                    <div className="mb-2 text-[10px] uppercase tracking-[0.16em] text-navy-700/55 font-bold">
                      {g.label} · {g.items.length}
                    </div>
                  ) : null}
                  <ul className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] divide-y divide-navy-900/[0.05] overflow-hidden">
                    {g.items.map((n) => (
                      <NotificationRow
                        key={n.id}
                        n={n}
                        nowMs={nowMs}
                        hydrated={hydrated}
                        selected={selectedId === n.id}
                        onOpen={() => openRow(n)}
                        onPin={() => toggleCenterNotificationPinned(n.id)}
                        onArchive={() =>
                          n.archived ? restoreCenterNotification(n.id) : archiveCenterNotification(n.id)
                        }
                        onDismiss={() =>
                          n.dismissed ? restoreCenterNotification(n.id) : dismissCenterNotification(n.id)
                        }
                      />
                    ))}
                  </ul>
                </section>
              ))
            )}
          </div>

          {/* Desktop detail panel */}
          <div className="hidden lg:block lg:sticky lg:top-6">
            {selected ? (
              <DetailPanel
                n={selected}
                nowMs={nowMs}
                hydrated={hydrated}
                onOpenRecord={() => openRecord(selected)}
                onPin={() => toggleCenterNotificationPinned(selected.id)}
                onArchive={() =>
                  selected.archived
                    ? restoreCenterNotification(selected.id)
                    : archiveCenterNotification(selected.id)
                }
                onDismiss={() =>
                  selected.dismissed
                    ? restoreCenterNotification(selected.id)
                    : dismissCenterNotification(selected.id)
                }
                onClose={() => setSelectedId(null)}
              />
            ) : (
              <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-8 text-center">
                <Bell className="h-6 w-6 mx-auto text-navy-700/30" strokeWidth={1.8} />
                <p className="mt-3 text-sm text-navy-700/55 leading-relaxed">
                  Select a notification to see its full detail, timeline, and actions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile slide-over detail */}
      {selected ? (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            aria-hidden
            onClick={() => setSelectedId(null)}
            className="absolute inset-0 bg-navy-900/55 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 right-0 w-[min(420px,100vw)] bg-cream shadow-2xl overflow-y-auto p-4">
            <DetailPanel
              n={selected}
              nowMs={nowMs}
              hydrated={hydrated}
              onOpenRecord={() => openRecord(selected)}
              onPin={() => toggleCenterNotificationPinned(selected.id)}
              onArchive={() =>
                selected.archived
                  ? restoreCenterNotification(selected.id)
                  : archiveCenterNotification(selected.id)
              }
              onDismiss={() =>
                selected.dismissed
                  ? restoreCenterNotification(selected.id)
                  : dismissCenterNotification(selected.id)
              }
              onClose={() => setSelectedId(null)}
            />
          </div>
        </div>
      ) : null}

      <NotificationPreferencesModal open={prefsOpen} onClose={() => setPrefsOpen(false)} />
    </div>
  );
}

// ---- Row ------------------------------------------------------------------

function NotificationRow({
  n,
  nowMs,
  hydrated,
  selected,
  onOpen,
  onPin,
  onArchive,
  onDismiss,
}: {
  n: CcNotification;
  nowMs: number;
  hydrated: boolean;
  selected: boolean;
  onOpen: () => void;
  onPin: () => void;
  onArchive: () => void;
  onDismiss: () => void;
}) {
  const Icon = NOTIFICATION_ICONS[n.icon];
  return (
    <li
      className={cn(
        "group relative flex items-start gap-3 px-4 py-3.5 transition-colors",
        selected ? "bg-gold-500/[0.07]" : !n.read ? "bg-gold-500/[0.04]" : "",
        "hover:bg-cream/60"
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className="absolute inset-0 z-0"
        aria-label={`Open notification: ${n.title}`}
      />
      <span
        className={cn(
          "relative z-10 pointer-events-none shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-lg ring-1 mt-0.5",
          TONE_TILE[n.tone]
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </span>
      <div className="relative z-10 pointer-events-none flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("text-sm leading-snug", n.read ? "font-medium text-navy-800" : "font-semibold text-navy-900")}>
            {n.title}
          </span>
          <Badge tone={PRIORITY_BADGE_TONE[n.priority]} size="sm">
            {n.priority}
          </Badge>
          {n.pinned ? (
            <Pin className="h-3 w-3 text-gold-600" strokeWidth={2.4} aria-label="Pinned" />
          ) : null}
        </div>
        {n.description ? (
          <p className="mt-0.5 text-xs text-navy-700/70 leading-snug line-clamp-1">{n.description}</p>
        ) : null}
        <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-navy-700/50 font-semibold">
          <span>{hydrated ? timeAgo(n.createdAt, nowMs) : "·"}</span>
          <span className="text-navy-700/25">·</span>
          <span className="truncate">{n.actorName}</span>
          {n.targetName ? (
            <>
              <span className="text-navy-700/25">·</span>
              <span className="truncate max-w-[180px]">{n.targetName}</span>
            </>
          ) : null}
        </div>
      </div>

      {!n.read ? (
        <span className="relative z-10 pointer-events-none mt-2 h-2 w-2 rounded-full bg-gold-500 shrink-0" aria-label="Unread" />
      ) : null}

      {/* Hover actions */}
      <div className="relative z-10 flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <RowAction
          label={n.pinned ? "Unpin" : "Pin"}
          onClick={onPin}
          icon={n.pinned ? PinOff : Pin}
        />
        <RowAction
          label={n.archived ? "Restore" : "Archive"}
          onClick={onArchive}
          icon={n.archived ? ArchiveRestore : Archive}
        />
        <RowAction
          label={n.dismissed ? "Restore" : "Dismiss"}
          onClick={onDismiss}
          icon={n.dismissed ? ArchiveRestore : X}
        />
      </div>
    </li>
  );
}

function RowAction({
  label,
  onClick,
  icon: Icon,
}: {
  label: string;
  onClick: () => void;
  icon: typeof Pin;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-navy-700/55 hover:text-navy-900 hover:bg-navy-900/[0.06] ring-1 ring-transparent hover:ring-navy-900/10 transition-colors"
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
    </button>
  );
}

// ---- Detail panel -----------------------------------------------------------

function DetailPanel({
  n,
  nowMs,
  hydrated,
  onOpenRecord,
  onPin,
  onArchive,
  onDismiss,
  onClose,
}: {
  n: CcNotification;
  nowMs: number;
  hydrated: boolean;
  onOpenRecord: () => void;
  onPin: () => void;
  onArchive: () => void;
  onDismiss: () => void;
  onClose: () => void;
}) {
  const Icon = NOTIFICATION_ICONS[n.icon];
  const meta = Object.entries(n.metadata ?? {});
  return (
    <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] overflow-hidden">
      <header className="px-5 py-4 border-b border-navy-900/[0.06] flex items-start gap-3">
        <span
          className={cn(
            "shrink-0 h-10 w-10 inline-flex items-center justify-center rounded-xl ring-1",
            TONE_TILE[n.tone]
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.9} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge tone={PRIORITY_BADGE_TONE[n.priority]} size="sm">
              {n.priority}
            </Badge>
            <Badge tone="neutral" size="sm">
              {n.category}
            </Badge>
          </div>
          <h2 className="mt-1.5 text-[15px] font-semibold text-navy-900 leading-snug">{n.title}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close detail"
          className="shrink-0 h-8 w-8 inline-flex items-center justify-center rounded-full text-navy-700/55 hover:text-navy-900 hover:bg-bone transition-colors"
        >
          <X className="h-4 w-4" strokeWidth={2.2} />
        </button>
      </header>

      <div className="px-5 py-4 space-y-4">
        {n.description ? (
          <p className="text-sm text-navy-700/85 leading-relaxed">{n.description}</p>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <DetailField label="Actor" value={`${n.actorName} · ${n.actorRole}`} />
          <DetailField label="Entity" value={n.targetName ?? n.targetId} />
          <DetailField label="Category" value={n.category} />
          <DetailField label="Notification ID" value={n.id} />
        </div>

        {meta.length > 0 ? (
          <div className="rounded-xl bg-bone/50 ring-1 ring-navy-900/[0.05] p-3 space-y-1.5">
            <div className="text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-bold">
              Metadata
            </div>
            {meta.map(([k, v]) => (
              <div key={k} className="flex items-start gap-2 text-xs">
                <span className="text-navy-700/55 shrink-0 capitalize">{k}:</span>
                <span className="text-navy-900 font-medium break-words min-w-0">{v}</span>
              </div>
            ))}
          </div>
        ) : null}

        {/* Timeline */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-bold mb-2">
            Timeline
          </div>
          <ol className="space-y-1.5 text-xs text-navy-700/75">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-500 shrink-0" />
              Created {hydrated ? timeAgo(n.createdAt, nowMs) : "·"}
            </li>
            {n.updatedAt !== n.createdAt ? (
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-navy-700/40 shrink-0" />
                Updated {hydrated ? timeAgo(n.updatedAt, nowMs) : "·"}
              </li>
            ) : null}
            <li className="flex items-center gap-2">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full shrink-0",
                  n.read ? "bg-emerald-500" : "bg-navy-700/30"
                )}
              />
              {n.read ? "Read" : "Unread"}
              {n.archived ? " · Archived" : ""}
              {n.dismissed ? " · Dismissed" : ""}
              {n.pinned ? " · Pinned" : ""}
            </li>
          </ol>
        </div>
      </div>

      <footer className="px-5 py-4 border-t border-navy-900/[0.06] bg-bone/30 space-y-2">
        {n.targetUrl ? (
          <Button
            fullWidth
            size="sm"
            iconRight={<ExternalLink className="h-3.5 w-3.5" strokeWidth={2.2} />}
            onClick={onOpenRecord}
          >
            {n.action?.label ?? "Open record"}
          </Button>
        ) : null}
        {n.secondaryAction ? (
          <Button fullWidth size="sm" variant="outline" href={n.secondaryAction.href}>
            {n.secondaryAction.label}
          </Button>
        ) : null}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={onPin}>
            {n.pinned ? "Unpin" : "Pin"}
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={onArchive}>
            {n.archived ? "Restore" : "Archive"}
          </Button>
          <Button size="sm" variant="ghost" className="flex-1" onClick={onDismiss}>
            {n.dismissed ? "Restore" : "Dismiss"}
          </Button>
        </div>
      </footer>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-bold">{label}</div>
      <div className="mt-0.5 text-xs font-medium text-navy-900 break-words">{value}</div>
    </div>
  );
}
