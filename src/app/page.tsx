import HomeHero from "@/components/home/HomeHero";
import MarketStatsStrip from "@/components/home/MarketStatsStrip";
import FeaturedOpportunities from "@/components/home/FeaturedOpportunities";
import RecentOpportunities from "@/components/home/RecentOpportunities";
import SponsorShowcase from "@/components/home/SponsorShowcase";
import MarketActivity from "@/components/home/MarketActivity";
import InvestmentCategories from "@/components/home/InvestmentCategories";
import HomeMapPreview from "@/components/home/HomeMapPreview";
import WhyInvestorsJoin from "@/components/home/WhyInvestorsJoin";
import FinalCta from "@/components/home/FinalCta";

export default function Home() {
  return (
    <div className="flex flex-col" id="opportunities">
      <HomeHero />
      <MarketStatsStrip />
      <FeaturedOpportunities />
      <RecentOpportunities />
      <SponsorShowcase />
      <MarketActivity />
      <InvestmentCategories />
      <HomeMapPreview />
      <WhyInvestorsJoin />
      <FinalCta />
    </div>
  );
}
