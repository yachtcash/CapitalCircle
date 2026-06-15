"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { AdminPage, TableShell, THead, ActBtn, StatusPill } from "./AdminShell";
import { DealStageBadge, formatDate } from "@/components/dashboard/deals/DealBadges";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  useBulkSelection,
  HeadCheckbox,
  RowCheckbox,
  BulkBar,
  BulkBtn,
} from "./bulk/BulkKit";

export default function AdminIntroductions() {
  const {
    introductionRequests,
    deals,
    approveIntroduction,
    rejectIntroduction,
    completeIntroduction,
    convertIntroductionToDeal,
    archiveIntroduction,
    restoreIntroduction,
    deleteIntroduction,
  } = useMessaging();
  const router = useRouter();
  const [showArchived, setShowArchived] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const rows = useMemo(
    () =>
      introductionRequests.filter((r) => (showArchived ? r.archived : !r.archived)),
    [introductionRequests, showArchived]
  );
  const bulk = useBulkSelection(rows.map((r) => r.id));
  const archivedCount = introductionRequests.filter((r) => r.archived).length;

  return (
    <AdminPage
      title="Introduction Management"
      count={rows.length}
      subtitle="Approve, reject, complete, convert, archive, or remove platform-brokered introductions. Select rows for bulk actions."
    >
      <div className="flex items-center gap-1.5">
        <FilterPill active={!showArchived} onClick={() => { setShowArchived(false); bulk.clear(); }}>
          Active ({introductionRequests.length - archivedCount})
        </FilterPill>
        <FilterPill active={showArchived} onClick={() => { setShowArchived(true); bulk.clear(); }}>
          Archived ({archivedCount})
        </FilterPill>
      </div>

      <TableShell minWidth={1340}>
        <THead
          leading={
            <HeadCheckbox checked={bulk.allChecked} indeterminate={bulk.someChecked} onChange={bulk.toggleAll} />
          }
          cols={[
            "Introduction ID",
            "Investor",
            "Sponsor",
            "Opportunity",
            "Status",
            "Created",
            "Linked Deal",
            "Actions",
          ]}
        />
        <tbody className="divide-y divide-navy-900/[0.06]">
          {rows.map((r) => {
            const existingDeal = deals.find(
              (d) =>
                d.introductionId === r.id ||
                (d.sourceType === "Introduction Request" && d.sourceId === r.id)
            );
            return (
              <tr key={r.id} className={cnRow(bulk.isSelected(r.id))}>
                <td className="px-3 py-3">
                  <RowCheckbox checked={bulk.isSelected(r.id)} onChange={() => bulk.toggle(r.id)} label={`Select ${r.id}`} />
                </td>
                <td className="px-3 py-3 text-[11px] uppercase tracking-[0.12em] font-bold text-navy-700/65 tabular-nums whitespace-nowrap">{r.id}</td>
                <td className="px-3 py-3 font-semibold text-navy-900 max-w-[160px] truncate">{r.requesterName}</td>
                <td className="px-3 py-3 font-semibold text-navy-900 max-w-[160px] truncate">{r.targetMemberName}</td>
                <td className="px-3 py-3 text-navy-700/80 max-w-[200px] truncate">{r.opportunityTitle ?? "—"}</td>
                <td className="px-3 py-3">
                  <StatusPill
                    label={r.status}
                    tone={r.status === "Pending" ? "amber" : r.status === "Approved" ? "sky" : r.status === "Completed" ? "emerald" : "rose"}
                  />
                </td>
                <td className="px-3 py-3 text-xs text-navy-700/65 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                <td className="px-3 py-3 whitespace-nowrap">
                  {existingDeal ? (
                    <div className="flex items-center gap-2">
                      <Link href={`/deal-desk/${existingDeal.dealId}`} className="text-[11px] uppercase tracking-[0.12em] font-bold text-gold-700 hover:text-gold-600 tabular-nums">
                        {existingDeal.dealId}
                      </Link>
                      <DealStageBadge stage={existingDeal.stage} />
                    </div>
                  ) : (
                    <span className="text-xs text-navy-700/40">—</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                    {r.status === "Pending" ? (
                      <>
                        <ActBtn onClick={() => approveIntroduction(r.id)} tone="emerald">Approve</ActBtn>
                        <ActBtn onClick={() => rejectIntroduction(r.id)} tone="rose">Reject</ActBtn>
                      </>
                    ) : null}
                    {r.status === "Approved" ? (
                      <ActBtn onClick={() => completeIntroduction(r.id)}>Complete</ActBtn>
                    ) : null}
                    {existingDeal ? (
                      <ActBtn href={`/deal-desk/${existingDeal.dealId}`} tone="gold">Open Deal</ActBtn>
                    ) : r.status === "Approved" || r.status === "Completed" ? (
                      <ActBtn
                        onClick={() => {
                          const id = convertIntroductionToDeal(r.id);
                          if (id) router.push(`/deal-desk/${id}`);
                        }}
                        tone="gold"
                      >
                        Convert To Deal
                      </ActBtn>
                    ) : null}
                    {r.archived ? (
                      <ActBtn onClick={() => restoreIntroduction(r.id)} tone="emerald">Restore</ActBtn>
                    ) : (
                      <ActBtn onClick={() => archiveIntroduction(r.id)}>Archive</ActBtn>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </TableShell>

      <BulkBar count={bulk.count} noun="introduction" onClear={bulk.clear}>
        <BulkBtn tone="emerald" onClick={() => { bulk.ids.forEach((id) => approveIntroduction(id)); bulk.clear(); }}>Approve</BulkBtn>
        <BulkBtn tone="rose" onClick={() => { bulk.ids.forEach((id) => rejectIntroduction(id)); bulk.clear(); }}>Reject</BulkBtn>
        <BulkBtn tone="gold" onClick={() => { bulk.ids.forEach((id) => convertIntroductionToDeal(id)); bulk.clear(); }}>Convert To Deal</BulkBtn>
        <BulkBtn onClick={() => { bulk.ids.forEach((id) => archiveIntroduction(id)); bulk.clear(); }}>Archive</BulkBtn>
        <BulkBtn tone="rose" onClick={() => setConfirmBulkDelete(true)}>Delete</BulkBtn>
      </BulkBar>

      <ConfirmDialog
        open={confirmBulkDelete}
        title={`Delete ${bulk.count} ${bulk.count === 1 ? "introduction" : "introductions"}?`}
        body="Every selected introduction is permanently removed. Each deletion is recorded in the audit trail. This cannot be undone."
        confirmLabel={`Delete ${bulk.count}`}
        tone="danger"
        onCancel={() => setConfirmBulkDelete(false)}
        onConfirm={() => { bulk.ids.forEach((id) => deleteIntroduction(id)); bulk.clear(); setConfirmBulkDelete(false); }}
      />
    </AdminPage>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "inline-flex items-center rounded-full px-3.5 py-1.5 text-xs uppercase tracking-[0.14em] font-semibold ring-1 bg-navy-900 text-white ring-navy-900"
          : "inline-flex items-center rounded-full px-3.5 py-1.5 text-xs uppercase tracking-[0.14em] font-semibold ring-1 bg-white text-navy-700 ring-navy-900/[0.08] hover:ring-navy-900/30"
      }
    >
      {children}
    </button>
  );
}

function cnRow(selected: boolean): string {
  return selected
    ? "bg-gold-500/[0.07] hover:bg-gold-500/[0.1] transition-colors"
    : "hover:bg-bone/40 transition-colors";
}
