"use client";

import { useMemo, useState } from "react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { MEMBERS } from "@/data/members";
import { ROLES, canManageRoles, type Role } from "@/lib/roles";
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

export default function AdminMembers() {
  const {
    memberAdminState,
    deals,
    introductionRequests,
    userMembers,
    setMemberRole,
    suspendMember,
    activateMember,
    deleteMember,
    verifyMember,
    approveMember,
    toggleMemberFeatured,
    currentRole,
  } = useMessaging();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const rows = useMemo(
    () =>
      [...userMembers, ...MEMBERS].filter(
        (m) => (memberAdminState[m.id]?.status ?? "Active") !== "Deleted"
      ),
    [userMembers, memberAdminState]
  );

  const bulk = useBulkSelection(rows.map((m) => m.id));
  const target = rows.find((m) => m.id === confirmDeleteId);

  const nameFor = (id: string) => rows.find((m) => m.id === id)?.name;

  const runBulk = (fn: (id: string, name?: string) => void) => {
    bulk.ids.forEach((id) => fn(id, nameFor(id)));
    bulk.clear();
  };

  return (
    <AdminPage
      title="Member Management"
      count={rows.length}
      subtitle="Suspend, activate, re-role, verify, feature, or remove members. Select rows for bulk actions. Role changes are Super Admin only."
    >
      <TableShell minWidth={1280}>
        <THead
          leading={
            <HeadCheckbox
              checked={bulk.allChecked}
              indeterminate={bulk.someChecked}
              onChange={bulk.toggleAll}
            />
          }
          cols={[
            "Member ID",
            "Name",
            "Company",
            "Role",
            "Status",
            "Verification",
            "Deals",
            "Intros",
            "Joined",
            "Actions",
          ]}
        />
        <tbody className="divide-y divide-navy-900/[0.06]">
          {rows.map((m) => {
            const admin = memberAdminState[m.id] ?? {};
            const role: Role = admin.role ?? "Member";
            const status = admin.status ?? "Active";
            const verification = admin.verificationOverride ?? m.verification;
            const featured = admin.featuredOverride ?? m.featured;
            const dealCount = deals.filter(
              (d) => d.sponsor.memberId === m.id || d.investor?.memberId === m.id
            ).length;
            const introCount = introductionRequests.filter(
              (r) => r.requesterId === m.id || r.targetMemberId === m.id
            ).length;
            return (
              <tr
                key={m.id}
                className={cnRow(bulk.isSelected(m.id))}
              >
                <td className="px-3 py-3">
                  <RowCheckbox
                    checked={bulk.isSelected(m.id)}
                    onChange={() => bulk.toggle(m.id)}
                    label={`Select ${m.name}`}
                  />
                </td>
                <td className="px-3 py-3 text-[11px] uppercase tracking-[0.12em] font-bold text-navy-700/65 tabular-nums whitespace-nowrap">
                  {m.id}
                </td>
                <td className="px-3 py-3 font-semibold text-navy-900 whitespace-nowrap">
                  {m.name}
                  {featured ? (
                    <span className="ml-2 align-middle">
                      <StatusPill label="Featured" tone="gold" />
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-3 text-navy-700/80 max-w-[180px] truncate">{m.company}</td>
                <td className="px-3 py-3">
                  {canManageRoles(currentRole) ? (
                    <select
                      value={role}
                      onChange={(e) => setMemberRole(m.id, e.target.value as Role, m.name)}
                      className="rounded-full bg-white ring-1 ring-navy-900/[0.1] px-2.5 py-1 text-[11px] uppercase tracking-[0.1em] font-bold text-navy-900"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  ) : (
                    <StatusPill label={role} tone="navy" />
                  )}
                </td>
                <td className="px-3 py-3">
                  <StatusPill label={status} tone={status === "Active" ? "emerald" : "rose"} />
                </td>
                <td className="px-3 py-3">
                  <StatusPill
                    label={verification}
                    tone={
                      verification === "Verified" || verification === "Founding Member"
                        ? "emerald"
                        : verification === "Pending"
                          ? "amber"
                          : "navy"
                    }
                  />
                </td>
                <td className="px-3 py-3 tabular-nums text-navy-700/80">{dealCount}</td>
                <td className="px-3 py-3 tabular-nums text-navy-700/80">{introCount}</td>
                <td className="px-3 py-3 text-xs text-navy-700/65 whitespace-nowrap">{m.joinedYear}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                    <ActBtn href={`/admin/members/${m.id}`} tone="gold">View</ActBtn>
                    {verification === "Pending" ? (
                      <ActBtn onClick={() => verifyMember(m.id, m.name)} tone="emerald">Verify</ActBtn>
                    ) : null}
                    <ActBtn onClick={() => toggleMemberFeatured(m.id, !featured, m.name)}>
                      {featured ? "Unfeature" : "Feature"}
                    </ActBtn>
                    {status === "Active" ? (
                      <ActBtn onClick={() => suspendMember(m.id, m.name)} tone="rose">Suspend</ActBtn>
                    ) : (
                      <ActBtn onClick={() => activateMember(m.id, m.name)} tone="emerald">Activate</ActBtn>
                    )}
                    <ActBtn onClick={() => setConfirmDeleteId(m.id)} tone="rose">Delete</ActBtn>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </TableShell>

      <BulkBar count={bulk.count} noun="member" onClear={bulk.clear}>
        <BulkBtn tone="emerald" onClick={() => runBulk(activateMember)}>Activate</BulkBtn>
        <BulkBtn tone="rose" onClick={() => runBulk(suspendMember)}>Suspend</BulkBtn>
        <BulkBtn tone="emerald" onClick={() => runBulk(approveMember)}>Approve</BulkBtn>
        <BulkBtn tone="emerald" onClick={() => runBulk(verifyMember)}>Verify</BulkBtn>
        <BulkBtn onClick={() => runBulk((id, name) => toggleMemberFeatured(id, true, name))}>Feature</BulkBtn>
        {canManageRoles(currentRole) ? (
          <BulkSelect
            value=""
            placeholder="Change Role…"
            options={ROLES}
            onChange={(role) => {
              if (!role) return;
              bulk.ids.forEach((id) => setMemberRole(id, role as Role, nameFor(id)));
              bulk.clear();
            }}
          />
        ) : null}
        <BulkBtn tone="rose" onClick={() => setConfirmBulkDelete(true)}>Delete</BulkBtn>
      </BulkBar>

      <ConfirmDialog
        open={!!confirmDeleteId}
        title={`Delete ${target?.name ?? confirmDeleteId}?`}
        body="The member is removed from the directory and all admin surfaces. The audit trail records the deletion."
        confirmLabel="Delete member"
        tone="danger"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) deleteMember(confirmDeleteId, target?.name);
          setConfirmDeleteId(null);
        }}
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        title={`Delete ${bulk.count} ${bulk.count === 1 ? "member" : "members"}?`}
        body="Every selected member is removed from the directory and admin surfaces. Each deletion is recorded in the audit trail. This cannot be undone."
        confirmLabel={`Delete ${bulk.count}`}
        tone="danger"
        onCancel={() => setConfirmBulkDelete(false)}
        onConfirm={() => {
          runBulk(deleteMember);
          setConfirmBulkDelete(false);
        }}
      />
    </AdminPage>
  );
}

function cnRow(selected: boolean): string {
  return selected
    ? "bg-gold-500/[0.07] hover:bg-gold-500/[0.1] transition-colors"
    : "hover:bg-bone/40 transition-colors";
}
