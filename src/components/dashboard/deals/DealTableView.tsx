"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  MoreHorizontal,
  Archive,
  RotateCcw,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { Deal } from "@/data/deals";
import { DEAL_DESK_NOW_MS, STAGE_RANK, isOpenStage } from "@/data/deals";
import { useMessaging } from "@/components/providers/MessagingProvider";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  DealHealthBadge,
  DealPriorityBadge,
  DealStageBadge,
  FollowUpBadge,
  formatCurrency,
  formatDate,
} from "./DealBadges";
import { cn } from "@/lib/cn";

type SortKey =
  | "dealId"
  | "title"
  | "sponsor"
  | "investor"
  | "stage"
  | "priority"
  | "value"
  | "expectedClose"
  | "admin"
  | "updated"
  | "created";

const PRIORITY_RANK: Record<Deal["priority"], number> = {
  Low: 0,
  Normal: 1,
  High: 2,
  Urgent: 3,
};

function compareDeals(a: Deal, b: Deal, key: SortKey): number {
  switch (key) {
    case "dealId":
      return a.dealId.localeCompare(b.dealId);
    case "title":
      return a.title.localeCompare(b.title);
    case "sponsor":
      return a.sponsor.name.localeCompare(b.sponsor.name);
    case "investor":
      return (a.investor?.name ?? "").localeCompare(b.investor?.name ?? "");
    case "stage":
      return STAGE_RANK[a.stage] - STAGE_RANK[b.stage];
    case "priority":
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    case "value":
      return a.targetInvestment - b.targetInvestment;
    case "expectedClose":
      return (a.expectedCloseDate ?? "").localeCompare(b.expectedCloseDate ?? "");
    case "admin":
      return a.assignedAdmin.localeCompare(b.assignedAdmin);
    case "updated":
      return a.updatedDate.localeCompare(b.updatedDate);
    case "created":
      return a.createdDate.localeCompare(b.createdDate);
  }
}

export default function DealTableView({ deals }: { deals: Deal[] }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "updated",
    dir: "desc",
  });
  const nowMs = DEAL_DESK_NOW_MS;

  const sorted = [...deals].sort((a, b) => {
    const c = compareDeals(a, b, sort.key);
    return sort.dir === "asc" ? c : -c;
  });

  const toggle = (key: SortKey) =>
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : {
            key,
            dir:
              key === "title" || key === "sponsor" || key === "investor" || key === "admin"
                ? "asc"
                : "desc",
          }
    );

  return (
    <div className="bg-white rounded-2xl ring-1 ring-navy-900/[0.06] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-[1360px] w-full text-sm">
          <thead className="bg-bone/60">
            <tr className="text-[10px] uppercase tracking-[0.14em] text-navy-700/65 font-bold">
              <Th k="dealId" s={sort} t={toggle}>Deal ID</Th>
              <Th k="title" s={sort} t={toggle}>Title</Th>
              <Th k="sponsor" s={sort} t={toggle}>Sponsor</Th>
              <Th k="investor" s={sort} t={toggle}>Investor</Th>
              <Th k="stage" s={sort} t={toggle}>Stage</Th>
              <Th k="priority" s={sort} t={toggle}>Priority</Th>
              <th className="px-3 py-3 text-left">Health</th>
              <Th k="value" s={sort} t={toggle} right>Value</Th>
              <Th k="expectedClose" s={sort} t={toggle}>Expected Close</Th>
              <Th k="admin" s={sort} t={toggle}>Assigned Admin</Th>
              <Th k="updated" s={sort} t={toggle}>Updated</Th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-900/[0.06]">
            {sorted.map((deal) => (
              <tr key={deal.dealId} className="hover:bg-bone/40 transition-colors">
                <td className="px-3 py-3 align-middle whitespace-nowrap">
                  <Link
                    href={`/deal-desk/${deal.dealId}`}
                    className="text-[11px] uppercase tracking-[0.14em] font-bold text-navy-700 hover:text-gold-700 tabular-nums"
                  >
                    {deal.dealId}
                  </Link>
                </td>
                <td className="px-3 py-3 align-middle min-w-[240px]">
                  <Link
                    href={`/deal-desk/${deal.dealId}`}
                    className="font-semibold text-navy-900 hover:text-gold-700 transition-colors line-clamp-2"
                  >
                    {deal.title}
                  </Link>
                </td>
                <td className="px-3 py-3 align-middle whitespace-nowrap text-navy-700/85 max-w-[160px] truncate">
                  {deal.sponsor.name}
                </td>
                <td className="px-3 py-3 align-middle whitespace-nowrap text-navy-700/85 max-w-[160px] truncate">
                  {deal.investor?.name ?? "—"}
                </td>
                <td className="px-3 py-3 align-middle">
                  <DealStageBadge stage={deal.stage} />
                </td>
                <td className="px-3 py-3 align-middle">
                  <DealPriorityBadge priority={deal.priority} />
                </td>
                <td className="px-3 py-3 align-middle">
                  <DealHealthBadge health={deal.health} />
                </td>
                <td className="px-3 py-3 align-middle text-right whitespace-nowrap font-semibold text-navy-900 tabular-nums">
                  {formatCurrency(deal.targetInvestment)}
                </td>
                <td className="px-3 py-3 align-middle whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-navy-700/70 tabular-nums">
                      {formatDate(deal.expectedCloseDate)}
                    </span>
                    <FollowUpBadge iso={deal.nextFollowUpDate} nowMs={nowMs} />
                  </div>
                </td>
                <td className="px-3 py-3 align-middle whitespace-nowrap text-navy-700/85">
                  {deal.assignedAdmin}
                </td>
                <td className="px-3 py-3 align-middle whitespace-nowrap text-navy-700/65 text-xs">
                  {formatDate(deal.updatedDate)}
                </td>
                <td className="px-3 py-3 align-middle text-right">
                  <RowActions deal={deal} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RowActions({ deal }: { deal: Deal }) {
  const { archiveDeal, restoreDeal, closeDeal, reopenDeal, deleteDeal } =
    useMessaging();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const isOpen = isOpenStage(deal.stage);
  const isArchived = deal.stage === "Archived";
  const isClosed = deal.stage === "Closed Won" || deal.stage === "Closed Lost";

  return (
    <div ref={ref} className="relative inline-flex items-center gap-1">
      <Link
        href={`/deal-desk/${deal.dealId}`}
        className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-bold text-gold-700 hover:text-gold-600"
      >
        Open
        <ArrowUpRight className="h-3 w-3" strokeWidth={2.4} />
      </Link>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Deal actions"
        className="h-7 w-7 inline-flex items-center justify-center rounded-full text-navy-700/65 hover:text-navy-900 hover:bg-bone"
      >
        <MoreHorizontal className="h-4 w-4" strokeWidth={2.2} />
      </button>
      {open ? (
        <ul
          role="menu"
          className="absolute right-0 top-full mt-1 min-w-[180px] bg-white ring-1 ring-navy-900/[0.08] shadow-lg rounded-xl py-1.5 z-30 text-left"
        >
          {isOpen ? (
            <>
              <MenuBtn
                onClick={() => {
                  closeDeal(deal.dealId, "won");
                  setOpen(false);
                }}
                Icon={CheckCircle2}
              >
                Close Won
              </MenuBtn>
              <MenuBtn
                onClick={() => {
                  closeDeal(deal.dealId, "lost");
                  setOpen(false);
                }}
                Icon={XCircle}
              >
                Close Lost
              </MenuBtn>
              <MenuBtn
                onClick={() => {
                  archiveDeal(deal.dealId);
                  setOpen(false);
                }}
                Icon={Archive}
              >
                Archive
              </MenuBtn>
            </>
          ) : null}
          {isClosed ? (
            <MenuBtn
              onClick={() => {
                reopenDeal(deal.dealId);
                setOpen(false);
              }}
              Icon={RotateCcw}
            >
              Reopen
            </MenuBtn>
          ) : null}
          {isArchived ? (
            <MenuBtn
              onClick={() => {
                restoreDeal(deal.dealId);
                setOpen(false);
              }}
              Icon={RotateCcw}
            >
              Restore
            </MenuBtn>
          ) : null}
          <MenuBtn
            onClick={() => {
              setConfirmDelete(true);
              setOpen(false);
            }}
            Icon={Trash2}
            destructive
          >
            Delete
          </MenuBtn>
        </ul>
      ) : null}
      <ConfirmDialog
        open={confirmDelete}
        title={`Delete ${deal.dealId}?`}
        body={`“${deal.title}” and its full activity history will be removed. This cannot be undone.`}
        confirmLabel="Delete deal"
        tone="danger"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteDeal(deal.dealId);
          setConfirmDelete(false);
        }}
      />
    </div>
  );
}

function MenuBtn({
  onClick,
  Icon,
  children,
  destructive,
}: {
  onClick: () => void;
  Icon: typeof Archive;
  children: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <li role="none">
      <button
        type="button"
        role="menuitem"
        onClick={onClick}
        className={cn(
          "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left",
          destructive
            ? "text-rose-700 hover:bg-rose-500/[0.07]"
            : "text-navy-900/85 hover:bg-bone hover:text-navy-900"
        )}
      >
        <Icon
          className={cn(
            "h-3.5 w-3.5 shrink-0",
            destructive ? "text-rose-600" : "text-gold-600"
          )}
          strokeWidth={2.2}
        />
        {children}
      </button>
    </li>
  );
}

function Th({
  children,
  k,
  s,
  t,
  right,
}: {
  children: React.ReactNode;
  k: SortKey;
  s: { key: SortKey; dir: "asc" | "desc" };
  t: (k: SortKey) => void;
  right?: boolean;
}) {
  const active = s.key === k;
  const Arrow = s.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th className={cn("px-3 py-3", right ? "text-right" : "text-left")}>
      <button
        type="button"
        onClick={() => t(k)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors",
          active ? "text-navy-900" : "hover:text-navy-900"
        )}
      >
        {children}
        {active ? <Arrow className="h-3 w-3" strokeWidth={2.4} /> : null}
      </button>
    </th>
  );
}
