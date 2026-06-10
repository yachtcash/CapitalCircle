// Helpers for turning the Create-Listing wizard form state into the live
// `Opportunity` and `ListingRecord` shapes the marketplace consumes.
//
// Mock-only — no backend; we just shape the data so it can live in the
// existing localStorage-backed MessagingProvider state.

import type {
  DealType,
  ListingType,
  Opportunity,
  OpportunityDocument,
  OpportunityStatus,
} from "@/data/opportunities";

/** Shape the wizard hands us. Matches `FormState` in @/components/wizard/types. */
export type CreateListingFormState = {
  listingType: ListingType | null;
  category: string | null;
  dealType: DealType | null;
  title: string;
  companyName: string;
  country: string;
  stateProvince: string;
  city: string;
  industry: string;
  executiveSummary: string;
  fullDescription: string;
  valueType: "Asking Price" | "Seeking Investment" | "Contact For Details" | null;
  currency: string;
  amount: string;
  images: Array<{ id: string; previewUrl: string; name: string }>;
  documents: Array<{ id: string; name: string; type: string; size: number }>;
};

/** Strip a title down to a slug-safe segment. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "listing";
}

/** Find a slug not already used by either seed or user-created opportunities. */
export function uniqueSlug(
  base: string,
  takenSlugs: Set<string>
): string {
  let candidate = base;
  let i = 2;
  while (takenSlugs.has(candidate)) {
    candidate = `${base}-${i++}`;
  }
  return candidate;
}

/** Generate the next `cc-XXX` style opportunity id above any existing value. */
export function nextOpportunityId(takenIds: Iterable<string>): string {
  // User-created opportunities start at cc-100 to leave generous space above
  // the existing seed range (cc-001..cc-046).
  let maxNum = 100;
  for (const id of takenIds) {
    const match = /^cc-(\d+)$/.exec(id);
    if (match) {
      const value = parseInt(match[1], 10);
      if (!Number.isNaN(value) && value > maxNum) maxNum = value;
    }
  }
  return `cc-${String(maxNum + 1).padStart(3, "0")}`;
}

/** Parse the wizard amount string into a fundingAmount number. */
function parseAmount(amount: string): number {
  if (!amount) return 0;
  const cleaned = amount.replace(/[^\d.-]/g, "");
  const parts = cleaned.split("-").map((p) => parseFloat(p.trim()));
  if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
    return Math.round((parts[0] + parts[1]) / 2);
  }
  const single = parseFloat(cleaned);
  return Number.isNaN(single) ? 0 : Math.round(single);
}

function formatRange(currency: string, amount: string): string {
  if (!amount) return "Contact for details";
  const symbol = currency === "USD" ? "$" : `${currency} `;
  if (amount.includes("-")) {
    const parts = amount.split("-").map((p) => p.trim());
    return `${symbol}${parts[0]} – ${symbol}${parts[1]}`;
  }
  return `${symbol}${amount}`;
}

function defaultStatusFor(dealType: DealType | null): OpportunityStatus {
  if (dealType === "Seeking Investor" || dealType === "Financing Needed") {
    return "Seeking Capital";
  }
  return "Open";
}

function paragraphsFrom(fullDescription: string): string[] {
  return fullDescription
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

function documentsFrom(
  formDocs: CreateListingFormState["documents"]
): OpportunityDocument[] {
  // Default new uploads to "Pitch Deck" type since the wizard doesn't ask
  // for per-doc classification. Pages set to 0 — the UI tolerates this.
  return formDocs.map((d) => ({
    name: d.name,
    type: "Pitch Deck",
    pages: 0,
    updated: "just now",
  }));
}

// Generic committed placeholder — used when a listing is created with no
// uploaded photos. Lives at public/images/placeholders/ (see the README
// there for the full image-storage convention).
const FALLBACK_OPPORTUNITY_IMAGE = "/images/placeholders/opportunity.svg";

function fallbackImage(): string {
  return FALLBACK_OPPORTUNITY_IMAGE;
}

/**
 * Build a full Opportunity record from wizard form data. Used at create time.
 * Image previewUrls (object URLs) are used directly; if no images were
 * uploaded we fall back to the public SVG placeholder folder for the new
 * opportunity id (which won't exist on disk, but the OpportunityCard already
 * tolerates broken thumbnails and the placeholder gradient renders inline).
 */
export function formStateToOpportunity(
  formData: CreateListingFormState,
  context: {
    opportunityId: string;
    slug: string;
    companyId: string;
    postedBy: string;
    nowIso: string;
  }
): Opportunity {
  const description =
    formData.executiveSummary
      .split(/[.!?]\s/)
      .filter((s) => s.trim().length > 0)[0] ?? formData.executiveSummary;

  const images =
    formData.images.length > 0
      ? formData.images.map((m) => m.previewUrl)
      : [fallbackImage()];

  const fundingAmount = parseAmount(formData.amount);
  const investmentRange = formatRange(formData.currency, formData.amount);

  return {
    id: context.opportunityId,
    slug: context.slug,
    title: formData.title.trim() || "Untitled Listing",
    category: formData.category ?? "Business Acquisitions",
    industry: formData.industry.trim() || formData.category || "Unspecified",
    listingType: formData.listingType ?? "Opportunity",
    dealType: formData.dealType ?? "Contact For Details",
    location:
      [formData.city, formData.country].filter(Boolean).join(", ") ||
      "Location pending",
    place: {
      country: formData.country || "Unspecified",
      state: formData.stateProvince || undefined,
      city: formData.city || "Unspecified",
    },
    investmentRange,
    fundingAmount,
    expectedReturn:
      formData.valueType === "Contact For Details"
        ? "Contact for details"
        : "Per discussion",
    status: defaultStatusFor(formData.dealType),
    description: description.slice(0, 220),
    executiveSummary: formData.executiveSummary.trim(),
    fullDescription: paragraphsFrom(formData.fullDescription),
    fundingRequired: investmentRange,
    equityAvailable: "Per discussion",
    minimumInvestment: "Per discussion",
    expectedReturns:
      formData.valueType === "Contact For Details"
        ? "Contact for details"
        : "Per discussion",
    currentStage: "New listing",
    timeline: "Per discussion",
    projectStatus: "Open for inquiries",
    postedBy: formData.companyName.trim() || context.postedBy,
    postedAgo: "just now",
    postedAt: context.nowIso.slice(0, 10),
    images,
    featured: false,
    trending: false,
    companyId: context.companyId,
    documents: documentsFrom(formData.documents),
  };
}

/** Same shaping as create, but as a Partial<Opportunity> for in-place edits. */
export function formStateToOpportunityPatch(
  formData: CreateListingFormState
): Partial<Opportunity> {
  const fundingAmount = parseAmount(formData.amount);
  const investmentRange = formatRange(formData.currency, formData.amount);
  return {
    title: formData.title.trim() || "Untitled Listing",
    category: formData.category ?? undefined,
    industry: formData.industry.trim() || undefined,
    listingType: formData.listingType ?? undefined,
    dealType: formData.dealType ?? undefined,
    location:
      [formData.city, formData.country].filter(Boolean).join(", ") || undefined,
    place: {
      country: formData.country || "Unspecified",
      state: formData.stateProvince || undefined,
      city: formData.city || "Unspecified",
    },
    investmentRange,
    fundingAmount,
    status: defaultStatusFor(formData.dealType),
    executiveSummary: formData.executiveSummary.trim(),
    fullDescription: paragraphsFrom(formData.fullDescription),
    fundingRequired: investmentRange,
    images:
      formData.images.length > 0
        ? formData.images.map((m) => m.previewUrl)
        : undefined,
    documents:
      formData.documents.length > 0 ? documentsFrom(formData.documents) : undefined,
    postedBy: formData.companyName.trim() || undefined,
  };
}
