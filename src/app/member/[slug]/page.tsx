import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MEMBERS, getMemberBySlug } from "@/data/members";
import MemberProfileView from "@/components/member/MemberProfileView";

type PageParams = { slug: string };

export function generateStaticParams(): PageParams[] {
  return MEMBERS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const member = getMemberBySlug(slug);
  if (!member) {
    return { title: "Member — Capital Circle" };
  }
  return {
    title: `${member.name} — ${member.memberType} — Capital Circle`,
    description: member.bio,
  };
}

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const member = getMemberBySlug(slug);
  if (!member) notFound();
  return <MemberProfileView member={member} />;
}
