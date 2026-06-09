import { FileText, Lock, ArrowDownToLine } from "lucide-react";
import type { OpportunityDocument } from "@/data/opportunities";

type Props = {
  documents: OpportunityDocument[];
  /**
   * Click handler for per-card "Request Access" buttons. Required for the
   * buttons to do anything — typically wired by the parent to open the same
   * `RequestAccessModal` used by `OpportunityDataRoomBlock`.
   */
  onRequestAccess?: () => void;
};

export default function DocumentsBlock({ documents, onRequestAccess }: Props) {
  return (
    <section>
      <SectionHeader
        eyebrow="Data Room"
        title="Documents"
        hint="Released after NDA is countersigned"
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {documents.map((doc) => (
          <article
            key={doc.name}
            className="group relative rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 flex flex-col gap-4 hover:ring-gold-500/50 hover:shadow-md hover:shadow-navy-900/[0.04] transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-gold-500 ring-1 ring-navy-900/5">
                <FileText className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-navy-700/60 font-semibold">
                <Lock className="h-3 w-3" strokeWidth={2.5} />
                Locked
              </span>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-gold-600 font-semibold">
                {doc.type}
              </div>
              <h3 className="mt-1.5 text-sm font-semibold text-navy-900 leading-snug">
                {doc.name}
              </h3>
            </div>

            <div className="mt-auto flex items-center justify-between text-[11px] text-navy-700/55">
              <span>{doc.pages} pages · PDF</span>
              <span>Updated {doc.updated}</span>
            </div>

            <button
              type="button"
              onClick={onRequestAccess}
              disabled={!onRequestAccess}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-bone hover:bg-gold-500 text-navy-900 text-xs font-semibold uppercase tracking-wider px-3 py-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-bone"
            >
              <ArrowDownToLine className="h-3.5 w-3.5" strokeWidth={2.4} />
              Request Access
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  hint,
}: {
  eyebrow: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-5 flex flex-col gap-1">
      <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
        {eyebrow}
      </div>
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">{title}</h2>
        {hint ? <span className="text-xs text-navy-700/55">{hint}</span> : null}
      </div>
    </div>
  );
}
