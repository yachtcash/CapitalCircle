"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Layers,
  MessageSquare,
  Bookmark,
  Building2,
  ShieldCheck,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import ProfileHero from "./ProfileHero";
import AboutCard from "./AboutCard";
import ExperienceCard from "./ExperienceCard";
import ExpertiseCard from "./ExpertiseCard";
import ContactCard from "./ContactCard";
import EditProfileModal from "./EditProfileModal";
import SavedSections from "@/components/profile/SavedSections";
import ActionToast, { useActionToast } from "@/components/ui/ActionToast";

export default function ProfileClient() {
  const {
    profile,
    listings,
    savedOpportunityIds,
    savedCompanyIds,
    totalUnreadConversations,
    conversations,
  } = useMessaging();
  const [editOpen, setEditOpen] = useState(false);
  const { toast, show: showToast, dismiss: dismissToast } = useActionToast();

  const activeListings = listings.filter(
    (l) => l.status !== "Draft" && l.status !== "Archived" && l.status !== "Closed"
  ).length;
  const activeNegotiations = conversations.filter((c) =>
    ["Discussion Active", "Documents Shared", "Negotiation Active", "Under Review"].includes(
      c.stage
    )
  ).length;

  return (
    <>
      <div className="bg-cream min-h-[calc(100vh-5rem)]">
        <ProfileHero profile={profile} onEdit={() => setEditOpen(true)} />

        <div className="max-w-6xl mx-auto px-5 md:px-10 py-8 md:py-12">
          {/* Stat strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10">
            <DashStat
              icon={Layers}
              label="My Active Listings"
              value={activeListings}
              href="/dashboard/listings"
            />
            <DashStat
              icon={Bookmark}
              label="Saved opportunities"
              value={savedOpportunityIds.length}
              href="#saved"
            />
            <DashStat
              icon={Building2}
              label="Saved companies"
              value={savedCompanyIds.length}
              href="#saved"
            />
            <DashStat
              icon={MessageSquare}
              label="Negotiations active"
              value={activeNegotiations}
              href="/messages"
              badge={totalUnreadConversations > 0 ? `${totalUnreadConversations} unread` : undefined}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
            <div className="space-y-8 md:space-y-10 min-w-0">
              <AboutCard profile={profile} />
              <ExpertiseCard profile={profile} />
              <ExperienceCard profile={profile} />
              <div id="saved">
                <SavedSections />
              </div>
            </div>

            <aside className="space-y-6">
              <ContactCard profile={profile} />

              <div className="bg-navy-900 text-white rounded-2xl p-5 md:p-6">
                <div className="text-[11px] uppercase tracking-[0.2em] text-gold-400 font-semibold inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.2} />
                  Membership
                </div>
                <div className="mt-2 text-base font-semibold">{profile.memberTier}</div>
                <p className="mt-1.5 text-sm text-white/75 leading-relaxed">
                  Priority access to closed-circle listings and the weekly editor&apos;s desk.
                </p>
                <Link
                  href="/dashboard"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors"
                >
                  Open dashboard
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={() => showToast("Profile saved")}
      />
      <ActionToast toast={toast} onDismiss={dismissToast} />
    </>
  );
}

function DashStat({
  icon: Icon,
  label,
  value,
  href,
  badge,
}: {
  icon: typeof Layers;
  label: string;
  value: number | string;
  href: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl ring-1 ring-navy-900/[0.06] p-4 md:p-5 hover:ring-gold-500/50 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-[0.16em] text-navy-700/60 font-semibold inline-flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
          {label}
        </span>
        {badge ? (
          <span className="text-[10px] uppercase tracking-[0.14em] font-bold bg-gold-500 text-navy-900 rounded-full px-2 py-0.5">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div className="text-2xl md:text-3xl font-semibold text-navy-900 tabular-nums">
          {value}
        </div>
        <ArrowRight
          className="h-4 w-4 text-navy-700/30 group-hover:text-gold-700 group-hover:translate-x-0.5 transition-all"
          strokeWidth={2.2}
        />
      </div>
    </Link>
  );
}
