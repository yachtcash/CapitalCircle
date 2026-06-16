import {
  Home,
  LayoutDashboard,
  Compass,
  Building2,
  Users,
  Briefcase,
  ShieldCheck,
  Map as MapIcon,
  PlusCircle,
  MessageSquare,
  CalendarDays,
  User,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  shortLabel: string;
  href: string;
  icon: LucideIcon;
  /** When true, hide from the mobile bottom nav (still in desktop sidebar). */
  hideOnMobile?: boolean;
  /** When true, only render for roles with canAccessAdmin (Admin+). */
  adminOnly?: boolean;
  /** When true, only render for roles/members that can view the calendar. */
  calendarGated?: boolean;
};

export const navItems: NavItem[] = [
  { label: "Home", shortLabel: "Home", href: "/", icon: Home },
  { label: "Opportunities", shortLabel: "Browse", href: "/opportunities", icon: Compass },
  { label: "Companies", shortLabel: "Firms", href: "/companies", icon: Building2, hideOnMobile: true },
  { label: "Members", shortLabel: "Members", href: "/members", icon: Users },
  { label: "Map", shortLabel: "Map", href: "/map", icon: MapIcon },
  { label: "Deal Desk", shortLabel: "Deals", href: "/deal-desk", icon: Briefcase },
  { label: "Calendar", shortLabel: "Calendar", href: "/calendar", icon: CalendarDays, calendarGated: true, hideOnMobile: true },
  { label: "Admin", shortLabel: "Admin", href: "/admin", icon: ShieldCheck, adminOnly: true },
  { label: "Dashboard", shortLabel: "Dash", href: "/dashboard", icon: LayoutDashboard, hideOnMobile: true },
  { label: "Create Listing", shortLabel: "Create", href: "/create-listing", icon: PlusCircle, hideOnMobile: true },
  { label: "Messages", shortLabel: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Profile", shortLabel: "Profile", href: "/profile", icon: User },
];
