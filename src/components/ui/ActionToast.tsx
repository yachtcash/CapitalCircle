"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, X } from "lucide-react";

export type ToastData = {
  id: string;
  message: string;
  href?: string;
  linkLabel?: string;
};

/**
 * Local toast state with the standard 5s auto-dismiss. Surfaces call
 * `show("Saved")` after an action; render `<ActionToast>` once per page.
 */
export function useActionToast() {
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const show = useCallback(
    (message: string, opts?: { href?: string; linkLabel?: string }) => {
      setToast({ id: `toast-${Date.now()}`, message, ...opts });
    },
    []
  );
  const dismiss = useCallback(() => setToast(null), []);

  return { toast, show, dismiss };
}

/**
 * The one action-feedback toast: navy pill, gold check, optional deep
 * link, dismissible, announced politely to screen readers.
 */
export default function ActionToast({
  toast,
  onDismiss,
}: {
  toast: ToastData | null;
  onDismiss: () => void;
}) {
  if (!toast) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50"
    >
      <div className="flex items-center gap-3 bg-navy-900 text-white rounded-2xl shadow-xl shadow-navy-900/30 ring-1 ring-gold-500/40 pl-3 pr-2 py-2">
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-500 text-navy-900">
          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.6} />
        </span>
        <span className="text-sm font-medium">{toast.message}</span>
        {toast.href ? (
          <Link
            href={toast.href}
            className="text-xs font-bold uppercase tracking-[0.14em] text-gold-400 hover:text-gold-300 ml-1"
          >
            {toast.linkLabel ?? "Open"}
          </Link>
        ) : null}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/[0.08]"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}
