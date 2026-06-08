import type { UserProfile } from "@/data/profile";

export default function AboutCard({ profile }: { profile: UserProfile }) {
  return (
    <section>
      <div className="mb-4">
        <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
          About
        </div>
        <h2 className="mt-1 text-base md:text-lg font-semibold text-navy-900 tracking-tight">
          About {profile.name.split(" ")[0]}
        </h2>
      </div>
      <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-7">
        <p className="text-sm md:text-[15px] leading-relaxed text-navy-700/85 whitespace-pre-wrap">
          {profile.about}
        </p>
      </div>
    </section>
  );
}
