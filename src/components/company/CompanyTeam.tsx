import type { TeamMember } from "@/data/companies";

export default function CompanyTeam({ team }: { team: TeamMember[] }) {
  if (team.length === 0) return null;
  return (
    <section>
      <SectionHeader eyebrow="Leadership" title="Senior team" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {team.map((m) => (
          <article
            key={m.name}
            className="bg-white rounded-2xl ring-1 ring-navy-900/[0.06] p-5 flex flex-col"
          >
            <div className="flex items-center gap-3">
              <div className="shrink-0 h-12 w-12 rounded-xl bg-navy-900 text-gold-500 ring-1 ring-navy-900/5 flex items-center justify-center text-sm font-semibold tracking-wide">
                {m.initials}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-navy-900 text-[15px] leading-snug truncate">
                  {m.name}
                </div>
                <div className="text-[11px] uppercase tracking-[0.14em] text-gold-600 font-semibold mt-0.5 truncate">
                  {m.role}
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-navy-700/80 line-clamp-4">{m.bio}</p>
            <div className="mt-4 pt-3 border-t border-navy-900/[0.06] text-[11px] text-navy-700/55">
              {m.yearsAtFirm} {m.yearsAtFirm === 1 ? "year" : "years"} at the firm
            </div>
          </article>
        ))}
      </div>
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
