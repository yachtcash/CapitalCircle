"use client";

import { useMemo, useState } from "react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { featuredOpportunities } from "@/data/opportunities";
import { SAMPLE_ADMINS } from "@/data/deals";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { AdminPage, TableShell, THead, ActBtn, StatusPill } from "./AdminShell";
import {
  useBulkSelection,
  HeadCheckbox,
  RowCheckbox,
  BulkBar,
  BulkBtn,
  BulkSelect,
} from "./bulk/BulkKit";

export default function AdminOpportunities() {
  const {
    opportunityAdminState,
    opportunityPatches,
    listings,
    userOpportunities,
    approveOpportunity,
    rejectOpportunity,
    archiveOpportunityAdmin,
    deleteOpportunityAdmin,
    toggleOpportunityFeatured,
    assignOpportunityModerator,
    assignOpportunityEditor,
    hydrated,
  } = useMessaging();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const all = hydrated ? [...userOpportunities, ...featuredOpportunities] : featuredOpportunities;
  const rows = useMemo(
    () => all.filter((o) => !opportunityAdminState[o.id]?.deleted),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [all, opportunityAdminState]
  );
  const bulk = useBulkSelection(rows.map((o) => o.id));
  const target = rows.find((o) => o.id === confirmDeleteId);
  const titleFor = (id: string) => rows.find((o) => o.id === id)?.title;
  const listingByOpp = new Map(
    listings.filter((l) => l.opportunityId).map((l) => [l.opportunityId!, l])
  );

  return (
    <AdminPage
      title="Opportunity Management"
      count={rows.length}
      subtitle="Approve, reject, feature, archive, assign, or remove opportunities. Select rows for bulk actions."
    >
      <TableShell minWidth={1320}>
        <THead
          leading={
            <HeadCheckbox checked={bulk.allChecked} indeterminate={bulk.someChecked} onChange={bulk.toggleAll} />
          }
          cols={[
            "Opportunity ID",
            "Title",
            "Sponsor",
            "Status",
            "Assigned",
            "Views",
            "Interests",
            "Actions",
          ]}
        />
        <tbody className="divide-y divide-navy-900/[0.06]">
          {rows.map((o) => {
            const admin = opportunityAdminState[o.id] ?? {};
            const moderation = admin.moderation ?? "Approved";
            const featured = opportunityPatches[o.id]?.featured ?? o.featured;
            const listing = listingByOpp.get(o.id);
            return (
              <tr key={o.id} className={cnRow(bulk.isSelected(o.id))}>
                <td className="px-3 py-3">
                  <RowCheckbox checked={bulk.isSelected(o.id)} onChange={() => bulk.toggle(o.id)} label={`Select ${o.title}`} />
                </td>
                <td className="px-3 py-3 text-[11px] uppercase tracking-[0.12em] font-bold text-navy-700/65 tabular-nums whitespace-nowrap">{o.id}</td>
                <td className="px-3 py-3 font-semibold text-navy-900 max-w-[240px] truncate">
                  {o.title}
                  {featured ? <span className="ml-2 align-middle"><StatusPill label="Featured" tone="gold" /></span> : null}
                </td>
                <td className="px-3 py-3 text-navy-700/80 max-w-[150px] truncate">{o.postedBy}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <StatusPill
                      label={moderation}
                      tone={moderation === "Approved" ? "emerald" : moderation === "Pending" ? "amber" : "rose"}
                    />
                    {admin.archived ? <StatusPill label="Archived" tone="navy" /> : null}
                  </div>
                </td>
                <td className="px-3 py-3 text-[11px] text-navy-700/70 max-w-[150px] truncate">
                  {admin.assignedModerator || admin.assignedEditor ? (
                    <span className="block">
                      {admin.assignedModerator ? <span className="block">Mod: {admin.assignedModerator}</span> : null}
                      {admin.assignedEditor ? <span className="block">Editor: {admin.assignedEditor}</span> : null}
                    </span>
                  ) : (
                    <span className="text-navy-700/35">—</span>
                  )}
                </td>
                <td className="px-3 py-3 tabular-nums text-navy-700/80">{listing ? listing.views.toLocaleString() : "—"}</td>
                <td className="px-3 py-3 tabular-nums text-navy-700/80">{listing ? listing.interests : "—"}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                    <ActBtn href={`/admin/opportunities/${o.id}`} tone="gold">View</ActBtn>
                    <ActBtn onClick={() => toggleOpportunityFeatured(o.id, !featured, o.title)}>
                      {featured ? "Unfeature" : "Feature"}
                    </ActBtn>
                    {moderation !== "Approved" ? (
                      <ActBtn onClick={() => approveOpportunity(o.id, o.title)} tone="emerald">Approve</ActBtn>
                    ) : null}
                    {moderation !== "Rejected" ? (
                      <ActBtn onClick={() => rejectOpportunity(o.id, o.title)} tone="rose">Reject</ActBtn>
                    ) : null}
                    {!admin.archived ? (
                      <ActBtn onClick={() => archiveOpportunityAdmin(o.id, o.title)}>Archive</ActBtn>
                    ) : null}
                    <ActBtn onClick={() => setConfirmDeleteId(o.id)} tone="rose">Delete</ActBtn>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </TableShell>

      <BulkBar count={bulk.count} noun="opportunity" onClear={bulk.clear}>
        <BulkBtn tone="emerald" onClick={() => { bulk.ids.forEach((id) => approveOpportunity(id, titleFor(id))); bulk.clear(); }}>Approve</BulkBtn>
        <BulkBtn tone="rose" onClick={() => { bulk.ids.forEach((id) => rejectOpportunity(id, titleFor(id))); bulk.clear(); }}>Reject</BulkBtn>
        <BulkBtn onClick={() => { bulk.ids.forEach((id) => toggleOpportunityFeatured(id, true, titleFor(id))); bulk.clear(); }}>Feature</BulkBtn>
        <BulkBtn onClick={() => { bulk.ids.forEach((id) => archiveOpportunityAdmin(id, titleFor(id))); bulk.clear(); }}>Archive</BulkBtn>
        <BulkSelect
          value=""
          placeholder="Assign Moderator…"
          options={SAMPLE_ADMINS}
          onChange={(mod) => { if (!mod) return; bulk.ids.forEach((id) => assignOpportunityModerator(id, mod, titleFor(id))); bulk.clear(); }}
        />
        <BulkSelect
          value=""
          placeholder="Assign Editor…"
          options={SAMPLE_ADMINS}
          onChange={(ed) => { if (!ed) return; bulk.ids.forEach((id) => assignOpportunityEditor(id, ed, titleFor(id))); bulk.clear(); }}
        />
        <BulkBtn tone="rose" onClick={() => setConfirmBulkDelete(true)}>Delete</BulkBtn>
      </BulkBar>

      <ConfirmDialog
        open={!!confirmDeleteId}
        title={`Delete ${target?.title ?? confirmDeleteId}?`}
        body="The opportunity is removed from the marketplace and all admin surfaces. The audit trail records the deletion."
        confirmLabel="Delete opportunity"
        tone="danger"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) deleteOpportunityAdmin(confirmDeleteId, target?.title);
          setConfirmDeleteId(null);
        }}
      />
      <ConfirmDialog
        open={confirmBulkDelete}
        title={`Delete ${bulk.count} ${bulk.count === 1 ? "opportunity" : "opportunities"}?`}
        body="Every selected opportunity leaves the marketplace and admin surfaces. Each deletion is recorded in the audit trail. This cannot be undone."
        confirmLabel={`Delete ${bulk.count}`}
        tone="danger"
        onCancel={() => setConfirmBulkDelete(false)}
        onConfirm={() => { bulk.ids.forEach((id) => deleteOpportunityAdmin(id, titleFor(id))); bulk.clear(); setConfirmBulkDelete(false); }}
      />
    </AdminPage>
  );
}

function cnRow(selected: boolean): string {
  return selected
    ? "bg-gold-500/[0.07] hover:bg-gold-500/[0.1] transition-colors"
    : "hover:bg-bone/40 transition-colors";
}
