import AdminAuditDetail from "@/components/admin/AdminAuditDetail";

type PageParams = { auditId: string };

// Audit events are generated at runtime (provider state), so the detail
// route stays dynamic — the client component resolves the id once the
// provider hydrates.
export default async function AdminAuditDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { auditId } = await params;
  return <AdminAuditDetail auditId={auditId} />;
}
