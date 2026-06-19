"use client";

import { useMemo, useState } from "react";
import {
  Crown,
  Star,
  Store,
  Search,
  X,
  Clock3,
  LayoutGrid,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { featuredOpportunities, type Opportunity } from "@/data/opportunities";
import { getCompanyById } from "@/data/companies";
import { publicOpportunityId } from "@/lib/opportunities/id";
import { MAX_FEATURED, placementLabel, placementRank } from "@/lib/marketplace/placement";
import { getFeaturedOpportunityOfTheWeek } from "@/data/opportunities/collections";
import type { AuditAction } from "@/data/audit";
import { AdminPage } from "@/components/admin/AdminShell";
import MarketplacePlacementCard, { formatInvestment } from "./MarketplacePlacementCard";
import MarketplacePreview from "./MarketplacePreview";
import { cn } from "@/lib/cn";

type Col = "hero" | "featured" | "marketplace";
type SortKey = "order" | "newest" | "funding" | "az";

const FUNDING_BUCKETS = [
  { key: "all", label: "All funding" },
  { key: "<1m", label: "Under $1M" },
  { key: "1-10m", label: "$1M – $10M" },
  { key: "10-50m", label: "$10M – $50M" },
  { key: "50m+", label: "$50M+" },
];
function inFunding(o: Opportunity, key: string): boolean {
  const n = o.fundingAmount || 0;
  switch (key) {
    case "<1m": return n > 0 && n < 1_000_000;
    case "1-10m": return n >= 1_000_000 && n < 10_000_000;
    case "10-50m": return n >= 10_000_000 && n < 50_000_000;
    case "50m+": return n >= 50_000_000;
    default: return true;
  }
}

export default function MarketplaceManager() {
  const { marketplacePlacement: placement, applyMarketplacePlacement, userOpportunities, hydrated } = useMessaging();

  const allOpps = useMemo(
    () => (hydrated ? [...userOpportunities, ...featuredOpportunities] : featuredOpportunities),
    [userOpportunities, hydrated]
  );
  const byId = useMemo(() => new Map(allOpps.map((o) => [o.id, o])), [allOpps]);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [fundingFilter, setFundingFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("order");

  // Drag state for premium visual feedback.
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Col | null>(null);
  const [featuredDropIndex, setFeaturedDropIndex] = useState<number | null>(null);

  const hero = placement.heroId ? byId.get(placement.heroId) ?? null : null;
  const featured = useMemo(
    () => placement.featuredIds.map((id) => byId.get(id)).filter((o): o is Opportunity => !!o && o.id !== placement.heroId),
    [placement.featuredIds, placement.heroId, byId]
  );
  // Cap math counts the PERSISTED slots (excluding the hero), not the filtered
  // render list. A featured id whose opportunity was deleted still occupies a
  // slot in state, so guarding on `featured.length` would let a no-op add slip
  // through (the central mutation slices it back off, losing the new id).
  const featuredCount = useMemo(
    () => placement.featuredIds.filter((id) => id !== placement.heroId).length,
    [placement.featuredIds, placement.heroId]
  );
  const placedIds = useMemo(
    () => new Set<string>([...(hero ? [hero.id] : []), ...featured.map((o) => o.id)]),
    [hero, featured]
  );

  const categories = useMemo(() => [...new Set(allOpps.map((o) => o.category))].sort(), [allOpps]);
  const countries = useMemo(
    () => [...new Set(allOpps.map((o) => o.place?.country).filter((c): c is string => !!c))].sort(),
    [allOpps]
  );

  // Full marketplace (unplaced) in persisted display order — reorders write to this.
  const fullRemaining = useMemo(
    () =>
      allOpps
        .filter((o) => !placedIds.has(o.id))
        .sort((a, b) => placementRank(a.id, placement) - placementRank(b.id, placement)),
    [allOpps, placedIds, placement]
  );

  // Filtered + sorted view of the inventory.
  const remaining = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = fullRemaining.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (categoryFilter !== "all" && o.category !== categoryFilter) return false;
      if (countryFilter !== "all" && (o.place?.country ?? "") !== countryFilter) return false;
      if (!inFunding(o, fundingFilter)) return false;
      if (!q) return true;
      const company = getCompanyById(o.companyId);
      const hay = [o.title, publicOpportunityId(o), company?.name ?? "", o.postedBy, o.category, o.location, o.place?.country ?? "", o.dealType, o.status, formatInvestment(o)]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
    if (sortKey === "newest") return [...list].sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt));
    if (sortKey === "funding") return [...list].sort((a, b) => (b.fundingAmount || 0) - (a.fundingAmount || 0));
    if (sortKey === "az") return [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list; // "order" — persisted placement order
  }, [fullRemaining, query, statusFilter, categoryFilter, countryFilter, fundingFilter, sortKey]);

  // ---- Atomic operations (all via applyMarketplacePlacement) ----
  const apply = (next: { heroId: string | null; featuredIds: string[]; order: string[] }, action: AuditAction, targetId?: string, label?: string, detail?: string) =>
    applyMarketplacePlacement(next, { action, targetId, label, detail });

  const makeHero = (o: Opportunity) =>
    apply({ heroId: o.id, featuredIds: placement.featuredIds.filter((x) => x !== o.id), order: placement.order }, "Marketplace Hero Assigned", o.id, o.title, `Hero → ${o.title}`);
  const removeHero = () =>
    apply({ heroId: null, featuredIds: placement.featuredIds, order: placement.order }, "Marketplace Hero Removed", placement.heroId ?? undefined);
  const addFeatured = (o: Opportunity) => {
    if (placement.featuredIds.includes(o.id) || featuredCount >= MAX_FEATURED) return;
    apply({ heroId: placement.heroId === o.id ? null : placement.heroId, featuredIds: [...placement.featuredIds, o.id], order: placement.order }, "Marketplace Featured Updated", o.id, o.title, `Featured + ${o.title}`);
  };
  const removeFeatured = (id: string) =>
    apply({ heroId: placement.heroId, featuredIds: placement.featuredIds.filter((x) => x !== id), order: placement.order }, "Marketplace Featured Updated", id);
  const insertFeaturedAt = (id: string, index: number) => {
    const f = placement.featuredIds.filter((x) => x !== id);
    f.splice(Math.max(0, Math.min(index, f.length)), 0, id);
    apply({ heroId: placement.heroId === id ? null : placement.heroId, featuredIds: f, order: placement.order }, "Marketplace Featured Updated", id, byId.get(id)?.title);
  };
  const moveFeatured = (id: string, dir: -1 | 1) => {
    const f = [...placement.featuredIds];
    const i = f.indexOf(id), j = i + dir;
    if (i < 0 || j < 0 || j >= f.length) return;
    [f[i], f[j]] = [f[j], f[i]];
    apply({ heroId: placement.heroId, featuredIds: f, order: placement.order }, "Marketplace Featured Updated", id);
  };
  const moveMarketplace = (id: string, dir: -1 | 1) => {
    const ids = fullRemaining.map((o) => o.id);
    const i = ids.indexOf(id), j = i + dir;
    if (i < 0 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    apply({ heroId: placement.heroId, featuredIds: placement.featuredIds, order: ids }, "Marketplace Order Changed", id);
  };
  const reorderMarketplaceTo = (id: string, targetId: string) => {
    if (id === targetId) return;
    const ids = fullRemaining.map((o) => o.id).filter((x) => x !== id);
    const ti = ids.indexOf(targetId);
    ids.splice(ti < 0 ? ids.length : ti, 0, id);
    apply({ heroId: placement.heroId === id ? null : placement.heroId, featuredIds: placement.featuredIds.filter((x) => x !== id), order: ids }, "Marketplace Order Changed", id);
  };
  const demote = (id: string) => {
    if (placement.heroId !== id && !placement.featuredIds.includes(id)) return;
    apply(
      { heroId: placement.heroId === id ? null : placement.heroId, featuredIds: placement.featuredIds.filter((x) => x !== id), order: placement.order },
      placement.heroId === id ? "Marketplace Hero Removed" : "Marketplace Featured Updated",
      id
    );
  };

  // ---- Drag plumbing ----
  const startDrag = (id: string) => () => setDragId(id);
  const endDrag = () => { setDragId(null); setDragOverCol(null); setFeaturedDropIndex(null); };
  const overCol = (col: Col) => (e: React.DragEvent) => { e.preventDefault(); setDragOverCol(col); };
  const dropHero = (e: React.DragEvent) => { e.preventDefault(); if (dragId) makeHero(byId.get(dragId)!); endDrag(); };
  const dropFeaturedAt = (index: number) => (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (dragId) insertFeaturedAt(dragId, index); endDrag(); };
  const dropFeaturedCol = (e: React.DragEvent) => { e.preventDefault(); if (dragId) addFeatured(byId.get(dragId)!); endDrag(); };
  const dropInventoryCol = (e: React.DragEvent) => { e.preventDefault(); if (dragId) demote(dragId); endDrag(); };
  const dropInventoryCard = (targetId: string) => (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!dragId) return;
    if (placedIds.has(dragId)) demote(dragId); // hero/featured → marketplace (rank default)
    else reorderMarketplaceTo(dragId, targetId);
    endDrag();
  };

  // ---- Stats ----
  const totalCurated = (placement.heroId ? 1 : 0) + placement.featuredIds.length + placement.order.length;
  const lastChange = placement.updatedAt ? placement.updatedAt.slice(0, 16).replace("T", " ") : "Never";

  const colHi = (col: Col) => dragId && dragOverCol === col ? "ring-2 ring-gold-500/50 bg-gold-500/[0.04]" : "ring-1 ring-navy-900/[0.06]";

  return (
    <AdminPage
      title="Marketplace Placement"
      subtitle="A visual board for what investors see first. Drag opportunities between Hero, Featured, and Marketplace — or use the controls on every card. Changes save instantly and are audited."
    >
      {/* ---- Stats ---- */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat icon={Crown} label="Hero Assigned" value={hero ? "Yes" : "Auto"} sub={hero?.title} />
        <Stat icon={Star} label="Featured Slots" value={`${featured.length} / ${MAX_FEATURED}`} />
        <Stat icon={Store} label="Marketplace" value={fullRemaining.length} />
        <Stat icon={LayoutGrid} label="Total Curated" value={totalCurated} />
        <Stat icon={Clock3} label="Last Change" value={lastChange} mono />
      </div>

      {/* ---- Board ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_320px_minmax(0,1fr)] gap-4 lg:h-[680px]">
        {/* HERO column */}
        <ColumnShell title="Hero" Icon={Crown} hint="Exactly one" className={colHi("hero")}>
          <div onDragOver={overCol("hero")} onDrop={dropHero} className="flex-1 overflow-y-auto p-3 space-y-3">
            {hero ? (
              <MarketplacePlacementCard
                opportunity={hero}
                variant="hero"
                badge="Hero"
                onRemoveHero={removeHero}
                dragging={dragId === hero.id}
                draggable
                onDragStart={startDrag(hero.id)}
                onDragEnd={endDrag}
              />
            ) : (
              <DropHint Icon={Crown} text="Drag an opportunity here to make it the Hero, or use “Make Hero” on any card." />
            )}
          </div>
        </ColumnShell>

        {/* FEATURED column */}
        <ColumnShell title="Featured" Icon={Star} hint={`Up to ${MAX_FEATURED} · ordered`} className={colHi("featured")}>
          <div onDragOver={overCol("featured")} onDrop={dropFeaturedCol} className="flex-1 overflow-y-auto p-3 space-y-2">
            {Array.from({ length: MAX_FEATURED }).map((_, slot) => {
              const o = featured[slot];
              return (
                <div key={slot} onDragOver={(e) => { e.preventDefault(); setFeaturedDropIndex(slot); }} onDrop={dropFeaturedAt(slot)}>
                  {dragId && featuredDropIndex === slot ? <div className="h-0.5 bg-gold-500 rounded-full mb-1.5" /> : null}
                  {o ? (
                    <MarketplacePlacementCard
                      opportunity={o}
                      variant="featured"
                      badge={`Featured #${slot + 1}`}
                      onUp={() => moveFeatured(o.id, -1)}
                      onDown={() => moveFeatured(o.id, 1)}
                      upDisabled={slot === 0}
                      downDisabled={slot >= featured.length - 1}
                      onMakeHero={() => makeHero(o)}
                      onRemoveFeatured={() => removeFeatured(o.id)}
                      dragging={dragId === o.id}
                      draggable
                      onDragStart={startDrag(o.id)}
                      onDragEnd={endDrag}
                    />
                  ) : (
                    <div className="rounded-xl border border-dashed border-navy-900/15 bg-bone/40 h-[58px] flex items-center justify-center text-[10px] uppercase tracking-[0.14em] font-bold text-navy-700/40">
                      Featured #{slot + 1}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ColumnShell>

        {/* MARKETPLACE column */}
        <ColumnShell title="Marketplace Inventory" Icon={Store} hint={`${remaining.length} shown`} className={colHi("marketplace")}>
          <div className="px-3 pt-3 space-y-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-700/50" strokeWidth={2} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, OPP ID, sponsor, location, deal type, investment…"
                className="w-full rounded-full bg-white ring-1 ring-navy-900/[0.08] focus:ring-2 focus:ring-gold-500 outline-none pl-9 pr-9 py-2 text-sm text-navy-900 placeholder:text-navy-700/45"
              />
              {query ? (
                <button type="button" onClick={() => setQuery("")} aria-label="Clear" className="absolute right-2.5 top-1/2 -translate-y-1/2 h-6 w-6 inline-flex items-center justify-center rounded-full hover:bg-bone text-navy-700/55">
                  <X className="h-3.5 w-3.5" strokeWidth={2.4} />
                </button>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Select value={categoryFilter} onChange={setCategoryFilter} options={["all", ...categories]} allLabel="All categories" />
              <Select value={statusFilter} onChange={setStatusFilter} options={["all", "Open", "Seeking Capital", "Negotiating", "Under Contract", "Closed"]} allLabel="All statuses" />
              <Select value={countryFilter} onChange={setCountryFilter} options={["all", ...countries]} allLabel="All countries" />
              <Select value={fundingFilter} onChange={setFundingFilter} options={FUNDING_BUCKETS.map((b) => b.key)} labels={Object.fromEntries(FUNDING_BUCKETS.map((b) => [b.key, b.label]))} allLabel="All funding" />
              <Select value={sortKey} onChange={(v) => setSortKey(v as SortKey)} options={["order", "newest", "funding", "az"]} labels={{ order: "Sort: Order", newest: "Sort: Newest", funding: "Sort: Funding", az: "Sort: A–Z" }} allLabel="Sort" />
            </div>
          </div>
          <div onDragOver={overCol("marketplace")} onDrop={dropInventoryCol} className="flex-1 overflow-y-auto p-3 space-y-2">
            {remaining.length > 0 ? (
              remaining.map((o, i) => (
                <div key={o.id} onDrop={dropInventoryCard(o.id)} onDragOver={(e) => e.preventDefault()}>
                  <MarketplacePlacementCard
                    opportunity={o}
                    variant="inventory"
                    badge={placementLabel(o.id, placement)}
                    onMakeHero={() => makeHero(o)}
                    onAddFeatured={() => addFeatured(o)}
                    canFeature={featuredCount < MAX_FEATURED}
                    onUp={sortKey === "order" ? () => moveMarketplace(o.id, -1) : undefined}
                    onDown={sortKey === "order" ? () => moveMarketplace(o.id, 1) : undefined}
                    upDisabled={i === 0}
                    downDisabled={i >= remaining.length - 1}
                    dragging={dragId === o.id}
                    draggable
                    onDragStart={startDrag(o.id)}
                    onDragEnd={endDrag}
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-navy-700/55 text-center py-8">No opportunities match these filters.</p>
            )}
          </div>
        </ColumnShell>
      </div>

      {/* ---- Live preview ---- */}
      <MarketplacePreview fallbackId={getFeaturedOpportunityOfTheWeek().id} />
    </AdminPage>
  );
}

// ---- Layout helpers ----

function ColumnShell({ title, Icon, hint, className, children }: { title: string; Icon: typeof Crown; hint: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={cn("flex flex-col rounded-2xl bg-white transition-colors lg:h-full min-h-[260px]", className)}>
      <header className="px-4 py-3 border-b border-navy-900/[0.06] shrink-0">
        <div className="text-[11px] uppercase tracking-[0.16em] text-navy-900 font-bold inline-flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.4} />
          {title}
        </div>
        <div className="text-[10px] text-navy-700/50 mt-0.5">{hint}</div>
      </header>
      {children}
    </section>
  );
}

function DropHint({ Icon, text }: { Icon: typeof Crown; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-navy-900/15 bg-bone/40 p-6 text-center">
      <Icon className="h-6 w-6 mx-auto text-navy-700/30" strokeWidth={1.9} />
      <p className="mt-2 text-xs text-navy-700/60 leading-relaxed">{text}</p>
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub, mono }: { icon: typeof Crown; label: string; value: string | number; sub?: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-3">
      <div className="text-[9px] uppercase tracking-[0.14em] text-navy-700/55 font-bold inline-flex items-center gap-1">
        <Icon className="h-3 w-3 text-gold-600" strokeWidth={2.2} />
        {label}
      </div>
      <div className={cn("mt-1 text-lg font-semibold text-navy-900 truncate", mono && "tabular-nums text-sm")}>{value}</div>
      {sub ? <div className="text-[10px] text-navy-700/50 truncate">{sub}</div> : null}
    </div>
  );
}

function Select({ value, onChange, options, labels, allLabel }: { value: string; onChange: (v: string) => void; options: string[]; labels?: Record<string, string>; allLabel: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full bg-white ring-1 ring-navy-900/[0.1] hover:ring-navy-900/25 text-navy-900 text-[11px] font-semibold px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-gold-500 [&>option]:text-navy-900"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {labels?.[o] ?? (o === "all" ? allLabel : o)}
        </option>
      ))}
    </select>
  );
}
