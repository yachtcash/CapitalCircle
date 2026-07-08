import Link from "next/link";
import { ArrowRight } from "lucide-react";
import OpportunityCard from "@/components/OpportunityCard";
import type { DirectoryCollection } from "@/data/opportunities/collections";
import { getCollectionOpportunities } from "@/data/opportunities/collections";

type Props = {
  collection: DirectoryCollection;
};

export default function CollectionRow({ collection }: Props) {
  const items = getCollectionOpportunities(collection);
  if (items.length === 0) return null;

  return (
    <section className="bg-cream">
      <div className="max-w-7xl mx-auto px-5 md:px-10 pt-6 md:pt-8 pb-2">
        <header className="flex items-end justify-between gap-3 mb-3">
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-navy-900 tracking-tight">
              {collection.title}
              <span className="ml-2 text-xs font-normal text-navy-700/55">
                · {items.length}
              </span>
            </h3>
            <p className="mt-0.5 text-sm text-navy-700/65">{collection.description}</p>
          </div>
          <Link
            href={`/opportunities?${collection.query}`}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-gold-700 transition-colors group whitespace-nowrap"
          >
            View all
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              strokeWidth={2.2}
            />
          </Link>
        </header>

        <div className="-mx-5 md:-mx-10 px-5 md:px-10 overflow-x-auto snap-x snap-mandatory pb-3">
          <div className="flex gap-4 md:gap-5">
            {items.map((opportunity) => (
              <div
                key={opportunity.id}
                className="snap-start shrink-0 w-[280px] sm:w-[320px] md:w-[360px]"
              >
                <OpportunityCard
                  opportunity={opportunity}
                  showPublicId
                  ribbon={collection.ribbon ?? null}
                />
              </div>
            ))}
            {/* Spacer so the last card has visual breathing room */}
            <div className="shrink-0 w-1" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
