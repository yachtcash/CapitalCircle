import { Handshake, Star, Globe2, type LucideIcon } from "lucide-react";

const CARDS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Handshake,
    title: "Direct Sponsor Access",
    body: "Engage sponsors and developers directly — no brokers, no layers. Every opportunity connects you to the team behind the deal.",
  },
  {
    icon: Star,
    title: "Curated Opportunities",
    body: "Each opportunity is vetted and sponsor-verified before it reaches the marketplace, so your time goes to deals worth pursuing.",
  },
  {
    icon: Globe2,
    title: "Global Marketplace",
    body: "Institutional-grade deal flow across real estate, energy, infrastructure, and operating businesses in dozens of markets.",
  },
];

export default function WhyInvestorsJoin() {
  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-12 md:py-16">
        <div className="mb-8 md:mb-10 text-center">
          <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
            Why Investors Join
          </div>
          <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-navy-900 tracking-tight">
            Built for serious capital
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {CARDS.map((c) => (
            <div
              key={c.title}
              className="rounded-2xl bg-cream ring-1 ring-navy-900/[0.06] p-6 md:p-7"
            >
              <div className="h-11 w-11 rounded-xl bg-navy-900 text-gold-500 inline-flex items-center justify-center">
                <c.icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-navy-900">{c.title}</h3>
              <p className="mt-2 text-sm text-navy-700/70 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
