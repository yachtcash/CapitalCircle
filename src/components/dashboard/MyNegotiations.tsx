"use client";

import Link from "next/link";
import { ArrowRight, Handshake, MessageSquare } from "lucide-react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { formatRelative, type Conversation } from "@/data/messages";
import { STAGE_META, type NegotiationStage } from "@/data/negotiations";
import { getCompanyById } from "@/data/companies";
import { cn } from "@/lib/cn";

const ACTIVE_NEGOTIATION_STAGES: NegotiationStage[] = [
  "Discussion Active",
  "Documents Shared",
  "Negotiation Active",
  "Under Review",
];

const STAGE_CHIP: Record<NegotiationStage, string> = {
  "Interest Submitted": "bg-navy-900/[0.05] text-navy-700 ring-navy-900/15",
  "Discussion Active": "bg-sky-500/15 text-sky-700 ring-sky-500/35",
  "Documents Shared": "bg-gold-500/15 text-gold-700 ring-gold-500/40",
  "Negotiation Active": "bg-amber-500/15 text-amber-700 ring-amber-500/40",
  "Under Review": "bg-rose-500/15 text-rose-700 ring-rose-500/35",
  "Agreement Reached": "bg-emerald-500/15 text-emerald-700 ring-emerald-500/35",
};

export default function MyNegotiations() {
  const { hydrated, conversations } = useMessaging();

  const active = conversations
    .filter((c) => ACTIVE_NEGOTIATION_STAGES.includes(c.stage))
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));

  return (
    <section className="bg-white rounded-2xl ring-1 ring-navy-900/[0.06] p-5 md:p-7">
      <header className="flex items-end justify-between gap-3 mb-5">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
            <Handshake className="h-3.5 w-3.5" strokeWidth={2.2} />
            In Motion
          </div>
          <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">
            My negotiations
          </h2>
        </div>
        <Link
          href="/messages"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-gold-600 transition-colors group whitespace-nowrap"
        >
          All conversations
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            strokeWidth={2.2}
          />
        </Link>
      </header>

      {!hydrated ? (
        <SkeletonRows />
      ) : active.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="divide-y divide-navy-900/[0.06]">
          {active.map((conversation) => (
            <NegotiationRow
              key={conversation.id}
              conversation={conversation}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function NegotiationRow({ conversation }: { conversation: Conversation }) {
  const company = getCompanyById(conversation.companyId);
  const stageMeta = STAGE_META[conversation.stage];
  const companyName = company?.name ?? "Private counterparty";
  const companySlug = company?.slug;

  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {companySlug ? (
              <Link
                href={`/company/${companySlug}`}
                className="text-sm md:text-[15px] font-semibold text-navy-900 hover:text-gold-700 transition-colors truncate"
              >
                {companyName}
              </Link>
            ) : (
              <span className="text-sm md:text-[15px] font-semibold text-navy-900 truncate">
                {companyName}
              </span>
            )}
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] font-bold inline-flex items-center ring-1",
                STAGE_CHIP[conversation.stage]
              )}
            >
              {stageMeta.shortLabel}
            </span>
          </div>
          {conversation.opportunityTitle ? (
            <div className="mt-1 text-xs md:text-sm text-navy-700/70 truncate">
              Re: {conversation.opportunityTitle}
            </div>
          ) : null}
          <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-navy-700/55 font-semibold">
            Last activity {formatRelative(conversation.lastMessageAt)}
          </div>
        </div>

        <Link
          href={`/messages?conversation=${conversation.id}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold px-4 py-2 transition-colors whitespace-nowrap shrink-0"
        >
          <MessageSquare className="h-3.5 w-3.5" strokeWidth={2.2} />
          Open in messages
        </Link>
      </div>
    </li>
  );
}

function SkeletonRows() {
  return (
    <ul className="divide-y divide-navy-900/[0.06]">
      {[0, 1, 2].map((i) => (
        <li key={i} className="py-4 first:pt-0 last:pb-0">
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 bg-bone rounded" />
              <div className="h-3 w-1/2 bg-bone rounded" />
            </div>
            <div className="h-8 w-32 bg-bone rounded-full" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl bg-bone/40 ring-1 ring-navy-900/[0.04] px-5 py-8 text-center">
      <Handshake
        className="h-6 w-6 mx-auto text-navy-700/45"
        strokeWidth={2}
      />
      <div className="mt-3 text-sm font-semibold text-navy-900">
        No active negotiations
      </div>
      <p className="mt-1.5 text-xs text-navy-700/65 leading-relaxed max-w-sm mx-auto">
        When you advance an interest into a working conversation it will appear
        here.
      </p>
      <Link
        href="/#opportunities"
        className="mt-4 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600 transition-colors group"
      >
        Browse opportunities
        <ArrowRight
          className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
          strokeWidth={2.4}
        />
      </Link>
    </div>
  );
}
