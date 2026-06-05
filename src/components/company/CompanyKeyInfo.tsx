import { CalendarDays, MapPin, Briefcase, Users, Layers, CheckCircle2 } from "lucide-react";
import type { Company } from "@/data/companies";

type Props = {
  company: Company;
  activeOpportunitiesCount: number;
};

export default function CompanyKeyInfo({ company, activeOpportunitiesCount }: Props) {
  const headquarters = [
    company.headquarters.city,
    company.headquarters.state,
    company.headquarters.country,
  ]
    .filter((x): x is string => Boolean(x && x.trim()))
    .join(", ");

  const items = [
    { icon: CalendarDays, label: "Founded", value: String(company.foundedYear) },
    { icon: MapPin, label: "Headquarters", value: headquarters || "—" },
    { icon: Briefcase, label: "Industry", value: company.industry },
    { icon: Users, label: "Employees", value: company.employees },
    {
      icon: Layers,
      label: "Active opportunities",
      value: String(activeOpportunitiesCount),
    },
    {
      icon: CheckCircle2,
      label: "Closed opportunities",
      value: String(company.closedOpportunitiesCount),
    },
  ];

  return (
    <section>
      <SectionHeader eyebrow="Snapshot" title="Key information" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="bg-white rounded-2xl ring-1 ring-navy-900/[0.06] p-4 md:p-5"
            >
              <div className="text-[10px] uppercase tracking-[0.16em] text-navy-700/60 font-semibold inline-flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
                {item.label}
              </div>
              <div className="mt-2 text-base md:text-lg font-semibold text-navy-900 leading-snug">
                {item.value}
              </div>
            </div>
          );
        })}
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
