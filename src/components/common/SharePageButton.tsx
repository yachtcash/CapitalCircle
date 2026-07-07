"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Quiet share affordance: copies the current page URL to the clipboard
 * (using the native share sheet on devices that have one) and confirms
 * inline. No external services, no persistence.
 */
export default function SharePageButton({
  label = "Share this page",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Share sheet dismissed or clipboard unavailable — do nothing.
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      aria-label={copied ? "Link copied" : label}
      title={copied ? "Link copied" : label}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] ring-1 transition-colors",
        copied
          ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/30"
          : "bg-white text-navy-900 ring-navy-900/[0.12] hover:ring-navy-900/30",
        className
      )}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
      ) : (
        <Share2 className="h-3.5 w-3.5" strokeWidth={2.2} />
      )}
      {copied ? "Copied" : "Share"}
    </button>
  );
}
