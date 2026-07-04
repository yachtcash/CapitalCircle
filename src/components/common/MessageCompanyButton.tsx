"use client";

import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import type { Company } from "@/data/companies";
import { cn } from "@/lib/cn";

type Props = {
  company: Company;
  variant?: "icon" | "full";
  className?: string;
};

/**
 * Universal "Message company" button. Creates a direct-to-company
 * conversation (no opportunity context) and routes to the thread.
 */
export default function MessageCompanyButton({
  company,
  variant = "full",
  className,
}: Props) {
  const router = useRouter();
  const { createInterestConversation, currentRole } = useMessaging();

  // Messaging is a member capability.
  if (currentRole === "Guest") return null;

  const handle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const id = createInterestConversation({ companyId: company.id });
    router.push(`/messages?conversation=${id}`);
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handle}
        aria-label={`Message ${company.name}`}
        title={`Message ${company.name}`}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy-900/85 hover:bg-navy-900 text-gold-500 ring-1 ring-white/15 backdrop-blur shadow-sm transition-colors",
          className
        )}
      >
        <MessageSquare className="h-3.5 w-3.5" strokeWidth={2.4} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handle}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-navy-900 hover:bg-navy-900/90 text-white font-semibold px-3 py-1.5 text-xs uppercase tracking-[0.14em] transition-colors",
        className
      )}
    >
      <MessageSquare className="h-3.5 w-3.5" strokeWidth={2.4} />
      Message
    </button>
  );
}
