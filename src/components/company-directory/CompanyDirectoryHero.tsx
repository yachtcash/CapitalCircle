import {
  Building2,
  ShieldCheck,
  Crown,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { companies } from "@/data/companies";
import { featuredOpportunities } from "@/data/opportunities";

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-navy-900/[0.06] p-4 md:p-5">
      <div className="text-[10px] uppercase tracking-[0.16em] text-navy-700/60 font-semibold inline-flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
        {label}
      </div>
      <div className="mt-2 text-2xl md:text-3xl font-semibold text-navy-900 tabular-nums">
        {value}
      </div>
    </div>
  );
}

export default function CompanyDirectoryHero() {
  const total = companies.length;
  const verified = companies.filter(
    (c) => c.verification === "Verified" || c.verification === "Premium Verified"
  ).length;
  const premium = companies.filter((c) => c.verification === "Premium Verified").length;
  const activeOpps = featuredOpportunities.length;

  return (
    <section className="bg-white border-b border-navy-900/[0.06]">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-7 md:py-10">
        <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5" strokeWidth={2.2} />
          Company Directory
        </div>
        <h1 className="mt-1.5 text-2xl md:text-3xl lg:text-4xl font-semibold text-navy-900 tracking-tight max-w-3xl">
          {total} vetted firms participating in Capital Circle.
        </h1>
        <p className="mt-2 text-sm md:text-base text-navy-700/70 leading-relaxed max-w-2xl">
          Developers, operators, capital allocators, energy independents,
          logistics groups, and land specialists — each with their own data room.
        </p>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          <Stat icon={Building2} label="Total companies" value={total} />
          <Stat icon={ShieldCheck} label="Verified" value={verified} />
          <Stat icon={Crown} label="Premium Verified" value={premium} />
          <Stat icon={Layers} label="Active opportunities" value={activeOpps} />
        </div>
      </div>
    </section>
  );
}
