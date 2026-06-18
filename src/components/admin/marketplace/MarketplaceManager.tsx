"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Crown,
  Star,
  Search,
  X,
  ChevronUp,
  ChevronDown,
  GripVertical,
  MapPin,
  Building2,
  ArrowUpRight,
  Trash2,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { featuredOpportunities, type Opportunity } from "@/data/opportunities";
import { getCompanyById } from "@/data/companies";
import { publicOpportunityId } from "@/lib/opportunities/id";
import { useResolvedImage } from "@/lib/imageStore";
import {
  MAX_FEATURED,
  placementLabel,
  placementRank,
} from "@/lib/marketplace/placement";
import { AdminPage } from "@/components/admin/AdminShell";
import { cn } from "@/lib/cn";

function money(o: Opportunity): string {
  const n = o.fundingAmount;
  if (typeof n === "number" && n > 0) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
    if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
    return `$${n.toLocaleString()}`;
  }
  return o.investmentRange || "On request";
}

export default function MarketplaceManager() {
  const {
    marketplacePlacement: placement,
    setMarketplaceHero,
    setMarketplaceFeatured,
    setMarketplaceOrder,
    userOpportunities,
    hydrated,
  } = useMessaging();

  const allOpps = useMemo(
    () => (hydrated ? [...userOpportunities, ...featuredOpportunities] : featuredOpportunities),
    [userOpportunities, hydrated]
  );
  const byId = useMemo(() => new Map(allOpps.map((o) => [o.id, o])), [allOpps]);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dragId, setDragId] = useState<string | null>(null);

  // ---- Derived sections ----
  const hero = placement.heroId ? byId.get(placement.heroId) ?? null : null;
  const featured = useMemo(
    () => placement.featuredIds.map((id) => byId.get(id)).filter((o): o is Opportunity => !!o && o.id !== placement.heroId),
    [placement.featuredIds, placement.heroId, byId]
  );
  const placedIds = useMemo(
    () => new Set<string>([...(hero ? [hero.id] : []), ...featured.map((o) => o.id)]),
    [hero, featured]
  );

  const categories = useMemo(
    () => [...new Set(allOpps.map((o) => o.category))].sort(),
    [allOpps]
  );

  const remaining = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allOpps
      .filter((o) => !placedIds.has(o.id))
      .filter((o) => {
        if (statusFilter !== "all" && o.status !== statusFilter) return false;
        if (categoryFilter !== "all" && o.category !== categoryFilter) return false;
        if (!q) return true;
        const company = getCompanyById(o.companyId);
        const hay = [
          o.title,
          publicOpportunityId(o),
          company?.name ?? "",
          o.postedBy,
          o.category,
          o.location,
          o.place?.country ?? "",
          o.dealType,
          o.status,
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => placementRank(a.id, placement) - placementRank(b.id, placement));
  }, [allOpps, placedIds, query, statusFilter, categoryFilter, placement]);

  // ---- Operations ----
  const makeHero = (id: string) => setMarketplaceHero(id, byId.get(id)?.title);
  const removeHero = () => setMarketplaceHero(null);
  const addFeatured = (id: string) => {
    if (placement.featuredIds.includes(id)) return;
    if (featured.length >= MAX_FEATURED) return;
    setMarketplaceFeatured([...placement.featuredIds, id], byId.get(id)?.title);
  };
  const removeFeatured = (id: string) =>
    setMarketplaceFeatured(placement.featuredIds.filter((x) => x !== id), byId.get(id)?.title);
  const insertFeaturedAt = (id: string, index: number) => {
    const without = placement.featuredIds.filter((x) => x !== id);
    without.splice(Math.max(0, Math.min(index, without.length)), 0, id);
    setMarketplaceFeatured(without, byId.get(id)?.title);
  };
  const moveFeatured = (id: string, dir: -1 | 1) => {
    const ids = [...placement.featuredIds];
    const i = ids.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    setMarketplaceFeatured(ids, byId.get(id)?.title);
  };
  const moveMarketplace = (id: string, dir: -1 | 1) => {
    const ids = remaining.map((o) => o.id);
    const i = ids.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    setMarketplaceOrder(ids);
  };
  const demote = (id: string) => {
    if (placement.heroId === id) setMarketplaceHero(null);
    else if (placement.featuredIds.includes(id)) removeFeatured(id);
  };

  const onDropTo = (handler: (id: string) => void) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragId) handler(dragId);
    setDragId(null);
  };
  const allowDrop = (e: React.DragEvent) => e.preventDefault();

  const totalOrdered = (placement.heroId ? 1 : 0) + placement.featuredIds.length + placement.order.length;

  return (
    <AdminPage
      title="Marketplace Placement"
      subtitle="Editorial control over what investors see first. Drag opportunities between Hero, Featured, and Marketplace — or use the controls on each card. Changes save instantly and are audited."
    >
      {/* ---- HERO ---- */}
      <SectionLabel icon={Crown} title="Hero Opportunity" hint="Exactly one. Appears at the very top of the Opportunities page." />
      <div
        onDragOver={allowDrop}
        onDrop={onDropTo(makeHero)}
        className={cn(
          "rounded-2xl ring-1 transition-colors",
          dragId ? "ring-gold-500/50 bg-gold-500/[0.04]" : "ring-navy-900/[0.06] bg-white"
        )}
      >
        {hero ? (
          <HeroCard opportunity={hero} onRemove={removeHero} draggable onDragStart={() => setDragId(hero.id)} onDragEnd={() => setDragId(null)} />
        ) : (
          <div className="p-8 text-center">
            <Crown className="h-6 w-6 mx-auto text-navy-700/35" strokeWidth={1.9} />
            <p className="mt-2 text-sm font-semibold text-navy-900">No hero selected</p>
            <p className="mt-1 text-xs text-navy-700/60">
              Drag an opportunity here, or use “Make Hero” on any card below. The marketplace falls
              back to the top Featured opportunity until one is set.
            </p>
          </div>
        )}
      </div>

      {/* ---- FEATURED ---- */}
      <SectionLabel
        icon={Star}
        title="Featured Opportunities"
        hint={`Up to ${MAX_FEATURED}, manually ordered. Position 1 shows first.`}
        className="mt-7"
      />
      <div
        onDragOver={allowDrop}
        onDrop={onDropTo(addFeatured)}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3"
      >
        {Array.from({ length: MAX_FEATURED }).map((_, slot) => {
          const o = featured[slot];
          return (
            <div
              key={slot}
              onDragOver={allowDrop}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (dragId) insertFeaturedAt(dragId, slot);
                setDragId(null);
              }}
              className={cn(
                "rounded-xl ring-1 min-h-[92px]",
                o ? "ring-navy-900/[0.06] bg-white" : "ring-dashed ring-navy-900/15 bg-bone/40 border border-dashed border-navy-900/15"
              )}
            >
              {o ? (
                <FeaturedCard
                  opportunity={o}
                  pos={slot}
                  count={featured.length}
                  onRemove={() => removeFeatured(o.id)}
                  onUp={() => moveFeatured(o.id, -1)}
                  onDown={() => moveFeatured(o.id, 1)}
                  onMakeHero={() => makeHero(o.id)}
                  draggable
                  onDragStart={() => setDragId(o.id)}
                  onDragEnd={() => setDragId(null)}
                />
              ) : (
                <div className="h-full min-h-[92px] flex items-center justify-center text-[11px] uppercase tracking-[0.14em] font-bold text-navy-700/40">
                  Featured #{slot + 1}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ---- MARKETPLACE INVENTORY ---- */}
      <SectionLabel
        icon={GripVertical}
        title="Marketplace Inventory"
        hint="Everything else, in display order. Drag up to Featured or Hero, or reorder."
        className="mt-7"
      />

      {/* Search + filters */}
      <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-3 md:p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-700/50" strokeWidth={2} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, OPP ID, company, sponsor, category, location, deal type, status…"
            className="w-full rounded-full bg-bone/60 ring-1 ring-navy-900/[0.06] focus:ring-2 focus:ring-gold-500 outline-none pl-9 pr-9 py-2 text-sm text-navy-900 placeholder:text-navy-700/45"
          />
          {query ? (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear" className="absolute right-2.5 top-1/2 -translate-y-1/2 h-6 w-6 inline-flex items-center justify-center rounded-full hover:bg-bone text-navy-700/55">
              <X className="h-3.5 w-3.5" strokeWidth={2.4} />
            </button>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onChange={setStatusFilter} options={["all", "Open", "Seeking Capital", "Negotiating", "Under Contract", "Closed"]} allLabel="All statuses" />
          <Select value={categoryFilter} onChange={setCategoryFilter} options={["all", ...categories]} allLabel="All categories" />
          <span className="ml-auto text-[11px] uppercase tracking-[0.12em] font-bold text-navy-700/55">
            {remaining.length} in marketplace · {totalOrdered} curated
          </span>
        </div>
      </div>

      {/* Inventory list = drop zone for demotion */}
      <div
        onDragOver={allowDrop}
        onDrop={onDropTo(demote)}
        className={cn("mt-3 rounded-2xl ring-1 transition-colors", dragId ? "ring-navy-900/20 bg-navy-900/[0.02]" : "ring-transparent")}
      >
        {remaining.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {remaining.map((o, i) => (
              <InventoryCard
                key={o.id}
                opportunity={o}
                index={i}
                count={remaining.length}
                placementText={placementLabel(o.id, placement)}
                canFeature={featured.length < MAX_FEATURED}
                onMakeHero={() => makeHero(o.id)}
                onAddFeatured={() => addFeatured(o.id)}
                onUp={() => moveMarketplace(o.id, -1)}
                onDown={() => moveMarketplace(o.id, 1)}
                draggable
                onDragStart={() => setDragId(o.id)}
                onDragEnd={() => setDragId(null)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-8 text-center text-sm text-navy-700/60">
            No opportunities match these filters.
          </div>
        )}
      </div>
    </AdminPage>
  );
}

// ---- Sub-components ----

function SectionLabel({ icon: Icon, title, hint, className }: { icon: typeof Crown; title: string; hint: string; className?: string }) {
  return (
    <div className={cn("mb-2.5", className)}>
      <h3 className="text-sm font-semibold text-navy-900 inline-flex items-center gap-1.5">
        <Icon className="h-4 w-4 text-gold-600" strokeWidth={2.2} />
        {title}
      </h3>
      <p className="text-[11px] text-navy-700/55 mt-0.5">{hint}</p>
    </div>
  );
}

function PlacementBadge({ text }: { text: string }) {
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
            : "bg-navy-900/[0.05] text-navy-700 ring-navy-900/15"
      )}
    >
      {text}
    </span>
  );
}

function Thumb({ opportunity, className }: { opportunity: Opportunity; className?: string }) {
  const src = useResolvedImage(opportunity.images[0]);
  return (
    <div className={cn("relative bg-navy-900/5 overflow-hidden", className)}>
      {src ? <Image src={src} alt={opportunity.title} fill sizes="200px" className="object-cover" /> : null}
    </div>
  );
}

function IconBtn({ onClick, label, children, disabled, tone = "default" }: { onClick: () => void; label: string; children: React.ReactNode; disabled?: boolean; tone?: "default" | "gold" | "rose" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center h-7 w-7 rounded-lg ring-1 transition-colors shrink-0",
        disabled
          ? "text-navy-700/25 ring-navy-900/[0.05] cursor-not-allowed"
          : tone === "gold"
            ? "text-gold-700 ring-gold-500/40 hover:bg-gold-500/10"
            : tone === "rose"
              ? "text-rose-700 ring-rose-500/30 hover:bg-rose-500/10"
              : "text-navy-900 ring-navy-900/15 hover:bg-bone"
      )}
    >
      {children}
    </button>
  );
}

function HeroCard({ opportunity, onRemove, ...drag }: { opportunity: Opportunity; onRemove: () => void } & React.HTMLAttributes<HTMLDivElement> & { draggable?: boolean }) {
  const company = getCompanyById(opportunity.companyId);
  return (
    <article {...drag} className="flex flex-col sm:flex-row gap-4 p-4 cursor-grab active:cursor-grabbing">
      <Thumb opportunity={opportunity} className="rounded-xl w-full sm:w-56 aspect-[16/10] sm:aspect-auto sm:h-36 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <PlacementBadge text="Hero" />
          <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-navy-700/55 tabular-nums">{publicOpportunityId(opportunity)}</span>
        </div>
        <h4 className="mt-1 text-lg font-semibold text-navy-900 leading-snug">{opportunity.title}</h4>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-navy-700/70 flex-wrap">
          <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />{company?.name ?? opportunity.postedBy}</span>
          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />{opportunity.place?.country ?? opportunity.location}</span>
        </div>
        <div className="mt-2 flex items-center gap-3 flex-wrap">
          <span className="text-base font-semibold text-navy-900 tabular-nums">{money(opportunity)}</span>
          <span className="text-[10px] uppercase tracking-[0.12em] font-bold rounded-full px-2 py-0.5 ring-1 bg-navy-900/[0.05] text-navy-700 ring-navy-900/10">{opportunity.status}</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Link href={`/opportunity/${opportunity.slug}`} className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:text-gold-600">
            View <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.2} />
          </Link>
          <button type="button" onClick={onRemove} className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-rose-500/40 hover:bg-rose-500/10 text-rose-700 font-semibold px-3 py-1.5 text-xs transition-colors">
            <X className="h-3.5 w-3.5" strokeWidth={2.4} /> Remove Hero
          </button>
        </div>
      </div>
    </article>
  );
}

function FeaturedCard({ opportunity, pos, count, onRemove, onUp, onDown, onMakeHero, ...drag }: { opportunity: Opportunity; pos: number; count: number; onRemove: () => void; onUp: () => void; onDown: () => void; onMakeHero: () => void } & React.HTMLAttributes<HTMLElement> & { draggable?: boolean }) {
  return (
    <article {...drag} className="flex gap-2.5 p-2.5 cursor-grab active:cursor-grabbing">
      <Thumb opportunity={opportunity} className="rounded-lg h-14 w-14 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <PlacementBadge text={`Featured #${pos + 1}`} />
        </div>
        <div className="mt-0.5 text-sm font-semibold text-navy-900 truncate">{opportunity.title}</div>
        <div className="text-[11px] text-navy-700/60 truncate">{money(opportunity)} · {opportunity.status}</div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="flex gap-1">
          <IconBtn onClick={onUp} label="Move up" disabled={pos === 0}><ChevronUp className="h-3.5 w-3.5" strokeWidth={2.4} /></IconBtn>
          <IconBtn onClick={onDown} label="Move down" disabled={pos >= count - 1}><ChevronDown className="h-3.5 w-3.5" strokeWidth={2.4} /></IconBtn>
        </div>
        <div className="flex gap-1">
          <IconBtn onClick={onMakeHero} label="Make Hero" tone="gold"><Crown className="h-3.5 w-3.5" strokeWidth={2.2} /></IconBtn>
          <IconBtn onClick={onRemove} label="Remove from Featured" tone="rose"><Trash2 className="h-3.5 w-3.5" strokeWidth={2.2} /></IconBtn>
        </div>
      </div>
    </article>
  );
}

function InventoryCard({ opportunity, index, count, placementText, canFeature, onMakeHero, onAddFeatured, onUp, onDown, ...drag }: { opportunity: Opportunity; index: number; count: number; placementText: string; canFeature: boolean; onMakeHero: () => void; onAddFeatured: () => void; onUp: () => void; onDown: () => void } & React.HTMLAttributes<HTMLElement> & { draggable?: boolean }) {
  const company = getCompanyById(opportunity.companyId);
  return (
    <article {...drag} className="flex gap-3 p-3 rounded-xl bg-white ring-1 ring-navy-900/[0.06] hover:ring-navy-900/15 transition-colors cursor-grab active:cursor-grabbing">
      <Thumb opportunity={opportunity} className="rounded-lg h-16 w-16 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-navy-700/55 tabular-nums">{publicOpportunityId(opportunity)}</span>
          <PlacementBadge text={placementText} />
        </div>
        <div className="mt-0.5 text-sm font-semibold text-navy-900 leading-snug truncate">{opportunity.title}</div>
        <div className="text-[11px] uppercase tracking-[0.1em] font-semibold text-gold-700 truncate">{opportunity.category}</div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-navy-700/65 truncate">
          <span className="font-semibold text-navy-900 tabular-nums">{money(opportunity)}</span>
          <span className="text-navy-700/30">·</span>
          <span className="truncate">{company?.name ?? opportunity.postedBy}</span>
          <span className="text-navy-700/30">·</span>
          <span>{opportunity.status}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-navy-700/45">
          <span>{opportunity.place?.country ?? opportunity.location}</span>
          <span className="text-navy-700/25">·</span>
          <span>{opportunity.postedAt?.slice(0, 10)}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        <IconBtn onClick={onMakeHero} label="Make Hero" tone="gold"><Crown className="h-3.5 w-3.5" strokeWidth={2.2} /></IconBtn>
        <IconBtn onClick={onAddFeatured} label={canFeature ? "Add to Featured" : "Featured is full"} disabled={!canFeature} tone="gold"><Star className="h-3.5 w-3.5" strokeWidth={2.2} /></IconBtn>
        <div className="flex gap-1">
          <IconBtn onClick={onUp} label="Move up" disabled={index === 0}><ChevronUp className="h-3.5 w-3.5" strokeWidth={2.4} /></IconBtn>
          <IconBtn onClick={onDown} label="Move down" disabled={index >= count - 1}><ChevronDown className="h-3.5 w-3.5" strokeWidth={2.4} /></IconBtn>
        </div>
      </div>
    </article>
  );
}

function Select({ value, onChange, options, allLabel }: { value: string; onChange: (v: string) => void; options: string[]; allLabel: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full bg-white ring-1 ring-navy-900/[0.1] hover:ring-navy-900/25 text-navy-900 text-xs font-semibold px-3 py-1.5 outline-none focus:ring-2 focus:ring-gold-500 [&>option]:text-navy-900"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o === "all" ? allLabel : o}
        </option>
      ))}
    </select>
  );
}
