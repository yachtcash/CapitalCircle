"use client";

import Image from "next/image";
import { Pencil, FileText } from "lucide-react";
import type { FormState } from "./types";

type Props = {
  formData: FormState;
  onEdit: (step: number) => void;
};

function fmtAmount(amount: string, currency: string): string {
  const raw = amount.replace(/[^0-9.]/g, "");
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n) || n === 0) return amount;
  const formatted = n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return `${currency} ${formatted}`;
}

export default function ReviewSummary({ formData, onEdit }: Props) {
  const location = [formData.city, formData.stateProvince, formData.country]
    .filter((s) => s && s.trim().length > 0)
    .join(", ");

  return (
    <div className="space-y-4 md:space-y-5">
      <ReviewBlock title="Listing setup" step={1} onEdit={onEdit}>
        <Row label="Listing type" value={formData.listingType ?? "—"} />
        <Row label="Category" value={formData.category ?? "—"} />
        <Row label="Deal type" value={formData.dealType ?? "—"} />
      </ReviewBlock>

      <ReviewBlock title="Basic information" step={4} onEdit={onEdit}>
        <Row label="Listing title" value={formData.title || "—"} />
        <Row label="Company" value={formData.companyName || "—"} />
        <Row label="Location" value={location || "—"} />
        <Row label="Industry" value={formData.industry || "—"} />
      </ReviewBlock>

      <ReviewBlock title="Description" step={5} onEdit={onEdit}>
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-navy-700/55 font-semibold">
            Executive summary
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-navy-900 whitespace-pre-wrap">
            {formData.executiveSummary || "—"}
          </p>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-navy-700/55 font-semibold">
            Full description
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-navy-700/85 whitespace-pre-wrap">
            {formData.fullDescription || "—"}
          </p>
        </div>
      </ReviewBlock>

      <ReviewBlock title="Financial" step={6} onEdit={onEdit}>
        <Row label="Value type" value={formData.valueType ?? "—"} />
        {formData.valueType !== "Contact For Details" ? (
          <Row
            label="Amount"
            value={
              formData.amount
                ? fmtAmount(formData.amount, formData.currency)
                : "—"
            }
          />
        ) : (
          <Row label="Amount" value="Hidden — contact for details" />
        )}
      </ReviewBlock>

      <ReviewBlock
        title={`Media (${formData.images.length})`}
        step={7}
        onEdit={onEdit}
      >
        {formData.images.length === 0 ? (
          <p className="text-sm text-navy-700/55">No images uploaded.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {formData.images.slice(0, 10).map((img) => (
              <div
                key={img.id}
                className="relative aspect-square rounded-lg overflow-hidden ring-1 ring-navy-900/5 bg-navy-900/5"
              >
                <Image
                  src={img.previewUrl}
                  alt={img.name}
                  fill
                  sizes="120px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
            {formData.images.length > 10 ? (
              <div className="aspect-square rounded-lg bg-navy-900 text-white text-sm font-semibold flex items-center justify-center">
                +{formData.images.length - 10}
              </div>
            ) : null}
          </div>
        )}
      </ReviewBlock>

      <ReviewBlock
        title={`Documents (${formData.documents.length})`}
        step={8}
        onEdit={onEdit}
      >
        {formData.documents.length === 0 ? (
          <p className="text-sm text-navy-700/55">No documents attached.</p>
        ) : (
          <ul className="space-y-1.5">
            {formData.documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center gap-2 text-sm text-navy-900"
              >
                <FileText className="h-4 w-4 text-gold-600 shrink-0" strokeWidth={1.8} />
                <span className="truncate">{doc.name}</span>
              </li>
            ))}
          </ul>
        )}
      </ReviewBlock>
    </div>
  );
}

function ReviewBlock({
  title,
  step,
  onEdit,
  children,
}: {
  title: string;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] overflow-hidden">
      <header className="flex items-center justify-between gap-3 px-5 md:px-6 py-3.5 border-b border-navy-900/[0.06]">
        <h3 className="text-sm font-semibold text-navy-900">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] font-semibold text-gold-600 hover:text-gold-700 transition-colors"
        >
          <Pencil className="h-3 w-3" strokeWidth={2.4} />
          Edit
        </button>
      </header>
      <div className="px-5 md:px-6 py-4 md:py-5 space-y-3">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[180px_minmax(0,1fr)] gap-1 sm:gap-4">
      <span className="text-[11px] uppercase tracking-[0.14em] text-navy-700/55 font-semibold pt-0.5">
        {label}
      </span>
      <span className="text-sm text-navy-900 break-words">{value}</span>
    </div>
  );
}
