"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUp, ArrowDown, ArrowUpRight } from "lucide-react";
import type { Deal, DealStage } from "@/data/deals";
import { STAGE_RANK } from "@/data/deals";
import {
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
  | "status"
  | "value"
  | "priority"
  | "owner"
  | "lastContact"
  | "nextFollowUp"
  | "updated";

const PRIORITY_RANK: Record<Deal["priority"], number> = {
  Low: 0,
  Medium: 1,
  High: 2,
  Urgent: 3,
};

function compareDeals(a: Deal, b: Deal, key: SortKey): number {
  switch (key) {
    case "dealId":
      return a.dealId.localeCompare(b.dealId);
    case "title":
      return a.title.localeCompare(b.title);
    case "status":
      return STAGE_RANK[a.status] - STAGE_RANK[b.status];
    case "value":
      return a.estimatedValue - b.estimatedValue;
    case "priority":
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    case "owner":
      return a.owner.localeCompare(b.owner);
    case "lastContact":
      return (a.lastContactDate ?? "").localeCompare(b.lastContactDate ?? "");
    case "nextFollowUp":
      return (a.nextFollowUpDate ?? "").localeCompare(b.nextFollowUpDate ?? "");
    case "updated":
      return a.updatedDate.localeCompare(b.updatedDate);
  }
}

export default function DealTableView({ deals }: { deals: Deal[] }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "updated",
    dir: "desc",
  });

  const nowMs = Date.parse("2026-06-09T00:00:00Z");

  const sorted = [...deals].sort((a, b) => {
    const c = compareDeals(a, b, sort.key);
    return sort.dir === "asc" ? c : -c;
  });

  const toggle = (key: SortKey) =>
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "value" ? "desc" : key === "title" || key === "owner" ? "asc" : "desc" }
    );

  return (
    <div className="bg-white rounded-2xl ring-1 ring-navy-900/[0.06] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-bone/60">
            <tr className="text-[10px] uppercase tracking-[0.14em] text-navy-700/65 font-bold">
              <Th sortKey="dealId" active={sort} onSort={toggle}>Deal ID</Th>
              <Th sortKey="title" active={sort} onSort={toggle}>Title</Th>
              <Th sortKey="status" active={sort} onSort={toggle}>Stage</Th>
              <Th sortKey="value" active={sort} onSort={toggle} align="right">Value</Th>
              <Th sortKey="priority" active={sort} onSort={toggle}>Priority</Th>
              <Th sortKey="owner" active={sort} onSort={toggle}>Owner</Th>
              <Th sortKey="lastContact" active={sort} onSort={toggle}>Last Contact</Th>
              <Th sortKey="nextFollowUp" active={sort} onSort={toggle}>Next Follow Up</Th>
              <Th sortKey="updated" active={sort} onSort={toggle}>Updated</Th>
              <th className="px-3 py-3 text-right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-900/[0.06]">
            {sorted.map((deal) => (
              <tr key={deal.dealId} className="hover:bg-bone/40 transition-colors">
                <td className="px-3 py-3 align-middle whitespace-nowrap">
                  <Link
                    href={`/dashboard/deals/${deal.dealId}`}
                    className="text-[11px] uppercase tracking-[0.14em] font-bold text-navy-700 hover:text-gold-700 tabular-nums"
                  >
                    {deal.dealId}
                  </Link>
                </td>
                <td className="px-3 py-3 align-middle min-w-[260px]">
                  <Link
                    href={`/dashboard/deals/${deal.dealId}`}
                    className="font-semibold text-navy-900 hover:text-gold-700 transition-colors line-clamp-2"
                  >
                    {deal.title}
                  </Link>
                  <div className="text-[11px] text-navy-700/60 mt-0.5 truncate">
                    {deal.companyId ?? deal.opportunityId ?? deal.sourceName ?? "—"}
                  </div>
                </td>
                <td className="px-3 py-3 align-middle">
                  <DealStageBadge stage={deal.status} />
                </td>
                <td className="px-3 py-3 align-middle text-right whitespace-nowrap font-semibold text-navy-900 tabular-nums">
                  {formatCurrency(deal.estimatedValue)}
                </td>
                <td className="px-3 py-3 align-middle">
                  <DealPriorityBadge priority={deal.priority} />
                </td>
                <td className="px-3 py-3 align-middle whitespace-nowrap text-navy-700/85">
                  {deal.owner}
                </td>
                <td className="px-3 py-3 align-middle whitespace-nowrap text-navy-700/70 text-xs">
                  {formatDate(deal.lastContactDate)}
                </td>
                <td className="px-3 py-3 align-middle whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-navy-700/70 tabular-nums">
                      {formatDate(deal.nextFollowUpDate)}
                    </span>
                    <FollowUpBadge iso={deal.nextFollowUpDate} nowMs={nowMs} />
                  </div>
                </td>
                <td className="px-3 py-3 align-middle whitespace-nowrap text-navy-700/65 text-xs">
                  {formatDate(deal.updatedDate)}
                </td>
                <td className="px-3 py-3 align-middle text-right">
                  <Link
                    href={`/dashboard/deals/${deal.dealId}`}
                    className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-bold text-gold-700 hover:text-gold-600"
                  >
                    Open
                    <ArrowUpRight className="h-3 w-3" strokeWidth={2.4} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  children,
  sortKey,
  active,
  onSort,
  align,
}: {
  children: React.ReactNode;
  sortKey: SortKey;
  active: { key: SortKey; dir: "asc" | "desc" };
  onSort: (k: SortKey) => void;
  align?: "left" | "right";
}) {
  const isActive = active.key === sortKey;
  const Arrow = active.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th className={cn("px-3 py-3", align === "right" ? "text-right" : "text-left")}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors",
          isActive ? "text-navy-900" : "hover:text-navy-900"
        )}
      >
        {children}
        {isActive ? (
          <Arrow className="h-3 w-3" strokeWidth={2.4} />
        ) : null}
      </button>
    </th>
  );
}
