"use client";

import { Mail, Phone, Globe2, Lock, Users, Globe } from "lucide-react";
import type { UserProfile } from "@/data/profile";
import type { PrivacyLevel } from "@/data/profile";
import PrivacyBadge from "./PrivacyBadge";
import { cn } from "@/lib/cn";

type Props = {
  profile: UserProfile;
};

type Render =
  | { kind: "value"; text: string }
  | { kind: "masked"; text: string; hint: string }
  | { kind: "hidden"; text: string; hint: string };

function renderFor(value: string, privacy: PrivacyLevel): Render {
  if (privacy === "Public") {
    return { kind: "value", text: value };
  }
  if (privacy === "Approved Contacts Only") {
    // Show masked preview — approved contacts will see the real value
    // (in a fully implemented backend); until then the hint explains the state.
    if (value.includes("@")) {
      const [local, domain] = value.split("@");
      return {
        kind: "masked",
        text: `${local.slice(0, 2)}•••@${domain}`,
        hint: "Visible to approved contacts only",
      };
    }
    const digits = value.replace(/\D/g, "");
    return {
      kind: "masked",
      text: digits.length > 4 ? `•••• ${digits.slice(-4)}` : "•••",
      hint: "Visible to approved contacts only",
    };
  }
  // Private — fully hidden, no preview
  return {
    kind: "hidden",
    text: "Hidden",
    hint: "Private — only you can see this",
  };
}

export default function ContactCard({ profile }: Props) {
  return (
    <section>
      <SectionHeader eyebrow="Contact" title="How members reach you" />
      <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] divide-y divide-navy-900/[0.06] overflow-hidden">
        <Row
          icon={Mail}
          label="Email"
          render={renderFor(profile.email, profile.privacy.email)}
          privacy={profile.privacy.email}
        />
        <Row
          icon={Phone}
          label="Phone"
          render={renderFor(profile.phone, profile.privacy.phone)}
          privacy={profile.privacy.phone}
        />
        {profile.website ? (
          <Row
            icon={Globe2}
            label="Website"
            render={{ kind: "value", text: profile.websiteLabel }}
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
  render,
  href,
  privacy,
}: {
  icon: typeof Mail;
  label: string;
  render: Render;
  href?: string;
  privacy?: PrivacyLevel;
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
              {render.text}
            </a>
          ) : (
            <>
              <div className="text-sm truncate inline-flex items-center gap-1.5">
                {render.kind === "value" ? (
                  <span className="text-navy-900 inline-flex items-center gap-1">
                    {render.text}
                    <Globe className="h-3 w-3 text-emerald-700" strokeWidth={2.4} />
                  </span>
                ) : null}
                {render.kind === "masked" ? (
                  <span className="text-navy-900 tabular-nums inline-flex items-center gap-1">
                    {render.text}
                    <Users
                      className="h-3 w-3 text-gold-700"
                      strokeWidth={2.4}
                      aria-hidden="true"
                    />
                  </span>
                ) : null}
                {render.kind === "hidden" ? (
                  <span className="italic text-navy-700/55 inline-flex items-center gap-1">
                    {render.text}
                    <Lock
                      className="h-3 w-3 text-navy-700/55"
                      strokeWidth={2.4}
                      aria-hidden="true"
                    />
                  </span>
                ) : null}
              </div>
              {render.kind !== "value" ? (
                <div
                  className={cn(
                    "mt-0.5 text-[10px] leading-snug",
                    render.kind === "hidden" ? "text-navy-700/45" : "text-navy-700/60"
                  )}
                >
                  {render.hint}
                </div>
              ) : null}
            </>
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
