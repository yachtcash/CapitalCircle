"use client";

import { useEffect, useMemo, useState } from "react";
import { Save, Sparkles, Plus } from "lucide-react";
import Modal from "@/components/negotiations/Modal";
import { useMessaging } from "@/components/providers/MessagingProvider";
import {
  EXPERTISE_SUGGESTIONS,
  PRIVACY_OPTIONS,
  type PrivacyLevel,
  type UserProfile,
} from "@/data/profile";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  onClose: () => void;
};

const inputClass =
  "w-full rounded-lg bg-bone/60 ring-1 ring-navy-900/5 focus:ring-2 focus:ring-gold-500 outline-none px-3 py-2 text-sm text-navy-900 placeholder:text-navy-700/40 transition-shadow";

export default function EditProfileModal({ open, onClose }: Props) {
  const { profile, updateProfile } = useMessaging();
  const [draft, setDraft] = useState<UserProfile>(profile);

  useEffect(() => {
    if (open) setDraft(profile);
  }, [open, profile]);

  const set = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const setPrivacy = (key: "email" | "phone", value: PrivacyLevel) => {
    setDraft((prev) => ({ ...prev, privacy: { ...prev.privacy, [key]: value } }));
  };

  const toggleExpertise = (tag: string) => {
    setDraft((prev) => ({
      ...prev,
      expertise: prev.expertise.includes(tag)
        ? prev.expertise.filter((t) => t !== tag)
        : [...prev.expertise, tag],
    }));
  };

  const handleSave = () => {
    updateProfile(draft);
    onClose();
  };

  const suggestions = useMemo(
    () => EXPERTISE_SUGGESTIONS.filter((t) => !draft.expertise.includes(t)),
    [draft.expertise]
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit profile"
      description="Update your bio, expertise, contact preferences, and privacy settings. Changes save locally."
      maxWidth="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-bone transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-6 py-2.5 text-sm transition-colors"
          >
            <Save className="h-4 w-4" strokeWidth={2.3} />
            Save changes
          </button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Basics */}
        <Section title="Basics">
          <Grid>
            <Field label="Title">
              <input
                type="text"
                value={draft.title}
                onChange={(e) => set("title", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Company">
              <input
                type="text"
                value={draft.company}
                onChange={(e) => set("company", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Industry">
              <input
                type="text"
                value={draft.industry}
                onChange={(e) => set("industry", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Website">
              <input
                type="url"
                value={draft.website}
                onChange={(e) => {
                  set("website", e.target.value);
                  const label = e.target.value
                    .replace(/^https?:\/\//, "")
                    .replace(/\/$/, "");
                  set("websiteLabel", label);
                }}
                placeholder="https://"
                className={inputClass}
              />
            </Field>
            <Field label="Country">
              <input
                type="text"
                value={draft.country}
                onChange={(e) => set("country", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="State / Province">
              <input
                type="text"
                value={draft.state ?? ""}
                onChange={(e) => set("state", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="City" full>
              <input
                type="text"
                value={draft.city}
                onChange={(e) => set("city", e.target.value)}
                className={inputClass}
              />
            </Field>
          </Grid>
        </Section>

        {/* Bio / About */}
        <Section title="Story">
          <Field label="Bio (one line)">
            <input
              type="text"
              value={draft.bio}
              onChange={(e) => set("bio", e.target.value)}
              maxLength={140}
              className={inputClass}
            />
          </Field>
          <Field label="About">
            <textarea
              value={draft.about}
              onChange={(e) => set("about", e.target.value)}
              rows={5}
              className={cn(inputClass, "resize-none leading-relaxed")}
            />
          </Field>
        </Section>

        {/* Expertise */}
        <Section title="Expertise">
          <div className="text-xs text-navy-700/60 mb-2">Your tags</div>
          {draft.expertise.length === 0 ? (
            <p className="text-xs text-navy-700/55 mb-3">
              Add at least one area of focus so sponsors can find you.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-3">
              {draft.expertise.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleExpertise(tag)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-900 bg-gold-500/15 ring-1 ring-gold-500/40 rounded-full px-3 py-1.5 hover:bg-gold-500 transition-colors"
                >
                  <Sparkles className="h-3 w-3" strokeWidth={2.4} />
                  {tag}
                  <span className="text-navy-900/55">×</span>
                </button>
              ))}
            </div>
          )}
          {suggestions.length > 0 ? (
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-navy-700/55 font-semibold mb-1.5">
                Suggested
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleExpertise(tag)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-navy-700 bg-white ring-1 ring-navy-900/[0.08] hover:ring-gold-500 hover:text-navy-900 rounded-full px-2.5 py-1 transition-all"
                  >
                    <Plus className="h-3 w-3" strokeWidth={2.4} />
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </Section>

        {/* Privacy */}
        <Section title="Privacy">
          <p className="text-xs text-navy-700/60 mb-3">
            Each contact field has its own visibility. Defaults stay private until you choose.
          </p>
          <Grid>
            <Field label="Email visibility">
              <PrivacySelect
                value={draft.privacy.email}
                onChange={(v) => setPrivacy("email", v)}
              />
            </Field>
            <Field label="Phone visibility">
              <PrivacySelect
                value={draft.privacy.phone}
                onChange={(v) => setPrivacy("phone", v)}
              />
            </Field>
          </Grid>
        </Section>
      </div>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold mb-3">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={cn("block", full ? "sm:col-span-2" : "")}>
      <span className="block text-xs uppercase tracking-[0.14em] text-navy-700/70 font-semibold mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

function PrivacySelect({
  value,
  onChange,
}: {
  value: PrivacyLevel;
  onChange: (v: PrivacyLevel) => void;
}) {
  return (
    <div className="space-y-1.5">
      {PRIVACY_OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "w-full text-left rounded-lg ring-1 px-3 py-2 transition-colors",
              active
                ? "bg-gold-500/[0.10] ring-gold-500/50"
                : "bg-white ring-navy-900/[0.06] hover:ring-navy-900/20"
            )}
          >
            <div className="text-sm font-semibold text-navy-900">{opt.label}</div>
            <div className="text-[11px] text-navy-700/65 leading-snug mt-0.5">{opt.hint}</div>
          </button>
        );
      })}
    </div>
  );
}
