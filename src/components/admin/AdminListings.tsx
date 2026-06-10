"use client";

import { useState } from "react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { featuredOpportunities } from "@/data/opportunities";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { AdminPage, TableShell, THead, ActBtn, StatusPill } from "./AdminShell";
import { formatDate } from "@/components/dashboard/deals/DealBadges";

export default function AdminListings() {
  const { listings, userOpportunities, archiveListing, restoreListing, deleteListing } =
    useMessaging();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const target = listings.find((l) => l.id === confirmDeleteId);
  const oppById = new Map(
    [...userOpportunities, ...featuredOpportunities].map((o) => [o.id, o])
  );

  return (
    <AdminPage
      title="Listing Management"
      count={listings.length}
      subtitle="Every listing record on the platform — archive, restore, delete, or jump into the inline editors."
    >
      <TableShell minWidth={1100}>
        <THead
          cols={["Listing ID", "Title", "Owner", "Status", "Visibility", "Updated", "Actions"]}
        />
        <tbody className="divide-y divide-navy-900/[0.06]">
          {listings.map((l) => {
            const owner = l.opportunityId
              ? oppById.get(l.opportunityId)?.postedBy ?? "—"
              : "Platform";
            const archived = l.status === "Archived";
            return (
              <tr key={l.id} className="hover:bg-bone/40 transition-colors">
                <td className="px-3 py-3 text-[11px] uppercase tracking-[0.12em] font-bold text-navy-700/65 tabular-nums whitespace-nowrap">
                  {l.id}
                </td>
                <td className="px-3 py-3 font-semibold text-navy-900 max-w-[260px] truncate">
                  {l.title}
                </td>
                <td className="px-3 py-3 text-navy-700/80 max-w-[180px] truncate">{owner}</td>
                <td className="px-3 py-3">
                  <StatusPill
                    label={l.status}
                    tone={
                      l.status === "Active" || l.status === "Seeking Capital"
                        ? "emerald"
                        : archived || l.status === "Closed"
                          ? "rose"
                          : "amber"
                    }
                  />
                </td>
                <td className="px-3 py-3">
                  <StatusPill
                    label={l.visibility ?? "Public"}
                    tone={(l.visibility ?? "Public") === "Public" ? "sky" : "navy"}
                  />
                </td>
                <td className="px-3 py-3 text-xs text-navy-700/65 whitespace-nowrap">
                  {formatDate(l.lastUpdatedAt)}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                    <ActBtn href={`/dashboard/listings/${l.id}`} tone="gold">View</ActBtn>
                    <ActBtn href={`/dashboard/listings/${l.id}?tab=edit`}>Edit</ActBtn>
                    <ActBtn href={`/dashboard/listings/${l.id}#gallery-manager`}>Images</ActBtn>
                    <ActBtn href={`/dashboard/listings/${l.id}?tab=documents`}>Docs</ActBtn>
                    {archived ? (
                      <ActBtn onClick={() => restoreListing(l.id)} tone="emerald">
                        Restore
                      </ActBtn>
                    ) : (
                      <ActBtn onClick={() => archiveListing(l.id)}>Archive</ActBtn>
                    )}
                    <ActBtn onClick={() => setConfirmDeleteId(l.id)} tone="rose">
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
        title={`Delete ${target?.id ?? confirmDeleteId}?`}
        body={`“${target?.title ?? ""}”, its gallery, documents, and history will be removed. This cannot be undone.`}
        confirmLabel="Delete listing"
        tone="danger"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) deleteListing(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
      />
    </AdminPage>
  );
}
