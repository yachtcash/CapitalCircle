"use client";

import { useMemo, useState } from "react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { companies } from "@/data/companies";
import { MEMBERS } from "@/data/members";
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

export default function AdminCompanies() {
  const {
    companyAdminState,
    deals,
    userCompanies,
    verifyCompany,
    toggleCompanyFeatured,
    suspendCompany,
    activateCompany,
    deleteCompany,
    assignCompanyEditor,
    assignCompanyAdmin,
  } = useMessaging();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const rows = useMemo(
    () =>
      [...userCompanies, ...companies].filter(
        (c) => (companyAdminState[c.id]?.status ?? "Active") !== "Deleted"
      ),
    [userCompanies, companyAdminState]
  );
  const bulk = useBulkSelection(rows.map((c) => c.id));
  const target = rows.find((c) => c.id === confirmDeleteId);
  const nameFor = (id: string) => rows.find((c) => c.id === id)?.name;

  return (
    <AdminPage
      title="Company Management"
      count={rows.length}
      subtitle="Verify, feature, suspend, assign, or remove companies. Select rows for bulk actions."
    >
      <TableShell minWidth={1320}>
        <THead
          leading={
            <HeadCheckbox checked={bulk.allChecked} indeterminate={bulk.someChecked} onChange={bulk.toggleAll} />
          }
          cols={[
            "Company ID",
            "Company Name",
            "Status",
            "Industry",
            "Assigned",
            "Members",
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
            const dealCount = deals.filter((d) => d.companyId === c.id).length;
            return (
              <tr key={c.id} className={cnRow(bulk.isSelected(c.id))}>
                <td className="px-3 py-3">
                  <RowCheckbox checked={bulk.isSelected(c.id)} onChange={() => bulk.toggle(c.id)} label={`Select ${c.name}`} />
                </td>
                <td className="px-3 py-3 text-[11px] uppercase tracking-[0.12em] font-bold text-navy-700/65 tabular-nums whitespace-nowrap">{c.id}</td>
                <td className="px-3 py-3 font-semibold text-navy-900 max-w-[220px] truncate">
                  {c.name}
                  {featured ? (
                    <span className="ml-2 align-middle"><StatusPill label="Featured" tone="gold" /></span>
                  ) : null}
                </td>
                <td className="px-3 py-3">
                  <StatusPill label={status} tone={status === "Active" ? "emerald" : "rose"} />
                </td>
                <td className="px-3 py-3 text-navy-700/80 max-w-[150px] truncate">{c.industry}</td>
                <td className="px-3 py-3 text-[11px] text-navy-700/70 max-w-[150px] truncate">
                  {admin.assignedAdmin || admin.assignedEditor ? (
                    <span className="space-y-0.5 block">
                      {admin.assignedAdmin ? <span className="block">Admin: {admin.assignedAdmin}</span> : null}
                      {admin.assignedEditor ? <span className="block">Editor: {admin.assignedEditor}</span> : null}
                    </span>
                  ) : (
                    <span className="text-navy-700/35">—</span>
                  )}
                </td>
                <td className="px-3 py-3 tabular-nums text-navy-700/80">{memberCount}</td>
                <td className="px-3 py-3 tabular-nums text-navy-700/80">{dealCount}</td>
                <td className="px-3 py-3">
                  <StatusPill
                    label={verification}
                    tone={
                      verification === "Premium Verified" ? "gold" : verification === "Verified" ? "emerald" : "amber"
                    }
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                    <ActBtn href={`/admin/companies/${c.id}`} tone="gold">View</ActBtn>
                    {verification === "Pending" ? (
                      <ActBtn onClick={() => verifyCompany(c.id, c.name)} tone="emerald">Verify</ActBtn>
                    ) : null}
                    <ActBtn onClick={() => toggleCompanyFeatured(c.id, !featured, c.name)}>
                      {featured ? "Unfeature" : "Feature"}
                    </ActBtn>
                    {status === "Active" ? (
                      <ActBtn onClick={() => suspendCompany(c.id, c.name)} tone="rose">Suspend</ActBtn>
                    ) : (
                      <ActBtn onClick={() => activateCompany(c.id)} tone="emerald">Activate</ActBtn>
                    )}
                    <ActBtn onClick={() => setConfirmDeleteId(c.id)} tone="rose">Delete</ActBtn>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </TableShell>

      <BulkBar count={bulk.count} noun="company" onClear={bulk.clear}>
        <BulkBtn tone="emerald" onClick={() => { bulk.ids.forEach((id) => verifyCompany(id, nameFor(id))); bulk.clear(); }}>Verify</BulkBtn>
        <BulkBtn onClick={() => { bulk.ids.forEach((id) => toggleCompanyFeatured(id, true, nameFor(id))); bulk.clear(); }}>Feature</BulkBtn>
        <BulkBtn tone="rose" onClick={() => { bulk.ids.forEach((id) => suspendCompany(id, nameFor(id))); bulk.clear(); }}>Suspend</BulkBtn>
        <BulkSelect
          value=""
          placeholder="Assign Editor…"
          options={SAMPLE_ADMINS}
          onChange={(editor) => { if (!editor) return; bulk.ids.forEach((id) => assignCompanyEditor(id, editor, nameFor(id))); bulk.clear(); }}
        />
        <BulkSelect
          value=""
          placeholder="Assign Admin…"
          options={SAMPLE_ADMINS}
          onChange={(admin) => { if (!admin) return; bulk.ids.forEach((id) => assignCompanyAdmin(id, admin, nameFor(id))); bulk.clear(); }}
        />
        <BulkBtn tone="rose" onClick={() => setConfirmBulkDelete(true)}>Delete</BulkBtn>
      </BulkBar>

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
      <ConfirmDialog
        open={confirmBulkDelete}
        title={`Delete ${bulk.count} ${bulk.count === 1 ? "company" : "companies"}?`}
        body="Every selected company is removed from admin surfaces. Each deletion is recorded in the audit trail. This cannot be undone."
        confirmLabel={`Delete ${bulk.count}`}
        tone="danger"
        onCancel={() => setConfirmBulkDelete(false)}
        onConfirm={() => { bulk.ids.forEach((id) => deleteCompany(id, nameFor(id))); bulk.clear(); setConfirmBulkDelete(false); }}
      />
    </AdminPage>
  );
}

function cnRow(selected: boolean): string {
  return selected
    ? "bg-gold-500/[0.07] hover:bg-gold-500/[0.1] transition-colors"
    : "hover:bg-bone/40 transition-colors";
}
