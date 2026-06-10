"use client";

import { useState } from "react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { MEMBERS } from "@/data/members";
import { ROLES, canManageRoles, type Role } from "@/lib/roles";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { AdminPage, TableShell, THead, ActBtn, StatusPill } from "./AdminShell";

export default function AdminMembers() {
  const {
    memberAdminState,
    deals,
    introductionRequests,
    setMemberRole,
    suspendMember,
    activateMember,
    deleteMember,
    currentRole,
  } = useMessaging();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const rows = MEMBERS.filter(
    (m) => (memberAdminState[m.id]?.status ?? "Active") !== "Deleted"
  );

  const target = rows.find((m) => m.id === confirmDeleteId);

  return (
    <AdminPage
      title="Member Management"
      count={rows.length}
      subtitle="Suspend, activate, re-role, or remove members. Role changes are Super Admin only."
    >
      <TableShell minWidth={1200}>
        <THead
          cols={[
            "Member ID",
            "Name",
            "Company",
            "Role",
            "Status",
            "Listings",
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
            const dealCount = deals.filter(
              (d) => d.sponsor.memberId === m.id || d.investor?.memberId === m.id
            ).length;
            const introCount = introductionRequests.filter(
              (r) => r.requesterId === m.id || r.targetMemberId === m.id
            ).length;
            return (
              <tr key={m.id} className="hover:bg-bone/40 transition-colors">
                <td className="px-3 py-3 text-[11px] uppercase tracking-[0.12em] font-bold text-navy-700/65 tabular-nums whitespace-nowrap">
                  {m.id}
                </td>
                <td className="px-3 py-3 font-semibold text-navy-900 whitespace-nowrap">
                  {m.name}
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
                  <StatusPill
                    label={status}
                    tone={status === "Active" ? "emerald" : "rose"}
                  />
                </td>
                <td className="px-3 py-3 tabular-nums text-navy-700/80">{m.listingsCount}</td>
                <td className="px-3 py-3 tabular-nums text-navy-700/80">{dealCount}</td>
                <td className="px-3 py-3 tabular-nums text-navy-700/80">{introCount}</td>
                <td className="px-3 py-3 text-xs text-navy-700/65 whitespace-nowrap">
                  {m.joinedYear}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                    <ActBtn href={`/admin/members/${m.id}`} tone="gold">View</ActBtn>
                    <ActBtn href={`/member/${m.slug}`}>Profile</ActBtn>
                    {status === "Active" ? (
                      <ActBtn onClick={() => suspendMember(m.id, m.name)} tone="rose">
                        Suspend
                      </ActBtn>
                    ) : (
                      <ActBtn onClick={() => activateMember(m.id, m.name)} tone="emerald">
                        Activate
                      </ActBtn>
                    )}
                    <ActBtn onClick={() => setConfirmDeleteId(m.id)} tone="rose">
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
        body="The member is removed from the directory and all admin surfaces. The audit trail records the deletion."
        confirmLabel="Delete member"
        tone="danger"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) deleteMember(confirmDeleteId, target?.name);
          setConfirmDeleteId(null);
        }}
      />
    </AdminPage>
  );
}
