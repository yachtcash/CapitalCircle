"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Archive,
  CheckCircle2,
  Copy,
  Eye,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import type { ListingRecord } from "@/data/listings";
import { cn } from "@/lib/cn";

type Props = {
  listing: ListingRecord;
  onDuplicateSuccess?: (newId: string) => void;
  align?: "left" | "right";
};

type MenuItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
};

export default function ListingActionsMenu({
  listing,
  onDuplicateSuccess,
  align = "right",
}: Props) {
  const {
    duplicateListing,
    archiveListing,
    restoreListing,
    markListingClosed,
  } = useMessaging();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const close = () => setOpen(false);

  const items: MenuItem[] = [
    {
      key: "view",
      label: "View Listing",
      icon: Eye,
      href: listing.opportunitySlug
        ? `/opportunity/${listing.opportunitySlug}`
        : undefined,
      disabled: !listing.opportunitySlug,
    },
    {
      key: "manage",
      label: "Manage",
      icon: Settings,
      href: `/dashboard/listings/${listing.id}`,
    },
    {
      key: "edit",
      label: "Edit Details",
      icon: Pencil,
      href: `/dashboard/listings/${listing.id}?tab=edit`,
    },
    {
      key: "duplicate",
      label: "Duplicate Listing",
      icon: Copy,
      onClick: () => {
        const newId = duplicateListing(listing.id);
        if (newId && onDuplicateSuccess) onDuplicateSuccess(newId);
        close();
      },
    },
  ];

  if (listing.status !== "Archived") {
    items.push({
      key: "closed",
      label: "Mark Closed",
      icon: CheckCircle2,
      onClick: () => {
        markListingClosed(listing.id);
        close();
      },
    });
    items.push({
      key: "archive",
      label: "Archive Listing",
      icon: Archive,
      destructive: true,
      onClick: () => {
        if (typeof window !== "undefined") {
          const ok = window.confirm(
            `Archive ${listing.title}? It will be removed from the active marketplace.`
          );
          if (!ok) return;
        }
        archiveListing(listing.id);
        close();
      },
    });
  } else {
    items.push({
      key: "restore",
      label: "Restore",
      icon: RotateCcw,
      onClick: () => {
        restoreListing(listing.id);
        close();
      },
    });
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Listing actions"
        className="inline-flex items-center justify-center h-8 w-8 rounded-full text-navy-700 hover:bg-navy-900/[0.06] focus:outline-none focus:ring-2 focus:ring-gold-500/40"
      >
        <MoreHorizontal className="h-4 w-4" strokeWidth={2.2} />
      </button>

      {open ? (
        <ul
          role="menu"
          className={cn(
            "absolute top-full mt-2 min-w-[200px] bg-white ring-1 ring-navy-900/[0.08] shadow-lg shadow-navy-900/10 rounded-xl py-1.5 z-30",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((item) => {
            const Icon = item.icon;
            const content = (
              <span
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                  item.disabled
                    ? "text-navy-700/40 cursor-not-allowed"
                    : item.destructive
                      ? "text-rose-700 hover:bg-rose-500/[0.07]"
                      : "text-navy-900/85 hover:bg-bone hover:text-navy-900"
                )}
              >
                <Icon
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    item.disabled
                      ? "text-navy-700/30"
                      : item.destructive
                        ? "text-rose-600"
                        : "text-gold-600"
                  )}
                  strokeWidth={2.2}
                />
                <span className="truncate">{item.label}</span>
              </span>
            );

            if (item.href && !item.disabled) {
              return (
                <li key={item.key} role="none">
                  <Link
                    role="menuitem"
                    href={item.href}
                    onClick={close}
                    className="block"
                  >
                    {content}
                  </Link>
                </li>
              );
            }

            return (
              <li key={item.key} role="none">
                <button
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={item.onClick}
                  className="w-full text-left"
                >
                  {content}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
