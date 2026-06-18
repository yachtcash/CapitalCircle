"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Crown,
  Star,
  ChevronUp,
  ChevronDown,
  Trash2,
  MapPin,
  Building2,
  ArrowUpRight,
  FileText,
  GripVertical,
} from "lucide-react";

import type { Opportunity } from "@/data/opportunities";
import { getCompanyById } from "@/data/companies";
import { getListingByOpportunitySlug } from "@/data/listings";
import { publicOpportunityId } from "@/lib/opportunities/id";
import { useResolvedImage } from "@/lib/imageStore";
import { cn } from "@/lib/cn";

export function formatInvestment(o: Opportunity): string {
  const n = o.fundingAmount;
  if (typeof n === "number" && n > 0) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
    if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
    return `$${n.toLocaleString()}`;
  }
  return o.investmentRange || "On request";
}

export function PlacementBadge({ text, className }: { text: string; className?: string }) {
  const isHero = text === "Hero";
  const isFeatured = text.startsWith("Featured");
  return (
    <span
      className={cn(
        "inline-flex items-center text-[9px] uppercase tracking-[0.14em] font-bold rounded-full px-2 py-0.5 ring-1 whitespace-nowrap",
        isHero
          ? "bg-navy-900 text-gold-400 ring-navy-900"
          : isFeatured
            ? "bg-gold-500/20 text-gold-700 ring-gold-500/45"
            : "bg-navy-900/[0.05] text-navy-700 ring-navy-900/15",
        className
      )}
    >
      {text}
    </span>
  );
}

function IconBtn({
  onClick,
  label,
  href,
  children,
  disabled,
  tone = "default",
}: {
  onClick?: () => void;
  label: string;
  href?: string;
  children: React.ReactNode;
  disabled?: boolean;
  tone?: "default" | "gold" | "rose";
}) {
  const cls = cn(
    "inline-flex items-center justify-center h-7 w-7 rounded-lg ring-1 transition-colors shrink-0",
    disabled
      ? "text-navy-700/25 ring-navy-900/[0.05] cursor-not-allowed"
      : tone === "gold"
        ? "text-gold-700 ring-gold-500/40 hover:bg-gold-500/10"
        : tone === "rose"
          ? "text-rose-700 ring-rose-500/30 hover:bg-rose-500/10"
          : "text-navy-900 ring-navy-900/15 hover:bg-bone"
  );
  if (href) {
    return (
      <Link href={href} aria-label={label} title={label} className={cls} onClick={(e) => e.stopPropagation()}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label} className={cls}>
      {children}
    </button>
  );
}

function Thumb({ opportunity, className }: { opportunity: Opportunity; className?: string }) {
  const src = useResolvedImage(opportunity.images[0]);
  return (
    <div className={cn("relative bg-navy-900/5 overflow-hidden", className)}>
      {src ? <Image src={src} alt={opportunity.title} fill sizes="280px" className="object-cover" /> : null}
    </div>
  );
}

type Variant = "hero" | "featured" | "inventory";

export default function MarketplacePlacementCard({
  opportunity,
  variant,
  badge,
  onMakeHero,
  onAddFeatured,
  onRemoveFeatured,
  onRemoveHero,
  onUp,
  onDown,
  upDisabled,
  downDisabled,
  canFeature,
  dragging,
  ...drag
}: {
  opportunity: Opportunity;
  variant: Variant;
  badge: string;
  onMakeHero?: () => void;
  onAddFeatured?: () => void;
  onRemoveFeatured?: () => void;
  onRemoveHero?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  upDisabled?: boolean;
  downDisabled?: boolean;
  canFeature?: boolean;
  dragging?: boolean;
} & React.HTMLAttributes<HTMLElement> & { draggable?: boolean }) {
  const company = getCompanyById(opportunity.companyId);
  const listing = getListingByOpportunitySlug(opportunity.slug);
  const sponsor = company?.name ?? opportunity.postedBy;

  // Shared meta + action toolbar
  const actions = (
    <div className="flex items-center gap-1 flex-wrap">
      {onMakeHero ? (
        <IconBtn onClick={onMakeHero} label="Make Hero" tone="gold">
          <Crown className="h-3.5 w-3.5" strokeWidth={2.2} />
        </IconBtn>
      ) : null}
      {onAddFeatured ? (
        <IconBtn onClick={onAddFeatured} label={canFeature ? "Add to Featured" : "Featured is full"} disabled={!canFeature} tone="gold">
          <Star className="h-3.5 w-3.5" strokeWidth={2.2} />
        </IconBtn>
      ) : null}
      {onUp ? (
        <IconBtn onClick={onUp} label="Move up" disabled={upDisabled}>
          <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.4} />
        </IconBtn>
      ) : null}
      {onDown ? (
        <IconBtn onClick={onDown} label="Move down" disabled={downDisabled}>
          <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.4} />
        </IconBtn>
      ) : null}
      {onRemoveFeatured ? (
        <IconBtn onClick={onRemoveFeatured} label="Remove from Featured" tone="rose">
          <Trash2 className="h-3.5 w-3.5" strokeWidth={2.2} />
        </IconBtn>
      ) : null}
      <IconBtn href={`/opportunity/${opportunity.slug}`} label="Open opportunity">
        <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.2} />
      </IconBtn>
      {listing ? (
        <IconBtn href={`/dashboard/listings/${listing.id}`} label="View listing">
          <FileText className="h-3.5 w-3.5" strokeWidth={2.2} />
        </IconBtn>
      ) : null}
    </div>
  );

  // ---- HERO variant: large, gold border, highlighted ----
  if (variant === "hero") {
    return (
      <article
        {...drag}
        className={cn(
          "rounded-2xl ring-2 ring-gold-500/55 bg-gold-500/[0.05] p-4 cursor-grab active:cursor-grabbing transition-shadow",
          dragging ? "opacity-40" : "shadow-md shadow-gold-500/10"
        )}
      >
        <Thumb opportunity={opportunity} className="rounded-xl w-full aspect-[16/10]" />
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <PlacementBadge text="Hero" />
          <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-navy-700/55 tabular-nums">{publicOpportunityId(opportunity)}</span>
          <span className="ml-auto text-[10px] uppercase tracking-[0.1em] font-bold text-gold-700">{opportunity.category}</span>
        </div>
        <h4 className="mt-1.5 text-lg font-semibold text-navy-900 leading-snug">{opportunity.title}</h4>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <Meta icon={Building2} label="Sponsor" value={sponsor} />
          <Meta icon={MapPin} label="Location" value={opportunity.place?.country ?? opportunity.location} />
        </div>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="text-lg font-semibold text-navy-900 tabular-nums">{formatInvestment(opportunity)}</span>
          <StatusPill status={opportunity.status} />
          <span className="text-[10px] text-navy-700/45 ml-auto">Listed {opportunity.postedAt?.slice(0, 10)}</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          {actions}
          {onRemoveHero ? (
            <button type="button" onClick={onRemoveHero} className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-rose-500/40 hover:bg-rose-500/10 text-rose-700 font-semibold px-3 py-1.5 text-xs transition-colors">
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2.2} /> Remove Hero
            </button>
          ) : null}
        </div>
      </article>
    );
  }

  // ---- FEATURED + INVENTORY: compact horizontal cards ----
  const compact = variant === "featured";
  return (
    <article
      {...drag}
      className={cn(
        "rounded-xl bg-white ring-1 p-2.5 cursor-grab active:cursor-grabbing transition-all",
        variant === "featured" ? "ring-gold-500/30" : "ring-navy-900/[0.06] hover:ring-navy-900/15",
        dragging ? "opacity-40" : ""
      )}
    >
      <div className="flex gap-2.5">
        <span className="self-center text-navy-700/25 shrink-0">
          <GripVertical className="h-4 w-4" strokeWidth={2} />
        </span>
        <Thumb opportunity={opportunity} className={cn("rounded-lg shrink-0", compact ? "h-12 w-12" : "h-14 w-14")} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <PlacementBadge text={badge} />
            <span className="text-[9px] uppercase tracking-[0.12em] font-bold text-navy-700/50 tabular-nums">{publicOpportunityId(opportunity)}</span>
          </div>
          <div className="mt-0.5 text-[13px] font-semibold text-navy-900 leading-snug truncate">{opportunity.title}</div>
          {!compact ? (
            <div className="text-[10px] uppercase tracking-[0.1em] font-semibold text-gold-700 truncate">{opportunity.category}</div>
          ) : null}
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-navy-700/65 truncate">
            <span className="font-semibold text-navy-900 tabular-nums">{formatInvestment(opportunity)}</span>
            <span className="text-navy-700/25">·</span>
            <span className="truncate">{opportunity.status}</span>
            {!compact ? (
              <>
                <span className="text-navy-700/25">·</span>
                <span className="truncate">{sponsor}</span>
              </>
            ) : null}
          </div>
          {!compact ? (
            <div className="mt-0.5 text-[10px] text-navy-700/45 truncate">
              {opportunity.place?.country ?? opportunity.location} · Listed {opportunity.postedAt?.slice(0, 10)}
            </div>
          ) : null}
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-navy-900/[0.05]">{actions}</div>
    </article>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/70 ring-1 ring-navy-900/[0.05] px-2 py-1 min-w-0">
      <div className="text-[8px] uppercase tracking-[0.12em] text-navy-700/55 font-bold inline-flex items-center gap-1">
        <Icon className="h-2.5 w-2.5 text-gold-600" strokeWidth={2.2} />
        {label}
      </div>
      <div className="text-[11px] font-semibold text-navy-900 truncate">{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className="text-[9px] uppercase tracking-[0.12em] font-bold rounded-full px-2 py-0.5 ring-1 bg-navy-900/[0.05] text-navy-700 ring-navy-900/10">
      {status}
    </span>
  );
}
