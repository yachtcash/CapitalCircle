"use client";

import Link from "next/link";
import Image from "next/image";
import { Bookmark, MapPin, TrendingUp, ArrowRight } from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import type { Opportunity } from "@/data/opportunities";
import { publicOpportunityId } from "@/lib/opportunities/id";
import { useResolvedImage } from "@/lib/imageStore";
import { capitalRequired } from "@/lib/home/format";
import { cn } from "@/lib/cn";

export default function CompanyOpportunityCard({
  opportunity,
  priority,
}: {
  opportunity: Opportunity;
  priority?: boolean;
}) {
  const { isOpportunitySaved, toggleSavedOpportunity, hydrated, currentRole } = useMessaging();
  const src = useResolvedImage(opportunity.images[0]);
  const location = opportunity.place
    ? [opportunity.place.city, opportunity.place.country].filter(Boolean).join(", ")
    : opportunity.location;
  const saved = hydrated && isOpportunitySaved(opportunity.id);

  return (
    <article className="group relative flex flex-col bg-white rounded-2xl ring-1 ring-navy-900/[0.06] hover:ring-gold-500/50 hover:shadow-xl hover:shadow-navy-900/10 hover:-translate-y-0.5 overflow-hidden transition-all">
      <Link href={`/opportunity/${opportunity.slug}`} className="relative block aspect-[16/10] bg-navy-900/5">
        {src ? (
          <Image
            src={src}
            alt={opportunity.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/55 via-transparent to-navy-900/15" />
        <span className="absolute top-3 left-3 inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-bold rounded-full px-2.5 py-1 bg-white/90 text-navy-900 ring-1 ring-navy-900/10">
          {opportunity.status}
        </span>
      </Link>

      {/* Save — member capability; hidden for guests */}
      {currentRole !== "Guest" ? (
        <button
          type="button"
          onClick={() => toggleSavedOpportunity(opportunity.id)}
          aria-pressed={saved}
          aria-label={saved ? "Saved" : "Save opportunity"}
          title={saved ? "Saved" : "Save opportunity"}
          className={cn(
            "absolute top-3 right-3 inline-flex items-center justify-center h-8 w-8 rounded-full ring-1 backdrop-blur transition-colors",
            saved
              ? "bg-gold-500/90 text-navy-900 ring-gold-500"
              : "bg-navy-900/60 text-white ring-white/20 hover:bg-navy-900/80"
          )}
        >
          <Bookmark className={cn("h-4 w-4", saved && "fill-navy-900")} strokeWidth={2.2} />
        </button>
      ) : null}

      <div className="flex-1 flex flex-col p-5">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] font-semibold">
          <span className="text-gold-600">{opportunity.category}</span>
          <span className="text-navy-700/25">·</span>
          <span className="text-navy-700/50 tabular-nums">{publicOpportunityId(opportunity)}</span>
        </div>
        <Link href={`/opportunity/${opportunity.slug}`}>
          <h3 className="mt-1.5 text-[15px] md:text-base font-semibold text-navy-900 leading-snug line-clamp-2 group-hover:text-gold-700 transition-colors">
            {opportunity.title}
          </h3>
        </Link>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <Meta label="Capital Required" value={capitalRequired(opportunity)} accent />
          <Meta icon={TrendingUp} label="Target Return" value={opportunity.expectedReturn || "On request"} />
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-navy-700/70 min-w-0">
          <MapPin className="h-3.5 w-3.5 text-gold-600 shrink-0" strokeWidth={2} />
          <span className="truncate">{location}</span>
        </div>

        <div className="mt-4 pt-4 border-t border-navy-900/[0.06] flex items-center justify-end">
          <Link
            href={`/opportunity/${opportunity.slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 hover:text-gold-700 transition-colors whitespace-nowrap"
          >
            View Opportunity
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon?: typeof MapPin;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="text-[9px] uppercase tracking-[0.12em] text-navy-700/55 font-bold inline-flex items-center gap-1">
        {Icon ? <Icon className="h-2.5 w-2.5 text-gold-600" strokeWidth={2.2} /> : null}
        {label}
      </div>
      <div className={cn("mt-0.5 text-sm font-semibold truncate", accent ? "text-navy-900 tabular-nums" : "text-navy-900")}>
        {value}
      </div>
    </div>
  );
}
