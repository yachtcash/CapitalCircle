import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import type { Opportunity } from "@/data/opportunities";
import OpportunityCard from "./OpportunityCard";
import { cn } from "@/lib/cn";

type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  opportunities: Opportunity[];
  ribbon?: "Featured" | "Trending" | "New";
  icon?: LucideIcon;
  bg?: "white" | "cream";
  ctaLabel?: string;
  ctaHref?: string;
  priorityFirstImage?: boolean;
};

export default function MarketplaceSection({
  eyebrow,
  title,
  description,
  opportunities,
  ribbon,
  icon: Icon,
  bg = "white",
  ctaLabel,
  ctaHref,
  priorityFirstImage = false,
}: Props) {
  if (opportunities.length === 0) return null;

  return (
    <section className={cn(bg === "cream" ? "bg-cream" : "bg-white")}>
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-12 md:py-16">
        <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
              {Icon ? <Icon className="h-3.5 w-3.5" strokeWidth={2.2} /> : null}
              {eyebrow}
            </div>
            <h2 className="mt-1.5 text-2xl md:text-3xl font-semibold text-navy-900 tracking-tight">
              {title}
            </h2>
            {description ? (
              <p className="mt-2 text-sm md:text-base text-navy-700/70 leading-relaxed max-w-2xl">
                {description}
              </p>
            ) : null}
          </div>
          {ctaLabel && ctaHref ? (
            <Link
              href={ctaHref}
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-gold-600 transition-colors group whitespace-nowrap"
            >
              {ctaLabel}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2.2}
              />
            </Link>
          ) : null}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {opportunities.map((opportunity, i) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              priority={priorityFirstImage && i === 0}
              ribbon={ribbon ?? null}
            />
          ))}
        </div>

        {ctaLabel && ctaHref ? (
          <div className="mt-8 sm:hidden">
            <Link
              href={ctaHref}
              className="flex items-center justify-center gap-1.5 w-full rounded-full bg-navy-900 text-white text-sm font-semibold py-3"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
