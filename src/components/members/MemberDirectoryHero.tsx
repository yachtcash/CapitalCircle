import { Users, ShieldCheck, HandCoins } from "lucide-react";

export default function MemberDirectoryHero({
  totalMembers,
  totalVerified,
  totalFeatured,
}: {
  totalMembers: number;
  totalVerified: number;
  totalFeatured: number;
}) {
  return (
    <section className="bg-navy-900 text-white">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-12 md:py-16">
        <div className="text-[11px] uppercase tracking-[0.22em] text-gold-400 font-bold inline-flex items-center gap-2">
          <Users className="h-3.5 w-3.5" strokeWidth={2.4} />
          Member Directory
        </div>
        <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
          Discover sponsors, investors, operators, and service providers across
          Capital Circle.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-white/75 leading-relaxed">
          Members never receive each other&apos;s direct contact information.
          Capital Circle reviews every introduction request and brokers the
          connection.
        </p>

        <dl className="mt-8 grid grid-cols-3 gap-4 max-w-2xl">
          <Stat
            label="Members"
            value={totalMembers.toLocaleString()}
            Icon={Users}
          />
          <Stat
            label="Verified"
            value={totalVerified.toLocaleString()}
            Icon={ShieldCheck}
          />
          <Stat
            label="Featured"
            value={totalFeatured.toLocaleString()}
            Icon={HandCoins}
          />
        </dl>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  Icon,
}: {
  label: string;
  value: string;
  Icon: typeof Users;
}) {
  return (
    <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-gold-400 font-bold inline-flex items-center gap-1.5">
        <Icon className="h-3 w-3" strokeWidth={2.4} />
        {label}
      </div>
      <div className="mt-1.5 text-xl md:text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </div>
    </div>
  );
}
