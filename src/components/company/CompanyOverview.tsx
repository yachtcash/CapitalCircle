"use client";

import { Target, Building2, Globe2, Briefcase, MapPin, Sparkles, type LucideIcon } from "lucide-react";

import type { Company } from "@/data/companies";
import { useCompanyOpportunityProfile } from "@/lib/company/profile";
import SectionHeader from "@/components/ui/SectionHeader";

export default function CompanyOverview({ company }: { company: Company }) {
  const { categories, dealTypes, countries, cities } = useCompanyOpportunityProfile(company.id, 0);

  const hqCountry = company.headquarters?.country;
  const industries = categories.length ? categories : [company.industry];
  const focus = dealTypes.length ? dealTypes : [company.industry];
  const markets = (cities.length ? cities : [company.headquarters?.city].filter(Boolean)) as string[];
  const reach = countries.length ? countries : (hqCountry ? [hqCountry] : []);

  const about = [
    { eyebrow: "Overview", body: company.about.overview },
    { eyebrow: "Mission", body: company.about.mission },
    { eyebrow: "Background", body: company.about.background },
  ].filter((s) => s.body && s.body.trim());

  const highlights = [
    { icon: Sparkles, label: "Track record", value: company.about.trackRecord },
    { icon: Briefcase, label: "Team", value: `${company.employees} employees` },
    { icon: Building2, label: "Closed to date", value: `${company.closedOpportunitiesCount} opportunities` },
    {
      icon: Globe2,
      label: "Reach",
      value: reach.length ? `${reach.length} ${reach.length === 1 ? "country" : "countries"}` : "—",
    },
  ].filter((h) => h.value && String(h.value).trim() && h.value !== "—");

  return (
    <section>
      <SectionHeader eyebrow="Overview" title={`About ${company.name}`} />

      <div className="grid lg:grid-cols-[1.55fr_minmax(0,1fr)] gap-4 md:gap-5">
        {/* About prose */}
        <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] divide-y divide-navy-900/[0.06] overflow-hidden">
          {about.map((s) => (
            <article key={s.eyebrow} className="p-5 md:p-7">
              <div className="text-[10px] uppercase tracking-[0.18em] text-gold-600 font-semibold">{s.eyebrow}</div>
              <p className="mt-2 text-sm md:text-[15px] leading-relaxed text-navy-700/85">{s.body}</p>
            </article>
          ))}
        </div>

        {/* Facet rail */}
        <div className="space-y-4 md:space-y-5">
          <FacetCard icon={Target} title="Investment Focus" items={focus} accent />
          <FacetCard icon={Briefcase} title="Industries" items={industries} />
          <FacetCard icon={MapPin} title="Markets" items={markets} />
          <FacetCard icon={Globe2} title="Geographic Reach" items={reach} />
        </div>
      </div>

      {/* Highlights */}
      {highlights.length > 0 ? (
        <div className="mt-4 md:mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {highlights.map((h) => (
            <div key={h.label} className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-6">
              <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-navy-700/55 font-bold">
                <h.icon className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
                {h.label}
              </div>
              <div className="mt-2 text-sm font-semibold text-navy-900 leading-snug">{h.value}</div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function FacetCard({
  icon: Icon,
  title,
  items,
  accent,
}: {
  icon: LucideIcon;
  title: string;
  items: string[];
  accent?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-6">
      <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-navy-700/55 font-bold">
        <Icon className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
        {title}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {items.map((it) => (
          <span
            key={it}
            className={
              accent
                ? "inline-flex items-center text-xs font-semibold rounded-full px-2.5 py-1 bg-gold-500/15 text-gold-700 ring-1 ring-gold-500/30"
                : "inline-flex items-center text-xs font-semibold rounded-full px-2.5 py-1 bg-navy-900/[0.04] text-navy-800 ring-1 ring-navy-900/10"
            }
          >
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}
