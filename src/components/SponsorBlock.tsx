import { ShieldCheck, MapPin, CalendarDays, Award } from "lucide-react";
import type { Sponsor } from "@/data/opportunities";

export default function SponsorBlock({ sponsor }: { sponsor: Sponsor }) {
  const initials = sponsor.name
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <section>
      <SectionHeader eyebrow="Sponsor" title="Sponsor Information" />
      <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-7">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="shrink-0 h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-navy-900 text-gold-500 ring-1 ring-navy-900/5 flex items-center justify-center text-xl md:text-2xl font-semibold tracking-wide">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg md:text-xl font-semibold text-navy-900">{sponsor.name}</h3>
              {sponsor.verified ? (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] font-bold bg-gold-500/15 text-gold-700 ring-1 ring-gold-500/40 rounded-full px-2 py-0.5">
                  <ShieldCheck className="h-3 w-3" strokeWidth={2.5} />
                  Verified
                </span>
              ) : null}
            </div>

            <p className="mt-3 text-sm md:text-[15px] text-navy-700/85 leading-relaxed">
              {sponsor.description}
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Meta icon={MapPin} label="Location" value={sponsor.location} />
              <Meta icon={CalendarDays} label="Founded" value={String(sponsor.foundedYear)} />
              <Meta
                icon={Award}
                label="Track record"
                value={sponsor.trackRecord}
                className="sm:col-span-2"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-[11px] uppercase tracking-[0.14em] text-navy-700/55 font-semibold inline-flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-gold-600" strokeWidth={2} />
        {label}
      </div>
      <div className="mt-1 text-sm text-navy-900 leading-snug">{value}</div>
    </div>
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
