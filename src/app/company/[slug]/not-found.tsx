import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)] flex items-center">
      <div className="max-w-xl mx-auto px-5 md:px-10 py-20 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-gold-500 ring-1 ring-navy-900/5 mx-auto">
          <AlertCircle className="h-6 w-6" strokeWidth={1.8} />
        </span>
        <h1 className="mt-6 text-3xl md:text-4xl font-semibold text-navy-900 tracking-tight">
          Company not found
        </h1>
        <p className="mt-3 text-navy-700/70 text-sm md:text-base leading-relaxed">
          This company profile may have been removed or never existed. Browse current
          opportunities to discover sponsors active on Capital Circle.
        </p>
        <Link
          href="/#opportunities"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-6 py-3 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
          Back to the Marketplace
        </Link>
      </div>
    </div>
  );
}
