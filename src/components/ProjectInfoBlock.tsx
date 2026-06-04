import { Layers, CalendarRange, Activity, Factory } from "lucide-react";
import type { Opportunity } from "@/data/opportunities";

export default function ProjectInfoBlock({ opportunity }: { opportunity: Opportunity }) {
  const items = [
    { label: "Current stage", value: opportunity.currentStage, icon: Layers },
    { label: "Timeline", value: opportunity.timeline, icon: CalendarRange },
    { label: "Project status", value: opportunity.projectStatus, icon: Activity },
    { label: "Industry", value: opportunity.industry, icon: Factory },
  ];

  return (
    <section>
      <SectionHeader eyebrow="Project" title="Project Information" />
      <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] divide-y divide-navy-900/[0.06] overflow-hidden">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="grid grid-cols-[auto_minmax(0,1fr)] sm:grid-cols-[160px_minmax(0,1fr)] items-start gap-4 p-5"
            >
              <div className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.16em] text-navy-700/60 font-semibold">
                <Icon className="h-4 w-4 text-gold-600" strokeWidth={2} />
                {item.label}
              </div>
              <div className="text-sm md:text-[15px] text-navy-900 leading-snug">{item.value}</div>
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
