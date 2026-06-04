import Link from "next/link";
import { MapPin, Briefcase, ChevronRight } from "lucide-react";
import type { Opportunity } from "@/data/opportunities";
import { cn } from "@/lib/cn";

const statusStyles: Record<Opportunity["status"], string> = {
  Open: "bg-emerald-500/20 text-emerald-200 ring-emerald-300/40",
  Funding: "bg-gold-500/20 text-gold-300 ring-gold-400/40",
  "Closing Soon": "bg-rose-500/20 text-rose-200 ring-rose-300/40",
};

export default function DetailHero({ opportunity }: { opportunity: Opportunity }) {
  return (
    <section className={cn("relative overflow-hidden", opportunity.gradient)}>
      <div
        className="absolute inset-0 opacity-25 mix-blend-soft-light"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.45), transparent 55%), radial-gradient(circle at 80% 70%, rgba(212,175,55,0.55), transparent 55%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-navy-950/70 to-transparent pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-5 md:px-10 pt-8 md:pt-12 pb-12 md:pb-16 min-h-[460px] md:min-h-[540px] flex flex-col text-white">
        <nav className="flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-white/70">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" strokeWidth={2} />
          <Link href="/#opportunities" className="hover:text-white transition-colors">
            Marketplace
          </Link>
          <ChevronRight className="h-3 w-3" strokeWidth={2} />
          <span className="text-white/90">{opportunity.category}</span>
        </nav>

        <div className="mt-auto pt-12">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="inline-flex items-center text-[10px] uppercase tracking-[0.18em] font-bold bg-white/10 backdrop-blur ring-1 ring-white/20 rounded-full px-3 py-1">
              {opportunity.category}
            </span>
            <span className="inline-flex items-center text-[10px] uppercase tracking-[0.18em] font-bold bg-gold-500/15 text-gold-300 ring-1 ring-gold-400/40 rounded-full px-3 py-1">
              {opportunity.dealType}
            </span>
            <span
              className={cn(
                "inline-flex items-center text-[10px] uppercase tracking-[0.18em] font-bold ring-1 rounded-full px-3 py-1",
                statusStyles[opportunity.status]
              )}
            >
              {opportunity.status}
            </span>
          </div>

          <h1 className="text-balance text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.05] tracking-tight max-w-4xl">
            {opportunity.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gold-400" strokeWidth={2} />
              {opportunity.location}
            </span>
            <span className="inline-flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-gold-400" strokeWidth={2} />
              {opportunity.industry}
            </span>
            <span className="inline-flex items-center gap-2 text-white/65">
              <span className="h-1 w-1 rounded-full bg-white/40" />
              Posted by {opportunity.postedBy}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
