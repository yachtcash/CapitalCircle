import PageShell from "@/components/PageShell";
import { MapPin, Briefcase, Globe2, Mail, ShieldCheck, Pencil } from "lucide-react";
import SavedSections from "@/components/profile/SavedSections";

const stats = [
  { label: "Opportunities posted", value: "7" },
  { label: "Connections", value: "184" },
  { label: "Deals reviewed", value: "42" },
  { label: "Member since", value: "2024" },
];

const interests = [
  "Hotels & Resorts",
  "Joint Ventures",
  "Real Estate Development",
  "Land Opportunities",
  "Hospitality",
];

const activity = [
  { kind: "Posted", text: "Beachfront Boutique Hotel — 42 Keys", time: "2 days ago" },
  { kind: "Connected", text: "Aurora Capital Partners", time: "5 days ago" },
  { kind: "Saved", text: "Solar + Storage Portfolio — 120 MW", time: "1 week ago" },
  { kind: "Posted", text: "Joint Venture — Branded Residences", time: "2 weeks ago" },
];

export default function ProfilePage() {
  return (
    <PageShell
      eyebrow="Member Profile"
      title="Stevie Cabrera"
      subtitle="Sponsor · Hospitality & Real Estate · Cabo San Lucas, MX"
      actions={
        <button className="inline-flex items-center gap-2 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-5 py-2.5 text-sm transition-colors">
          <Pencil className="h-4 w-4" strokeWidth={2.2} />
          Edit Profile
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-6">
          <section className="bg-white rounded-2xl ring-1 ring-navy-900/[0.06] p-5 md:p-7">
            <div className="flex items-start gap-4">
              <div className="shrink-0 h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-navy-900 text-gold-500 ring-1 ring-navy-900/5 flex items-center justify-center text-xl md:text-2xl font-semibold tracking-wide">
                SC
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg md:text-xl font-semibold text-navy-900">
                    Stevie Cabrera
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] font-bold bg-gold-500/15 text-gold-700 ring-1 ring-gold-500/40 rounded-full px-2 py-0.5">
                    <ShieldCheck className="h-3 w-3" strokeWidth={2.5} />
                    Verified Sponsor
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-6 text-sm text-navy-700/75">
                  <span className="inline-flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-navy-700/50" strokeWidth={2} />
                    Pacific Coast Holdings
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-navy-700/50" strokeWidth={2} />
                    Cabo San Lucas, Mexico
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Globe2 className="h-4 w-4 text-navy-700/50" strokeWidth={2} />
                    pacificcoastholdings.example
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Mail className="h-4 w-4 text-navy-700/50" strokeWidth={2} />
                    s.cabrera@example.com
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-5 text-sm md:text-[15px] text-navy-700/85 leading-relaxed">
              Sponsor and operator focused on coastal hospitality assets across Mexico and the
              Caribbean. Twelve years of experience originating, structuring, and operating
              boutique hotels and branded residence projects between $5M and $80M.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {interests.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center text-xs font-medium bg-bone text-navy-900 ring-1 ring-navy-900/[0.06] rounded-full px-3 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl ring-1 ring-navy-900/[0.06] p-5 md:p-7">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-base md:text-lg font-semibold text-navy-900">Recent Activity</h3>
              <a href="#all" className="text-xs uppercase tracking-[0.14em] font-semibold text-gold-600 hover:text-gold-700">
                View all
              </a>
            </div>
            <ul className="space-y-3">
              {activity.map((a, i) => (
                <li key={i} className="flex gap-3 items-center text-sm">
                  <span className="text-[10px] uppercase tracking-[0.14em] font-bold bg-navy-900/[0.04] text-navy-900 rounded-full px-2 py-0.5 shrink-0 w-20 text-center">
                    {a.kind}
                  </span>
                  <span className="flex-1 text-navy-900 truncate">{a.text}</span>
                  <span className="text-xs text-navy-700/55 shrink-0">{a.time}</span>
                </li>
              ))}
            </ul>
          </section>

          <SavedSections />
        </div>

        <aside className="space-y-4">
          <div className="bg-navy-900 text-white rounded-2xl p-5">
            <div className="grid grid-cols-2 gap-5">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-semibold tracking-tight">{s.value}</div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-gold-400 mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gold-500/10 ring-1 ring-gold-500/30 rounded-2xl p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-gold-700 font-semibold">
              Membership
            </div>
            <div className="mt-1 text-base font-semibold text-navy-900">Founding Member</div>
            <p className="mt-2 text-sm text-navy-900/70 leading-relaxed">
              You have priority access to closed-circle listings and the weekly editor&apos;s desk.
            </p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
