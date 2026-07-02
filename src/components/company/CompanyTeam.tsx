"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { TeamMember } from "@/data/companies";
import { cn } from "@/lib/cn";
import SectionHeader from "@/components/ui/SectionHeader";

export default function CompanyTeam({ team }: { team: TeamMember[] }) {
  const [expandedName, setExpandedName] = useState<string | null>(null);

  if (team.length === 0) return null;

  const toggle = (name: string) => {
    setExpandedName((prev) => (prev === name ? null : name));
  };

  return (
    <section>
      <SectionHeader eyebrow="Leadership" title="Senior team" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {team.map((m) => {
          const expanded = expandedName === m.name;
          return (
            <button
              key={m.name}
              type="button"
              onClick={() => toggle(m.name)}
              aria-expanded={expanded}
              aria-label={`${expanded ? "Collapse" : "Expand"} bio for ${m.name}`}
              className={cn(
                "text-left bg-white rounded-2xl ring-1 p-5 flex flex-col transition-shadow",
                expanded
                  ? "ring-gold-500/50 shadow-md shadow-navy-900/[0.04]"
                  : "ring-navy-900/[0.06] hover:ring-navy-900/15"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="shrink-0 h-12 w-12 rounded-xl bg-navy-900 text-gold-500 ring-1 ring-navy-900/5 flex items-center justify-center text-sm font-semibold tracking-wide">
                  {m.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-navy-900 text-[15px] leading-snug truncate">
                    {m.name}
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.14em] text-gold-600 font-semibold mt-0.5 truncate">
                    {m.role}
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-navy-700/55 shrink-0 transition-transform",
                    expanded && "rotate-180 text-gold-600"
                  )}
                  strokeWidth={2.2}
                />
              </div>
              <p
                className={cn(
                  "mt-4 text-sm leading-relaxed text-navy-700/80",
                  !expanded && "line-clamp-4"
                )}
              >
                {m.bio}
              </p>
              <div className="mt-4 pt-3 border-t border-navy-900/[0.06] text-[11px] text-navy-700/55">
                {m.yearsAtFirm} {m.yearsAtFirm === 1 ? "year" : "years"} at the firm
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
