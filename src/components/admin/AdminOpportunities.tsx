"use client";

import { useState } from "react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { featuredOpportunities } from "@/data/opportunities";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { AdminPage, TableShell, THead, ActBtn, StatusPill } from "./AdminShell";

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
    hydrated,
  } = useMessaging();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const all = hydrated
    ? [...userOpportunities, ...featuredOpportunities]
    : featuredOpportunities;
  const rows = all.filter((o) => !opportunityAdminState[o.id]?.deleted);
  const target = rows.find((o) => o.id === confirmDeleteId);
  const listingByOpp = new Map(
    listings.filter((l) => l.opportunityId).map((l) => [l.opportunityId!, l])
  );

  return (
    <AdminPage
      title="Opportunity Management"
      count={rows.length}
      subtitle="Approve, reject, feature, archive, or remove opportunities. Rejected and archived listings leave the public marketplace immediately."
    >
      <TableShell minWidth={1200}>
        <THead
          cols={[
            "Opportunity ID",
            "Title",
            "Sponsor",
            "Category",
            "Status",
            "Views",
            "Interests",
            "Created",
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
              <tr key={o.id} className="hover:bg-bone/40 transition-colors">
                <td className="px-3 py-3 text-[11px] uppercase tracking-[0.12em] font-bold text-navy-700/65 tabular-nums whitespace-nowrap">
                  {o.id}
                </td>
                <td className="px-3 py-3 font-semibold text-navy-900 max-w-[260px] truncate">
                  {o.title}
                  {featured ? (
                    <span className="ml-2 align-middle">
                      <StatusPill label="Featured" tone="gold" />
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-3 text-navy-700/80 max-w-[170px] truncate">{o.postedBy}</td>
                <td className="px-3 py-3 text-navy-700/80 max-w-[150px] truncate">{o.category}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <StatusPill
                      label={moderation}
                      tone={
                        moderation === "Approved"
                          ? "emerald"
                          : moderation === "Pending"
                            ? "amber"
                            : "rose"
                      }
                    />
                    {admin.archived ? <StatusPill label="Archived" tone="navy" /> : null}
                  </div>
                </td>
                <td className="px-3 py-3 tabular-nums text-navy-700/80">
                  {listing ? listing.views.toLocaleString() : "—"}
                </td>
                <td className="px-3 py-3 tabular-nums text-navy-700/80">
                  {listing ? listing.interests : "—"}
                </td>
                <td className="px-3 py-3 text-xs text-navy-700/65 whitespace-nowrap">
                  {o.postedAt}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                    <ActBtn href={`/admin/opportunities/${o.id}`} tone="gold">View</ActBtn>
                    {listing ? (
                      <ActBtn href={`/dashboard/listings/${listing.id}?tab=edit`}>Edit</ActBtn>
                    ) : (
                      <ActBtn href={`/opportunity/${o.slug}`}>Open</ActBtn>
                    )}
                    <ActBtn onClick={() => toggleOpportunityFeatured(o.id, !featured, o.title)}>
                      {featured ? "Unfeature" : "Feature"}
                    </ActBtn>
                    {moderation !== "Approved" ? (
                      <ActBtn onClick={() => approveOpportunity(o.id, o.title)} tone="emerald">
                        Approve
                      </ActBtn>
                    ) : null}
                    {moderation !== "Rejected" ? (
                      <ActBtn onClick={() => rejectOpportunity(o.id, o.title)} tone="rose">
                        Reject
                      </ActBtn>
                    ) : null}
                    {!admin.archived ? (
                      <ActBtn onClick={() => archiveOpportunityAdmin(o.id, o.title)}>
                        Archive
                      </ActBtn>
                    ) : null}
                    <ActBtn onClick={() => setConfirmDeleteId(o.id)} tone="rose">
                      Delete
                    </ActBtn>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </TableShell>

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
    </AdminPage>
  );
}
