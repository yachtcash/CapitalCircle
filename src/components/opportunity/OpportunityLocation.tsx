"use client";

import { useMemo } from "react";
import Link from "next/link";
import { MapPin, Layers, TrendingUp, Building2, ArrowUpRight } from "lucide-react";

import type { Opportunity } from "@/data/opportunities";
import { useAllOpportunities } from "@/lib/opportunities/all";
import { featuredOpportunities } from "@/data/opportunities";
import WorldMapSvg from "@/components/map/WorldMapSvg";
import { projectLngLat, withinBounds, MAP_BOUNDS } from "@/lib/map/projection";
import { publicOpportunityId } from "@/lib/opportunities/id";
import { capitalRequired, compactMoney } from "@/lib/home/format";

const ACTIVE_FUNDING_STATUSES = new Set(["Open", "Seeking Capital", "Negotiating"]);

export default function OpportunityLocation({ opportunity }: { opportunity: Opportunity }) {
  const allOpps = useAllOpportunities();
  const pool = allOpps.length ? allOpps : featuredOpportunities;

  const country = opportunity.place?.country ?? "";
  const cityLine = opportunity.place
    ? [opportunity.place.city, opportunity.place.state, opportunity.place.country].filter(Boolean).join(", ")
    : opportunity.location;

  const { nearby, regional, markers, selfPoint } = useMemo(() => {
    const inCountry = pool.filter((o) => o.place?.country && o.place.country === country);
    const nearby = inCountry.filter((o) => o.slug !== opportunity.slug).slice(0, 3);
    const capital = inCountry
      .filter((o) => ACTIVE_FUNDING_STATUSES.has(o.status))
      .reduce((s, o) => s + (o.fundingAmount || 0), 0);
    const sponsors = new Set(inCountry.map((o) => o.companyId).filter(Boolean)).size;
    const regional = { count: inCountry.length, capital, sponsors };

    const markers = inCountry
      .map((o) => o.place?.coordinates)
      .filter((c): c is { lat: number; lng: number } => !!c && withinBounds(c.lng, c.lat, MAP_BOUNDS))
      .map((c) => projectLngLat(c.lng, c.lat));
    const sc = opportunity.place?.coordinates;
    const selfPoint = sc && withinBounds(sc.lng, sc.lat, MAP_BOUNDS) ? projectLngLat(sc.lng, sc.lat) : null;

    return { nearby, regional, markers, selfPoint };
  }, [pool, country, opportunity]);

  return (
    <section>
      <SectionHeader eyebrow="Location" title="Where this opportunity sits" />
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1.3fr] gap-4 md:gap-5">
        {/* Details + regional stats + nearby */}
        <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-6 flex flex-col">
          <div className="inline-flex items-center gap-2 text-navy-900">
            <MapPin className="h-5 w-5 text-gold-600 shrink-0" strokeWidth={2.2} />
            <span className="text-lg font-semibold">{cityLine}</span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat icon={Layers} label={`In ${country || "region"}`} value={String(regional.count)} />
            <Stat icon={TrendingUp} label="Raising" value={compactMoney(regional.capital)} />
            <Stat icon={Building2} label="Sponsors" value={String(regional.sponsors)} />
          </div>

          {nearby.length > 0 ? (
            <div className="mt-5 pt-5 border-t border-navy-900/[0.06]">
              <div className="text-[10px] uppercase tracking-[0.16em] text-navy-700/55 font-bold mb-2">Nearby opportunities</div>
              <ul className="space-y-1.5">
                {nearby.map((o) => (
                  <li key={o.id}>
                    <Link href={`/opportunity/${o.slug}`} className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-cream transition-colors">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold-500 shrink-0" />
                      <span className="text-sm font-medium text-navy-900 truncate group-hover:text-gold-700 transition-colors">{o.title}</span>
                      <span className="ml-auto text-xs text-navy-700/60 tabular-nums shrink-0">{capitalRequired(o)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <Link
            href="/map"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-gold-700 transition-colors"
          >
            Explore on the map
            <ArrowUpRight className="h-4 w-4 text-gold-600" strokeWidth={2.2} />
          </Link>
        </div>

        {/* Map preview */}
        <Link href="/map" aria-label="Open the interactive map" className="relative rounded-2xl overflow-hidden bg-navy-900 ring-1 ring-navy-900/[0.06] min-h-[240px] block group">
          <WorldMapSvg className="w-full h-full opacity-95" ariaLabel={`${opportunity.title} location`}>
            {markers.map((m, i) => (
              <circle key={i} cx={m.x} cy={m.y} r={4} fill="#D4AF37" opacity={0.5} />
            ))}
            {selfPoint ? (
              <g>
                <circle cx={selfPoint.x} cy={selfPoint.y} r={16} fill="#D4AF37" opacity={0.2} />
                <circle cx={selfPoint.x} cy={selfPoint.y} r={7} fill="#D4AF37" stroke="#0A1628" strokeWidth={1.5} />
              </g>
            ) : null}
          </WorldMapSvg>
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 to-transparent pointer-events-none" />
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-white bg-navy-900/70 ring-1 ring-white/15 rounded-full px-2.5 py-1 backdrop-blur">
            <MapPin className="h-3.5 w-3.5 text-gold-400" strokeWidth={2.4} />
            {opportunity.place?.country ?? opportunity.location}
          </span>
        </Link>
      </div>
    </section>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Layers; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-bone/50 ring-1 ring-navy-900/[0.05] p-3">
      <div className="text-[9px] uppercase tracking-[0.12em] text-navy-700/55 font-bold inline-flex items-center gap-1">
        <Icon className="h-2.5 w-2.5 text-gold-600 shrink-0" strokeWidth={2.2} />
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-navy-900 tabular-nums">{value}</div>
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-5">
      <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">{eyebrow}</div>
      <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">{title}</h2>
    </div>
  );
}
