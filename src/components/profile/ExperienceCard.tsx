import { Briefcase, MapPin } from "lucide-react";
import type { UserProfile } from "@/data/profile";

function formatRange(start: number, end?: number): string {
  if (!end) return `${start} – Present`;
  return `${start} – ${end}`;
}

export default function ExperienceCard({ profile }: { profile: UserProfile }) {
  if (profile.experience.length === 0) return null;
  return (
    <section>
      <div className="mb-4">
        <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
          Experience
        </div>
        <h2 className="mt-1 text-base md:text-lg font-semibold text-navy-900 tracking-tight">
          Career history
        </h2>
      </div>
      <ol className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] divide-y divide-navy-900/[0.06] overflow-hidden">
        {profile.experience.map((exp) => (
          <li key={exp.id} className="p-5 md:p-6">
            <div className="flex items-start gap-3">
              <span className="shrink-0 h-10 w-10 rounded-xl bg-navy-900 text-gold-500 ring-1 ring-navy-900/5 flex items-center justify-center">
                <Briefcase className="h-4 w-4" strokeWidth={2} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h3 className="font-semibold text-navy-900 text-[15px] leading-snug">
                    {exp.title}
                  </h3>
                  <span className="text-[11px] uppercase tracking-[0.14em] text-navy-700/55 font-semibold">
                    {formatRange(exp.startYear, exp.endYear)}
                  </span>
                </div>
                <div className="mt-0.5 text-[13px] text-gold-700 font-semibold">
                  {exp.company}
                </div>
                {exp.location ? (
                  <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-navy-700/65">
                    <MapPin className="h-3 w-3 text-gold-600" strokeWidth={2.2} />
                    {exp.location}
                  </div>
                ) : null}
                {exp.description ? (
                  <p className="mt-2 text-sm text-navy-700/80 leading-relaxed">
                    {exp.description}
                  </p>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
