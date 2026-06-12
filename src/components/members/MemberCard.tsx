"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Briefcase,
  CalendarDays,
  ShieldCheck,
  ArrowUpRight,
  Building2,
  HandCoins,
  MessageSquare,
  Layers,
} from "lucide-react";
import type { Member } from "@/data/members";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { useResolvedImage } from "@/lib/imageStore";
import { cn } from "@/lib/cn";
import RequestIntroductionModal from "./RequestIntroductionModal";

type Props = {
  member: Member;
  priority?: boolean;
};

const verificationStyles: Record<Member["verification"], string> = {
  Verified: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30",
  "Founding Member": "bg-gold-500/20 text-gold-700 ring-gold-500/40",
  Pending: "bg-amber-500/15 text-amber-700 ring-amber-500/30",
  Unverified: "bg-navy-900/[0.06] text-navy-700 ring-navy-900/15",
};

function joinedLabel(year: number): string {
  return `Joined ${year}`;
}

export default function MemberCard({ member: seedMember, priority = false }: Props) {
  void priority;
  // Live overlay-applied record — avatar / cover edits show here.
  const { getMemberLive } = useMessaging();
  const member = getMemberLive(seedMember.id) ?? seedMember;
  const avatar = useResolvedImage(member.avatar);
  const cardCover = useResolvedImage(member.coverImage);
  const [introOpen, setIntroOpen] = useState(false);
  const location = [member.city, member.state, member.country]
    .filter((x): x is string => Boolean(x))
    .join(", ");

  return (
    <article
      className={cn(
        "group flex flex-col bg-white rounded-2xl ring-1 ring-navy-900/[0.06] overflow-hidden",
        "hover:shadow-xl hover:shadow-navy-900/10 hover:-translate-y-0.5 transition-all duration-200"
      )}
    >
      {/* Cover band — gradient by coverGradient key */}
      <div
        className={cn(
          "relative h-24 md:h-28 overflow-hidden",
          `cover-${member.coverGradient}`
        )}
      >
        {cardCover ? (
          <Image
            src={cardCover}
            alt={`${member.name} — cover`}
            fill
            sizes="(min-width: 1280px) 380px, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            unoptimized
          />
        ) : null}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {member.featured ? (
          <span className="absolute top-3 left-3 inline-flex items-center text-[10px] uppercase tracking-[0.16em] font-bold bg-navy-900 text-gold-400 ring-1 ring-gold-500/40 rounded-full px-2.5 py-1">
            Featured
          </span>
        ) : null}
        <div className="absolute top-3 right-3">
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-bold rounded-full px-2 py-0.5 ring-1",
              verificationStyles[member.verification]
            )}
          >
            <ShieldCheck className="h-3 w-3" strokeWidth={2.4} />
            {member.verification}
          </span>
        </div>
      </div>

      <div className="px-5 pt-0">
        <div className="-mt-9 relative flex items-end gap-3">
          <Link
            href={`/member/${member.slug}`}
            aria-label={`${member.name} profile`}
            className="relative shrink-0 h-16 w-16 rounded-2xl bg-navy-900 text-gold-500 ring-2 ring-white shadow flex items-center justify-center text-base font-semibold tracking-wide overflow-hidden"
          >
            {avatar ? (
              <Image
                src={avatar}
                alt={`${member.name} — avatar`}
                fill
                sizes="64px"
                className="object-cover"
                unoptimized
              />
            ) : (
              member.initials
            )}
          </Link>
          <div className="flex-1 min-w-0 pb-1">
            <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-navy-700/60 tabular-nums">
              {member.id}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 pt-3 pb-5 flex flex-col">
        <Link
          href={`/member/${member.slug}`}
          className="font-semibold text-navy-900 text-[15px] md:text-base leading-snug group-hover:text-gold-700 transition-colors"
        >
          {member.name}
        </Link>
        <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-gold-600 font-semibold truncate">
          {member.memberType}
        </div>

        <div className="mt-2 text-sm text-navy-700/80 inline-flex items-center gap-1.5">
          <Briefcase
            className="h-3.5 w-3.5 text-gold-600 shrink-0"
            strokeWidth={2.2}
          />
          <span className="truncate">
            <span className="font-medium text-navy-900">{member.title}</span>
            <span className="text-navy-700/55"> · </span>
            <span className="truncate">{member.company}</span>
          </span>
        </div>

        <p className="mt-3 text-sm text-navy-700/75 leading-relaxed line-clamp-2">
          {member.bio}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-y-1.5 text-xs text-navy-700/70">
          <span className="inline-flex items-center gap-1.5 min-w-0">
            <MapPin
              className="h-3.5 w-3.5 text-gold-600 shrink-0"
              strokeWidth={2.2}
            />
            <span className="truncate">{location}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays
              className="h-3.5 w-3.5 text-gold-600 shrink-0"
              strokeWidth={2.2}
            />
            {joinedLabel(member.joinedYear)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Layers
              className="h-3.5 w-3.5 text-gold-600 shrink-0"
              strokeWidth={2.2}
            />
            {member.listingsCount} listings
          </span>
          <span className="inline-flex items-center gap-1.5">
            <HandCoins
              className="h-3.5 w-3.5 text-gold-600 shrink-0"
              strokeWidth={2.2}
            />
            {member.opportunitiesCount} opps
          </span>
          <span className="inline-flex items-center gap-1.5 col-span-2">
            <Building2
              className="h-3.5 w-3.5 text-gold-600 shrink-0"
              strokeWidth={2.2}
            />
            {member.companiesCount} {member.companiesCount === 1 ? "company" : "companies"}
            <span className="text-navy-700/40">·</span>
            <span className="truncate text-navy-700/55">{member.industry}</span>
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Link
            href={`/member/${member.slug}`}
            className="inline-flex items-center justify-center gap-1 rounded-full bg-bone hover:bg-gold-500 text-navy-900 font-semibold px-3 py-2 text-[11px] uppercase tracking-[0.12em] transition-colors"
          >
            View
            <ArrowUpRight className="h-3 w-3" strokeWidth={2.4} />
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIntroOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-3 py-2 text-[11px] uppercase tracking-[0.12em] transition-colors"
          >
            Request Intro
          </button>
          <Link
            href="/messages"
            className="inline-flex items-center justify-center gap-1 rounded-full bg-navy-900 hover:bg-navy-800 text-white font-semibold px-3 py-2 text-[11px] uppercase tracking-[0.12em] transition-colors"
            title="Capital Circle is the platform middleman — start a thread with us, not the member directly."
          >
            <MessageSquare className="h-3 w-3" strokeWidth={2.4} />
            Platform
          </Link>
        </div>
      </div>

      <RequestIntroductionModal
        open={introOpen}
        onClose={() => setIntroOpen(false)}
        member={member}
      />
    </article>
  );
}
