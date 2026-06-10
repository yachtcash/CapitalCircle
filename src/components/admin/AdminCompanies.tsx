"use client";

import { useState } from "react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { companies } from "@/data/companies";
import { featuredOpportunities } from "@/data/opportunities";
import { MEMBERS } from "@/data/members";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { AdminPage, TableShell, THead, ActBtn, StatusPill } from "./AdminShell";

export default function AdminCompanies() {
  const {
    companyAdminState,
    deals,
    listings,
    verifyCompany,
    toggleCompanyFeatured,
    suspendCompany,
    activateCompany,
    deleteCompany,
  } = useMessaging();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const rows = companies.filter(
    (c) => (companyAdminState[c.id]?.status ?? "Active") !== "Deleted"
  );
  const target = rows.find((c) => c.id === confirmDeleteId);

  const oppCompany = new Map(featuredOpportunities.map((o) => [o.id, o.companyId]));

  return (
    <AdminPage
      title="Company Management"
      count={rows.length}
      subtitle="Verify, feature, suspend, or remove companies from the directory."
    >
      <TableShell minWidth={1200}>
        <THead
          cols={[
            "Company ID",
            "Company Name",
            "Status",
            "Industry",
            "Members",
            "Listings",
            "Deals",
            "Verification",
            "Actions",
          ]}
        />
        <tbody className="divide-y divide-navy-900/[0.06]">
          {rows.map((c) => {
            const admin = companyAdminState[c.id] ?? {};
            const status = admin.status ?? "Active";
            const verification = admin.verificationOverride ?? c.verification;
            const featured = admin.featuredOverride ?? !!c.featured;
            const memberCount = MEMBERS.filter(
              (m) => m.companyId === c.id || m.companySlugs.includes(c.slug)
            ).length;
            const listingCount = listings.filter(
              (l) => l.opportunityId && oppCompany.get(l.opportunityId) === c.id
            ).length;
            const dealCount = deals.filter((d) => d.companyId === c.id).length;
            return (
              <tr key={c.id} className="hover:bg-bone/40 transition-colors">
                <td className="px-3 py-3 text-[11px] uppercase tracking-[0.12em] font-bold text-navy-700/65 tabular-nums whitespace-nowrap">
                  {c.id}
                </td>
                <td className="px-3 py-3 font-semibold text-navy-900 max-w-[220px] truncate">
                  {c.name}
                  {featured ? (
                    <span className="ml-2 align-middle">
                      <StatusPill label="Featured" tone="gold" />
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-3">
                  <StatusPill label={status} tone={status === "Active" ? "emerald" : "rose"} />
                </td>
                <td className="px-3 py-3 text-navy-700/80 max-w-[170px] truncate">{c.industry}</td>
                <td className="px-3 py-3 tabular-nums text-navy-700/80">{memberCount}</td>
                <td className="px-3 py-3 tabular-nums text-navy-700/80">{listingCount}</td>
                <td className="px-3 py-3 tabular-nums text-navy-700/80">{dealCount}</td>
                <td className="px-3 py-3">
                  <StatusPill
                    label={verification}
                    tone={
                      verification === "Premium Verified"
                        ? "gold"
                        : verification === "Verified"
                          ? "emerald"
                          : "amber"
                    }
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                    <ActBtn href={`/admin/companies/${c.id}`} tone="gold">View</ActBtn>
                    <ActBtn href={`/company/${c.slug}`}>Edit</ActBtn>
                    {verification === "Pending" ? (
                      <ActBtn onClick={() => verifyCompany(c.id, c.name)} tone="emerald">
                        Verify
                      </ActBtn>
                    ) : null}
                    <ActBtn onClick={() => toggleCompanyFeatured(c.id, !featured, c.name)}>
                      {featured ? "Unfeature" : "Feature"}
                    </ActBtn>
                    {status === "Active" ? (
                      <ActBtn onClick={() => suspendCompany(c.id, c.name)} tone="rose">
                        Suspend
                      </ActBtn>
                    ) : (
                      <ActBtn onClick={() => activateCompany(c.id)} tone="emerald">
                        Activate
                      </ActBtn>
                    )}
                    <ActBtn onClick={() => setConfirmDeleteId(c.id)} tone="rose">
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
        title={`Delete ${target?.name ?? confirmDeleteId}?`}
        body="The company is removed from admin surfaces and the audit trail records the deletion."
        confirmLabel="Delete company"
        tone="danger"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) deleteCompany(confirmDeleteId, target?.name);
          setConfirmDeleteId(null);
        }}
      />
    </AdminPage>
  );
}
