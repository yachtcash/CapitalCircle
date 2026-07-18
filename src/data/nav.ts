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
  BarChart3,
  User,
  Bell,
  LogIn,
  Search,
  Gavel,
  FileText,
  Gauge,
  type LucideIcon,
} from "lucide-react";
import {
  canAccessAdmin,
  canManageListings,
  canReviewQueue,
  canViewCalendar,
  experienceForRole,
  type Role,
} from "@/lib/roles";

export type NavItem = {
  label: string;
  shortLabel: string;
  href: string;
  icon: LucideIcon;
  /** When true, hide from the mobile bottom nav (still in desktop sidebar). */
  hideOnMobile?: boolean;
  /** Primary action — rendered highlighted (gold) in navigation. */
  highlight?: boolean;
  /** When true, only render for roles with canAccessAdmin (Admin+). */
  adminOnly?: boolean;
  /** When true, only render for roles/members that can view the calendar. */
  calendarGated?: boolean;
};

// ---- Experience navigation sets ------------------------------------------

/** Guest — marketplace browsing only. */
const GUEST_NAV: NavItem[] = [
  { label: "Home", shortLabel: "Home", href: "/", icon: Home },
  { label: "Opportunities", shortLabel: "Browse", href: "/opportunities", icon: Compass },
  { label: "Companies", shortLabel: "Firms", href: "/companies", icon: Building2 },
  { label: "Members", shortLabel: "Members", href: "/members", icon: Users },
  { label: "Map", shortLabel: "Map", href: "/map", icon: MapIcon },
  { label: "Search", shortLabel: "Search", href: "/search", icon: Search },
  { label: "Login", shortLabel: "Login", href: "/login", icon: LogIn },
];

/** Member — the investment portal. */
const MEMBER_NAV: NavItem[] = [
  { label: "Opportunities", shortLabel: "Browse", href: "/opportunities", icon: Compass },
  { label: "Companies", shortLabel: "Firms", href: "/companies", icon: Building2, hideOnMobile: true },
  { label: "Members", shortLabel: "Members", href: "/members", icon: Users, hideOnMobile: true },
  { label: "Map", shortLabel: "Map", href: "/map", icon: MapIcon, hideOnMobile: true },
  { label: "Create Opportunity", shortLabel: "Create", href: "/create-listing", icon: PlusCircle, highlight: true },
  { label: "Messages", shortLabel: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Notifications", shortLabel: "Alerts", href: "/notifications", icon: Bell, hideOnMobile: true },
  { label: "My Dashboard", shortLabel: "My Desk", href: "/my", icon: LayoutDashboard },
  { label: "My Calendar", shortLabel: "Calendar", href: "/my/calendar", icon: CalendarDays, hideOnMobile: true },
  { label: "Profile", shortLabel: "Profile", href: "/profile", icon: User },
];

/** Internal operations — Admin / Super Admin. Unchanged from before. */
const OPERATIONS_NAV: NavItem[] = [
  { label: "Home", shortLabel: "Home", href: "/", icon: Home },
  { label: "Command Center", shortLabel: "Command", href: "/command", icon: Gauge, hideOnMobile: true },
  { label: "Opportunities", shortLabel: "Browse", href: "/opportunities", icon: Compass },
  { label: "Companies", shortLabel: "Firms", href: "/companies", icon: Building2, hideOnMobile: true },
  { label: "Members", shortLabel: "Members", href: "/members", icon: Users },
  { label: "Map", shortLabel: "Map", href: "/map", icon: MapIcon },
  { label: "Deal Desk", shortLabel: "Deals", href: "/deal-desk", icon: Briefcase },
  { label: "Calendar", shortLabel: "Calendar", href: "/calendar", icon: CalendarDays, calendarGated: true, hideOnMobile: true },
  { label: "Analytics", shortLabel: "Stats", href: "/analytics", icon: BarChart3, adminOnly: true },
  { label: "Admin", shortLabel: "Admin", href: "/admin", icon: ShieldCheck, adminOnly: true },
  { label: "Dashboard", shortLabel: "Dash", href: "/dashboard", icon: LayoutDashboard, hideOnMobile: true },
  { label: "Create Opportunity", shortLabel: "Create", href: "/create-listing", icon: PlusCircle, hideOnMobile: true },
  { label: "Messages", shortLabel: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Profile", shortLabel: "Profile", href: "/profile", icon: User },
];

/**
 * Role-aware navigation — the single source for sidebar + bottom nav.
 * Moderators and Editors live in the member portal with their extra tool.
 */
export function navItemsForRole(role: Role, calendarGranted = false): NavItem[] {
  const experience = experienceForRole(role);
  if (experience === "guest") return GUEST_NAV;
  if (experience === "operations") {
    return OPERATIONS_NAV.filter((i) => {
      if (i.adminOnly && !canAccessAdmin(role)) return false;
      if (i.calendarGated && !canViewCalendar(role, calendarGranted)) return false;
      return true;
    });
  }
  // Member portal (+ role extras)
  const items = [...MEMBER_NAV];
  if (canReviewQueue(role) && role === "Moderator") {
    items.splice(items.length - 1, 0, {
      label: "Moderation",
      shortLabel: "Queue",
      href: "/admin/moderation",
      icon: Gavel,
      hideOnMobile: true,
    });
  }
  if (role === "Editor" && canManageListings(role)) {
    items.splice(items.length - 1, 0, {
      label: "Content",
      shortLabel: "Content",
      href: "/admin/listings",
      icon: FileText,
      hideOnMobile: true,
    });
  }
  return items;
}

/** Legacy flat list — retained for compatibility; new surfaces use navItemsForRole. */
export const navItems: NavItem[] = OPERATIONS_NAV;
