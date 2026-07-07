"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Bookmark, MapPin, Building2, ArrowRight } from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { useAllOpportunities } from "@/lib/opportunities/all";
import { featuredOpportunities, type Opportunity } from "@/data/opportunities";
import { getFeaturedOpportunityOfTheWeek } from "@/data/opportunities/collections";
import { getCompanyById } from "@/data/companies";
import { resolveHeroId, splitByPlacement, isPlacementEmpty } from "@/lib/marketplace/placement";
import { publicOpportunityId } from "@/lib/opportunities/id";
import { useResolvedImage } from "@/lib/imageStore";
import { capitalRequired } from "@/lib/home/format";
import { cn } from "@/lib/cn";

export default function FeaturedOpportunities() {
  const { marketplacePlacement: placement, hydrated } = useMessaging();
  const allOpps = useAllOpportunities();
  const pool = allOpps.length ? allOpps : featuredOpportunities;
  const fallbackId = getFeaturedOpportunityOfTheWeek().id;

  const items = useMemo(() => {
    const heroId =
      !hydrated || isPlacementEmpty(placement)
        ? fallbackId
        : resolveHeroId(pool, placement) ?? fallbackId;

    // Curated featured slots when the admin has placed any; otherwise fall back
    // to the editorial `featured` flag so the row is never empty.
    let list: Opportunity[] = [];
    if (hydrated && !isPlacementEmpty(placement)) {
      list = splitByPlacement(pool, placement).featured;
    }
    if (list.length === 0) {
      list = pool.filter((o) => o.featured);
    }
    if (list.length === 0) list = pool.slice(0, 6);
    // Don't repeat the hero card shown at the top of the page.
    return list.filter((o) => o.id !== heroId).slice(0, 6);
  }, [pool, placement, hydrated, fallbackId]);

  if (items.length === 0) return null;

  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-12 md:py-16">
        <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
              <Star className="h-3.5 w-3.5" strokeWidth={2.4} />
              Featured Opportunities
            </div>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-navy-900 tracking-tight">
              Curated by our investment team
            </h2>
            <p className="mt-2 text-sm md:text-base text-navy-700/70 max-w-2xl">
              Sponsor-vetted deals placed front and center — the opportunities drawing the most serious capital this week.
            </p>
          </div>
          <Link
            href="/opportunities"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-gold-700 transition-colors whitespace-nowrap"
          >
            View all
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {items.map((o, i) => (
            <FeaturedCard key={o.id} opportunity={o} position={i + 1} priority={i === 0} />
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link
            href="/opportunities"
            className="w-full inline-flex items-center justify-center rounded-full bg-navy-900 text-white text-sm font-semibold py-3"
          >
            View all opportunities
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeaturedCard({
  opportunity,
  position,
  priority,
}: {
  opportunity: Opportunity;
  position: number;
  priority: boolean;
}) {
  const { isOpportunitySaved, toggleSavedOpportunity, hydrated, currentRole } = useMessaging();
  const src = useResolvedImage(opportunity.images[0]);
  const company = getCompanyById(opportunity.companyId);
  const sponsor = company?.name ?? opportunity.postedBy;
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
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/55 via-transparent to-navy-900/20" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-navy-900 text-gold-400 ring-1 ring-gold-500/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] font-bold">
          <Star className="h-3 w-3" strokeWidth={2.4} /> Featured #{position}
        </span>
        <span className="absolute bottom-3 left-3 inline-flex items-center text-[10px] uppercase tracking-[0.12em] font-bold rounded-full px-2 py-0.5 bg-white/90 text-navy-900 ring-1 ring-navy-900/10">
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
          <Meta icon={Building2} label="Sponsor" value={sponsor} />
          <Meta icon={MapPin} label="Location" value={location} />
        </div>

        <div className="mt-4 pt-4 border-t border-navy-900/[0.06] flex items-end justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-bold">Capital Required</div>
            <div className="text-[15px] font-semibold text-navy-900 tabular-nums">{capitalRequired(opportunity)}</div>
          </div>
          <Link
            href={`/opportunity/${opportunity.slug}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-gold-700 hover:text-gold-600 transition-colors whitespace-nowrap"
          >
            View
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-bold inline-flex items-center gap-1">
        <Icon className="h-3 w-3 text-gold-600" strokeWidth={2.2} />
        {label}
      </div>
      <div className="mt-0.5 text-xs font-semibold text-navy-900 truncate">{value}</div>
    </div>
  );
}
