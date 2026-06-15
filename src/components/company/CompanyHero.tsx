"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Globe2,
  MapPin,
  Briefcase,
  CalendarDays,
  MessageSquare,
} from "lucide-react";
import type { Company } from "@/data/companies";
import VerificationBadge from "./VerificationBadge";
import SaveCompanyButton from "@/components/profile/SaveCompanyButton";
import ReportButton from "@/components/moderation/ReportButton";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { useResolvedImage } from "@/lib/imageStore";

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function CompanyHero({ company: seedCompany }: { company: Company }) {
  const router = useRouter();
  const { createInterestConversation, getCompanyLive } = useMessaging();
  // Live overlay-applied record so logo / cover edits show instantly.
  const company = getCompanyLive(seedCompany.id) ?? seedCompany;
  const cover = useResolvedImage(company.coverImage);
  const logo = useResolvedImage(company.logo);

  const headquarters = [
    company.headquarters.city,
    company.headquarters.state,
    company.headquarters.country,
  ]
    .filter((x): x is string => Boolean(x && x.trim()))
    .join(", ");

  const messageCompany = () => {
    const id = createInterestConversation({ companyId: company.id });
    router.push(`/messages?conversation=${id}`);
  };

  return (
    <section className="bg-white">
      {/* Cover band */}
      <div className="relative h-44 md:h-72 bg-navy-900 overflow-hidden">
        {cover ? (
          <Image
            src={cover}
            alt={`${company.name} — cover`}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-95"
            unoptimized
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/40 via-navy-900/10 to-navy-900/40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/35 to-transparent pointer-events-none" />

        {/* Breadcrumb */}
        <nav className="relative max-w-6xl mx-auto px-5 md:px-10 pt-6 flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-white/85">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" strokeWidth={2} />
          <Link href="/companies" className="hover:text-white transition-colors">
            Companies
          </Link>
          <ChevronRight className="h-3 w-3" strokeWidth={2} />
          <span className="text-white">{company.name}</span>
        </nav>
      </div>

      {/* Identity card overlapping cover */}
      <div className="max-w-6xl mx-auto px-5 md:px-10">
        <div className="relative -mt-12 md:-mt-16 bg-white rounded-2xl ring-1 ring-navy-900/[0.06] shadow-sm p-5 md:p-7 flex flex-col md:flex-row items-start gap-5">
          {/* Logo — uploaded image when set, initials monogram otherwise */}
          <div className="relative shrink-0 h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-navy-900 text-gold-500 ring-1 ring-navy-900/5 flex items-center justify-center text-2xl md:text-3xl font-semibold tracking-wide overflow-hidden">
            {logo ? (
              <Image
                src={logo}
                alt={`${company.name} — logo`}
                fill
                sizes="96px"
                className="object-cover"
                unoptimized
              />
            ) : (
              initialsFor(company.name)
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.18em] text-gold-600 font-semibold">
                  {company.industry}
                </div>
                <h1 className="mt-1.5 text-2xl md:text-3xl font-semibold text-navy-900 tracking-tight">
                  {company.name}
                </h1>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <VerificationBadge status={company.verification} size="md" />
                <button
                  type="button"
                  onClick={messageCompany}
                  aria-label={`Message ${company.name}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 text-xs font-semibold uppercase tracking-[0.14em] px-3 py-2 transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5" strokeWidth={2.4} />
                  Message Company
                </button>
                <SaveCompanyButton companyId={company.id} />
                <ReportButton
                  targetKind="company"
                  targetId={company.id}
                  targetLabel={company.name}
                  variant="chip"
                  className="ml-1"
                />
              </div>
            </div>

            <p className="mt-3 text-sm md:text-[15px] text-navy-700/80 leading-relaxed max-w-3xl">
              {company.tagline}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-navy-700/80">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gold-600" strokeWidth={2} />
                {headquarters}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-gold-600" strokeWidth={2} />
                Founded {company.foundedYear}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-gold-600" strokeWidth={2} />
                {company.industry}
              </span>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-navy-900 font-semibold hover:text-gold-700 transition-colors"
              >
                <Globe2 className="h-4 w-4" strokeWidth={2} />
                {company.websiteLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
