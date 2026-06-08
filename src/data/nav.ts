import {
  Home,
  LayoutDashboard,
  Compass,
  Building2,
  Map as MapIcon,
  PlusCircle,
  MessageSquare,
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
};

export const navItems: NavItem[] = [
  { label: "Home", shortLabel: "Home", href: "/", icon: Home },
  { label: "Opportunities", shortLabel: "Browse", href: "/opportunities", icon: Compass },
  { label: "Companies", shortLabel: "Firms", href: "/companies", icon: Building2, hideOnMobile: true },
  { label: "Map", shortLabel: "Map", href: "/map", icon: MapIcon },
  { label: "Dashboard", shortLabel: "Dash", href: "/dashboard", icon: LayoutDashboard, hideOnMobile: true },
  { label: "Create Listing", shortLabel: "Create", href: "/create-listing", icon: PlusCircle, hideOnMobile: true },
  { label: "Messages", shortLabel: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Profile", shortLabel: "Profile", href: "/profile", icon: User },
];
