"use client";

import { useState } from "react";
import { ChevronDown, MapPin, CalendarDays } from "lucide-react";
import type { PastProject } from "@/data/companies";
import { cn } from "@/lib/cn";

export default function CompanyPastProjects({ projects }: { projects: PastProject[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (projects.length === 0) return null;

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section>
      <SectionHeader eyebrow="History" title="Past projects" />
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {projects.map((p) => {
          const expanded = expandedId === p.id;
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => toggle(p.id)}
                aria-expanded={expanded}
                aria-label={`${expanded ? "Collapse" : "Expand"} project: ${p.name}`}
                className={cn(
                  "w-full text-left bg-white rounded-2xl ring-1 p-5 md:p-6 h-full flex flex-col transition-shadow",
                  expanded
                    ? "ring-gold-500/50 shadow-md shadow-navy-900/[0.04]"
                    : "ring-navy-900/[0.06] hover:ring-navy-900/15"
                )}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <h3 className="text-base md:text-lg font-semibold text-navy-900 leading-snug">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-navy-700/55 font-semibold">
                      <CalendarDays className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
                      {p.year}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-navy-700/55 transition-transform",
                        expanded && "rotate-180 text-gold-600"
                      )}
                      strokeWidth={2.2}
                    />
                  </div>
                </div>
                <p
                  className={cn(
                    "mt-3 text-sm text-navy-700/80 leading-relaxed flex-1",
                    !expanded && "line-clamp-3"
                  )}
                >
                  {p.description}
                </p>
                <div className="mt-4 pt-3 border-t border-navy-900/[0.06] flex items-center gap-1.5 text-xs text-navy-700/70">
                  <MapPin className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
                  {p.location}
                  {p.category ? (
                    <span className="ml-auto text-[10px] uppercase tracking-[0.16em] text-navy-700/55 font-semibold">
                      {p.category}
                    </span>
                  ) : null}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-5">
      <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
        {eyebrow}
      </div>
      <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">
        {title}
      </h2>
    </div>
  );
}
