import {
  Handshake,
  UserPlus,
  Building2,
  UserRound,
  Sparkles,
  FileText,
  Image as ImageIcon,
  CalendarDays,
  MessageSquare,
  Shield,
  ShieldAlert,
  Gavel,
  Megaphone,
  Settings,
  TrendingUp,
  Bookmark,
  Bell,
  type LucideIcon,
} from "lucide-react";
import type {
  NotificationIcon,
  NotificationPriority,
  NotificationTone,
} from "@/data/notifications/types";
import type { Tone } from "@/lib/design/tokens";

/** Icon key → Lucide component. */
export const NOTIFICATION_ICONS: Record<NotificationIcon, LucideIcon> = {
  handshake: Handshake,
  "user-plus": UserPlus,
  building: Building2,
  user: UserRound,
  sparkles: Sparkles,
  "file-text": FileText,
  image: ImageIcon,
  calendar: CalendarDays,
  message: MessageSquare,
  shield: Shield,
  "shield-alert": ShieldAlert,
  gavel: Gavel,
  megaphone: Megaphone,
  settings: Settings,
  "trending-up": TrendingUp,
  bookmark: Bookmark,
  bell: Bell,
};

/** Tone → icon-tile classes (soft tinted square, institutional). */
export const TONE_TILE: Record<NotificationTone, string> = {
  neutral: "bg-navy-900/[0.05] text-navy-700 ring-navy-900/10",
  gold: "bg-gold-500/10 text-gold-700 ring-gold-500/25",
  success: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-700 ring-amber-500/20",
  danger: "bg-rose-500/10 text-rose-600 ring-rose-500/20",
  info: "bg-sky-500/10 text-sky-600 ring-sky-500/20",
  violet: "bg-violet-500/10 text-violet-600 ring-violet-500/20",
  navy: "bg-navy-900 text-gold-400 ring-navy-900",
};

/** Priority → shared Badge tone. */
export const PRIORITY_BADGE_TONE: Record<NotificationPriority, Tone> = {
  Critical: "danger",
  High: "warning",
  Normal: "info",
  Low: "neutral",
  Info: "neutral",
};

export const PRIORITY_RANK: Record<NotificationPriority, number> = {
  Critical: 0,
  High: 1,
  Normal: 2,
  Low: 3,
  Info: 4,
};
