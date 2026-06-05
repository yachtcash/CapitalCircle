import { Home, PlusCircle, MessageSquare, User, type LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  shortLabel: string;
  href: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { label: "Home", shortLabel: "Home", href: "/", icon: Home },
  { label: "Create Listing", shortLabel: "Create", href: "/create-listing", icon: PlusCircle },
  { label: "Messages", shortLabel: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Profile", shortLabel: "Profile", href: "/profile", icon: User },
];
