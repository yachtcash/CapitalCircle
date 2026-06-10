"use client";

import { useRouter } from "next/navigation";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { AdminPage, TableShell, THead, ActBtn, StatusPill } from "./AdminShell";
import { formatDate } from "@/components/dashboard/deals/DealBadges";

export default function AdminIntroductions() {
  const {
    introductionRequests,
    deals,
    approveIntroduction,
    rejectIntroduction,
    completeIntroduction,
    convertIntroductionToDeal,
  } = useMessaging();
  const router = useRouter();

  return (
    <AdminPage
      title="Introduction Management"
      count={introductionRequests.length}
      subtitle="Approve, reject, complete, or convert platform-brokered introductions into deals."
    >
      <TableShell minWidth={1100}>
        <THead
          cols={[
            "Introduction ID",
            "Investor",
            "Sponsor",
            "Opportunity",
            "Status",
            "Created",
            "Actions",
          ]}
        />
        <tbody className="divide-y divide-navy-900/[0.06]">
          {introductionRequests.map((r) => {
            const existingDeal = deals.find(
              (d) => d.sourceType === "Introduction Request" && d.sourceId === r.id
            );
            return (
              <tr key={r.id} className="hover:bg-bone/40 transition-colors">
                <td className="px-3 py-3 text-[11px] uppercase tracking-[0.12em] font-bold text-navy-700/65 tabular-nums whitespace-nowrap">
                  {r.id}
                </td>
                <td className="px-3 py-3 font-semibold text-navy-900 max-w-[160px] truncate">
                  {r.requesterName}
                </td>
                <td className="px-3 py-3 font-semibold text-navy-900 max-w-[160px] truncate">
                  {r.targetMemberName}
                </td>
                <td className="px-3 py-3 text-navy-700/80 max-w-[220px] truncate">
                  {r.opportunityTitle ?? "—"}
                </td>
                <td className="px-3 py-3">
                  <StatusPill
                    label={r.status}
                    tone={
                      r.status === "Pending"
                        ? "amber"
                        : r.status === "Approved"
                          ? "sky"
                          : r.status === "Completed"
                            ? "emerald"
                            : "rose"
                    }
                  />
                </td>
                <td className="px-3 py-3 text-xs text-navy-700/65 whitespace-nowrap">
                  {formatDate(r.createdAt)}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                    {r.status === "Pending" ? (
                      <>
                        <ActBtn onClick={() => approveIntroduction(r.id)} tone="emerald">
                          Approve
                        </ActBtn>
                        <ActBtn onClick={() => rejectIntroduction(r.id)} tone="rose">
                          Reject
                        </ActBtn>
                      </>
                    ) : null}
                    {r.status === "Approved" ? (
                      <ActBtn onClick={() => completeIntroduction(r.id)}>Complete</ActBtn>
                    ) : null}
                    {existingDeal ? (
                      <ActBtn href={`/deal-desk/${existingDeal.dealId}`} tone="gold">
                        {existingDeal.dealId}
                      </ActBtn>
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
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </TableShell>
    </AdminPage>
  );
}
