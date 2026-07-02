"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
};

const WIDTHS: Record<NonNullable<Props["maxWidth"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

/**
 * Canonical modal (relocated from negotiations/Modal — same markup and
 * behaviour, widened size scale). Escape closes, body scroll locks, backdrop
 * blurs, content scrolls with a sticky footer.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "md",
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-navy-900/55 backdrop-blur-sm"
      />
      <div
        className={`relative w-full ${WIDTHS[maxWidth]} bg-white rounded-2xl ring-1 ring-navy-900/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden`}
      >
        <header className="flex items-start justify-between gap-3 px-5 md:px-7 pt-5 md:pt-6 pb-3">
          <div className="min-w-0">
            <h2 id="modal-title" className="text-lg md:text-xl font-semibold text-navy-900 tracking-tight">
              {title}
            </h2>
            {description ? (
              <p className="mt-1.5 text-sm text-navy-700/70 leading-relaxed">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-full text-navy-700/60 hover:text-navy-900 hover:bg-bone transition-colors -mr-2 -mt-1"
          >
            <X className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </header>

        <div className="px-5 md:px-7 py-4 overflow-y-auto">{children}</div>

        {footer ? (
          <footer className="px-5 md:px-7 py-4 border-t border-navy-900/[0.06] bg-bone/30 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
