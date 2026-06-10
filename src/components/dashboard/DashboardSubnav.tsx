"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  ListChecks,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

type SubNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

const ITEMS: SubNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Deals", href: "/dashboard/deals", icon: Briefcase },
  { label: "Listings", href: "/dashboard/listings", icon: ListChecks },
  { label: "Introductions", href: "/dashboard/introductions", icon: UserPlus },
];

export default function DashboardSubnav() {
  const pathname = usePathname() ?? "";
  return (
    <nav
      aria-label="Dashboard sections"
      className="bg-white border-b border-navy-900/[0.06]"
    >
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="flex items-stretch gap-0.5 overflow-x-auto">
          {ITEMS.map(({ label, href, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative inline-flex items-center gap-2 px-4 md:px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors",
                  active
                    ? "text-navy-900"
                    : "text-navy-700/60 hover:text-navy-900"
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                {label}
                <span
                  className={cn(
                    "absolute inset-x-3 -bottom-px h-0.5 rounded-full transition-opacity",
                    active ? "bg-gold-500 opacity-100" : "opacity-0"
                  )}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
