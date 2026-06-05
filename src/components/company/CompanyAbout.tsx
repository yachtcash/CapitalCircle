import type { Company } from "@/data/companies";

export default function CompanyAbout({ company }: { company: Company }) {
  const sections: { eyebrow: string; title: string; body: string }[] = [
    { eyebrow: "Overview", title: "Who we are", body: company.about.overview },
    { eyebrow: "Mission", title: "Why we do it", body: company.about.mission },
    { eyebrow: "Background", title: "How we got here", body: company.about.background },
    { eyebrow: "Track record", title: "What we've delivered", body: company.about.trackRecord },
  ];

  return (
    <section>
      <SectionHeader eyebrow="About" title={`About ${company.name}`} />
      <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] divide-y divide-navy-900/[0.06] overflow-hidden">
        {sections.map((s) => (
          <article key={s.eyebrow} className="p-5 md:p-7">
            <div className="text-[10px] uppercase tracking-[0.18em] text-gold-600 font-semibold">
              {s.eyebrow}
            </div>
            <h3 className="mt-1.5 text-base md:text-lg font-semibold text-navy-900 tracking-tight">
              {s.title}
            </h3>
            <p className="mt-2.5 text-sm md:text-[15px] leading-relaxed text-navy-700/85">
              {s.body}
            </p>
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
