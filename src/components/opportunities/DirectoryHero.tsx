import Link from "next/link";
import {
  Compass,
  TrendingUp,
  ShieldCheck,
  Globe2,
  PlusCircle,
  type LucideIcon,
} from "lucide-react";
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

export default function DirectoryHero() {
  const total = featuredOpportunities.length;
  const featured = featuredOpportunities.filter((o) => o.featured).length;
  const seeking = featuredOpportunities.filter(
    (o) => o.status === "Seeking Capital"
  ).length;
  const countries = new Set(
    featuredOpportunities.map((o) => o.place?.country).filter(Boolean)
  ).size;

  return (
    <section className="bg-white border-b border-navy-900/[0.06]">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-7 md:py-10">
        <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
          <Compass className="h-3.5 w-3.5" strokeWidth={2.2} />
          Opportunity Directory
        </div>
        <h1 className="mt-1.5 text-2xl md:text-3xl lg:text-4xl font-semibold text-navy-900 tracking-tight max-w-3xl">
          Browse every active opportunity on Capital Circle.
        </h1>
        <p className="mt-2 text-sm md:text-base text-navy-700/70 leading-relaxed max-w-2xl">
          Investments, joint ventures, hotels, land, businesses for sale, suppliers, and
          services — sponsor-vetted, with private data rooms behind every opportunity.
        </p>

        <div className="mt-4">
          <Link
            href="/create-listing"
            className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 hover:bg-navy-800 text-white font-semibold px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5 text-gold-400" strokeWidth={2.2} />
            List your opportunity
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          <Stat icon={Compass} label="Active opportunities" value={total} />
          <Stat icon={TrendingUp} label="Featured this week" value={featured} />
          <Stat icon={ShieldCheck} label="Seeking capital" value={seeking} />
          <Stat icon={Globe2} label="Countries" value={countries} />
        </div>
      </div>
    </section>
  );
}
