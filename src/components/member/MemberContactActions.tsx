"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, MessageSquare, Building2 } from "lucide-react";

import type { Member } from "@/data/members";
import RequestIntroductionModal from "@/components/members/RequestIntroductionModal";
import { useMessaging } from "@/components/providers/MessagingProvider";

export default function MemberContactActions({
  member,
  primaryCompanySlug,
}: {
  member: Member;
  primaryCompanySlug: string | null;
}) {
  const { currentRole } = useMessaging();
  const [introOpen, setIntroOpen] = useState(false);

  // Introductions and messaging are member capabilities.
  if (currentRole === "Guest") return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIntroOpen(true)}
        className="group inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-5 py-2.5 text-sm transition-colors"
      >
        <Sparkles className="h-4 w-4" strokeWidth={2.3} />
        Request Introduction
      </button>
      <Link
        href="/messages"
        title="Capital Circle brokers the conversation — start a thread with the platform."
        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white ring-1 ring-navy-900/[0.12] hover:ring-navy-900/30 text-navy-900 font-semibold px-5 py-2.5 text-sm transition-colors"
      >
        <MessageSquare className="h-4 w-4 text-gold-600" strokeWidth={2.2} />
        Contact
      </Link>
      {primaryCompanySlug ? (
        <Link
          href={`/company/${primaryCompanySlug}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white ring-1 ring-navy-900/[0.12] hover:ring-navy-900/30 text-navy-900 font-semibold px-5 py-2.5 text-sm transition-colors"
        >
          <Building2 className="h-4 w-4 text-gold-600" strokeWidth={2.2} />
          View Company
        </Link>
      ) : null}

      <RequestIntroductionModal open={introOpen} onClose={() => setIntroOpen(false)} member={member} />
    </>
  );
}
