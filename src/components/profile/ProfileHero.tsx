"use client";

import { Pencil, MapPin, Briefcase, Globe2, ShieldCheck, Building2 } from "lucide-react";
import type { UserProfile } from "@/data/profile";
import { cn } from "@/lib/cn";

type Props = {
  profile: UserProfile;
  onEdit: () => void;
};

export default function ProfileHero({ profile, onEdit }: Props) {
  const location = [profile.city, profile.state, profile.country]
    .filter((x): x is string => Boolean(x))
    .join(", ");

  return (
    <section className="bg-white">
      {/* Cover */}
      <div
        className={cn(
          "relative h-40 md:h-56",
          !profile.coverUrl && `cover-${profile.coverGradient}`
        )}
        style={
          profile.coverUrl
            ? {
                backgroundImage: `url(${profile.coverUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      {/* Identity card overlapping cover */}
      <div className="max-w-6xl mx-auto px-5 md:px-10">
        <div className="relative -mt-14 md:-mt-20 bg-white rounded-3xl ring-1 ring-navy-900/[0.06] shadow-sm p-5 md:p-7 flex flex-col md:flex-row items-start gap-5">
          {profile.avatarUrl ? (
            <div
              className="shrink-0 h-24 w-24 md:h-28 md:w-28 rounded-2xl ring-4 ring-white shadow overflow-hidden bg-navy-900"
              style={{
                backgroundImage: `url(${profile.avatarUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              aria-label={profile.name}
            />
          ) : (
            <div className="shrink-0 h-24 w-24 md:h-28 md:w-28 rounded-2xl bg-navy-900 text-gold-500 ring-4 ring-white shadow flex items-center justify-center text-3xl md:text-4xl font-semibold tracking-wide">
              {profile.initials}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.18em] text-gold-600 font-semibold">
                  {profile.title}
                </div>
                <h1 className="mt-1 text-2xl md:text-3xl font-semibold text-navy-900 tracking-tight">
                  {profile.name}
                </h1>
                <div className="mt-1 text-sm md:text-[15px] text-navy-700/80 inline-flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-gold-600 shrink-0" strokeWidth={2} />
                  {profile.company}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] font-bold bg-gold-500/15 text-gold-700 ring-1 ring-gold-500/40 rounded-full px-2.5 py-1">
                  <ShieldCheck className="h-3 w-3" strokeWidth={2.5} />
                  {profile.memberTier}
                </span>
                <button
                  type="button"
                  onClick={onEdit}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={2.4} />
                  Edit Profile
                </button>
              </div>
            </div>

            <p className="mt-3 text-sm md:text-[15px] text-navy-700/85 leading-relaxed max-w-3xl">
              {profile.bio}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-navy-700/80">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gold-600" strokeWidth={2} />
                {location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-gold-600" strokeWidth={2} />
                {profile.industry}
              </span>
              {profile.website ? (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-navy-900 font-semibold hover:text-gold-700 transition-colors"
                >
                  <Globe2 className="h-4 w-4" strokeWidth={2} />
                  {profile.websiteLabel}
                </a>
              ) : null}
              <span className="inline-flex items-center gap-1.5 text-navy-700/60">
                Joined {profile.joinedYear}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
