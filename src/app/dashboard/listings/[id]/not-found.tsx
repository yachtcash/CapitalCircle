import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)] flex items-center">
      <div className="max-w-xl mx-auto px-5 md:px-10 py-20 text-center">
        <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
          Dashboard
        </div>
        <span className="mt-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-gold-500 ring-1 ring-navy-900/5 mx-auto">
          <AlertCircle className="h-6 w-6" strokeWidth={1.8} />
        </span>
        <h1 className="mt-6 text-3xl md:text-4xl font-semibold text-navy-900 tracking-tight">
          Listing not found.
        </h1>
        <p className="mt-3 text-navy-700/70 text-sm md:text-base leading-relaxed">
          This listing may have been deleted, archived, or the link is incorrect.
          Head back to the dashboard to find your active listings.
        </p>
        <Link
          href="/dashboard"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-6 py-3 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
