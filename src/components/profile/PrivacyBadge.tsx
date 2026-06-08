import { Lock, Users, Globe } from "lucide-react";
import type { PrivacyLevel } from "@/data/profile";
import { cn } from "@/lib/cn";

const META: Record<PrivacyLevel, { icon: typeof Lock; tone: string }> = {
  Private: {
    icon: Lock,
    tone: "bg-navy-900/[0.06] text-navy-700 ring-navy-900/15",
  },
  "Approved Contacts Only": {
    icon: Users,
    tone: "bg-gold-500/15 text-gold-700 ring-gold-500/40",
  },
  Public: {
    icon: Globe,
    tone: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30",
  },
};

export default function PrivacyBadge({ level }: { level: PrivacyLevel }) {
  const m = META[level];
  const Icon = m.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full ring-1 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] font-bold",
        m.tone
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2.4} />
      {level}
    </span>
  );
}
