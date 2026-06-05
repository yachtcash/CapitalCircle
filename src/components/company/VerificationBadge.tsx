import { ShieldCheck, Clock3, Crown } from "lucide-react";
import type { VerificationStatus } from "@/data/companies";
import { cn } from "@/lib/cn";

const styles: Record<
  VerificationStatus,
  { wrap: string; icon: typeof ShieldCheck; subLabel?: string }
> = {
  Pending: {
    wrap: "bg-navy-900/[0.05] text-navy-700 ring-navy-900/15",
    icon: Clock3,
  },
  Verified: {
    wrap: "bg-gold-500/15 text-gold-700 ring-gold-500/45",
    icon: ShieldCheck,
  },
  "Premium Verified": {
    wrap: "bg-navy-900 text-gold-400 ring-navy-900",
    icon: Crown,
    subLabel: "Premium",
  },
};

type Props = {
  status: VerificationStatus;
  size?: "sm" | "md";
};

export default function VerificationBadge({ status, size = "sm" }: Props) {
  const style = styles[status];
  const Icon = style.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 ring-1 rounded-full font-bold uppercase",
        size === "sm" ? "text-[10px] tracking-[0.14em] px-2.5 py-1" : "text-xs tracking-[0.16em] px-3 py-1.5",
        style.wrap
      )}
    >
      <Icon
        className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")}
        strokeWidth={2.5}
      />
      {status}
    </span>
  );
}
