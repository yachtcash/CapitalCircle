import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Star, Building2 } from "lucide-react";
import type { Opportunity } from "@/data/opportunities";
import { getCompanyById } from "@/data/companies";
import { publicOpportunityId } from "@/lib/opportunities/id";

const statusStyles: Record<Opportunity["status"], string> = {
  Open: "bg-emerald-500 text-white",
  "Seeking Capital": "bg-gold-500 text-navy-900",
  Negotiating: "bg-amber-500 text-white",
  "Under Contract": "bg-rose-500 text-white",
  Closed: "bg-navy-700 text-white",
};

export default function FeaturedOpportunityHero({
  opportunity,
}: {
  opportunity: Opportunity;
}) {
  const company = getCompanyById(opportunity.companyId);
  const publicId = publicOpportunityId(opportunity);

  return (
    <section className="bg-cream">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-6 md:py-8">
        <article className="relative bg-navy-900 text-white rounded-3xl overflow-hidden ring-1 ring-white/5 shadow-xl shadow-navy-900/15">
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_minmax(0,1fr)]">
            {/* Image */}
            <div className="relative aspect-[16/10] md:aspect-auto md:h-full min-h-[280px]">
              <Image
                src={opportunity.images[0]}
                alt={opportunity.title}
                fill
                priority
                sizes="(min-width: 768px) 60vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-navy-900/40 via-transparent to-transparent md:bg-gradient-to-r md:from-navy-900/20 md:via-transparent md:to-navy-900/60 pointer-events-none" />
              {/* Status pill on the image */}
              <span
                className={`absolute top-4 right-4 inline-flex items-center text-[10px] uppercase tracking-[0.16em] font-bold rounded-full px-3 py-1 shadow ${statusStyles[opportunity.status]}`}
              >
                {opportunity.status}
              </span>
            </div>

            {/* Copy */}
            <div className="relative p-6 md:p-8 lg:p-10 flex flex-col">
              <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-gold-400 font-semibold">
                <Star className="h-3.5 w-3.5" strokeWidth={2.4} />
                Featured Opportunity of the Week
              </div>
              <div className="mt-2 flex items-center gap-2 flex-wrap text-[10px] uppercase tracking-[0.16em] font-semibold">
                <span className="bg-white/10 ring-1 ring-white/20 rounded-full px-2.5 py-1">
                  {opportunity.category}
                </span>
                <span className="bg-white/10 ring-1 ring-white/20 rounded-full px-2.5 py-1">
                  {opportunity.dealType}
                </span>
                <span className="text-white/65 tabular-nums">{publicId}</span>
              </div>
              <h2 className="mt-4 text-2xl md:text-3xl lg:text-[34px] font-semibold tracking-tight leading-tight">
                {opportunity.title}
              </h2>
              <p className="mt-3 text-sm md:text-[15px] text-white/75 leading-relaxed line-clamp-4 md:line-clamp-5">
                {opportunity.executiveSummary}
              </p>

              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-white/55 font-semibold">
                    Investment
                  </dt>
                  <dd className="mt-0.5 font-semibold text-white">
                    {opportunity.investmentRange}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-white/55 font-semibold">
                    Target return
                  </dt>
                  <dd className="mt-0.5 font-semibold text-white">
                    {opportunity.expectedReturn}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-white/55 font-semibold inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gold-400" strokeWidth={2.4} />
                    Location
                  </dt>
                  <dd className="mt-0.5 font-semibold text-white truncate">
                    {opportunity.location}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-white/55 font-semibold inline-flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-gold-400" strokeWidth={2.4} />
                    Sponsor
                  </dt>
                  <dd className="mt-0.5 font-semibold text-white truncate">
                    {company?.name ?? opportunity.postedBy}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 md:mt-7 flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/opportunity/${opportunity.slug}`}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-6 py-3 text-sm transition-colors"
                >
                  View opportunity
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    strokeWidth={2.4}
                  />
                </Link>
                {company ? (
                  <Link
                    href={`/company/${company.slug}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white/5 hover:bg-white/10 ring-1 ring-white/20 text-white font-medium px-5 py-3 text-sm transition-colors"
                  >
                    {company.name}
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
