import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function Hero() {
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
      <div className="relative max-w-6xl mx-auto px-5 md:px-10 pt-12 md:pt-20 pb-14 md:pb-24">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 backdrop-blur ring-1 ring-white/10 px-3 py-1.5 text-xs text-white/80">
          <ShieldCheck className="h-3.5 w-3.5 text-gold-500" strokeWidth={2} />
          <span className="tracking-wide">Vetted Members · Private Deal Flow</span>
        </div>

        <h1 className="mt-6 md:mt-7 text-balance text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight max-w-3xl">
          Where serious capital
          <br className="hidden sm:block" />
          meets <span className="text-gold-500">real opportunity</span>.
        </h1>

        <p className="mt-5 md:mt-6 text-base md:text-lg text-white/70 max-w-2xl leading-relaxed">
          Capital Circle is the private marketplace connecting investors, developers, entrepreneurs,
          land owners, suppliers, and business professionals on deals you won&apos;t find anywhere else.
        </p>

        <div className="mt-7 md:mt-9 flex flex-col sm:flex-row gap-3">
          <Link
            href="/post"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-6 py-3 text-sm transition-colors"
          >
            Post an Opportunity
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
          </Link>
          <Link
            href="#opportunities"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white/5 hover:bg-white/10 ring-1 ring-white/15 text-white font-medium px-6 py-3 text-sm transition-colors"
          >
            Browse the Marketplace
          </Link>
        </div>

        <div className="mt-12 md:mt-16 grid grid-cols-3 max-w-2xl gap-6 md:gap-10">
          <Stat value="$2.4B+" label="Deal Flow" />
          <Stat value="1,200+" label="Active Members" />
          <Stat value="47" label="Countries" />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl md:text-3xl font-semibold text-white tracking-tight">{value}</div>
      <div className="mt-1 text-[10px] md:text-xs uppercase tracking-[0.18em] text-gold-400/90">
        {label}
      </div>
    </div>
  );
}
