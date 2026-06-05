"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown } from "lucide-react";
import { categories } from "@/data/categories";

export default function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const qParts = [q.trim(), location.trim()].filter(Boolean);
    if (qParts.length > 0) params.set("q", qParts.join(" "));
    if (category) params.set("category", category);
    const qs = params.toString();
    router.push(`/search${qs ? `?${qs}` : ""}`);
  };

  return (
    <div className="relative max-w-6xl mx-auto px-5 md:px-10 -mt-7 md:-mt-9 z-10">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-2xl shadow-xl ring-1 ring-navy-900/5 p-3 md:p-4 grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr_auto] gap-2 md:gap-2"
      >
        <div className="flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-xl bg-bone md:bg-transparent">
          <Search className="h-4 w-4 text-navy-700/70 shrink-0" strokeWidth={2} />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search opportunities, sectors, sponsors…"
            className="w-full bg-transparent text-sm text-navy-900 placeholder:text-navy-700/40 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-xl bg-bone md:bg-transparent md:border-l md:border-navy-900/5">
          <span className="text-xs uppercase tracking-wider text-navy-700/50 hidden md:inline">
            Category
          </span>
          <div className="relative flex-1">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none bg-transparent text-sm text-navy-900 outline-none pr-6"
            >
              <option value="">All sectors</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.label}>
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-700/60 pointer-events-none"
              strokeWidth={2}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-xl bg-bone md:bg-transparent md:border-l md:border-navy-900/5">
          <MapPin className="h-4 w-4 text-navy-700/70 shrink-0" strokeWidth={2} />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Anywhere"
            className="w-full bg-transparent text-sm text-navy-900 placeholder:text-navy-700/40 outline-none"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-sm px-6 py-3 transition-colors"
        >
          Search
        </button>
      </form>
    </div>
  );
}
