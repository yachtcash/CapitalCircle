import { ShieldCheck, Clock3, Crown } from "lucide-react";
import type { VerificationStatus } from "@/data/companies";
import Badge from "@/components/ui/Badge";

const styles: Record<
  VerificationStatus,
  { wrap: string; icon: typeof ShieldCheck }
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
    <Badge size={size === "sm" ? "md" : "lg"} className={style.wrap}>
      <Icon
        className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"}
        strokeWidth={2.5}
      />
      {status}
    </Badge>
  );
}
