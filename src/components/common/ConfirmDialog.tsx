"use client";

import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Lightweight inline confirmation dialog used by destructive listing /
 * image / document actions. Replaces ad-hoc `window.confirm` so the UI
 * stays inside the app's design system and survives the Next.js server
 * render path.
 */
export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-[70] bg-navy-900/65 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl ring-1 ring-navy-900/[0.08] shadow-2xl shadow-navy-900/40 w-full max-w-md p-5 md:p-6"
      >
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1",
                tone === "danger"
                  ? "bg-rose-500/10 text-rose-700 ring-rose-500/30"
                  : "bg-gold-500/15 text-gold-700 ring-gold-500/40"
              )}
            >
              <AlertTriangle className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <h2
              id="confirm-title"
              className="text-base md:text-lg font-semibold text-navy-900 tracking-tight"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close dialog"
            className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full text-navy-700/55 hover:text-navy-900 hover:bg-navy-900/[0.06] transition-colors"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.4} />
          </button>
        </header>

        {body ? (
          <p className="mt-3 text-sm text-navy-700/80 leading-relaxed">{body}</p>
        ) : null}

        <footer className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-bone transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "inline-flex items-center justify-center rounded-full font-semibold px-5 py-2 text-sm transition-colors",
              tone === "danger"
                ? "bg-rose-600 hover:bg-rose-500 text-white"
                : "bg-gold-500 hover:bg-gold-400 text-navy-900"
            )}
          >
            {confirmLabel}
          </button>
        </footer>
      </div>
    </div>
  );
}
