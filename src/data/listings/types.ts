export type ListingStatus =
  | "Draft"
  | "Active"
  | "Seeking Capital"
  | "Negotiating"
  | "Under Review"
  | "Closed"
  | "Archived";

export type ListingActivityKind =
  | "interest"
  | "negotiation_start"
  | "saved"
  | "company_view"
  | "document_request"
  | "stage_change"
  | "edit";

export type ListingActivity = {
  id: string;
  kind: ListingActivityKind;
  title: string;
  body: string;
  createdAt: string; // ISO timestamp
  listingId: string;
  opportunitySlug?: string;
  companyId?: string;
};

export type ListingAnalyticsPoint = {
  day: string; // YYYY-MM-DD
  views: number;
  saves: number;
  interests: number;
  messages: number;
};

/**
 * Listing-level visibility, separate from `status`. Lets sponsors hide a
 * listing from public surfaces without flipping it to Draft/Closed.
 *
 *  - "Public"   — appears on /opportunities, /search, /map, and is
 *                  reachable via /opportunity/[slug]. Default.
 *  - "Unlisted" — hidden from directories, search, and the map, but the
 *                  direct opportunity URL still resolves.
 *  - "Private"  — hidden everywhere except the sponsor's own dashboard
 *                  and management workspace.
 */
export type ListingVisibility = "Public" | "Unlisted" | "Private";

/** What kinds of inbound contact a sponsor will accept on this listing. */
export type ContactPreferences = {
  acceptMessages: boolean;
  acceptInterest: boolean;
  acceptNegotiations: boolean;
};

export type ListingRecord = {
  id: string; // "LST-XXXXXX"
  opportunityId?: string;
  opportunitySlug?: string;
  title: string;
  /** Short one-line subtitle / tagline. Mirrors Opportunity.description. */
  subtitle?: string;
  category?: string;
  dealType?: string;
  status: ListingStatus;
  visibility?: ListingVisibility;
  contactPreferences?: ContactPreferences;
  views: number;
  saves: number;
  interests: number;
  negotiations: number;
  messages: number;
  lastUpdatedAt: string; // ISO timestamp
  createdAt: string; // ISO timestamp
  analyticsSeries: ListingAnalyticsPoint[];
  activity: ListingActivity[];
  draftPayload?: unknown;
  duplicatedFromId?: string;
};
