import Image from "next/image";
import Link from "next/link";
import { MapPin, Briefcase, ChevronRight } from "lucide-react";
import type { Opportunity } from "@/data/opportunities";
import { cn } from "@/lib/cn";

const statusStyles: Record<Opportunity["status"], string> = {
  Open: "bg-emerald-500 text-white",
  "Seeking Capital": "bg-gold-500 text-navy-900",
  Negotiating: "bg-amber-500 text-white",
  "Under Contract": "bg-rose-500 text-white",
  Closed: "bg-navy-700 text-white",
};

export default function DetailHero({ opportunity }: { opportunity: Opportunity }) {
  return (
    <section className="relative overflow-hidden bg-navy-900">
      {/* Image */}
      <div className="absolute inset-0">
        <Image
          src={opportunity.images[0]}
          alt={opportunity.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Overlay gradients for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/55 via-navy-900/25 to-navy-900/85 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-900/55 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-5 md:px-10 pt-8 md:pt-12 pb-12 md:pb-16 min-h-[520px] md:min-h-[600px] flex flex-col text-white">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-white/80">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" strokeWidth={2} />
          <Link href="/opportunities" className="hover:text-white transition-colors">
            Marketplace
          </Link>
          <ChevronRight className="h-3 w-3" strokeWidth={2} />
          <span className="text-white">{opportunity.category}</span>
        </nav>

        <div className="mt-auto pt-16 md:pt-24">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="inline-flex items-center text-[10px] uppercase tracking-[0.18em] font-bold bg-white/10 backdrop-blur-md ring-1 ring-white/25 rounded-full px-3 py-1">
              {opportunity.category}
            </span>
            <span className="inline-flex items-center text-[10px] uppercase tracking-[0.18em] font-bold bg-gold-500/20 text-gold-300 ring-1 ring-gold-400/50 backdrop-blur-md rounded-full px-3 py-1">
              {opportunity.dealType}
            </span>
            <span
              className={cn(
                "inline-flex items-center text-[10px] uppercase tracking-[0.18em] font-bold rounded-full px-3 py-1 shadow-md",
                statusStyles[opportunity.status]
              )}
            >
              {opportunity.status}
            </span>
          </div>

          <h1 className="text-balance text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.05] tracking-tight max-w-4xl drop-shadow-sm">
            {opportunity.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/90">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gold-400" strokeWidth={2} />
              {opportunity.location}
            </span>
            <span className="inline-flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-gold-400" strokeWidth={2} />
              {opportunity.industry}
            </span>
            <span className="inline-flex items-center gap-2 text-white/70">
              <span className="h-1 w-1 rounded-full bg-white/40" />
              Posted by {opportunity.postedBy}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
