"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

type Props = {
  initialValue: string;
  onSubmit: (value: string) => void;
  placeholder?: string;
  size?: "md" | "lg";
};

export default function SearchInput({
  initialValue,
  onSubmit,
  placeholder = "Search opportunities, sponsors, locations…",
  size = "lg",
}: Props) {
  const [value, setValue] = useState(initialValue);

  // Keep local state in sync if URL is mutated elsewhere (e.g. ribbon click)
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(value.trim());
  };

  const clear = () => {
    setValue("");
    onSubmit("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 bg-white rounded-full ring-1 ring-navy-900/[0.08] focus-within:ring-2 focus-within:ring-gold-500 shadow-sm transition-shadow"
    >
      <span className="pl-4 text-navy-700/60">
        <Search className="h-4 w-4" strokeWidth={2} />
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={`flex-1 bg-transparent outline-none text-navy-900 placeholder:text-navy-700/45 ${
          size === "lg" ? "py-3 text-sm md:text-base" : "py-2 text-sm"
        }`}
      />
      {value ? (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="h-7 w-7 mr-1 inline-flex items-center justify-center rounded-full hover:bg-bone text-navy-700/65 hover:text-navy-900 transition-colors"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.4} />
        </button>
      ) : null}
      <button
        type="submit"
        className="mr-1.5 inline-flex items-center justify-center rounded-full bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs uppercase tracking-[0.14em] px-4 py-2 transition-colors"
      >
        Search
      </button>
    </form>
  );
}
