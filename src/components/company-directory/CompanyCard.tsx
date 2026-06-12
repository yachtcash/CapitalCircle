"use client";

import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  CalendarDays,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import type { Company } from "@/data/companies";
import { getActiveOpportunitiesForCompany } from "@/data/companies";
import VerificationBadge from "@/components/company/VerificationBadge";
import MessageCompanyButton from "@/components/common/MessageCompanyButton";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { useResolvedImage } from "@/lib/imageStore";
import { cn } from "@/lib/cn";

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type Props = {
  company: Company;
  priority?: boolean;
};

export default function CompanyCard({ company: seedCompany, priority = false }: Props) {
  // Live overlay-applied record — Media Manager cover/logo edits show here.
  const { getCompanyLive } = useMessaging();
  const company = getCompanyLive(seedCompany.id) ?? seedCompany;
  const cover = useResolvedImage(company.coverImage);
  const active = getActiveOpportunitiesForCompany(company.id).length;
  const hq = [
    company.headquarters.city,
    company.headquarters.state,
    company.headquarters.country,
  ]
    .filter((x): x is string => Boolean(x))
    .join(", ");

  return (
    <article
      className={cn(
        "group flex flex-col bg-white rounded-2xl ring-1 ring-navy-900/[0.06] overflow-hidden",
        "hover:shadow-xl hover:shadow-navy-900/10 hover:-translate-y-0.5 transition-all duration-200"
      )}
    >
      {/* Cover band */}
      <Link
        href={`/company/${company.slug}`}
        aria-label={`Open ${company.name} profile`}
        className="relative block aspect-[16/8] overflow-hidden bg-navy-900/5"
      >
        {cover ? (
          <Image
            src={cover}
            alt={`${company.name} — cover`}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 380px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/55 to-transparent pointer-events-none" />
        {company.featured ? (
          <span className="absolute top-3 left-3 inline-flex items-center text-[10px] uppercase tracking-[0.16em] font-bold bg-navy-900 text-gold-400 ring-1 ring-gold-500/40 rounded-full px-2.5 py-1">
            Featured
          </span>
        ) : null}
        <div className="absolute top-3 right-3">
          <MessageCompanyButton company={company} variant="icon" />
        </div>
      </Link>

      {/* Identity row overlapping the cover */}
      <div className="px-5 pt-0">
        <div className="-mt-9 relative flex items-end gap-3">
          <Link
            href={`/company/${company.slug}`}
            aria-label={`${company.name} profile`}
            className="shrink-0 h-16 w-16 rounded-2xl bg-navy-900 text-gold-500 ring-2 ring-white shadow flex items-center justify-center text-base font-semibold tracking-wide"
          >
            {initialsFor(company.name)}
          </Link>
          <div className="flex-1 min-w-0 pb-1">
            <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-navy-700/60 tabular-nums">
              {company.id}
            </span>
          </div>
          <VerificationBadge status={company.verification} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pt-3 pb-5 flex flex-col">
        <Link
          href={`/company/${company.slug}`}
          className="font-semibold text-navy-900 text-[15px] md:text-base leading-snug group-hover:text-gold-700 transition-colors"
        >
          {company.name}
        </Link>
        <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-gold-600 font-semibold truncate">
          {company.industry}
        </div>

        <p className="mt-3 text-sm text-navy-700/75 leading-relaxed line-clamp-2">
          {company.tagline}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-y-1.5 text-xs text-navy-700/70">
          <span className="inline-flex items-center gap-1.5 min-w-0">
            <MapPin className="h-3.5 w-3.5 text-gold-600 shrink-0" strokeWidth={2.2} />
            <span className="truncate">{hq}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-gold-600 shrink-0" strokeWidth={2.2} />
            Founded {company.foundedYear}
          </span>
        </div>

        <div className="mt-auto pt-4">
          <Link
            href={`/opportunities?company=${company.id}`}
            className="group/op inline-flex items-center justify-between w-full gap-2 rounded-full bg-bone hover:bg-gold-500 text-navy-900 font-semibold px-4 py-2.5 text-sm transition-colors"
          >
            <span className="inline-flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-gold-700 group-hover/op:text-navy-900" strokeWidth={2.4} />
              {active} {active === 1 ? "active listing" : "active listings"}
            </span>
            <ArrowUpRight
              className="h-3.5 w-3.5 text-navy-700/70 group-hover/op:text-navy-900 transition-transform group-hover/op:translate-x-0.5"
              strokeWidth={2.4}
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
