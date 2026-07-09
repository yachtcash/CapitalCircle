import { Clock3, CheckCircle2, XCircle } from "lucide-react";
import type { AccessRequestStatus } from "@/data/documents";
import Badge from "@/components/ui/Badge";

const META: Record<
  AccessRequestStatus,
  { tone: string; icon: typeof Clock3 }
> = {
  Requested: { tone: "bg-gold-500/15 text-gold-700 ring-gold-500/40", icon: Clock3 },
  Approved: { tone: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30", icon: CheckCircle2 },
  Denied: { tone: "bg-rose-500/15 text-rose-700 ring-rose-500/30", icon: XCircle },
};

export default function AccessStatusBadge({ status }: { status: AccessRequestStatus }) {
  const m = META[status];
  const Icon = m.icon;
  return (
    <Badge className={m.tone}>
      <Icon className="h-3 w-3" strokeWidth={2.4} />
      {status}
    </Badge>
  );
}
