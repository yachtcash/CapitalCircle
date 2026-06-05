import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import CategoryGrid from "@/components/CategoryGrid";
import MarketplaceSection from "@/components/MarketplaceSection";
import PopularSearches from "@/components/search/PopularSearches";
import { Star, Sparkles, Flame } from "lucide-react";
import {
  getFeaturedOpportunities,
  getRecentlyAddedOpportunities,
  getTrendingOpportunities,
} from "@/data/opportunities";

export default function Home() {
  const featured = getFeaturedOpportunities(3);
  const recentlyAdded = getRecentlyAddedOpportunities(3);
  const trending = getTrendingOpportunities(3);

  return (
    <div className="flex flex-col" id="opportunities">
      <Hero />
      <SearchBar />
      <PopularSearches />
      <CategoryGrid />

      <MarketplaceSection
        eyebrow="Featured This Week"
        title="Hand-picked opportunities"
        description="Editor's selection of standout deals — sponsor-vetted and ready for serious capital."
        opportunities={featured}
        ribbon="Featured"
        icon={Star}
        bg="white"
        ctaLabel="See all featured"
        ctaHref="/search?sort=featured"
        priorityFirstImage
      />

      <MarketplaceSection
        eyebrow="Just Listed"
        title="Recently added"
        description="Fresh deal flow from the past week — be among the first to engage."
        opportunities={recentlyAdded}
        ribbon="New"
        icon={Sparkles}
        bg="cream"
        ctaLabel="Browse all new"
        ctaHref="/search"
      />

      <MarketplaceSection
        eyebrow="Heating Up"
        title="Trending opportunities"
        description="Listings drawing the most member attention right now."
        opportunities={trending}
        ribbon="Trending"
        icon={Flame}
        bg="white"
        ctaLabel="See all trending"
        ctaHref="/search?sort=trending"
      />

      <ClosingBanner />
    </div>
  );
}

function ClosingBanner() {
  return (
    <section className="bg-navy-900 text-white">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-12 md:py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-gold-500 font-semibold">
            Have a deal worth circulating?
          </div>
          <h3 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight max-w-2xl">
            Create a listing in front of 1,200+ vetted members.
          </h3>
        </div>
        <a
          href="/create-listing"
          className="inline-flex items-center justify-center rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-6 py-3 text-sm transition-colors whitespace-nowrap"
        >
          Create a Listing
        </a>
      </div>
    </section>
  );
}
