import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CapitalCircleMark from "@/components/brand/CapitalCircleMark";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-cream flex items-center justify-center px-5 py-20">
      <div className="text-center max-w-md">
        <CapitalCircleMark className="h-14 w-14 mx-auto" />
        <div className="mt-6 text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
          Capital Circle
        </div>
        <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-navy-900 tracking-tight">
          Page not found
        </h1>
        <p className="mt-3 text-sm md:text-[15px] text-navy-700/70 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back to the marketplace.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-5 py-2.5 text-sm transition-colors"
          >
            Back to home
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
          </Link>
          <Link
            href="/opportunities"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white ring-1 ring-navy-900/[0.12] hover:ring-navy-900/30 text-navy-900 font-semibold px-5 py-2.5 text-sm transition-colors"
          >
            Browse opportunities
          </Link>
        </div>
      </div>
    </div>
  );
}
