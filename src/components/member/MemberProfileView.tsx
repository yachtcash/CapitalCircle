"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Briefcase,
  Building2,
  CalendarDays,
  ShieldCheck,
  Sparkles,
  FileText,
  Activity,
  HandCoins,
  Images,
  Layers,
  MessageSquare,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";

import type { Member } from "@/data/members";
import { featuredOpportunities } from "@/data/opportunities";
import { companies } from "@/data/companies";
import RequestIntroductionModal from "@/components/members/RequestIntroductionModal";
import { MemberDealsPanel } from "@/components/dashboard/deals/DealIntegrations";
import MemberMediaManager from "@/components/member/MemberMediaManager";
import Lightbox, { useLightbox } from "@/components/common/Lightbox";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { useResolvedImage, useResolvedImages } from "@/lib/imageStore";
import { cn } from "@/lib/cn";

const verificationStyles: Record<Member["verification"], string> = {
  Verified: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30",
  "Founding Member": "bg-gold-500/20 text-gold-700 ring-gold-500/40",
  Pending: "bg-amber-500/15 text-amber-700 ring-amber-500/30",
  Unverified: "bg-navy-900/[0.06] text-navy-700 ring-navy-900/15",
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MemberProfileView({ member }: { member: Member }) {
  const [introOpen, setIntroOpen] = useState(false);
  // Live overlay-applied record so Media Manager edits show instantly.
  const { getMemberLive } = useMessaging();
  const live = getMemberLive(member.id) ?? member;
  const avatar = useResolvedImage(live.avatar);
  const coverImg = useResolvedImage(live.coverImage);
  const portfolio = live.gallery ?? [];
  const portfolioResolved = useResolvedImages(portfolio);
  const portfolioLb = useLightbox(
    portfolioResolved.map((src, i) => ({
      src,
      alt: `${live.name} — portfolio ${i + 1}`,
    }))
  );
  const location = [member.city, member.state, member.country]
    .filter((x): x is string => Boolean(x))
    .join(", ");

  const linkedOpportunities = featuredOpportunities.filter((o) =>
    member.opportunitySlugs.includes(o.slug)
  );
  const linkedCompanies = companies.filter((c) =>
    member.companySlugs.includes(c.slug)
  );

  return (
    <div className="bg-cream">
      {/* Hero */}
      <section className="bg-white">
        <div
          className={cn("relative h-40 md:h-56 overflow-hidden", `cover-${member.coverGradient}`)}
        >
          {coverImg ? (
            <Image
              src={coverImg}
              alt={`${live.name} — cover`}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              unoptimized
            />
          ) : null}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-5 md:px-10">
          <div className="relative -mt-14 md:-mt-20 bg-white rounded-3xl ring-1 ring-navy-900/[0.06] shadow-sm p-5 md:p-7 flex flex-col md:flex-row items-start gap-5">
            <div className="relative shrink-0 h-24 w-24 md:h-28 md:w-28 rounded-2xl bg-navy-900 text-gold-500 ring-4 ring-white shadow flex items-center justify-center text-3xl md:text-4xl font-semibold tracking-wide overflow-hidden">
              {avatar ? (
                <Image
                  src={avatar}
                  alt={`${live.name} — avatar`}
                  fill
                  sizes="112px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                member.initials
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] uppercase tracking-[0.16em] text-gold-600 font-semibold">
                  {member.memberType}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-bold rounded-full px-2 py-0.5 ring-1",
                    verificationStyles[member.verification]
                  )}
                >
                  <ShieldCheck className="h-3 w-3" strokeWidth={2.4} />
                  {member.verification}
                </span>
                <span className="text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-semibold tabular-nums">
                  {member.id}
                </span>
              </div>
              <h1 className="mt-1 text-2xl md:text-3xl font-semibold text-navy-900 tracking-tight">
                {member.name}
              </h1>
              <div className="mt-2 text-sm md:text-[15px] text-navy-700/80 inline-flex items-center gap-1.5 flex-wrap">
                <Briefcase
                  className="h-4 w-4 text-gold-600 shrink-0"
                  strokeWidth={2}
                />
                <span>
                  <span className="font-medium text-navy-900">{member.title}</span>
                  <span className="text-navy-700/60"> · </span>
                  <span>{member.company}</span>
                </span>
              </div>
              <div className="mt-2 text-sm text-navy-700/70 flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin
                    className="h-4 w-4 text-gold-600 shrink-0"
                    strokeWidth={2}
                  />
                  {location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays
                    className="h-4 w-4 text-gold-600 shrink-0"
                    strokeWidth={2}
                  />
                  Joined {member.joinedYear}
                </span>
              </div>
            </div>

            <div className="md:shrink-0 flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setIntroOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-5 py-2.5 text-sm transition-colors"
              >
                <Sparkles className="h-4 w-4" strokeWidth={2.3} />
                Request Introduction
              </button>
              <Link
                href="/messages"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-navy-900 hover:bg-navy-800 text-white font-semibold px-5 py-2.5 text-sm transition-colors"
                title="Capital Circle is the middleman — start a thread with the platform."
              >
                <MessageSquare className="h-4 w-4" strokeWidth={2.3} />
                Message Platform
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Media management — self-gates to owner / Admin / Super Admin */}
      <div className="max-w-6xl mx-auto px-5 md:px-10 pt-8">
        <MemberMediaManager member={member} />
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
          <div className="order-2 lg:order-1 space-y-10 min-w-0">
            {/* About */}
            <Section title="About" Icon={Sparkles}>
              <p className="text-sm md:text-[15px] leading-relaxed text-navy-700/85">
                {member.about}
              </p>
              <p className="mt-3 text-sm text-navy-700/65 leading-relaxed">
                {member.bio}
              </p>
            </Section>

            {/* Portfolio & Media — public display of the member gallery */}
            {portfolio.length > 0 ? (
              <Section title="Portfolio & Media" Icon={Images}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {portfolio.map((src, i) => (
                    <button
                      key={src + i}
                      type="button"
                      onClick={() => portfolioLb.openAt(i)}
                      aria-label={`Open portfolio photo ${i + 1}`}
                      className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-navy-900/5 ring-1 ring-navy-900/[0.06] group"
                    >
                      {portfolioResolved[i] ? (
                        <Image
                          src={portfolioResolved[i]}
                          alt={`${live.name} — portfolio ${i + 1}`}
                          fill
                          sizes="(min-width: 1024px) 280px, 45vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <span className="absolute inset-0 bg-navy-900/[0.06] animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
                <Lightbox
                  images={portfolioLb.images}
                  initialIndex={portfolioLb.index}
                  open={portfolioLb.open}
                  onClose={portfolioLb.close}
                />
              </Section>
            ) : null}

            {/* Company */}
            <Section title="Company" Icon={Building2}>
              <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 flex items-start gap-4 flex-wrap">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-gold-500">
                  <Building2 className="h-5 w-5" strokeWidth={2} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-navy-900">{member.company}</div>
                  <div className="text-xs uppercase tracking-[0.14em] text-gold-600 font-semibold mt-1">
                    {member.industry}
                  </div>
                  <div className="text-sm text-navy-700/70 mt-1">
                    {member.title}
                  </div>
                </div>
                {member.companyId ? (
                  <Link
                    href={`/companies?company=${member.companyId}`}
                    className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] font-semibold text-gold-700 hover:text-gold-600"
                  >
                    View directory entry
                    <ArrowUpRight className="h-3 w-3" strokeWidth={2.4} />
                  </Link>
                ) : null}
              </div>
            </Section>

            {/* Experience — synthesized from current role */}
            <Section title="Experience" Icon={Briefcase}>
              <ul className="space-y-3">
                <li className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-4 md:p-5">
                  <div className="text-[11px] uppercase tracking-[0.14em] text-gold-600 font-semibold">
                    Current role
                  </div>
                  <div className="mt-1 font-semibold text-navy-900">
                    {member.title}
                  </div>
                  <div className="text-sm text-navy-700/70 mt-0.5">
                    {member.company} · {member.city}, {member.country}
                  </div>
                </li>
              </ul>
            </Section>

            {/* Areas of Interest */}
            <Section title="Areas of Interest" Icon={HandCoins}>
              {member.areasOfInterest.length === 0 ? (
                <p className="text-sm text-navy-700/55">No areas specified.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {member.areasOfInterest.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center text-xs font-semibold text-navy-900 bg-gold-500/15 ring-1 ring-gold-500/40 rounded-full px-3 py-1.5"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </Section>

            {/* Industries */}
            <Section title="Industries" Icon={Layers}>
              {member.industries.length === 0 ? (
                <p className="text-sm text-navy-700/55">No industries specified.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {member.industries.map((ind) => (
                    <span
                      key={ind}
                      className="inline-flex items-center text-xs font-semibold text-navy-700 bg-white ring-1 ring-navy-900/[0.08] rounded-full px-3 py-1.5"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              )}
            </Section>

            {/* Opportunities Posted */}
            <Section title="Opportunities Posted" Icon={HandCoins}>
              {linkedOpportunities.length === 0 ? (
                <p className="text-sm text-navy-700/55">
                  This member has not posted opportunities yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {linkedOpportunities.map((o) => (
                    <li
                      key={o.id}
                      className="rounded-xl bg-white ring-1 ring-navy-900/[0.06] p-4 flex items-start gap-3"
                    >
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-bone text-gold-700">
                        <HandCoins className="h-4 w-4" strokeWidth={2.2} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/opportunity/${o.slug}`}
                          className="font-semibold text-navy-900 hover:text-gold-700 transition-colors truncate block"
                        >
                          {o.title}
                        </Link>
                        <div className="text-xs text-navy-700/65 mt-0.5">
                          {o.category} · {o.location}
                        </div>
                      </div>
                      <ChevronRight
                        className="h-4 w-4 text-navy-700/40 mt-2 shrink-0"
                        strokeWidth={2.2}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            {/* Companies Associated */}
            <Section title="Companies Associated" Icon={Building2}>
              {linkedCompanies.length === 0 ? (
                <p className="text-sm text-navy-700/55">
                  No company directory entries linked.
                </p>
              ) : (
                <ul className="space-y-3">
                  {linkedCompanies.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-xl bg-white ring-1 ring-navy-900/[0.06] p-4 flex items-start gap-3"
                    >
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-bone text-gold-700">
                        <Building2 className="h-4 w-4" strokeWidth={2.2} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/company/${c.slug}`}
                          className="font-semibold text-navy-900 hover:text-gold-700 transition-colors truncate block"
                        >
                          {c.name}
                        </Link>
                        <div className="text-xs text-navy-700/65 mt-0.5">
                          {c.industry}
                        </div>
                      </div>
                      <ChevronRight
                        className="h-4 w-4 text-navy-700/40 mt-2 shrink-0"
                        strokeWidth={2.2}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            {/* Documents Shared */}
            <Section title="Documents Shared" Icon={FileText}>
              {member.sharedDocuments.length === 0 ? (
                <p className="text-sm text-navy-700/55">
                  This member has not shared documents at the directory level.
                </p>
              ) : (
                <ul className="space-y-2">
                  {member.sharedDocuments.map((d, i) => (
                    <li
                      key={`${d.name}-${i}`}
                      className="rounded-xl bg-white ring-1 ring-navy-900/[0.06] p-4 flex items-center gap-3"
                    >
                      <FileText
                        className="h-4 w-4 text-gold-600"
                        strokeWidth={2.2}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-navy-900 text-sm truncate">
                          {d.name}
                        </div>
                        <div className="text-[11px] text-navy-700/65 mt-0.5">
                          {d.type} · shared {fmtDate(d.sharedAt)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            {/* Recent Activity */}
            <Section title="Recent Activity" Icon={Activity}>
              {member.recentActivity.length === 0 ? (
                <p className="text-sm text-navy-700/55">No recent activity.</p>
              ) : (
                <ul className="space-y-3">
                  {member.recentActivity.map((a) => (
                    <li
                      key={a.id}
                      className="rounded-xl bg-white ring-1 ring-navy-900/[0.06] p-4"
                    >
                      <div className="text-[11px] uppercase tracking-[0.14em] text-gold-600 font-semibold">
                        {a.kind.replace("_", " ")}
                      </div>
                      <div className="mt-1 font-semibold text-navy-900 text-sm">
                        {a.title}
                      </div>
                      <p className="mt-1 text-xs text-navy-700/65 leading-relaxed">
                        {a.description}
                      </p>
                      <div className="mt-2 text-[10px] uppercase tracking-[0.14em] text-navy-700/50 font-semibold">
                        {fmtDate(a.at)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>

          {/* Sidebar */}
          <aside className="order-1 lg:order-2 lg:w-[320px] space-y-5">
            <div className="rounded-2xl bg-navy-900 text-white ring-1 ring-white/5 overflow-hidden">
              <div className="p-5 md:p-6">
                <div className="text-[11px] uppercase tracking-[0.2em] text-gold-400 font-semibold">
                  Contact Preferences
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <Row
                    label="Introductions"
                    value={member.contactPreferences.acceptsIntroductions ? "Accepting" : "Not accepting"}
                    positive={member.contactPreferences.acceptsIntroductions}
                  />
                  <Row
                    label="Scope"
                    value={
                      member.contactPreferences.introductionScope === "both"
                        ? "Opportunities & Companies"
                        : member.contactPreferences.introductionScope === "opportunity"
                          ? "Opportunities only"
                          : "Companies only"
                    }
                  />
                </div>
                {member.contactPreferences.introductionNote ? (
                  <p className="mt-3 text-xs text-white/70 leading-relaxed border-t border-white/10 pt-3">
                    “{member.contactPreferences.introductionNote}”
                  </p>
                ) : null}
              </div>
              <div className="bg-white/[0.04] px-5 md:px-6 py-3 text-[11px] text-white/70 leading-relaxed border-t border-white/5">
                Members never see your contact info from this surface. Capital
                Circle handles the introduction end-to-end.
              </div>
            </div>

            <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-gold-600 font-semibold">
                Engagement
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <Stat label="Listings" value={member.listingsCount} />
                <Stat label="Opps" value={member.opportunitiesCount} />
                <Stat label="Cos" value={member.companiesCount} />
              </div>
            </div>

            <MemberDealsPanel member={member} />
          </aside>
        </div>
      </div>

      <RequestIntroductionModal
        open={introOpen}
        onClose={() => setIntroOpen(false)}
        member={member}
      />
    </div>
  );
}

function Section({
  title,
  Icon,
  children,
}: {
  title: string;
  Icon: typeof Sparkles;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="text-[11px] uppercase tracking-[0.18em] text-gold-600 font-semibold inline-flex items-center gap-1.5 mb-3">
        <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
        {title}
      </div>
      <div>{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-white/70 text-xs uppercase tracking-[0.14em] font-semibold">
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-semibold",
          positive ? "text-emerald-300" : "text-white"
        )}
      >
        {value}
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-bone/60 p-2.5">
      <div className="text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-semibold">
        {label}
      </div>
      <div className="mt-0.5 text-base font-semibold text-navy-900 tabular-nums">
        {value}
      </div>
    </div>
  );
}
