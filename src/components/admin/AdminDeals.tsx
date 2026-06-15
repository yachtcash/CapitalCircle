"use client";

import { useState } from "react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { DEAL_STAGES, SAMPLE_ADMINS, isOpenStage, type DealStage } from "@/data/deals";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { AdminPage, TableShell, THead, ActBtn } from "./AdminShell";
import {
  DealPriorityBadge,
  DealStageBadge,
  formatCurrency,
  formatDate,
} from "@/components/dashboard/deals/DealBadges";
import {
  useBulkSelection,
  HeadCheckbox,
  RowCheckbox,
  BulkBar,
  BulkBtn,
  BulkSelect,
} from "./bulk/BulkKit";

export default function AdminDeals() {
  const {
    deals,
    assignDealAdmin,
    updateDealStage,
    archiveDeal,
    restoreDeal,
    closeDeal,
    reopenDeal,
    deleteDeal,
  } = useMessaging();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const bulk = useBulkSelection(deals.map((d) => d.dealId));
  const target = deals.find((d) => d.dealId === confirmDeleteId);

  return (
    <AdminPage
      title="Deal Management"
      count={deals.length}
      subtitle="Assign admins, drive lifecycle, and bulk-manage the pipeline. Select rows for bulk actions."
    >
      <TableShell minWidth={1320}>
        <THead
          leading={
            <HeadCheckbox checked={bulk.allChecked} indeterminate={bulk.someChecked} onChange={bulk.toggleAll} />
          }
          cols={[
            "Deal ID",
            "Title",
            "Sponsor",
            "Investor",
            "Stage",
            "Priority",
            "Value",
            "Assigned Admin",
            "Updated",
            "Actions",
          ]}
        />
        <tbody className="divide-y divide-navy-900/[0.06]">
          {deals.map((d) => {
            const open = isOpenStage(d.stage);
            const archived = d.stage === "Archived";
            const closed = d.stage === "Closed Won" || d.stage === "Closed Lost";
            return (
              <tr key={d.dealId} className={cnRow(bulk.isSelected(d.dealId))}>
                <td className="px-3 py-3">
                  <RowCheckbox checked={bulk.isSelected(d.dealId)} onChange={() => bulk.toggle(d.dealId)} label={`Select ${d.dealId}`} />
                </td>
                <td className="px-3 py-3 text-[11px] uppercase tracking-[0.12em] font-bold text-navy-700/65 tabular-nums whitespace-nowrap">{d.dealId}</td>
                <td className="px-3 py-3 font-semibold text-navy-900 max-w-[220px] truncate">{d.title}</td>
                <td className="px-3 py-3 text-navy-700/80 max-w-[140px] truncate">{d.sponsor.name}</td>
                <td className="px-3 py-3 text-navy-700/80 max-w-[140px] truncate">{d.investor?.name ?? "—"}</td>
                <td className="px-3 py-3"><DealStageBadge stage={d.stage} /></td>
                <td className="px-3 py-3"><DealPriorityBadge priority={d.priority} /></td>
                <td className="px-3 py-3 font-semibold text-navy-900 tabular-nums whitespace-nowrap">{formatCurrency(d.targetInvestment)}</td>
                <td className="px-3 py-3">
                  <select
                    value={d.assignedAdmin}
                    onChange={(e) => assignDealAdmin(d.dealId, e.target.value)}
                    className="rounded-full bg-white ring-1 ring-navy-900/[0.1] px-2.5 py-1 text-[11px] font-semibold text-navy-900 max-w-[150px]"
                  >
                    {SAMPLE_ADMINS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-3 text-xs text-navy-700/65 whitespace-nowrap">{formatDate(d.updatedDate)}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                    <ActBtn href={`/deal-desk/${d.dealId}`} tone="gold">View</ActBtn>
                    {open ? (
                      <>
                        <ActBtn onClick={() => closeDeal(d.dealId, "won")} tone="emerald">Won</ActBtn>
                        <ActBtn onClick={() => closeDeal(d.dealId, "lost")} tone="rose">Lost</ActBtn>
                        <ActBtn onClick={() => archiveDeal(d.dealId)}>Archive</ActBtn>
                      </>
                    ) : null}
                    {closed ? <ActBtn onClick={() => reopenDeal(d.dealId)}>Reopen</ActBtn> : null}
                    {archived ? <ActBtn onClick={() => restoreDeal(d.dealId)} tone="emerald">Restore</ActBtn> : null}
                    <ActBtn onClick={() => setConfirmDeleteId(d.dealId)} tone="rose">Delete</ActBtn>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </TableShell>

      <BulkBar count={bulk.count} noun="deal" onClear={bulk.clear}>
        <BulkSelect
          value=""
          placeholder="Assign Admin…"
          options={SAMPLE_ADMINS}
          onChange={(admin) => { if (!admin) return; bulk.ids.forEach((id) => assignDealAdmin(id, admin)); bulk.clear(); }}
        />
        <BulkSelect
          value=""
          placeholder="Change Stage…"
          options={DEAL_STAGES}
          onChange={(stage) => { if (!stage) return; bulk.ids.forEach((id) => updateDealStage(id, stage as DealStage, "Bulk stage change")); bulk.clear(); }}
        />
        <BulkBtn onClick={() => { bulk.ids.forEach((id) => archiveDeal(id)); bulk.clear(); }}>Archive</BulkBtn>
        <BulkBtn tone="emerald" onClick={() => { bulk.ids.forEach((id) => restoreDeal(id)); bulk.clear(); }}>Restore</BulkBtn>
        <BulkBtn tone="rose" onClick={() => setConfirmBulkDelete(true)}>Delete</BulkBtn>
      </BulkBar>

      <ConfirmDialog
        open={!!confirmDeleteId}
        title={`Delete ${confirmDeleteId}?`}
        body={`“${target?.title ?? ""}” and its full history will be removed. This cannot be undone.`}
        confirmLabel="Delete deal"
        tone="danger"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) deleteDeal(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
      />
      <ConfirmDialog
        open={confirmBulkDelete}
        title={`Delete ${bulk.count} ${bulk.count === 1 ? "deal" : "deals"}?`}
        body="Every selected deal and its full history will be removed. This cannot be undone."
        confirmLabel={`Delete ${bulk.count}`}
        tone="danger"
        onCancel={() => setConfirmBulkDelete(false)}
        onConfirm={() => { bulk.ids.forEach((id) => deleteDeal(id)); bulk.clear(); setConfirmBulkDelete(false); }}
      />
    </AdminPage>
  );
}

function cnRow(selected: boolean): string {
  return selected
    ? "bg-gold-500/[0.07] hover:bg-gold-500/[0.1] transition-colors"
    : "hover:bg-bone/40 transition-colors";
}
