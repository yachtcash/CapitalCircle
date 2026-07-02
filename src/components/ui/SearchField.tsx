"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Canonical search input: rounded-full field with search icon, gold focus
 * ring, and an accessible clear button. Controlled.
 */
export default function SearchField({
  value,
  onChange,
  placeholder = "Search…",
  size = "md",
  className,
  inputClassName,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  size?: "md" | "lg";
  className?: string;
  inputClassName?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-700/50"
        strokeWidth={2}
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-full bg-white ring-1 ring-navy-900/[0.08] focus:ring-2 focus:ring-gold-500 outline-none pl-9 pr-9 text-navy-900 placeholder:text-navy-700/45 transition-shadow",
          size === "lg" ? "py-3 text-sm md:text-base" : "py-2 text-sm",
          inputClassName
        )}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 h-6 w-6 inline-flex items-center justify-center rounded-full text-navy-700/55 hover:text-navy-900 hover:bg-bone transition-colors"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.4} />
        </button>
      ) : null}
    </div>
  );
}
