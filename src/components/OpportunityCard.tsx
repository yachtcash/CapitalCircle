import Link from "next/link";
import { MapPin, TrendingUp, Clock } from "lucide-react";
import type { Opportunity } from "@/data/opportunities";
import { cn } from "@/lib/cn";

const statusStyles: Record<Opportunity["status"], string> = {
  Open: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30",
  Funding: "bg-gold-500/15 text-gold-700 ring-gold-500/40",
  "Closing Soon": "bg-rose-500/15 text-rose-700 ring-rose-500/30",
};

export default function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  return (
    <Link
      href={`/opportunity/${opportunity.slug}`}
      className="group flex flex-col bg-white rounded-2xl ring-1 ring-navy-900/[0.06] overflow-hidden hover:shadow-xl hover:shadow-navy-900/10 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className={cn("relative h-40 md:h-44", opportunity.gradient)}>
        <div className="absolute inset-0 opacity-30 mix-blend-soft-light"
             style={{
               backgroundImage:
                 "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 50%), radial-gradient(circle at 70% 70%, rgba(212,175,55,0.4), transparent 50%)",
             }}
        />
        <div className="relative h-full p-5 flex flex-col justify-between text-white">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center text-[10px] uppercase tracking-[0.16em] font-semibold bg-white/10 backdrop-blur ring-1 ring-white/20 rounded-full px-2.5 py-1">
              {opportunity.category}
            </span>
            <span
              className={cn(
                "inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-bold rounded-full px-2.5 py-1 ring-1 bg-white",
                statusStyles[opportunity.status]
              )}
            >
              {opportunity.status}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/85">
            <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
            <span>{opportunity.location}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-5 flex flex-col">
        <h3 className="font-semibold text-navy-900 text-[15px] md:text-base leading-snug group-hover:text-gold-700 transition-colors">
          {opportunity.title}
        </h3>
        <p className="mt-2 text-sm text-navy-700/70 leading-relaxed line-clamp-2">
          {opportunity.description}
        </p>

        <div className="mt-5 pt-4 border-t border-navy-900/[0.06] grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-navy-700/50 font-semibold">
              Investment
            </div>
            <div className="mt-1 text-sm font-semibold text-navy-900">
              {opportunity.investmentRange}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-navy-700/50 font-semibold inline-flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-gold-600" strokeWidth={2.5} />
              Target Return
            </div>
            <div className="mt-1 text-sm font-semibold text-navy-900">
              {opportunity.expectedReturn}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-[11px] text-navy-700/55">
          <span className="font-medium text-navy-700/80">{opportunity.postedBy}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" strokeWidth={2} />
            {opportunity.postedAgo}
          </span>
        </div>
      </div>
    </Link>
  );
}
