export const LISTING_TYPES = ["Opportunity", "Product", "Service"] as const;
export type ListingType = (typeof LISTING_TYPES)[number];

export const DEAL_TYPES = [
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
] as const;
export type DealType = (typeof DEAL_TYPES)[number];

export const VALUE_TYPES = [
  "Asking Price",
  "Seeking Investment",
  "Contact For Details",
] as const;
export type ValueType = (typeof VALUE_TYPES)[number];

export const CURRENCIES = ["USD", "EUR", "GBP", "MXN", "CAD", "AED", "Other"] as const;
export type Currency = (typeof CURRENCIES)[number];

export type MediaItem = {
  id: string;
  name: string;
  size: number;
  type: string;
  previewUrl: string;
};

export type DocumentItem = {
  id: string;
  name: string;
  size: number;
  type: string;
};

export type FormState = {
  // Step 1
  listingType: ListingType | null;
  // Step 2
  category: string | null;
  // Step 3
  dealType: DealType | null;
  // Step 4
  title: string;
  companyName: string;
  country: string;
  stateProvince: string;
  city: string;
  industry: string;
  // Step 5
  executiveSummary: string;
  fullDescription: string;
  // Step 6
  valueType: ValueType | null;
  currency: Currency;
  amount: string;
  // Step 7
  images: MediaItem[];
  // Step 8
  documents: DocumentItem[];
};

export const INITIAL_FORM_STATE: FormState = {
  listingType: null,
  category: null,
  dealType: null,
  title: "",
  companyName: "",
  country: "",
  stateProvince: "",
  city: "",
  industry: "",
  executiveSummary: "",
  fullDescription: "",
  valueType: null,
  currency: "USD",
  amount: "",
  images: [],
  documents: [],
};

export const STEP_LABELS = [
  "Type",
  "Category",
  "Deal Type",
  "Basics",
  "Description",
  "Financial",
  "Media",
  "Documents",
  "Review",
];

export const STEP_TITLES: Record<number, { eyebrow: string; title: string; subtitle: string }> = {
  1: {
    eyebrow: "Step 1 of 9 · Listing Type",
    title: "What are you listing?",
    subtitle: "Pick the format that best describes what you're bringing to Capital Circle.",
  },
  2: {
    eyebrow: "Step 2 of 9 · Category",
    title: "Which category fits best?",
    subtitle: "Members browse and filter by these 13 sectors. Pick the closest match.",
  },
  3: {
    eyebrow: "Step 3 of 9 · Deal Type",
    title: "How are you structuring the deal?",
    subtitle: "This tells members what kind of engagement you're inviting.",
  },
  4: {
    eyebrow: "Step 4 of 9 · Basic Information",
    title: "The essentials",
    subtitle: "A clear title and accurate location make your listing easier to find and easier to trust.",
  },
  5: {
    eyebrow: "Step 5 of 9 · Description",
    title: "Tell the story",
    subtitle: "A tight executive summary up front, then the full picture. Members read both before reaching out.",
  },
  6: {
    eyebrow: "Step 6 of 9 · Financial Information",
    title: "What's the financial frame?",
    subtitle: "You can disclose a specific number or keep it private until you connect.",
  },
  7: {
    eyebrow: "Step 7 of 9 · Media",
    title: "Add photos and renderings",
    subtitle: "Visuals make a listing memorable. Drop up to 30 images.",
  },
  8: {
    eyebrow: "Step 8 of 9 · Documents",
    title: "Attach supporting documents",
    subtitle: "Pitch decks, financials, and project plans help serious members go deeper.",
  },
  9: {
    eyebrow: "Step 9 of 9 · Review",
    title: "Review your listing",
    subtitle: "Double-check the details. You can jump back to any step to make edits.",
  },
};
