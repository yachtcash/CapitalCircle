import { MapPin, CalendarDays } from "lucide-react";
import type { PastProject } from "@/data/companies";

export default function CompanyPastProjects({ projects }: { projects: PastProject[] }) {
  if (projects.length === 0) return null;
  return (
    <section>
      <SectionHeader eyebrow="History" title="Past projects" />
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {projects.map((p) => (
          <li key={p.id}>
            <article className="bg-white rounded-2xl ring-1 ring-navy-900/[0.06] p-5 md:p-6 h-full flex flex-col">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <h3 className="text-base md:text-lg font-semibold text-navy-900 leading-snug">
                  {p.name}
                </h3>
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-navy-700/55 font-semibold shrink-0">
                  <CalendarDays className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
                  {p.year}
                </span>
              </div>
              <p className="mt-3 text-sm text-navy-700/80 leading-relaxed flex-1">
                {p.description}
              </p>
              <div className="mt-4 pt-3 border-t border-navy-900/[0.06] flex items-center gap-1.5 text-xs text-navy-700/70">
                <MapPin className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
                {p.location}
              </div>
            </article>
          </li>
        ))}
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
