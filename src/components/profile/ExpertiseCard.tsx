import { Sparkles } from "lucide-react";
import type { UserProfile } from "@/data/profile";

export default function ExpertiseCard({ profile }: { profile: UserProfile }) {
  if (profile.expertise.length === 0) return null;
  return (
    <section>
      <div className="mb-4">
        <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} />
          Expertise
        </div>
        <h2 className="mt-1 text-base md:text-lg font-semibold text-navy-900 tracking-tight">
          Areas of focus
        </h2>
      </div>
      <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-6 flex flex-wrap gap-2">
        {profile.expertise.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center text-xs font-semibold text-navy-900 bg-bone ring-1 ring-navy-900/[0.06] rounded-full px-3 py-1.5"
          >
            {tag}
          </span>
        ))}
      </div>
    </section>
  );
}
