"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  X,
  Users,
  Building2,
  HandCoins,
  Briefcase,
  UserPlus,
  ListChecks,
  ScrollText,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { MEMBERS } from "@/data/members";
import { companies } from "@/data/companies";
import { featuredOpportunities } from "@/data/opportunities";
import { cn } from "@/lib/cn";

type Result = {
  kind: string;
  Icon: typeof Users;
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

const SEED_MEMBER_SLUGS = new Set(MEMBERS.map((m) => m.slug));
const SEED_COMPANY_SLUGS = new Set(companies.map((c) => c.slug));
const SEED_OPP_SLUGS = new Set(featuredOpportunities.map((o) => o.slug));

/**
 * Platform-wide admin search. Scans members, companies, opportunities, deals,
 * introductions, listings, and audit events client-side and links each result
 * straight to its record. Records created at runtime (no public page) link to
 * the matching admin list instead of a 404.
 */
export default function AdminGlobalSearch() {
  const {
    deals,
    introductionRequests,
    listings,
    auditEvents,
    userOpportunities,
    userMembers,
    userCompanies,
  } = useMessaging();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const out: Result[] = [];
    const hit = (...parts: (string | undefined)[]) =>
      parts.filter(Boolean).join(" ").toLowerCase().includes(q);

    for (const m of [...userMembers, ...MEMBERS]) {
      if (out.length > 400) break;
      if (hit(m.id, m.name, m.company, m.title, m.industry))
        out.push({
          kind: "Member",
          Icon: Users,
          id: m.id,
          title: m.name,
          subtitle: `${m.id} · ${m.title} · ${m.company}`,
          href: SEED_MEMBER_SLUGS.has(m.slug)
            ? `/member/${m.slug}`
            : "/admin/members",
        });
    }
    for (const c of [...userCompanies, ...companies]) {
      if (hit(c.id, c.name, c.industry, c.tagline))
        out.push({
          kind: "Company",
          Icon: Building2,
          id: c.id,
          title: c.name,
          subtitle: `${c.id} · ${c.industry}`,
          href: SEED_COMPANY_SLUGS.has(c.slug)
            ? `/company/${c.slug}`
            : "/admin/companies",
        });
    }
    for (const o of [...userOpportunities, ...featuredOpportunities]) {
      if (hit(o.id, o.title, o.category, o.postedBy))
        out.push({
          kind: "Opportunity",
          Icon: HandCoins,
          id: o.id,
          title: o.title,
          subtitle: `${o.id} · ${o.category}`,
          href: SEED_OPP_SLUGS.has(o.slug)
            ? `/opportunity/${o.slug}`
            : `/admin/opportunities`,
        });
    }
    for (const d of deals) {
      if (hit(d.dealId, d.title, d.sponsor.name, d.investor?.name, d.assignedAdmin))
        out.push({
          kind: "Deal",
          Icon: Briefcase,
          id: d.dealId,
          title: d.title,
          subtitle: `${d.dealId} · ${d.stage}`,
          href: `/deal-desk/${d.dealId}`,
        });
    }
    for (const r of introductionRequests) {
      if (hit(r.id, r.requesterName, r.targetMemberName, r.opportunityTitle))
        out.push({
          kind: "Introduction",
          Icon: UserPlus,
          id: r.id,
          title: `${r.requesterName} → ${r.targetMemberName}`,
          subtitle: `${r.id} · ${r.status}`,
          href: "/admin/introductions",
        });
    }
    for (const l of listings) {
      if (hit(l.id, l.title, l.category, l.dealType))
        out.push({
          kind: "Listing",
          Icon: ListChecks,
          id: l.id,
          title: l.title,
          subtitle: `${l.id} · ${l.status}`,
          href: `/dashboard/listings/${l.id}`,
        });
    }
    for (const e of auditEvents) {
      if (hit(e.id, e.action, e.targetLabel, e.targetId, e.detail))
        out.push({
          kind: "Audit",
          Icon: ScrollText,
          id: e.id,
          title: e.action,
          subtitle: `${e.id} · ${e.targetLabel ?? e.targetId}`,
          href: `/admin/audit/${e.id}`,
        });
    }
    return out.slice(0, 40);
  }, [
    query,
    deals,
    introductionRequests,
    listings,
    auditEvents,
    userOpportunities,
    userMembers,
    userCompanies,
  ]);

  const grouped = useMemo(() => {
    const g = new Map<string, Result[]>();
    for (const r of results) {
      const arr = g.get(r.kind) ?? [];
      arr.push(r);
      g.set(r.kind, arr);
    }
    return [...g.entries()];
  }, [results]);

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 bg-white rounded-full ring-1 ring-navy-900/[0.08] focus-within:ring-2 focus-within:ring-gold-500 shadow-sm transition-shadow">
        <span className="pl-4 text-navy-700/60">
          <Search className="h-4 w-4" strokeWidth={2} />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search members, companies, opportunities, deals, introductions, listings, audit…"
          className="flex-1 bg-transparent outline-none py-3 text-sm text-navy-900 placeholder:text-navy-700/45 min-w-0"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            aria-label="Clear search"
            className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-navy-700/55 hover:text-navy-900 hover:bg-bone"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.4} />
          </button>
        ) : null}
      </div>

      {open && query.trim().length >= 2 ? (
        <div className="absolute z-40 mt-2 w-full bg-white rounded-2xl ring-1 ring-navy-900/[0.08] shadow-2xl shadow-navy-900/15 max-h-[60vh] overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-navy-700/60">
              No records match{" "}
              <span className="font-semibold text-navy-900">“{query}”</span>.
            </div>
          ) : (
            <div className="py-2">
              {grouped.map(([kind, items]) => (
                <div key={kind}>
                  <div className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-[0.16em] font-bold text-navy-700/45">
                    {kind} · {items.length}
                  </div>
                  {items.map((r) => (
                    <Link
                      key={r.kind + r.id}
                      href={r.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-bone/70 transition-colors"
                    >
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-bone text-gold-700 shrink-0">
                        <r.Icon className="h-4 w-4" strokeWidth={2.2} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-navy-900 truncate">
                          {r.title}
                        </span>
                        <span className="block text-[11px] text-navy-700/55 truncate">
                          {r.subtitle}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
