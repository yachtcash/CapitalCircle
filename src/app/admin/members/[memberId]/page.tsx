import { notFound } from "next/navigation";
import { MEMBERS, getMemberById } from "@/data/members";
import AdminMemberDetail from "@/components/admin/AdminMemberDetail";

type PageParams = { memberId: string };

export function generateStaticParams(): PageParams[] {
  return MEMBERS.map((m) => ({ memberId: m.id }));
}

export default async function AdminMemberDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { memberId } = await params;
  const member = getMemberById(memberId);
  if (!member) notFound();
  return <AdminMemberDetail member={member} />;
}
