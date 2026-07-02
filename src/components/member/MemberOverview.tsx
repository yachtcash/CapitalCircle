"use client";

import { Target, Layers, Award, MapPin, Globe2, Briefcase, type LucideIcon } from "lucide-react";

import type { Member } from "@/data/members";
import { useMemberProfile } from "@/lib/members/profile";
import SectionHeader from "@/components/ui/SectionHeader";

export default function MemberOverview({ member }: { member: Member }) {
  const { categories, countries, cities } = useMemberProfile(member, 0);

  const focus = member.areasOfInterest.length ? member.areasOfInterest : [member.industry];
  const industries = member.industries.length ? member.industries : [member.industry];
  const expertise = categories.length ? categories : industries;
  const markets = (cities.length ? cities : [member.city].filter(Boolean)) as string[];
  const reach = countries.length ? countries : [member.country].filter(Boolean);

  const prose = [
    { eyebrow: "About", body: member.about },
    { eyebrow: "Professional background", body: member.bio },
  ].filter((s) => s.body && s.body.trim());

  return (
    <section>
      <SectionHeader eyebrow="Overview" title={`About ${member.name}`} />

      <div className="grid lg:grid-cols-[1.55fr_minmax(0,1fr)] gap-4 md:gap-5">
        <div className="space-y-4 md:space-y-5">
          <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] divide-y divide-navy-900/[0.06] overflow-hidden">
            {prose.map((s) => (
              <article key={s.eyebrow} className="p-5 md:p-7">
                <div className="text-[10px] uppercase tracking-[0.18em] text-gold-600 font-semibold">{s.eyebrow}</div>
                <p className="mt-2 text-sm md:text-[15px] leading-relaxed text-navy-700/85">{s.body}</p>
              </article>
            ))}
          </div>

          {/* Experience */}
          <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-7">
            <div className="text-[10px] uppercase tracking-[0.18em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" strokeWidth={2.2} />
              Experience
            </div>
            <div className="mt-3 flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-gold-500 mt-2 shrink-0" />
              <div>
                <div className="font-semibold text-navy-900">{member.title}</div>
                <div className="text-sm text-navy-700/70 mt-0.5">
                  {member.company} · {member.city}, {member.country}
                </div>
                <div className="text-[11px] uppercase tracking-[0.14em] text-navy-700/50 font-semibold mt-1">
                  Since {member.joinedYear}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 md:space-y-5">
          <FacetCard icon={Target} title="Investment Focus" items={focus} accent />
          <FacetCard icon={Layers} title="Industries" items={industries} />
          <FacetCard icon={Award} title="Areas of Expertise" items={expertise} />
          <FacetCard icon={MapPin} title="Markets" items={markets} />
          <FacetCard icon={Globe2} title="Geographic Reach" items={reach} />
        </div>
      </div>
    </section>
  );
}

function FacetCard({
  icon: Icon,
  title,
  items,
  accent,
}: {
  icon: LucideIcon;
  title: string;
  items: string[];
  accent?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5">
      <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-navy-700/55 font-bold">
        <Icon className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
        {title}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {items.map((it) => (
          <span
            key={it}
            className={
              accent
                ? "inline-flex items-center text-xs font-semibold rounded-full px-2.5 py-1 bg-gold-500/15 text-gold-700 ring-1 ring-gold-500/30"
                : "inline-flex items-center text-xs font-semibold rounded-full px-2.5 py-1 bg-navy-900/[0.04] text-navy-800 ring-1 ring-navy-900/10"
            }
          >
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}
