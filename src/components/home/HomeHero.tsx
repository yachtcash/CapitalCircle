"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  ArrowRight,
  Crown,
  MapPin,
  Building2,
  TrendingUp,
  Map as MapIcon,
  LayoutGrid,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { useAllOpportunities } from "@/lib/opportunities/all";
import { featuredOpportunities, type Opportunity } from "@/data/opportunities";
import { getFeaturedOpportunityOfTheWeek } from "@/data/opportunities/collections";
import { getCompanyById } from "@/data/companies";
import { resolveHeroId, isPlacementEmpty } from "@/lib/marketplace/placement";
import { publicOpportunityId } from "@/lib/opportunities/id";
import { useResolvedImage } from "@/lib/imageStore";
import { capitalRequired } from "@/lib/home/format";

export default function HomeHero() {
  const { marketplacePlacement: placement, hydrated } = useMessaging();
  const allOpps = useAllOpportunities();
  const pool = allOpps.length ? allOpps : featuredOpportunities;
  const fallbackId = getFeaturedOpportunityOfTheWeek().id;

  const hero = useMemo(() => {
    // Mirror PlacementHero / the live directory so the homepage hero matches.
    const heroId =
      !hydrated || isPlacementEmpty(placement)
        ? fallbackId
        : resolveHeroId(pool, placement) ?? fallbackId;
    return pool.find((o) => o.id === heroId) ?? pool.find((o) => o.id === fallbackId) ?? pool[0] ?? null;
  }, [pool, placement, hydrated, fallbackId]);

  return (
    <section className="relative hero-gradient text-white overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative max-w-6xl mx-auto px-5 md:px-10 pt-12 md:pt-20 pb-14 md:pb-20">
        <div className="grid lg:grid-cols-[1.05fr_minmax(0,0.95fr)] gap-10 lg:gap-12 items-center">
          {/* Left — copy + CTAs */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 backdrop-blur ring-1 ring-white/10 px-3 py-1.5 text-xs text-white/80">
              <ShieldCheck className="h-3.5 w-3.5 text-gold-500" strokeWidth={2} />
              <span className="tracking-wide">Vetted Members · Private Deal Flow</span>
            </div>

            <h1 className="mt-6 text-balance text-4xl sm:text-5xl md:text-[3.4rem] font-semibold leading-[1.05] tracking-tight max-w-2xl">
              Where serious capital meets <span className="text-gold-500">real opportunity</span>.
            </h1>

            <p className="mt-5 text-base md:text-lg text-white/70 max-w-xl leading-relaxed">
              The private marketplace connecting family offices, private equity, developers, and
              high-net-worth investors to institutional-grade deals — vetted, sponsored, and ready for capital.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row flex-wrap gap-3">
              {hero ? (
                <Link
                  href={`/opportunity/${hero.slug}`}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-6 py-3 text-sm transition-colors"
                >
                  View Opportunity
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
                </Link>
              ) : null}
              <Link
                href="/opportunities"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/5 hover:bg-white/10 ring-1 ring-white/15 text-white font-medium px-6 py-3 text-sm transition-colors"
              >
                <LayoutGrid className="h-4 w-4 text-gold-400" strokeWidth={2} />
                Browse Marketplace
              </Link>
              <Link
                href="/map"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/5 hover:bg-white/10 ring-1 ring-white/15 text-white font-medium px-6 py-3 text-sm transition-colors"
              >
                <MapIcon className="h-4 w-4 text-gold-400" strokeWidth={2} />
                Explore Map
              </Link>
            </div>
          </div>

          {/* Right — featured opportunity card */}
          {hero ? <HeroFeaturedCard opportunity={hero} /> : null}
        </div>
      </div>
    </section>
  );
}

function HeroFeaturedCard({ opportunity }: { opportunity: Opportunity }) {
  const src = useResolvedImage(opportunity.images[0]);
  const company = getCompanyById(opportunity.companyId);
  const sponsor = company?.name ?? opportunity.postedBy;
  const location = opportunity.place
    ? [opportunity.place.city, opportunity.place.country].filter(Boolean).join(", ")
    : opportunity.location;

  return (
    <Link
      href={`/opportunity/${opportunity.slug}`}
      className="group block rounded-2xl bg-white/[0.04] backdrop-blur ring-1 ring-white/10 hover:ring-gold-500/40 overflow-hidden transition-all"
    >
      <div className="relative aspect-[16/10] bg-navy-800">
        {src ? (
          <Image
            src={src}
            alt={opportunity.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 520px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/20 to-transparent" />
        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-navy-900/80 ring-1 ring-gold-500/40 text-gold-400 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] font-bold">
          <Crown className="h-3 w-3" strokeWidth={2.4} />
          Featured Opportunity
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] font-bold text-white/70">
            <span className="text-gold-400">{opportunity.category}</span>
            <span className="text-white/30">·</span>
            <span className="tabular-nums">{publicOpportunityId(opportunity)}</span>
          </div>
          <h3 className="mt-1 text-lg md:text-xl font-semibold leading-snug line-clamp-2 text-white">
            {opportunity.title}
          </h3>
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3">
        <HeroMeta icon={TrendingUp} label="Capital Required" value={capitalRequired(opportunity)} accent />
        <HeroMeta icon={TrendingUp} label="Target Return" value={opportunity.expectedReturn} />
        <HeroMeta icon={MapPin} label="Location" value={location} />
        <HeroMeta icon={Building2} label="Sponsor" value={sponsor} />
        <div className="col-span-2 flex items-center justify-between gap-2 pt-1">
          <span className="inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-bold rounded-full px-2.5 py-1 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/25">
            {opportunity.status}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold-400 group-hover:text-gold-300">
            View Opportunity
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function HeroMeta({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="text-[9px] uppercase tracking-[0.14em] text-white/45 font-bold inline-flex items-center gap-1">
        <Icon className="h-2.5 w-2.5 text-gold-400" strokeWidth={2.2} />
        {label}
      </div>
      <div className={`mt-0.5 text-sm font-semibold truncate ${accent ? "text-gold-400 tabular-nums" : "text-white"}`}>
        {value}
      </div>
    </div>
  );
}
