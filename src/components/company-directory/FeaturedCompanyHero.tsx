"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, CalendarDays, Briefcase, Star } from "lucide-react";
import type { Company } from "@/data/companies";
import { getActiveOpportunitiesForCompany } from "@/data/companies";
import VerificationBadge from "@/components/company/VerificationBadge";
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

export default function FeaturedCompanyHero({ company: seedCompany }: { company: Company }) {
  // Live overlay-applied record — Media Manager cover edits show here.
  const { getCompanyLive } = useMessaging();
  const company = getCompanyLive(seedCompany.id) ?? seedCompany;
  const cover = useResolvedImage(company.coverImage);
  const hq = [
    company.headquarters.city,
    company.headquarters.state,
    company.headquarters.country,
  ]
    .filter((x): x is string => Boolean(x))
    .join(", ");
  const activeCount = getActiveOpportunitiesForCompany(company.id).length;

  return (
    <section className="bg-cream">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-6 md:py-8">
        <article className="relative bg-navy-900 text-white rounded-3xl overflow-hidden ring-1 ring-white/5 shadow-xl shadow-navy-900/15">
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_minmax(0,1fr)]">
            {/* Cover image */}
            <div className="relative aspect-[16/10] md:aspect-auto md:h-full min-h-[260px]">
              {cover ? (
                <Image
                  src={cover}
                  alt={`${company.name} — cover`}
                  fill
                  priority
                  sizes="(min-width: 768px) 60vw, 100vw"
                  className="object-cover"
                  unoptimized
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-r from-navy-900/40 via-transparent to-transparent md:bg-gradient-to-r md:from-navy-900/20 md:via-transparent md:to-navy-900/60 pointer-events-none" />
            </div>

            {/* Copy */}
            <div className="relative p-6 md:p-8 lg:p-10 flex flex-col">
              <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-gold-400 font-semibold">
                <Star className="h-3.5 w-3.5" strokeWidth={2.4} />
                Featured Company of the Week
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="shrink-0 h-12 w-12 rounded-xl bg-white/[0.08] ring-1 ring-white/15 text-gold-400 flex items-center justify-center text-sm font-semibold tracking-wide">
                  {initialsFor(company.name)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl md:text-2xl lg:text-[28px] font-semibold tracking-tight leading-tight">
                    {company.name}
                  </h2>
                  <div className="mt-1 inline-flex items-center gap-2 flex-wrap">
                    <VerificationBadge status={company.verification} />
                    <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-white/65 tabular-nums">
                      {company.id}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm md:text-[15px] text-white/75 leading-relaxed line-clamp-4 md:line-clamp-5">
                {company.about.overview}
              </p>

              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-white/55 font-semibold inline-flex items-center gap-1">
                    <Briefcase className="h-3 w-3 text-gold-400" strokeWidth={2.4} />
                    Industry
                  </dt>
                  <dd className="mt-0.5 font-semibold text-white truncate">
                    {company.industry}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-white/55 font-semibold inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gold-400" strokeWidth={2.4} />
                    Headquarters
                  </dt>
                  <dd className="mt-0.5 font-semibold text-white truncate">{hq}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-white/55 font-semibold inline-flex items-center gap-1">
                    <CalendarDays className="h-3 w-3 text-gold-400" strokeWidth={2.4} />
                    Founded
                  </dt>
                  <dd className="mt-0.5 font-semibold text-white">{company.foundedYear}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-white/55 font-semibold">
                    Active opportunities
                  </dt>
                  <dd className="mt-0.5 font-semibold text-white tabular-nums">
                    {activeCount}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 md:mt-7 flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/company/${company.slug}`}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-6 py-3 text-sm transition-colors"
                >
                  View Company
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    strokeWidth={2.4}
                  />
                </Link>
                {activeCount > 0 ? (
                  <Link
                    href={`/opportunities?company=${company.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white/5 hover:bg-white/10 ring-1 ring-white/20 text-white font-medium px-5 py-3 text-sm transition-colors"
                  >
                    See {activeCount} listing{activeCount === 1 ? "" : "s"}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
