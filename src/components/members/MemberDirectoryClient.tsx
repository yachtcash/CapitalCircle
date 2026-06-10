"use client";

import { useMemo, useState } from "react";
import { Search, X, SearchX, ChevronDown } from "lucide-react";
import MemberCard from "./MemberCard";
import type { Member, MemberType } from "@/data/members";
import { MEMBER_TYPES } from "@/data/members";
import { cn } from "@/lib/cn";

type SortKey = "name" | "joined-newest" | "joined-oldest" | "listings" | "featured";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured first" },
  { value: "name", label: "Name (A → Z)" },
  { value: "joined-newest", label: "Recently joined" },
  { value: "joined-oldest", label: "Earliest joined" },
  { value: "listings", label: "Most listings" },
];

const REGIONS = [
  "Mexico",
  "United States",
  "Canada",
  "Europe",
  "Caribbean",
  "South America",
] as const;

type Props = {
  members: Member[];
};

export default function MemberDirectoryClient({ members }: Props) {
  const [query, setQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<MemberType[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("featured");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      if (selectedTypes.length > 0 && !selectedTypes.includes(m.memberType)) return false;
      if (selectedRegions.length > 0 && !selectedRegions.includes(m.region)) return false;
      if (verifiedOnly && m.verification !== "Verified" && m.verification !== "Founding Member") return false;
      if (!q) return true;
      const hay = [
        m.name,
        m.company,
        m.title,
        m.industry,
        m.country,
        m.city,
        m.bio,
        m.about,
        m.memberType,
        ...m.industries,
        ...m.areasOfInterest,
      ]
        .join("\n")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [members, query, selectedTypes, selectedRegions, verifiedOnly]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case "name":
        return arr.sort((a, b) => a.name.localeCompare(b.name));
      case "joined-newest":
        return arr.sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));
      case "joined-oldest":
        return arr.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
      case "listings":
        return arr.sort((a, b) => b.listingsCount - a.listingsCount);
      case "featured":
      default:
        return arr.sort((a, b) => {
          if (a.featured !== b.featured) return a.featured ? -1 : 1;
          if (a.trending !== b.trending) return a.trending ? -1 : 1;
          return b.joinedAt.localeCompare(a.joinedAt);
        });
    }
  }, [filtered, sort]);

  const toggleType = (t: MemberType) =>
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  const toggleRegion = (r: string) =>
    setSelectedRegions((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );

  const noun = sorted.length === 1 ? "member" : "members";

  const chips: { id: string; label: string; remove: () => void }[] = [];
  if (query.trim())
    chips.push({
      id: `q:${query}`,
      label: `“${query.trim()}”`,
      remove: () => setQuery(""),
    });
  for (const t of selectedTypes)
    chips.push({ id: `t:${t}`, label: t, remove: () => toggleType(t) });
  for (const r of selectedRegions)
    chips.push({ id: `r:${r}`, label: r, remove: () => toggleRegion(r) });
  if (verifiedOnly)
    chips.push({
      id: "verified",
      label: "Verified only",
      remove: () => setVerifiedOnly(false),
    });

  const onClearAll = () => {
    setQuery("");
    setSelectedTypes([]);
    setSelectedRegions([]);
    setVerifiedOnly(false);
  };

  return (
    <section className="bg-cream">
      <div className="max-w-7xl mx-auto px-5 md:px-10 pt-6 md:pt-8 pb-4">
        <div className="bg-white rounded-full ring-1 ring-navy-900/[0.08] focus-within:ring-2 focus-within:ring-gold-500 shadow-sm transition-shadow flex items-center gap-2">
          <span className="pl-4 text-navy-700/60">
            <Search className="h-4 w-4" strokeWidth={2} />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, company, industry, city, or focus"
            className="flex-1 bg-transparent outline-none py-3 text-sm md:text-base text-navy-900 placeholder:text-navy-700/45"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-navy-700/55 hover:text-navy-900 hover:bg-bone"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.4} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-10 pb-8 md:pb-10">
        <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
          <aside className="hidden lg:block">
            <div className="lg:sticky lg:top-6 space-y-5">
              <FilterGroup label="Member type">
                <div className="flex flex-wrap gap-1.5">
                  {MEMBER_TYPES.map((t) => (
                    <Pill
                      key={t}
                      active={selectedTypes.includes(t)}
                      onClick={() => toggleType(t)}
                    >
                      {t}
                    </Pill>
                  ))}
                </div>
              </FilterGroup>
              <FilterGroup label="Region">
                <div className="flex flex-wrap gap-1.5">
                  {REGIONS.map((r) => (
                    <Pill
                      key={r}
                      active={selectedRegions.includes(r)}
                      onClick={() => toggleRegion(r)}
                    >
                      {r}
                    </Pill>
                  ))}
                </div>
              </FilterGroup>
              <FilterGroup label="Verification">
                <Pill
                  active={verifiedOnly}
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                >
                  Verified only
                </Pill>
              </FilterGroup>
              {(selectedTypes.length > 0 || selectedRegions.length > 0 || verifiedOnly || query) ? (
                <button
                  type="button"
                  onClick={onClearAll}
                  className="text-xs uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600 transition-colors"
                >
                  Clear all filters
                </button>
              ) : null}
            </div>
          </aside>

          <main className="min-w-0">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="text-sm text-navy-900">
                <span className="font-semibold tabular-nums">{sorted.length}</span>{" "}
                <span className="text-navy-700/70">{noun}</span>
                {query ? (
                  <>
                    {" "}
                    <span className="text-navy-700/55">for</span>{" "}
                    <span className="font-semibold">&ldquo;{query}&rdquo;</span>
                  </>
                ) : null}
              </div>
              <SortControl value={sort} onChange={setSort} />
            </div>

            {chips.length > 0 ? (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {chips.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={c.remove}
                    className="group inline-flex items-center gap-1.5 rounded-full bg-white text-navy-900 ring-1 ring-navy-900/[0.08] hover:ring-gold-500/60 px-3 py-1.5 text-xs font-medium transition-all"
                  >
                    <span className="truncate max-w-[200px]">{c.label}</span>
                    <X
                      className="h-3 w-3 text-navy-700/55 group-hover:text-navy-900 transition-colors"
                      strokeWidth={2.4}
                    />
                  </button>
                ))}
                {chips.length > 1 ? (
                  <button
                    type="button"
                    onClick={onClearAll}
                    className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600 px-2 py-1 transition-colors"
                  >
                    Clear all
                  </button>
                ) : null}
              </div>
            ) : null}

            {/* Mobile filter row */}
            <div className="lg:hidden mb-5 -mx-5 px-5 flex gap-2 overflow-x-auto pb-2">
              <Pill
                active={verifiedOnly}
                onClick={() => setVerifiedOnly(!verifiedOnly)}
              >
                Verified
              </Pill>
              {REGIONS.map((r) => (
                <Pill
                  key={r}
                  active={selectedRegions.includes(r)}
                  onClick={() => toggleRegion(r)}
                >
                  {r}
                </Pill>
              ))}
              {MEMBER_TYPES.slice(0, 8).map((t) => (
                <Pill
                  key={t}
                  active={selectedTypes.includes(t)}
                  onClick={() => toggleType(t)}
                >
                  {t}
                </Pill>
              ))}
            </div>

            {sorted.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                {sorted.map((m, i) => (
                  <MemberCard key={m.id} member={m} priority={i === 0} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-10 md:p-14 text-center">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-navy-900 text-gold-500 ring-4 ring-navy-900/5">
                  <SearchX className="h-6 w-6" strokeWidth={1.9} />
                </span>
                <h3 className="mt-5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">
                  No members matched your search.
                </h3>
                <p className="mt-3 text-sm md:text-base text-navy-700/70 leading-relaxed max-w-md mx-auto">
                  Try widening your filters or clearing your search.
                </p>
                <button
                  type="button"
                  onClick={onClearAll}
                  className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold text-sm px-5 py-2.5 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.16em] text-navy-700/70 font-semibold mb-2">
        {label}
      </div>
      {children}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 inline-flex items-center text-[11px] uppercase tracking-[0.14em] font-semibold rounded-full px-2.5 py-1.5 ring-1 transition-colors",
        active
          ? "bg-gold-500 text-navy-900 ring-gold-500"
          : "bg-white text-navy-700 ring-navy-900/[0.08] hover:ring-gold-500"
      )}
    >
      {children}
    </button>
  );
}

function SortControl({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
}) {
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="appearance-none rounded-full bg-white ring-1 ring-navy-900/[0.08] hover:ring-navy-900/20 text-navy-900 text-xs font-semibold uppercase tracking-[0.12em] pl-4 pr-9 py-2 transition-shadow"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            Sort · {s.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-navy-700/55 pointer-events-none"
        strokeWidth={2.4}
      />
    </div>
  );
}
