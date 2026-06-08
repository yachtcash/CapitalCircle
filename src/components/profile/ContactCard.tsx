"use client";

import { Mail, Phone, Globe2, Lock } from "lucide-react";
import type { UserProfile } from "@/data/profile";
import PrivacyBadge from "./PrivacyBadge";

type Props = {
  profile: UserProfile;
};

function maskedFor(value: string, privacy: UserProfile["privacy"]["email"]): string {
  if (privacy === "Public") return value;
  // Mask everything for Private + Approved Contacts Only — give a hint of the prefix.
  if (value.includes("@")) {
    const [local, domain] = value.split("@");
    return `${local.slice(0, 2)}•••@${domain}`;
  }
  // Phone number
  const digits = value.replace(/\D/g, "");
  if (digits.length > 4) {
    return `•••• ${digits.slice(-4)}`;
  }
  return "•••";
}

export default function ContactCard({ profile }: Props) {
  const emailDisplay = maskedFor(profile.email, profile.privacy.email);
  const phoneDisplay = maskedFor(profile.phone, profile.privacy.phone);

  return (
    <section>
      <SectionHeader eyebrow="Contact" title="How members reach you" />
      <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] divide-y divide-navy-900/[0.06] overflow-hidden">
        <Row
          icon={Mail}
          label="Email"
          value={emailDisplay}
          masked={profile.privacy.email !== "Public"}
          privacy={profile.privacy.email}
        />
        <Row
          icon={Phone}
          label="Phone"
          value={phoneDisplay}
          masked={profile.privacy.phone !== "Public"}
          privacy={profile.privacy.phone}
        />
        {profile.website ? (
          <Row
            icon={Globe2}
            label="Website"
            value={profile.websiteLabel}
            href={profile.website}
          />
        ) : null}
      </div>
      <p className="mt-3 text-xs text-navy-700/55 inline-flex items-center gap-1.5">
        <Lock className="h-3 w-3 text-gold-600" strokeWidth={2.2} />
        Contact details default to private. Approved contacts only unlocks after a sponsor accepts
        your request.
      </p>
    </section>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  href,
  masked = false,
  privacy,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
  masked?: boolean;
  privacy?: UserProfile["privacy"]["email"];
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-4 md:p-5">
      <div className="flex items-center gap-3 min-w-0">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-gold-500 ring-1 ring-navy-900/5 shrink-0">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.16em] text-navy-700/55 font-semibold">
            {label}
          </div>
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-navy-900 hover:text-gold-700 transition-colors truncate block"
            >
              {value}
            </a>
          ) : (
            <div className="text-sm text-navy-900 truncate inline-flex items-center gap-1.5">
              <span className="tabular-nums">{value}</span>
              {masked ? (
                <Lock className="h-3 w-3 text-navy-700/40" strokeWidth={2.4} />
              ) : null}
            </div>
          )}
        </div>
      </div>
      {privacy ? <PrivacyBadge level={privacy} /> : null}
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-4">
      <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
        {eyebrow}
      </div>
      <h2 className="mt-1 text-base md:text-lg font-semibold text-navy-900 tracking-tight">
        {title}
      </h2>
    </div>
  );
}
