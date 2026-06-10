import { notFound } from "next/navigation";
import { companies, getCompanyById } from "@/data/companies";
import AdminCompanyDetail from "@/components/admin/AdminCompanyDetail";

type PageParams = { companyId: string };

export function generateStaticParams(): PageParams[] {
  return companies.map((c) => ({ companyId: c.id }));
}

export default async function AdminCompanyDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { companyId } = await params;
  const company = getCompanyById(companyId);
  if (!company) notFound();
  return <AdminCompanyDetail company={company} />;
}
