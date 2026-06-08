"use client";

import { useEffect, useState } from "react";
import { X, Expand, FileText, ArrowDownToLine } from "lucide-react";
import type { Attachment } from "@/data/messages";
import { formatBytes } from "@/data/messages";

function paletteFor(id: string): { from: string; to: string } {
  const palettes: Array<{ from: string; to: string }> = [
    { from: "#0A1628", to: "#1A3160" },
    { from: "#112344", to: "#4B6CA8" },
    { from: "#B8941F", to: "#0A1628" },
    { from: "#1A3160", to: "#D4AF37" },
    { from: "#294378", to: "#0A1628" },
    { from: "#0A1628", to: "#8C6F14" },
  ];
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum = (sum * 31 + id.charCodeAt(i)) >>> 0;
  return palettes[sum % palettes.length];
}

export function InlineImagePreview({ attachment }: { attachment: Attachment }) {
  const [open, setOpen] = useState(false);
  const { from, to } = paletteFor(attachment.id);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative w-full max-w-md overflow-hidden rounded-2xl ring-1 ring-navy-900/[0.08] hover:ring-gold-500/60 transition-all"
        aria-label={`Expand ${attachment.name}`}
      >
        <div
          className="aspect-[16/10] w-full"
          style={{
            backgroundImage: `radial-gradient(ellipse at 85% 15%, rgba(255,255,255,0.18), transparent 55%), linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
          }}
        >
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-bold bg-navy-900/70 text-white rounded-full px-2 py-0.5 backdrop-blur-sm">
            {attachment.type.toUpperCase()}
          </div>
          <div className="absolute inset-0 flex items-end p-3">
            <div className="flex items-center justify-between w-full">
              <div className="text-xs text-white truncate max-w-[70%] drop-shadow">
                {attachment.name}
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-bold text-white/90 bg-white/15 ring-1 ring-white/30 rounded-full px-2 py-0.5 group-hover:bg-white/25 transition-colors">
                <Expand className="h-3 w-3" strokeWidth={2.4} />
                Expand
              </span>
            </div>
          </div>
        </div>
      </button>

      {open ? (
        <Lightbox attachment={attachment} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}

function Lightbox({
  attachment,
  onClose,
}: {
  attachment: Attachment;
  onClose: () => void;
}) {
  const { from, to } = paletteFor(attachment.id);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] bg-navy-900/85 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="absolute -top-12 right-0 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] font-bold text-white/85 hover:text-white"
        >
          <X className="h-4 w-4" strokeWidth={2.4} />
          Close
        </button>
        <div
          className="aspect-video w-full rounded-2xl ring-1 ring-white/20 overflow-hidden"
          style={{
            backgroundImage: `radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.20), transparent 60%), linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
          }}
        >
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 text-sm">
          <div className="text-white truncate">
            <span className="font-semibold">{attachment.name}</span>
            <span className="ml-2 text-white/55 text-xs">
              {attachment.type.toUpperCase()} · {formatBytes(attachment.sizeBytes)}
            </span>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors"
          >
            <ArrowDownToLine className="h-3.5 w-3.5" strokeWidth={2.4} />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

export function PdfPreviewCard({ attachment }: { attachment: Attachment }) {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl ring-1 ring-navy-900/[0.08] bg-white">
      <div className="relative h-32 bg-gradient-to-br from-rose-50 via-white to-bone overflow-hidden">
        {/* Fake document lines */}
        <div className="absolute inset-x-5 top-5 space-y-1.5">
          <div className="h-2 w-24 rounded bg-rose-500/30" />
          <div className="h-1.5 w-full rounded bg-navy-900/10" />
          <div className="h-1.5 w-[88%] rounded bg-navy-900/10" />
          <div className="h-1.5 w-[60%] rounded bg-navy-900/10" />
          <div className="h-3" />
          <div className="h-1.5 w-[90%] rounded bg-navy-900/10" />
          <div className="h-1.5 w-[75%] rounded bg-navy-900/10" />
        </div>
        <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-bold bg-rose-600 text-white rounded-full px-2 py-0.5">
          <FileText className="h-3 w-3" strokeWidth={2.4} />
          PDF
        </span>
      </div>
      <div className="flex items-center gap-3 p-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-navy-900 truncate">{attachment.name}</div>
          <div className="text-[11px] text-navy-700/65 mt-0.5">
            PDF · {formatBytes(attachment.sizeBytes)}
          </div>
        </div>
        <button
          type="button"
          aria-label={`Download ${attachment.name}`}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full text-navy-900 hover:bg-bone px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] font-bold transition-colors"
        >
          <ArrowDownToLine className="h-3.5 w-3.5" strokeWidth={2.4} />
          Open
        </button>
      </div>
    </div>
  );
}
