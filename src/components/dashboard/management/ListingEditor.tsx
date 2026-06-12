"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertTriangle,
  Loader2,
  Lock,
  Eye,
  Globe,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import type {
  ContactPreferences,
  ListingRecord,
  ListingStatus,
  ListingVisibility,
} from "@/data/listings";
import type {
  DealType,
  ListingType,
  Opportunity,
  OpportunityStatus,
} from "@/data/opportunities";
import { categories } from "@/data/categories";
import { cn } from "@/lib/cn";

const inputClass =
  "w-full rounded-lg bg-white ring-1 ring-navy-900/[0.10] focus:ring-2 focus:ring-gold-500 outline-none px-3 py-2 text-sm text-navy-900 placeholder:text-navy-700/40 transition-shadow";

const textareaClass = cn(inputClass, "resize-none leading-relaxed");

const LISTING_STATUSES: ListingStatus[] = [
  "Draft",
  "Active",
  "Seeking Capital",
  "Negotiating",
  "Under Review",
  "Closed",
  "Archived",
];

const DEAL_TYPES: DealType[] = [
  "Seeking Investor",
  "Joint Venture",
  "Land For Sale",
  "Business For Sale",
  "Acquisition",
  "Financing Needed",
  "Supplier Offering",
  "Strategic Partnership",
  "Development Project",
  "Franchise Opportunity",
  "Licensing Opportunity",
  "Service Offering",
  "Contact For Details",
];

const LISTING_TYPES: ListingType[] = ["Opportunity", "Product", "Service"];

const OPPORTUNITY_STATUSES: OpportunityStatus[] = [
  "Open",
  "Seeking Capital",
  "Negotiating",
  "Under Contract",
  "Closed",
];

const DEFAULT_CONTACT_PREFS: ContactPreferences = {
  acceptMessages: true,
  acceptInterest: true,
  acceptNegotiations: true,
};

type Draft = {
  // Listing-level
  title: string;
  subtitle: string;
  category: string;
  dealType: DealType | "";
  status: ListingStatus;
  visibility: ListingVisibility;
  contactPreferences: ContactPreferences;
  // Opportunity-level (only persisted for user opps)
  listingType: ListingType;
  postedBy: string;
  industry: string;
  companyDescription: string;
  website: string;
  country: string;
  state: string;
  city: string;
  investmentRange: string;
  fundingAmount: string;
  expectedReturn: string;
  fundingRequired: string;
  equityAvailable: string;
  minimumInvestment: string;
  expectedReturns: string;
  currentStage: string;
  timeline: string;
  projectStatus: string;
  oppStatus: OpportunityStatus;
  executiveSummary: string;
  fullDescription: string;
};

function buildDraft(listing: ListingRecord, opp: Opportunity | undefined): Draft {
  return {
    title: listing.title,
    subtitle: listing.subtitle ?? opp?.description ?? "",
    category: listing.category ?? opp?.category ?? "",
    dealType: (listing.dealType as DealType) ?? (opp?.dealType ?? ""),
    status: listing.status,
    visibility: listing.visibility ?? "Public",
    contactPreferences:
      listing.contactPreferences ?? DEFAULT_CONTACT_PREFS,
    listingType: opp?.listingType ?? "Opportunity",
    postedBy: opp?.postedBy ?? "",
    industry: opp?.industry ?? "",
    companyDescription: opp?.companyDescription ?? "",
    website: opp?.website ?? "",
    country: opp?.place?.country ?? "",
    state: opp?.place?.state ?? "",
    city: opp?.place?.city ?? "",
    investmentRange: opp?.investmentRange ?? "",
    fundingAmount:
      typeof opp?.fundingAmount === "number" && opp.fundingAmount > 0
        ? String(opp.fundingAmount)
        : "",
    expectedReturn: opp?.expectedReturn ?? "",
    fundingRequired: opp?.fundingRequired ?? "",
    equityAvailable: opp?.equityAvailable ?? "",
    minimumInvestment: opp?.minimumInvestment ?? "",
    expectedReturns: opp?.expectedReturns ?? "",
    currentStage: opp?.currentStage ?? "",
    timeline: opp?.timeline ?? "",
    projectStatus: opp?.projectStatus ?? "",
    oppStatus: opp?.status ?? "Open",
    executiveSummary: opp?.executiveSummary ?? "",
    fullDescription: (opp?.fullDescription ?? []).join("\n\n"),
  };
}

type SaveStatus = "saved" | "saving" | "error";

/** Debounce window between the last keystroke and the autosave write. */
const AUTOSAVE_DELAY_MS = 900;

type Props = {
  listing: ListingRecord;
  opportunity?: Opportunity;
};

export default function ListingEditor({ listing, opportunity }: Props) {
  const { updateListingFields, getOpportunity } = useMessaging();
  // Prefer the overlay-applied live record so the editor opens with the
  // latest saved values (across both seed-backed and user-created opps).
  const liveOpportunity =
    (listing.opportunityId ? getOpportunity(listing.opportunityId) : undefined) ??
    opportunity;

  const initial = useMemo(
    () => buildDraft(listing, liveOpportunity),
    [listing, liveOpportunity]
  );

  const [draft, setDraft] = useState<Draft>(initial);
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  // Dirty is computed against the last SAVED draft (not `initial`) so the
  // autosave loop terminates: normalization on save (trims, parsing) never
  // re-marks the form dirty.
  const savedSnapRef = useRef<string>(JSON.stringify(initial));
  const draftJson = JSON.stringify(draft);
  const dirty = draftJson !== savedSnapRef.current;

  // When an autosave WE issued bumps listing.lastUpdatedAt, skip the reset
  // below — the user may already be typing the next edit.
  const selfSaveRef = useRef(false);

  // Reset draft when the underlying record changes from OUTSIDE the editor
  // (e.g. a gallery update or an admin action bumps the listing).
  const lastKeyRef = useRef<string>("");
  useEffect(() => {
    const key = `${listing.id}:${listing.lastUpdatedAt}`;
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;
    if (selfSaveRef.current) {
      selfSaveRef.current = false;
      return;
    }
    setDraft(initial);
    savedSnapRef.current = JSON.stringify(initial);
    setStatus("saved");
  }, [listing.id, listing.lastUpdatedAt, initial]);

  // Warn on tab close only while a save is pending or in flight.
  useEffect(() => {
    if (!dirty && status !== "saving") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, status]);

  const set = useCallback(<K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setPref = (key: keyof ContactPreferences, value: boolean) => {
    setDraft((prev) => ({
      ...prev,
      contactPreferences: { ...prev.contactPreferences, [key]: value },
    }));
  };

  const doSave = (d: Draft) => {
    const listingPatch: Parameters<typeof updateListingFields>[1]["listing"] = {
      title: d.title.trim() || listing.title,
      subtitle: d.subtitle.trim() || undefined,
      category: d.category || undefined,
      dealType: d.dealType || undefined,
      status: d.status,
      visibility: d.visibility,
      contactPreferences: d.contactPreferences,
    };

    const parsedAmount = parseFloat(
      d.fundingAmount.replace(/[^\d.-]/g, "")
    );
    const opportunityPatch: Partial<Opportunity> = {
      title: d.title.trim() || listing.title,
      description: d.subtitle.trim() || undefined,
      listingType: d.listingType,
      dealType: d.dealType || undefined,
      category: d.category || undefined,
      industry: d.industry.trim() || undefined,
      postedBy: d.postedBy.trim() || undefined,
      executiveSummary: d.executiveSummary,
      fullDescription: d.fullDescription
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
      investmentRange: d.investmentRange.trim() || undefined,
      fundingAmount: Number.isFinite(parsedAmount)
        ? Math.round(parsedAmount)
        : opportunity?.fundingAmount,
      expectedReturn: d.expectedReturn.trim() || undefined,
      website: d.website.trim() || undefined,
      companyDescription: d.companyDescription.trim() || undefined,
      fundingRequired: d.fundingRequired.trim() || undefined,
      equityAvailable: d.equityAvailable.trim() || undefined,
      minimumInvestment: d.minimumInvestment.trim() || undefined,
      expectedReturns: d.expectedReturns.trim() || undefined,
      currentStage: d.currentStage.trim() || undefined,
      timeline: d.timeline.trim() || undefined,
      projectStatus: d.projectStatus.trim() || undefined,
      status: d.oppStatus,
      location:
        [d.city, d.country].filter(Boolean).join(", ") ||
        opportunity?.location,
      place: {
        country: d.country.trim() || opportunity?.place?.country || "Unspecified",
        state: d.state.trim() || undefined,
        city: d.city.trim() || opportunity?.place?.city || "Unspecified",
        coordinates: opportunity?.place?.coordinates,
      },
    };

    try {
      selfSaveRef.current = true;
      updateListingFields(listing.id, {
        listing: listingPatch,
        opportunity: opportunityPatch,
      });
      savedSnapRef.current = JSON.stringify(d);
      setStatus("saved");
      setLastSavedAt(Date.now());
    } catch {
      selfSaveRef.current = false;
      setStatus("error");
    }
  };

  // Autosave: debounce after the last edit, then persist. Every keystroke
  // reschedules the timer, so saves fire only when the user pauses.
  useEffect(() => {
    if (!dirty) return;
    setStatus("saving");
    const timer = window.setTimeout(() => {
      doSave(draft);
    }, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftJson]);

  return (
    <section className="space-y-6 md:space-y-8">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
            Listing editor
          </div>
          <h2 className="mt-1 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">
            Edit listing details
          </h2>
          <p className="mt-1.5 text-sm text-navy-700/70 max-w-2xl">
            Update every field of your listing without re-entering the Create
            Listing wizard. Every change saves automatically — no Save button
            needed — and propagates across the marketplace immediately.
          </p>
        </div>
        <AutosaveStatus
          status={status}
          dirty={dirty}
          lastSavedAt={lastSavedAt}
          onRetry={() => doSave(draft)}
        />
      </header>

      {/* Basic Information */}
      <Section title="Basic Information" eyebrow="Section 1">
        <Grid>
          <Field label="Title" required full>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              maxLength={120}
              className={inputClass}
            />
          </Field>
          <Field
            label="Subtitle"
            hint="One-line tagline shown above the title on the opportunity page."
            full
          >
            <input
              type="text"
              value={draft.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
              maxLength={180}
              className={inputClass}
            />
          </Field>
          <Field label="Company name">
            <input
              type="text"
              value={draft.postedBy}
              onChange={(e) => set("postedBy", e.target.value)}
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
          <Field
            label="Website"
            hint="Public link investors can verify the sponsor against."
            full
          >
            <input
              type="url"
              value={draft.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://"
              className={inputClass}
            />
          </Field>
          <Field
            label="Company description"
            hint="A one-paragraph background on the sponsor entity behind the listing."
            full
          >
            <textarea
              value={draft.companyDescription}
              onChange={(e) => set("companyDescription", e.target.value)}
              rows={3}
              maxLength={500}
              className={textareaClass}
            />
          </Field>
          <Field label="Listing type">
            <Select
              value={draft.listingType}
              onChange={(v) => set("listingType", v as ListingType)}
              options={LISTING_TYPES.map((t) => ({ value: t, label: t }))}
            />
          </Field>
          <Field label="Category">
            <Select
              value={draft.category}
              onChange={(v) => set("category", v)}
              options={[
                { value: "", label: "— Select category —" },
                ...categories.map((c) => ({ value: c.label, label: c.label })),
              ]}
            />
          </Field>
          <Field label="Deal type" full>
            <Select
              value={draft.dealType}
              onChange={(v) => set("dealType", v as DealType)}
              options={[
                { value: "", label: "— Select deal type —" },
                ...DEAL_TYPES.map((d) => ({ value: d, label: d })),
              ]}
            />
          </Field>
        </Grid>
      </Section>

      {/* Location */}
      <Section title="Location" eyebrow="Section 2">
        <Grid>
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
              value={draft.state}
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

      {/* Financial Information */}
      <Section title="Financial Information" eyebrow="Section 3">
        <Grid>
          <Field
            label="Investment amount"
            hint="A single number like 10500000 — used for sort and range filters."
          >
            <input
              type="text"
              inputMode="numeric"
              value={draft.fundingAmount}
              onChange={(e) => set("fundingAmount", e.target.value)}
              placeholder="10,500,000"
              className={inputClass}
            />
          </Field>
          <Field
            label="Funding range"
            hint="Display string e.g. “$8M – $12M” or “€2.5M”."
          >
            <input
              type="text"
              value={draft.investmentRange}
              onChange={(e) => set("investmentRange", e.target.value)}
              placeholder="$8M – $12M"
              className={inputClass}
            />
          </Field>
          <Field label="Funding required">
            <input
              type="text"
              value={draft.fundingRequired}
              onChange={(e) => set("fundingRequired", e.target.value)}
              placeholder="$10.5M total · $4M LP"
              className={inputClass}
            />
          </Field>
          <Field label="Equity available">
            <input
              type="text"
              value={draft.equityAvailable}
              onChange={(e) => set("equityAvailable", e.target.value)}
              placeholder="32% LP"
              className={inputClass}
            />
          </Field>
          <Field label="Minimum investment">
            <input
              type="text"
              value={draft.minimumInvestment}
              onChange={(e) => set("minimumInvestment", e.target.value)}
              placeholder="$250,000"
              className={inputClass}
            />
          </Field>
          <Field label="Expected return (short)">
            <input
              type="text"
              value={draft.expectedReturn}
              onChange={(e) => set("expectedReturn", e.target.value)}
              placeholder="18% IRR"
              className={inputClass}
            />
          </Field>
          <Field label="Expected returns (detail)" full>
            <input
              type="text"
              value={draft.expectedReturns}
              onChange={(e) => set("expectedReturns", e.target.value)}
              placeholder="18% IRR · 2.3x MOIC · 5-year hold"
              className={inputClass}
            />
          </Field>
        </Grid>
      </Section>

      {/* Deal Mechanics */}
      <Section title="Deal Mechanics" eyebrow="Section 3a">
        <Grid>
          <Field
            label="Current stage"
            hint="Where the deal sits today — e.g. “Operating · expansion shovel-ready”."
          >
            <input
              type="text"
              value={draft.currentStage}
              onChange={(e) => set("currentStage", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field
            label="Timeline"
            hint="Hold or build window — e.g. “5-year hold · construction Q2 next year”."
          >
            <input
              type="text"
              value={draft.timeline}
              onChange={(e) => set("timeline", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field
            label="Project status"
            hint="Operational detail — e.g. “Permits secured, GMP contract priced”."
            full
          >
            <input
              type="text"
              value={draft.projectStatus}
              onChange={(e) => set("projectStatus", e.target.value)}
              className={inputClass}
            />
          </Field>
        </Grid>
      </Section>

      {/* Description */}
      <Section title="Description" eyebrow="Section 4">
        <Field label="Executive summary" hint="2–4 sentences. Lead with the opportunity.">
          <textarea
            value={draft.executiveSummary}
            onChange={(e) => set("executiveSummary", e.target.value)}
            rows={4}
            maxLength={1200}
            className={textareaClass}
          />
        </Field>
        <Field
          label="Full description"
          hint="Detailed picture — market, asset, structure, returns, timeline. Separate paragraphs with a blank line."
        >
          <textarea
            value={draft.fullDescription}
            onChange={(e) => set("fullDescription", e.target.value)}
            rows={10}
            maxLength={8000}
            className={textareaClass}
          />
        </Field>
      </Section>

      {/* Visibility */}
      <Section title="Visibility" eyebrow="Section 5">
        <p className="text-sm text-navy-700/70 -mt-1 mb-3">
          Control where this listing appears across Capital Circle.
        </p>
        <VisibilitySelect
          value={draft.visibility}
          onChange={(v) => set("visibility", v)}
        />
      </Section>

      {/* Status */}
      <Section title="Status" eyebrow="Section 6">
        <Grid>
          <Field label="Listing status">
            <Select
              value={draft.status}
              onChange={(v) => set("status", v as ListingStatus)}
              options={LISTING_STATUSES.map((s) => ({ value: s, label: s }))}
            />
          </Field>
          <Field label="Opportunity status">
            <Select
              value={draft.oppStatus}
              onChange={(v) => set("oppStatus", v as OpportunityStatus)}
              options={OPPORTUNITY_STATUSES.map((s) => ({
                value: s,
                label: s,
              }))}
            />
          </Field>
        </Grid>

        <div className="mt-5">
          <div className="text-[11px] uppercase tracking-[0.14em] text-navy-700/70 font-semibold mb-2">
            Contact preferences
          </div>
          <div className="rounded-xl bg-white ring-1 ring-navy-900/[0.06] divide-y divide-navy-900/[0.05] overflow-hidden">
            <Toggle
              label="Accept direct messages"
              hint="Members can open a thread from your sponsor card."
              checked={draft.contactPreferences.acceptMessages}
              onChange={(v) => setPref("acceptMessages", v)}
            />
            <Toggle
              label="Accept interest submissions"
              hint="“Show Interest” buttons on the opportunity page are active."
              checked={draft.contactPreferences.acceptInterest}
              onChange={(v) => setPref("acceptInterest", v)}
            />
            <Toggle
              label="Accept negotiation requests"
              hint="“Start Negotiation” buttons can be used by qualified investors."
              checked={draft.contactPreferences.acceptNegotiations}
              onChange={(v) => setPref("acceptNegotiations", v)}
            />
          </div>
        </div>
      </Section>

      <div className="flex justify-end">
        <AutosaveStatus
          status={status}
          dirty={dirty}
          lastSavedAt={lastSavedAt}
          onRetry={() => doSave(draft)}
        />
      </div>
    </section>
  );
}

// ---------- Sub-components ----------

/**
 * Live autosave indicator — the only save UI the editor has. States:
 *  - "Saving…"     a change is pending or being written
 *  - "Saved"       everything persisted, with a last-saved timestamp
 *  - "Save failed" the write threw; a Retry button re-attempts it
 */
function AutosaveStatus({
  status,
  dirty,
  lastSavedAt,
  onRetry,
}: {
  status: SaveStatus;
  dirty: boolean;
  lastSavedAt: number | null;
  onRetry: () => void;
}) {
  if (status === "error") {
    return (
      <span
        role="status"
        className="inline-flex items-center gap-2 text-xs font-semibold text-rose-700 bg-rose-500/10 ring-1 ring-rose-500/30 rounded-full px-3 py-1.5"
      >
        <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.4} />
        Save failed
        <button
          type="button"
          onClick={onRetry}
          className="underline underline-offset-2 hover:text-rose-600"
        >
          Retry
        </button>
      </span>
    );
  }

  if (status === "saving" || dirty) {
    return (
      <span
        role="status"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-700 bg-gold-500/10 ring-1 ring-gold-500/30 rounded-full px-3 py-1.5"
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.4} />
        Saving…
      </span>
    );
  }

  return (
    <span
      role="status"
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-500/10 ring-1 ring-emerald-500/30 rounded-full px-3 py-1.5"
    >
      <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.4} />
      Saved
      {lastSavedAt ? (
        <span className="font-medium text-emerald-700/75">
          · Last saved{" "}
          {new Date(lastSavedAt).toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
      ) : null}
    </span>
  );
}

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-bone/40 ring-1 ring-navy-900/[0.04] p-5 md:p-6">
      <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
        {eyebrow}
      </div>
      <h3 className="mt-1 text-base md:text-lg font-semibold text-navy-900 tracking-tight">
        {title}
      </h3>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

function Field({
  label,
  required,
  hint,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", full && "sm:col-span-2")}>
      <span className="block text-xs uppercase tracking-[0.14em] text-navy-700/70 font-semibold mb-1.5">
        {label}
        {required ? <span className="text-gold-600 ml-1">*</span> : null}
      </span>
      {children}
      {hint ? (
        <span className="block text-[11px] text-navy-700/55 mt-1.5 leading-snug">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputClass, "appearance-none pr-9")}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-700/60 pointer-events-none"
        strokeWidth={2}
      />
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-3 p-3 cursor-pointer hover:bg-bone/40 transition-colors">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-navy-900">{label}</div>
        {hint ? (
          <div className="mt-0.5 text-xs text-navy-700/65 leading-snug">
            {hint}
          </div>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors mt-0.5",
          checked ? "bg-gold-500" : "bg-navy-900/15"
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </label>
  );
}

function VisibilitySelect({
  value,
  onChange,
}: {
  value: ListingVisibility;
  onChange: (v: ListingVisibility) => void;
}) {
  const options: Array<{
    value: ListingVisibility;
    label: string;
    hint: string;
    Icon: typeof Globe;
  }> = [
    {
      value: "Public",
      label: "Public",
      hint: "Appears on the marketplace, search, and map. Direct URL works.",
      Icon: Globe,
    },
    {
      value: "Unlisted",
      label: "Unlisted",
      hint: "Hidden from the directory / search / map. Direct URL still works for anyone with the link.",
      Icon: Eye,
    },
    {
      value: "Private",
      label: "Private",
      hint: "Hidden from every public surface. Only you can see it from your dashboard.",
      Icon: Lock,
    },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "text-left rounded-xl ring-1 px-3 py-3 transition-colors",
              active
                ? "bg-gold-500/[0.10] ring-gold-500/50"
                : "bg-white ring-navy-900/[0.06] hover:ring-navy-900/20"
            )}
          >
            <div className="flex items-center gap-2">
              <opt.Icon
                className={cn(
                  "h-4 w-4",
                  active ? "text-gold-700" : "text-navy-700/65"
                )}
                strokeWidth={2.2}
              />
              <span className="text-sm font-semibold text-navy-900">
                {opt.label}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-navy-700/65 leading-snug">
              {opt.hint}
            </p>
          </button>
        );
      })}
    </div>
  );
}
