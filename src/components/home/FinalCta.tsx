import Link from "next/link";
import { LayoutGrid, Building2, Map as MapIcon, PlusCircle, ArrowRight, type LucideIcon } from "lucide-react";

const ACTIONS: { href: string; label: string; icon: LucideIcon; primary?: boolean }[] = [
  { href: "/opportunities", label: "Browse Opportunities", icon: LayoutGrid, primary: true },
  { href: "/companies", label: "View Sponsors", icon: Building2 },
  { href: "/map", label: "Explore Map", icon: MapIcon },
  { href: "/create-listing", label: "Create Listing", icon: PlusCircle },
];

export default function FinalCta() {
  return (
    <section className="relative hero-gradient text-white overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative max-w-6xl mx-auto px-5 md:px-10 py-16 md:py-24 text-center">
        <div className="text-[11px] uppercase tracking-[0.2em] text-gold-500 font-semibold">
          Capital Circle
        </div>
        <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight max-w-2xl mx-auto text-balance">
          Where serious capital meets real opportunity.
        </h2>
        <p className="mt-4 text-base md:text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
          Browse vetted deals, connect directly with sponsors, and put your capital to work.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          {ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={
                a.primary
                  ? "group inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-6 py-3 text-sm transition-colors"
                  : "inline-flex items-center justify-center gap-2 rounded-full bg-white/5 hover:bg-white/10 ring-1 ring-white/15 text-white font-medium px-6 py-3 text-sm transition-colors"
              }
            >
              <a.icon className={`h-4 w-4 ${a.primary ? "" : "text-gold-400"}`} strokeWidth={2} />
              {a.label}
              {a.primary ? (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
              ) : null}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
