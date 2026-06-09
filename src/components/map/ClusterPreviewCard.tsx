"use client";

import Image from "next/image";
import Link from "next/link";
import { X, ChevronRight, Layers, MapPin } from "lucide-react";
import type { MapCluster } from "@/lib/map/types";
import type { Opportunity } from "@/data/opportunities";
import { publicOpportunityId } from "@/lib/opportunities/id";

type Props = {
  cluster: MapCluster;
  onPickOpportunity: (opp: Opportunity) => void;
  onClose: () => void;
};

/**
 * Floating panel for a clustered set of map markers.
 *
 * Lists every opportunity in the cluster as a row; clicking a row pops the
 * single-opportunity `MarkerPreviewCard` for it. Closing the panel returns
 * the map to its un-selected state. Replaces the prior behavior where only
 * the first marker's opportunity was reachable.
 */
export default function ClusterPreviewCard({
  cluster,
  onPickOpportunity,
  onClose,
}: Props) {
  return (
    <article className="bg-white rounded-2xl ring-1 ring-navy-900/[0.08] shadow-xl shadow-navy-900/15 overflow-hidden w-[280px]">
      <header className="flex items-center justify-between gap-2 px-4 py-3 bg-navy-900 text-white">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-gold-400 font-bold">
            <Layers className="h-3 w-3" strokeWidth={2.4} />
            Cluster
          </div>
          <div className="mt-1 text-sm font-semibold leading-snug">
            {cluster.markers.length} opportunities here
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close cluster preview"
          className="shrink-0 h-7 w-7 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.4} />
        </button>
      </header>

      <ul className="max-h-[280px] overflow-y-auto divide-y divide-navy-900/[0.06]">
        {cluster.markers.map(({ opportunity }) => {
          const id = publicOpportunityId(opportunity);
          return (
            <li key={opportunity.id}>
              <button
                type="button"
                onClick={() => onPickOpportunity(opportunity)}
                className="w-full text-left flex items-center gap-3 px-3 py-2.5 hover:bg-bone/60 transition-colors group"
              >
                <div className="relative h-10 w-12 shrink-0 rounded-md overflow-hidden bg-navy-900/5 ring-1 ring-navy-900/[0.05]">
                  <Image
                    src={opportunity.images[0]}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-navy-900 truncate group-hover:text-gold-700 transition-colors">
                    {opportunity.title}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-navy-700/65">
                    <MapPin
                      className="h-2.5 w-2.5 text-gold-600 shrink-0"
                      strokeWidth={2.4}
                    />
                    <span className="truncate">{opportunity.location}</span>
                  </div>
                  <div className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-navy-700/45 font-semibold tabular-nums">
                    {id}
                  </div>
                </div>
                <ChevronRight
                  className="h-3.5 w-3.5 text-navy-700/40 group-hover:text-gold-700 transition-colors shrink-0"
                  strokeWidth={2.4}
                />
              </button>
            </li>
          );
        })}
      </ul>

      <footer className="px-4 py-2.5 bg-bone/40 text-[10px] text-navy-700/60 leading-snug">
        Tip — zoom in by tightening filters from the list panel to break a
        cluster apart on the map.
        <span className="hidden sm:inline">
          {" "}
          <Link href="/opportunities" className="font-semibold text-navy-900 hover:text-gold-700">
            Browse directory
          </Link>
        </span>
      </footer>
    </article>
  );
}
