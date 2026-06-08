"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  CircleDollarSign,
  Tag,
  MessageCircle,
  Sparkles,
  Package,
  Wrench,
  HandCoins,
  Handshake,
  Mountain,
  Building,
  Combine,
  PiggyBank,
  Truck,
  Network,
  HardHat,
  Store,
  KeyRound,
  Briefcase,
  ImagePlus,
  FileUp,
  CloudUpload,
  Info,
  Save,
  Pencil,
  LayoutGrid,
  ExternalLink,
} from "lucide-react";

import ProgressBar from "@/components/wizard/ProgressBar";
import SelectionGrid, {
  type SelectionOption,
} from "@/components/wizard/SelectionGrid";
import FileDropzone from "@/components/wizard/FileDropzone";
import MediaPreviews from "@/components/wizard/MediaPreviews";
import DocumentList from "@/components/wizard/DocumentList";
import ReviewSummary from "@/components/wizard/ReviewSummary";
import WizardField, {
  inputClass,
  textareaClass,
} from "@/components/wizard/WizardField";
import {
  INITIAL_FORM_STATE,
  STEP_LABELS,
  STEP_TITLES,
  CURRENCIES,
  type Currency,
  type DealType,
  type DocumentItem,
  type FormState,
  type ListingType,
  type MediaItem,
  type ValueType,
} from "@/components/wizard/types";
import { categories } from "@/data/categories";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { cn } from "@/lib/cn";

// -------- Constants & options --------

const MAX_IMAGES = 30;
const MAX_TITLE = 100;
const MAX_SUMMARY = 600;
const MIN_SUMMARY = 60;
const MAX_DESCRIPTION = 4000;
const MIN_DESCRIPTION = 120;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_DOC_EXTS = [".pdf", ".docx", ".xlsx", ".pptx"];
const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";
const DOC_ACCEPT =
  ".pdf,.docx,.xlsx,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation";

const DOC_EXAMPLES = [
  "Pitch Deck",
  "Financial Summary",
  "Project Overview",
  "Survey",
  "Architectural Plans",
];

const LISTING_TYPE_OPTIONS: SelectionOption[] = [
  {
    value: "Opportunity",
    label: "Opportunity",
    description:
      "An investment, acquisition, partnership, or development project.",
    icon: Sparkles,
  },
  {
    value: "Product",
    label: "Product",
    description: "Materials, equipment, inventory, or branded goods for sale.",
    icon: Package,
  },
  {
    value: "Service",
    label: "Service",
    description:
      "Professional services, advisory, construction, or supplier capacity.",
    icon: Wrench,
  },
];

const DEAL_TYPE_OPTIONS: SelectionOption[] = [
  {
    value: "Seeking Investor",
    label: "Seeking Investor",
    icon: HandCoins,
    description: "Equity or pref equity capital raise.",
  },
  {
    value: "Joint Venture",
    label: "Joint Venture",
    icon: Handshake,
    description: "Operator + capital partner structure.",
  },
  {
    value: "Land For Sale",
    label: "Land For Sale",
    icon: Mountain,
    description: "Titled land transaction.",
  },
  {
    value: "Business For Sale",
    label: "Business For Sale",
    icon: Building,
    description: "Going-concern sale, founder transition.",
  },
  {
    value: "Acquisition",
    label: "Acquisition",
    icon: Combine,
    description: "Buy-side mandate or platform deal.",
  },
  {
    value: "Financing Needed",
    label: "Financing Needed",
    icon: PiggyBank,
    description: "Debt, mezz, or structured financing.",
  },
  {
    value: "Supplier Offering",
    label: "Supplier Offering",
    icon: Truck,
    description: "Capacity, contracts, distribution.",
  },
  {
    value: "Strategic Partnership",
    label: "Strategic Partnership",
    icon: Network,
    description: "Non-equity commercial alignment.",
  },
  {
    value: "Development Project",
    label: "Development Project",
    icon: HardHat,
    description: "Ground-up or value-add build.",
  },
  {
    value: "Franchise Opportunity",
    label: "Franchise Opportunity",
    icon: Store,
    description: "Multi-unit or single-territory rights.",
  },
  {
    value: "Licensing Opportunity",
    label: "Licensing Opportunity",
    icon: KeyRound,
    description: "IP, brand, or technology license.",
  },
  {
    value: "Service Offering",
    label: "Service Offering",
    icon: Briefcase,
    description: "Professional or B2B services.",
  },
  {
    value: "Contact For Details",
    label: "Contact For Details",
    icon: MessageCircle,
    description: "Discreet listing — connect to learn more.",
  },
];

const VALUE_TYPE_OPTIONS: SelectionOption[] = [
  {
    value: "Asking Price",
    label: "Asking Price",
    icon: Tag,
    description: "A fixed price you're asking from a buyer.",
  },
  {
    value: "Seeking Investment",
    label: "Seeking Investment",
    icon: CircleDollarSign,
    description: "A capital amount you're raising.",
  },
  {
    value: "Contact For Details",
    label: "Contact For Details",
    icon: MessageCircle,
    description: "Keep numbers private until a member connects.",
  },
];

const CATEGORY_OPTIONS: SelectionOption[] = categories.map((c) => ({
  value: c.label,
  label: c.label,
  description: c.description,
  icon: c.icon,
}));

// -------- Helpers --------

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function isFormStatePayload(value: unknown): value is FormState {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    "title" in v &&
    typeof v.title === "string" &&
    "country" in v &&
    typeof v.country === "string" &&
    "city" in v &&
    typeof v.city === "string" &&
    "executiveSummary" in v &&
    typeof v.executiveSummary === "string" &&
    "fullDescription" in v &&
    typeof v.fullDescription === "string" &&
    "currency" in v &&
    typeof v.currency === "string" &&
    "amount" in v &&
    typeof v.amount === "string" &&
    Array.isArray(v.images) &&
    Array.isArray(v.documents)
  );
}

// -------- Main wizard --------

type CreatedIds = { listingId: string; slug: string };

export default function CreateListingClient({
  initialListingId,
}: {
  initialListingId?: string;
}) {
  const listingId = initialListingId ?? null;
  const { getListing, createListing, commitListingEdit } = useMessaging();
  const [createdIds, setCreatedIds] = useState<CreatedIds | null>(null);

  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormState>(() => {
    if (!listingId) return INITIAL_FORM_STATE;
    const existing = getListing(listingId);
    if (existing && isFormStatePayload(existing.draftPayload)) {
      return existing.draftPayload;
    }
    return INITIAL_FORM_STATE;
  });

  // After hydration, if we land on the edit URL but the live listing now
  // has a draftPayload (e.g. localStorage rehydration set it), sync into
  // the wizard state so we don't keep the empty INITIAL_FORM_STATE.
  const [didHydrate, setDidHydrate] = useState(false);
  useEffect(() => {
    if (!listingId || didHydrate) return;
    const existing = getListing(listingId);
    if (existing && isFormStatePayload(existing.draftPayload)) {
      setFormData(existing.draftPayload);
    }
    setDidHydrate(true);
  }, [listingId, didHydrate, getListing]);

  const update = useCallback((partial: Partial<FormState>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  }, []);

  const canProceed = useMemo(() => {
    switch (step) {
      case 1:
        return formData.listingType !== null;
      case 2:
        return formData.category !== null;
      case 3:
        return formData.dealType !== null;
      case 4:
        return (
          formData.title.trim().length > 0 &&
          formData.country.trim().length > 0 &&
          formData.city.trim().length > 0
        );
      case 5:
        return (
          formData.executiveSummary.trim().length >= MIN_SUMMARY &&
          formData.fullDescription.trim().length >= MIN_DESCRIPTION
        );
      case 6:
        return (
          formData.valueType !== null &&
          (formData.valueType === "Contact For Details" ||
            formData.amount.trim().length > 0)
        );
      default:
        return true;
    }
  }, [step, formData]);

  const scrollTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNext = () => {
    if (!canProceed) return;
    if (step === 9) {
      if (listingId) {
        // Edit flow: persist edits and reuse the existing listing's slug.
        commitListingEdit(listingId, formData);
        const existing = getListing(listingId);
        setCreatedIds({
          listingId,
          slug: existing?.opportunitySlug ?? "",
        });
      } else {
        // New listing → create + publish + capture ids for the success screen.
        const ids = createListing(formData, { status: "Active" });
        setCreatedIds({ listingId: ids.listingId, slug: ids.slug });
      }
      setStep(10);
      scrollTop();
      return;
    }
    if (step < 9) {
      setStep((s) => s + 1);
      scrollTop();
    }
  };

  const handleSaveDraft = () => {
    if (listingId) {
      // Re-save the draft against the existing record without publishing.
      commitListingEdit(listingId, formData);
      const existing = getListing(listingId);
      setCreatedIds({
        listingId,
        slug: existing?.opportunitySlug ?? "",
      });
    } else {
      const ids = createListing(formData, { status: "Draft" });
      setCreatedIds({ listingId: ids.listingId, slug: ids.slug });
    }
    setStep(11); // 11 = "Draft saved" screen
    scrollTop();
  };

  const handleBack = () => {
    if (step > 1 && step < 10) {
      setStep((s) => s - 1);
      scrollTop();
    }
  };

  const handleEdit = (targetStep: number) => {
    setStep(targetStep);
    scrollTop();
  };

  const handleCreateAnother = () => {
    formData.images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setFormData(INITIAL_FORM_STATE);
    setCreatedIds(null);
    setStep(1);
    scrollTop();
  };

  // -------- Image / document handlers --------

  const handleImagesAdded = useCallback(
    (files: File[]) => {
      const remaining = MAX_IMAGES - formData.images.length;
      if (remaining <= 0) return;
      const accepted = files
        .filter((f) => ALLOWED_IMAGE_TYPES.includes(f.type))
        .slice(0, remaining)
        .map<MediaItem>((f) => ({
          id: makeId(),
          name: f.name,
          size: f.size,
          type: f.type,
          previewUrl: URL.createObjectURL(f),
        }));
      if (accepted.length > 0) {
        update({ images: [...formData.images, ...accepted] });
      }
    },
    [formData.images, update]
  );

  const handleImageRemove = useCallback(
    (id: string) => {
      const target = formData.images.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      update({ images: formData.images.filter((i) => i.id !== id) });
    },
    [formData.images, update]
  );

  const handleDocumentsAdded = useCallback(
    (files: File[]) => {
      const accepted = files
        .filter((f) =>
          ALLOWED_DOC_EXTS.some((ext) => f.name.toLowerCase().endsWith(ext))
        )
        .map<DocumentItem>((f) => ({
          id: makeId(),
          name: f.name,
          size: f.size,
          type: f.type,
        }));
      if (accepted.length > 0) {
        update({ documents: [...formData.documents, ...accepted] });
      }
    },
    [formData.documents, update]
  );

  const handleDocumentRemove = useCallback(
    (id: string) => {
      update({ documents: formData.documents.filter((d) => d.id !== id) });
    },
    [formData.documents, update]
  );

  // -------- Step 10 / 11 — success layout takes over --------

  if (step === 10 && createdIds) {
    return (
      <SuccessScreen
        variant="published"
        createdIds={createdIds}
        onCreateAnother={handleCreateAnother}
      />
    );
  }
  if (step === 11 && createdIds) {
    return (
      <SuccessScreen
        variant="draft"
        createdIds={createdIds}
        onCreateAnother={handleCreateAnother}
      />
    );
  }

  // -------- Wizard layout --------

  return (
    <div className="flex-1 flex flex-col">
      <ProgressBar current={step} total={9} labels={STEP_LABELS} />

      <div className="flex-1 max-w-3xl w-full mx-auto px-5 md:px-10 py-8 md:py-12">
        <StepHeading {...STEP_TITLES[step]} />

        {step === 1 && (
          <SelectionGrid
            options={LISTING_TYPE_OPTIONS}
            value={formData.listingType}
            onChange={(v) => update({ listingType: v as ListingType })}
            columns="grid-cols-1 sm:grid-cols-3"
          />
        )}

        {step === 2 && (
          <SelectionGrid
            options={CATEGORY_OPTIONS}
            value={formData.category}
            onChange={(v) => update({ category: v })}
            columns="grid-cols-1 sm:grid-cols-2"
            compact
          />
        )}

        {step === 3 && (
          <SelectionGrid
            options={DEAL_TYPE_OPTIONS}
            value={formData.dealType}
            onChange={(v) => update({ dealType: v as DealType })}
            columns="grid-cols-1 sm:grid-cols-2"
            compact
          />
        )}

        {step === 4 && <BasicsForm formData={formData} update={update} />}

        {step === 5 && (
          <DescriptionForm formData={formData} update={update} />
        )}

        {step === 6 && <FinancialForm formData={formData} update={update} />}

        {step === 7 && (
          <MediaStep
            formData={formData}
            onAdd={handleImagesAdded}
            onRemove={handleImageRemove}
          />
        )}

        {step === 8 && (
          <DocumentsStep
            formData={formData}
            onAdd={handleDocumentsAdded}
            onRemove={handleDocumentRemove}
          />
        )}

        {step === 9 && (
          <ReviewSummary formData={formData} onEdit={handleEdit} />
        )}
      </div>

      <WizardNav
        step={step}
        canProceed={canProceed}
        onBack={handleBack}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        isEditing={!!listingId}
      />
    </div>
  );
}

// -------- StepHeading --------

function StepHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <header className="mb-7 md:mb-9">
      <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
        {eyebrow}
      </div>
      <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-navy-900 tracking-tight">
        {title}
      </h1>
      <p className="mt-3 text-sm md:text-base text-navy-700/70 leading-relaxed max-w-2xl">
        {subtitle}
      </p>
    </header>
  );
}

// -------- WizardNav (back / next) --------

function WizardNav({
  step,
  canProceed,
  onBack,
  onNext,
  onSaveDraft,
  isEditing,
}: {
  step: number;
  canProceed: boolean;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  isEditing: boolean;
}) {
  const isLast = step === 9;
  const isFirst = step === 1;
  // Draft saving requires at least a category + title so the listing has a
  // recognizable identity in My Listings. Until then the button stays
  // disabled but visible.
  const canSaveDraft = step >= 4;
  return (
    <footer className="bg-white border-t border-navy-900/[0.06] mt-auto">
      <div className="max-w-3xl mx-auto px-5 md:px-10 py-4 md:py-5 flex items-center justify-between gap-2 md:gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isFirst}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-4 md:px-5 py-2.5 text-sm font-semibold transition-colors",
            isFirst
              ? "text-navy-700/40 cursor-not-allowed"
              : "text-navy-900 hover:bg-bone"
          )}
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
          Back
        </button>

        <button
          type="button"
          onClick={onSaveDraft}
          disabled={!canSaveDraft}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-4 md:px-5 py-2.5 text-sm font-semibold transition-colors",
            canSaveDraft
              ? "text-navy-900 bg-white ring-1 ring-navy-900/15 hover:ring-navy-900/35"
              : "text-navy-700/40 cursor-not-allowed ring-1 ring-navy-900/[0.05]"
          )}
          title={canSaveDraft ? "Save progress as a draft in My Listings" : "Complete the basics first"}
        >
          <Save className="h-4 w-4" strokeWidth={2.2} />
          {isEditing ? "Save Draft" : "Save as Draft"}
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-5 md:px-6 py-2.5 text-sm font-semibold transition-colors",
            canProceed
              ? "bg-gold-500 hover:bg-gold-400 text-navy-900"
              : "bg-navy-900/10 text-navy-700/40 cursor-not-allowed"
          )}
        >
          {isLast ? (isEditing ? "Save Changes" : "Submit Listing") : "Next"}
          {!isLast ? <ArrowRight className="h-4 w-4" strokeWidth={2.4} /> : null}
        </button>
      </div>
    </footer>
  );
}

// -------- Step 4: Basic Information --------

function BasicsForm({
  formData,
  update,
}: {
  formData: FormState;
  update: (p: Partial<FormState>) => void;
}) {
  return (
    <div className="space-y-5 md:space-y-6">
      <WizardField
        label="Listing title"
        required
        counter={{ current: formData.title.length, max: MAX_TITLE }}
        hint="A clear, specific name. Members scan titles first."
      >
        <input
          type="text"
          value={formData.title}
          maxLength={MAX_TITLE}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Beachfront Boutique Hotel — 42 Keys"
          className={inputClass}
        />
      </WizardField>

      <WizardField label="Company name" optional>
        <input
          type="text"
          value={formData.companyName}
          onChange={(e) => update({ companyName: e.target.value })}
          placeholder="Pacific Coast Holdings"
          className={inputClass}
        />
      </WizardField>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <WizardField label="Country" required>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => update({ country: e.target.value })}
            placeholder="Mexico"
            className={inputClass}
          />
        </WizardField>
        <WizardField label="State / Province" optional>
          <input
            type="text"
            value={formData.stateProvince}
            onChange={(e) => update({ stateProvince: e.target.value })}
            placeholder="Baja California Sur"
            className={inputClass}
          />
        </WizardField>
        <WizardField label="City" required>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => update({ city: e.target.value })}
            placeholder="Cabo San Lucas"
            className={inputClass}
          />
        </WizardField>
      </div>

      <WizardField
        label="Industry"
        optional
        hint="More specific than category — e.g. Luxury Hospitality, Mixed-Use Residential, Freight & Logistics."
      >
        <input
          type="text"
          value={formData.industry}
          onChange={(e) => update({ industry: e.target.value })}
          placeholder="Luxury Hospitality"
          className={inputClass}
        />
      </WizardField>
    </div>
  );
}

// -------- Step 5: Description --------

function DescriptionForm({
  formData,
  update,
}: {
  formData: FormState;
  update: (p: Partial<FormState>) => void;
}) {
  return (
    <div className="space-y-6">
      <WizardField
        label="Executive summary"
        required
        hint={`2–4 sentences. Lead with the opportunity, the structure, and what you're asking for.`}
        counter={{
          current: formData.executiveSummary.length,
          max: MAX_SUMMARY,
          min: MIN_SUMMARY,
        }}
      >
        <textarea
          rows={4}
          value={formData.executiveSummary}
          maxLength={MAX_SUMMARY}
          onChange={(e) => update({ executiveSummary: e.target.value })}
          placeholder="Established 42-key beachfront boutique on Médano Beach raising growth equity to fund an 18-key expansion and beach club…"
          className={textareaClass}
        />
      </WizardField>

      <WizardField
        label="Full description"
        required
        hint="The detailed picture — market, asset, structure, returns, timeline, risks. Avoid confidential information here."
        counter={{
          current: formData.fullDescription.length,
          max: MAX_DESCRIPTION,
          min: MIN_DESCRIPTION,
        }}
      >
        <textarea
          rows={10}
          value={formData.fullDescription}
          maxLength={MAX_DESCRIPTION}
          onChange={(e) => update({ fullDescription: e.target.value })}
          placeholder={`The property occupies 1.2 acres of titled beachfront…\n\nEntitlements for an 18-key expansion are shovel-ready…\n\nCapital is being raised as common equity alongside the existing sponsor…`}
          className={textareaClass}
        />
      </WizardField>
    </div>
  );
}

// -------- Step 6: Financial --------

function FinancialForm({
  formData,
  update,
}: {
  formData: FormState;
  update: (p: Partial<FormState>) => void;
}) {
  const hideAmount = formData.valueType === "Contact For Details";

  return (
    <div className="space-y-7">
      <div>
        <div className="mb-3 text-xs uppercase tracking-[0.14em] text-navy-700/70 font-semibold">
          Value type <span className="text-gold-600 ml-1">*</span>
        </div>
        <SelectionGrid
          options={VALUE_TYPE_OPTIONS}
          value={formData.valueType}
          onChange={(v) => update({ valueType: v as ValueType })}
          columns="grid-cols-1 sm:grid-cols-3"
          compact
        />
      </div>

      {!hideAmount ? (
        <div className="grid grid-cols-1 sm:grid-cols-[140px_minmax(0,1fr)] gap-4">
          <WizardField label="Currency" required>
            <div className="relative">
              <select
                value={formData.currency}
                onChange={(e) =>
                  update({ currency: e.target.value as Currency })
                }
                className={`${inputClass} appearance-none pr-9`}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-700/60 pointer-events-none"
                strokeWidth={2}
              />
            </div>
          </WizardField>
          <WizardField
            label="Amount"
            required
            hint="A single number or a range like 8,000,000 – 12,000,000."
          >
            <input
              type="text"
              inputMode="decimal"
              value={formData.amount}
              onChange={(e) => update({ amount: e.target.value })}
              placeholder="10,500,000"
              className={inputClass}
            />
          </WizardField>
        </div>
      ) : (
        <div className="flex gap-3 rounded-2xl bg-gold-500/10 ring-1 ring-gold-500/30 p-5">
          <Info
            className="h-5 w-5 text-gold-700 shrink-0 mt-0.5"
            strokeWidth={2}
          />
          <div className="text-sm text-navy-900/90">
            <div className="font-semibold">The amount will stay private.</div>
            <p className="mt-1 text-navy-900/70 leading-relaxed">
              Members will need to contact you directly to discuss numbers.
              This is a good choice for confidential acquisitions or competitive
              deal flow.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// -------- Step 7: Media --------

function MediaStep({
  formData,
  onAdd,
  onRemove,
}: {
  formData: FormState;
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
}) {
  const remaining = MAX_IMAGES - formData.images.length;
  const full = remaining <= 0;
  return (
    <div className="space-y-5">
      <FileDropzone
        accept={IMAGE_ACCEPT}
        multiple
        onFiles={onAdd}
        disabled={full}
        className="p-8 md:p-12"
      >
        <div className="flex flex-col items-center text-center gap-3">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-gold-500 ring-1 ring-navy-900/10">
            <ImagePlus className="h-6 w-6" strokeWidth={1.8} />
          </span>
          <div>
            <div className="text-base font-semibold text-navy-900">
              {full ? "Image limit reached" : "Drop images or click to browse"}
            </div>
            <div className="mt-1 text-xs text-navy-700/65">
              JPG, PNG, WEBP · Up to {MAX_IMAGES} images
            </div>
          </div>
          <span className="text-[11px] uppercase tracking-[0.14em] text-gold-600 font-semibold">
            {formData.images.length} / {MAX_IMAGES} added
          </span>
        </div>
      </FileDropzone>

      <div className="flex gap-2 items-start rounded-xl bg-bone/60 ring-1 ring-navy-900/[0.05] px-4 py-3">
        <Info
          className="h-4 w-4 text-gold-600 shrink-0 mt-0.5"
          strokeWidth={2}
        />
        <p className="text-xs text-navy-700/75 leading-relaxed">
          Images will be automatically optimized for display. No need to resize
          before uploading.
        </p>
      </div>

      <MediaPreviews items={formData.images} onRemove={onRemove} />
    </div>
  );
}

// -------- Step 8: Documents --------

function DocumentsStep({
  formData,
  onAdd,
  onRemove,
}: {
  formData: FormState;
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {DOC_EXAMPLES.map((ex) => (
          <span
            key={ex}
            className="inline-flex items-center text-[11px] uppercase tracking-[0.12em] font-semibold text-navy-700/70 bg-white ring-1 ring-navy-900/[0.06] rounded-full px-3 py-1.5"
          >
            {ex}
          </span>
        ))}
      </div>

      <FileDropzone
        accept={DOC_ACCEPT}
        multiple
        onFiles={onAdd}
        className="p-8 md:p-12"
      >
        <div className="flex flex-col items-center text-center gap-3">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-gold-500 ring-1 ring-navy-900/10">
            <FileUp className="h-6 w-6" strokeWidth={1.8} />
          </span>
          <div>
            <div className="text-base font-semibold text-navy-900">
              Drop documents or click to browse
            </div>
            <div className="mt-1 text-xs text-navy-700/65">
              PDF · DOCX · XLSX · PPTX
            </div>
          </div>
          <span className="text-[11px] uppercase tracking-[0.14em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
            <CloudUpload className="h-3.5 w-3.5" strokeWidth={2.2} />
            {formData.documents.length} attached
          </span>
        </div>
      </FileDropzone>

      <div className="flex gap-2 items-start rounded-xl bg-bone/60 ring-1 ring-navy-900/[0.05] px-4 py-3">
        <Info
          className="h-4 w-4 text-gold-600 shrink-0 mt-0.5"
          strokeWidth={2}
        />
        <p className="text-xs text-navy-700/75 leading-relaxed">
          Documents are stored privately and only released to members after they
          countersign an NDA.
        </p>
      </div>

      <DocumentList items={formData.documents} onRemove={onRemove} />
    </div>
  );
}

// -------- Step 10 / 11: Success screen --------

function SuccessScreen({
  variant,
  createdIds,
  onCreateAnother,
}: {
  variant: "published" | "draft";
  createdIds: CreatedIds;
  onCreateAnother: () => void;
}) {
  const isDraft = variant === "draft";
  const publicHref = createdIds.slug
    ? `/opportunity/${createdIds.slug}`
    : `/dashboard/listings/${createdIds.listingId}`;
  const manageHref = `/dashboard/listings/${createdIds.listingId}`;
  const editHref = `/create-listing?listingId=${createdIds.listingId}`;
  const myListingsHref = "/dashboard/listings";

  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)] flex items-center">
      <div className="max-w-xl mx-auto px-5 md:px-10 py-16 text-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold-500 text-navy-900 ring-8 ring-gold-500/15">
          {isDraft ? (
            <Save className="h-9 w-9" strokeWidth={2.2} />
          ) : (
            <CheckCircle2 className="h-9 w-9" strokeWidth={2.2} />
          )}
        </span>
        <div className="mt-6 text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
          {isDraft ? "Draft saved" : "Listing published"}
        </div>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-navy-900 tracking-tight text-balance">
          {isDraft
            ? "Your draft has been saved."
            : "Your listing is live on Capital Circle."}
        </h1>
        <p className="mt-4 text-base text-navy-700/75 leading-relaxed">
          {isDraft ? (
            <>
              You can come back to it anytime from{" "}
              <span className="font-semibold text-navy-900">My Listings</span>.
              Publish when you&apos;re ready and it appears across the
              marketplace, search, and map.
            </>
          ) : (
            <>
              Your opportunity now appears in the marketplace directory, search
              results, and (if it has coordinates) the map view. Manage it
              anytime from{" "}
              <span className="font-semibold text-navy-900">My Listings</span>.
            </>
          )}
        </p>

        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-navy-900/[0.06] px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-navy-700/70 font-semibold">
          <span>Listing</span>
          <span className="text-navy-900 tabular-nums">{createdIds.listingId}</span>
        </div>

        <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
          {!isDraft && createdIds.slug ? (
            <Link
              href={publicHref}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-6 py-3 text-sm transition-colors"
            >
              <ExternalLink className="h-4 w-4" strokeWidth={2.4} />
              View Public Listing
            </Link>
          ) : null}
          <Link
            href={manageHref}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-full font-semibold px-6 py-3 text-sm transition-colors",
              isDraft
                ? "bg-gold-500 hover:bg-gold-400 text-navy-900"
                : "bg-navy-900 hover:bg-navy-900/90 text-white"
            )}
          >
            <LayoutGrid className="h-4 w-4" strokeWidth={2.4} />
            Manage Listing
          </Link>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center text-sm">
          <Link
            href={editHref}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white ring-1 ring-navy-900/10 hover:ring-navy-900/25 text-navy-900 font-semibold px-5 py-2.5 transition-all"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={2.4} />
            Edit Listing
          </Link>
          <Link
            href={myListingsHref}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white ring-1 ring-navy-900/10 hover:ring-navy-900/25 text-navy-900 font-semibold px-5 py-2.5 transition-all"
          >
            <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2.4} />
            My Listings
          </Link>
          <button
            type="button"
            onClick={onCreateAnother}
            className="inline-flex items-center justify-center rounded-full bg-white ring-1 ring-navy-900/10 hover:ring-navy-900/25 text-navy-900 font-semibold px-5 py-2.5 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} />
            Create Another
          </button>
        </div>
      </div>
    </div>
  );
}
