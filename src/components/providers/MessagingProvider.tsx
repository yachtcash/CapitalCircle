"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  SEED_CONVERSATIONS,
  SEED_NOTIFICATIONS,
  SEED_SAVED_COMPANIES,
  SEED_SAVED_OPPORTUNITIES,
  makeId,
  type Attachment,
  type Conversation,
  type Message,
  type Notification,
} from "@/data/messages";
import type { NegotiationStage } from "@/data/negotiations";
import {
  SEED_LISTINGS,
  type ListingActivity,
  type ListingActivityKind,
  type ListingRecord,
  type ListingStatus,
} from "@/data/listings";
import { featuredOpportunities, type Opportunity } from "@/data/opportunities";
import { getCompanyById, companies as SEED_COMPANIES, type Company } from "@/data/companies";
import {
  formStateToOpportunity,
  formStateToOpportunityPatch,
  nextOpportunityId as nextOpportunityIdInternal,
  slugify as slugifyTitle,
  uniqueSlug as uniqueSlugInternal,
  type CreateListingFormState,
} from "@/lib/listings/create";
import {
  SEED_ACCESS_REQUESTS,
  SEED_DOCUMENTS,
  SEED_DOCUMENT_ACTIVITY,
  type AccessRequest,
  type DataRoomDocument,
  type DocumentActivity,
  type DocumentActivityKind,
} from "@/data/documents";
import { SEED_PROFILE, type UserProfile } from "@/data/profile";
import {
  SEED_INTRODUCTIONS,
  type IntroductionRequest,
  type IntroductionStatus,
} from "@/data/introductions";
import {
  SEED_DIRECT_CONNECTIONS,
  type DirectConnection,
} from "@/data/connections";
import {
  SEED_DEALS,
  statusForStage,
  type Deal,
  type DealActivity,
  type DealActivityKind,
  type DealDocumentType,
  type DealHealth,
  type DealNote,
  type DealParticipant,
  type DealPriority,
  type DealStage,
} from "@/data/deals";
import { CURRENT_USER_ROLE, type Role } from "@/lib/roles";
import { getMemberById, MEMBERS as SEED_MEMBERS, type Member } from "@/data/members";
import { SEED_AUDIT_EVENTS, type AuditAction, type AuditEvent, type AuditTargetKind } from "@/data/audit";
import {
  SEED_COMPANY_ADMIN,
  SEED_MEMBER_ADMIN,
  SEED_OPP_ADMIN,
  type CompanyAdminState,
  type MemberAdminState,
  type OpportunityAdminState,
  type CreatedMember,
  type CreatedCompany,
} from "@/data/admin";
import {
  buildMember,
  buildCompany,
  slugify as slugifyName,
  uniqueSlug as uniqueRecordSlug,
  type CreateMemberInput,
  type CreateCompanyInput,
} from "@/lib/admin/createRecords";
import { isStoredImageToken, prewarmTokens } from "@/lib/imageStore";

const KEY_CONVERSATIONS = "cc:conversations:v1";
const KEY_NOTIFICATIONS = "cc:notifications:v1";
const KEY_SAVED_OPPS = "cc:saved-opps:v1";
const KEY_SAVED_COMPANIES = "cc:saved-companies:v1";
const KEY_LISTINGS = "cc:listings:v1";
const KEY_DOCUMENTS = "cc:documents:v1";
const KEY_ACCESS_REQUESTS = "cc:access-requests:v1";
const KEY_DOCUMENT_ACTIVITY = "cc:document-activity:v1";
const KEY_PROFILE = "cc:profile:v1";
const KEY_USER_OPPORTUNITIES = "cc:user-opps:v1";
const KEY_OPPORTUNITY_PATCHES = "cc:opp-patches:v1";
const KEY_COMPANY_MEDIA = "cc:company-media:v1";
const KEY_MEMBER_MEDIA = "cc:member-media:v1";
const KEY_INTRODUCTIONS = "cc:introductions:v1";
const KEY_CONNECTIONS = "cc:connections:v1";
const KEY_DEALS = "cc:deals:v1";
const KEY_ROLE = "cc:role:v1";
const KEY_MEMBER_ADMIN = "cc:member-admin:v1";
const KEY_USER_MEMBERS = "cc:user-members:v1";
const KEY_USER_COMPANIES = "cc:user-companies:v1";
const KEY_COMPANY_ADMIN = "cc:company-admin:v1";
const KEY_OPP_ADMIN = "cc:opp-admin:v1";
const KEY_AUDIT = "cc:audit:v1";

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStored<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* swallow quota / private-mode errors */
  }
}

type ConversationContext = {
  companyId: string;
  opportunitySlug?: string;
  opportunityTitle?: string;
  opportunityCategory?: string;
  opportunityLocation?: string;
  opportunityImage?: string;
};

/** Media-only overlay for seed companies; mirrors opportunityPatches. */
export type CompanyMediaPatch = Partial<
  Pick<Company, "logo" | "coverImage" | "gallery">
>;
/** Media-only overlay for seed members. */
export type MemberMediaPatch = Partial<
  Pick<Member, "avatar" | "coverImage" | "gallery">
>;

type MessagingValue = {
  hydrated: boolean;
  conversations: Conversation[];
  notifications: Notification[];
  savedOpportunityIds: string[];
  savedCompanyIds: string[];
  listings: ListingRecord[];

  totalUnreadConversations: number;
  totalUnreadNotifications: number;

  createInterestConversation: (
    context: ConversationContext,
    optionalNote?: string
  ) => string;
  createNegotiationConversation: (
    context: ConversationContext
  ) => string;
  sendMessage: (
    conversationId: string,
    text: string,
    attachments?: Attachment[]
  ) => void;
  markConversationRead: (conversationId: string) => void;
  advanceStage: (conversationId: string, stage: NegotiationStage) => void;

  isOpportunitySaved: (opportunityId: string) => boolean;
  toggleSavedOpportunity: (opportunityId: string) => void;
  isCompanySaved: (companyId: string) => boolean;
  toggleSavedCompany: (companyId: string) => void;

  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;

  createListingFromOpportunity: (opportunityId: string) => string;
  duplicateListing: (id: string) => string;
  archiveListing: (id: string) => void;
  restoreListing: (id: string) => void;
  markListingClosed: (id: string) => void;
  updateListingStatus: (id: string, status: ListingStatus) => void;
  saveListingDraft: (id: string, draftPayload: unknown) => void;
  getListing: (id: string) => ListingRecord | undefined;

  /**
   * Hard-delete a listing. Also removes its backing user opportunity (if any)
   * and any documents owned by the listing. Seed opportunities are untouched.
   */
  deleteListing: (id: string) => void;
  /**
   * Replace the image array on the listing's backing opportunity. Works for
   * user-created opportunities; for seed opportunities this is a no-op
   * (the image manager will keep local-only state).
   */
  updateListingImages: (listingId: string, images: string[]) => void;
  /** Seed company merged with its media overlay (logo / cover / gallery). */
  getCompanyLive: (companyId: string) => Company | undefined;
  /** Seed member merged with its media overlay (avatar / cover / gallery). */
  getMemberLive: (memberId: string) => Member | undefined;
  /** Merge media fields into a company overlay. Persists immediately. */
  updateCompanyMedia: (companyId: string, media: CompanyMediaPatch) => void;
  /** Merge media fields into a member overlay. Persists immediately. */
  updateMemberMedia: (memberId: string, media: MemberMediaPatch) => void;
  /**
   * Patch listing-level fields AND (where allowed) the backing user
   * opportunity. Used by the inline Listing Editor so sponsors can update
   * a published listing without re-entering the wizard.
   *
   * Listing-level fields always persist (title, category, dealType, status,
   * visibility, contactPreferences, subtitle). Opportunity-level fields
   * (description, executiveSummary, fullDescription, place, financial,
   * postedBy, etc.) only persist when the listing is backed by a user
   * opportunity; for seed-backed listings those updates are silently
   * skipped.
   */
  updateListingFields: (
    listingId: string,
    patch: {
      listing?: Partial<
        Pick<
          ListingRecord,
          | "title"
          | "subtitle"
          | "category"
          | "dealType"
          | "status"
          | "visibility"
          | "contactPreferences"
        >
      >;
      opportunity?: Partial<Opportunity>;
    }
  ) => void;

  /** Add a new document to a listing's data room. */
  addDocument: (
    input: Omit<DataRoomDocument, "id" | "uploadedAt" | "updatedAt">
  ) => string;
  /** Hard-delete a document. */
  deleteDocument: (documentId: string) => void;
  /** Patch document metadata (e.g. replace name / category / size on replace). */
  replaceDocument: (
    documentId: string,
    patch: Partial<Omit<DataRoomDocument, "id" | "listingId" | "uploadedAt">>
  ) => void;

  /** User-created opportunities (persisted to localStorage). */
  userOpportunities: Opportunity[];
  /**
   * Overlay patches keyed by opportunity id. Applied on top of the seed
   * catalog AND user-created opportunities at read time so edits to any
   * listing (seed-backed or user-created) propagate to every public surface.
   */
  opportunityPatches: Record<string, Partial<Opportunity>>;
  /**
   * Returns the live (overlay-applied) opportunity for an id, looking at the
   * seed catalog first and then user-created opportunities. Returns undefined
   * if no underlying record exists.
   */
  getOpportunity: (opportunityId: string) => Opportunity | undefined;
  /**
   * Returns the live (overlay-applied) opportunity for a slug. Slugs are
   * unique across seed + user catalogs.
   */
  getOpportunityBySlug: (slug: string) => Opportunity | undefined;
  /**
   * Create a new listing AND a backing opportunity from wizard form data.
   * Returns the newly assigned IDs so the success screen can link to them.
   * `status: "Draft"` keeps the listing in Drafts (and the opportunity hidden
   * from public surfaces); `status: "Active"` publishes it.
   */
  createListing: (
    formData: CreateListingFormState,
    options: { status: "Draft" | "Active" }
  ) => { listingId: string; opportunityId: string; slug: string };
  /**
   * Update a user-created opportunity in place. Seed opportunities (cc-001..)
   * are static and cannot be patched.
   */
  updateUserOpportunity: (opportunityId: string, patch: Partial<Opportunity>) => void;
  /**
   * Commit an edit from the wizard: saves the draftPayload AND, when the
   * listing's opportunity is user-created, syncs the live opportunity record
   * with the form data so changes appear on the public surfaces immediately.
   */
  commitListingEdit: (listingId: string, formData: CreateListingFormState) => void;

  documents: DataRoomDocument[];
  accessRequests: AccessRequest[];
  documentActivity: DocumentActivity[];

  totalPendingAccessRequests: number;

  requestDocumentAccess: (listingId: string, message?: string) => string;
  approveAccessRequest: (requestId: string) => void;
  denyAccessRequest: (requestId: string) => void;
  markDocumentViewed: (documentId: string) => void;
  markDocumentDownloaded: (documentId: string) => void;
  hasApprovedAccess: (listingId: string) => boolean;
  hasPendingAccess: (listingId: string) => boolean;

  profile: UserProfile;
  updateProfile: (partial: Partial<UserProfile>) => void;
  resetProfile: () => void;

  // ---- Introductions (platform-as-middleman flow) ----
  introductionRequests: IntroductionRequest[];
  /**
   * Submit a new introduction request from the current user. Returns the
   * generated INT-XXXXXX id. The request lands in "Pending" and is visible
   * to the admin at /dashboard/introductions.
   */
  submitIntroductionRequest: (input: {
    targetMemberId: string;
    targetMemberName: string;
    reason: string;
    message: string;
    opportunitySlug?: string;
    opportunityTitle?: string;
    companyId?: string;
    companyName?: string;
  }) => string;
  /**
   * Update an introduction's status (admin actions). For "Completed", also
   * optionally provision a direct connection record.
   */
  updateIntroductionStatus: (
    id: string,
    status: IntroductionStatus,
    note?: string
  ) => void;
  approveIntroduction: (id: string, note?: string) => void;
  rejectIntroduction: (id: string, note?: string) => void;
  completeIntroduction: (id: string, note?: string) => void;
  archiveIntroduction: (id: string) => void;
  restoreIntroduction: (id: string) => void;
  deleteIntroduction: (id: string) => void;

  // ---- Direct Connections (future-ready) ----
  directConnections: DirectConnection[];
  /** Provision a direct connection between two members. Schema-only — no
   *  permission gating is implemented yet. Returns the new CONN id. */
  createDirectConnection: (input: {
    memberA: string;
    memberB: string;
    introductionId?: string;
  }) => string;

  // ---- Deal Desk (Phase 1 — Platform Operations Center) ----
  deals: Deal[];
  /** Get a single deal by DEAL-XXXXXX id. */
  getDeal: (dealId: string) => Deal | undefined;
  /** Create a new deal. Status derives from stage. Returns the new id. */
  createDeal: (
    input: Omit<
      Deal,
      | "dealId"
      | "createdDate"
      | "updatedDate"
      | "status"
      | "notes"
      | "internalNotes"
      | "activity"
      | "participants"
      | "documents"
      | "conversationIds"
    > &
      Partial<
        Pick<
          Deal,
          "notes" | "internalNotes" | "participants" | "documents" | "conversationIds"
        >
      >
  ) => string;
  /**
   * Convert an approved introduction into a deal: sponsor = target member,
   * investor = requester, stage = "Introduction Approved", admin = current
   * user, opportunity/company carried over. Idempotent per introduction.
   */
  convertIntroductionToDeal: (introductionId: string) => string | null;
  /** Update a deal's stage (kanban drag / selector). Syncs status. */
  updateDealStage: (dealId: string, stage: DealStage, note?: string) => void;
  /** Patch any subset of editable deal fields. Stamps an "updated" activity. */
  updateDealFields: (dealId: string, patch: Partial<Deal>) => void;
  /** Append a note. `internal = true` targets the Editor+ internal list. */
  addDealNote: (dealId: string, text: string, internal?: boolean) => string;
  /** Set the deal's priority. */
  setDealPriority: (dealId: string, priority: DealPriority) => void;
  /** Set the deal's health flag (manual). */
  setDealHealth: (dealId: string, health: DealHealth) => void;
  /** Log a lifecycle milestone (NDA Signed, LOI Received, …). */
  logDealMilestone: (
    dealId: string,
    kind: DealActivityKind,
    title: string,
    body?: string
  ) => void;
  /** Update follow-up dates (last contact / next follow up). */
  setDealFollowUp: (
    dealId: string,
    patch: { lastContactDate?: string; nextFollowUpDate?: string }
  ) => void;
  /** Reassign the responsible admin. */
  assignDealAdmin: (dealId: string, admin: string) => void;
  /** Close the deal won/lost; "won" backfills actuals from targets. */
  closeDeal: (dealId: string, outcome: "won" | "lost", note?: string) => void;
  /** Reopen a closed deal back into Negotiating. */
  reopenDeal: (dealId: string) => void;
  /** Archive / restore. */
  archiveDeal: (dealId: string) => void;
  restoreDeal: (dealId: string) => void;
  /** Hard-delete the deal record. */
  deleteDeal: (dealId: string) => void;
  /** Participant roster management. */
  addDealParticipant: (dealId: string, input: Omit<DealParticipant, "id">) => void;
  removeDealParticipant: (dealId: string, participantId: string) => void;
  /** Document references (no file storage — pointers only). */
  addDealDocument: (
    dealId: string,
    input: { name: string; type: DealDocumentType; linkedDocumentId?: string }
  ) => void;
  removeDealDocument: (dealId: string, documentId: string) => void;

  // ---- Admin Control Center ----
  /** Live role (persisted). Super Admin can impersonate lower roles. */
  currentRole: Role;
  setCurrentRole: (role: Role) => void;

  /** Per-member admin overrides (role / account status). */
  memberAdminState: Record<string, MemberAdminState>;
  setMemberRole: (memberId: string, role: Role, memberName?: string) => void;
  suspendMember: (memberId: string, memberName?: string) => void;
  activateMember: (memberId: string, memberName?: string) => void;
  deleteMember: (memberId: string, memberName?: string) => void;
  verifyMember: (memberId: string, memberName?: string) => void;
  approveMember: (memberId: string, memberName?: string) => void;
  toggleMemberFeatured: (memberId: string, featured: boolean, memberName?: string) => void;
  /** Members created at runtime via the Admin Control Center. */
  userMembers: CreatedMember[];
  createMember: (input: CreateMemberInput) => string;

  /** Per-company admin overrides (verification / featured / status). */
  companyAdminState: Record<string, CompanyAdminState>;
  verifyCompany: (companyId: string, companyName?: string, premium?: boolean) => void;
  toggleCompanyFeatured: (companyId: string, featured: boolean, companyName?: string) => void;
  suspendCompany: (companyId: string, companyName?: string) => void;
  activateCompany: (companyId: string) => void;
  deleteCompany: (companyId: string, companyName?: string) => void;
  assignCompanyEditor: (companyId: string, editor: string, companyName?: string) => void;
  assignCompanyAdmin: (companyId: string, admin: string, companyName?: string) => void;
  /** Companies created at runtime via the Admin Control Center. */
  userCompanies: CreatedCompany[];
  createCompany: (input: CreateCompanyInput) => string;

  /** Per-opportunity moderation overrides. */
  opportunityAdminState: Record<string, OpportunityAdminState>;
  approveOpportunity: (oppId: string, title?: string) => void;
  rejectOpportunity: (oppId: string, title?: string) => void;
  archiveOpportunityAdmin: (oppId: string, title?: string) => void;
  deleteOpportunityAdmin: (oppId: string, title?: string) => void;
  toggleOpportunityFeatured: (oppId: string, featured: boolean, title?: string) => void;
  assignOpportunityModerator: (oppId: string, moderator: string, title?: string) => void;
  assignOpportunityEditor: (oppId: string, editor: string, title?: string) => void;

  /** Central audit stream, rendered by /admin/audit. */
  auditEvents: AuditEvent[];
  recordAudit: (
    action: AuditAction,
    target: { kind: AuditTargetKind; id: string; label?: string },
    detail?: string,
    change?: { before?: string; after?: string }
  ) => void;
};

const Ctx = createContext<MessagingValue | null>(null);

const ME = {
  authorId: "me",
  authorName: "Stevie Cabrera",
  authorInitials: "SC",
};

export function MessagingProvider({ children }: { children: ReactNode }) {
  // Initialize from seed so the first server-rendered HTML already shows
  // content. After mount, the client overrides with localStorage if present.
  const [hydrated, setHydrated] = useState(false);
  const [conversations, setConversations] =
    useState<Conversation[]>(SEED_CONVERSATIONS);
  const [notifications, setNotifications] =
    useState<Notification[]>(SEED_NOTIFICATIONS);
  const [savedOpportunityIds, setSavedOpportunityIds] = useState<string[]>(
    SEED_SAVED_OPPORTUNITIES
  );
  const [savedCompanyIds, setSavedCompanyIds] = useState<string[]>(
    SEED_SAVED_COMPANIES
  );
  const [listings, setListings] = useState<ListingRecord[]>(SEED_LISTINGS);
  const [documents, setDocuments] =
    useState<DataRoomDocument[]>(SEED_DOCUMENTS);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>(
    SEED_ACCESS_REQUESTS
  );
  const [documentActivity, setDocumentActivity] = useState<DocumentActivity[]>(
    SEED_DOCUMENT_ACTIVITY
  );
  const [profile, setProfile] = useState<UserProfile>(SEED_PROFILE);
  const [userOpportunities, setUserOpportunities] = useState<Opportunity[]>([]);
  const [userMembers, setUserMembers] = useState<CreatedMember[]>([]);
  const [userCompanies, setUserCompanies] = useState<CreatedCompany[]>([]);
  const [opportunityPatches, setOpportunityPatches] = useState<
    Record<string, Partial<Opportunity>>
  >({});
  const [companyMediaPatches, setCompanyMediaPatches] = useState<
    Record<string, CompanyMediaPatch>
  >({});
  const [memberMediaPatches, setMemberMediaPatches] = useState<
    Record<string, MemberMediaPatch>
  >({});
  const [introductionRequests, setIntroductionRequests] = useState<
    IntroductionRequest[]
  >(SEED_INTRODUCTIONS);
  const [directConnections, setDirectConnections] = useState<DirectConnection[]>(
    SEED_DIRECT_CONNECTIONS
  );
  const [deals, setDeals] = useState<Deal[]>(SEED_DEALS);
  const [currentRole, setCurrentRoleState] = useState<Role>(CURRENT_USER_ROLE);
  const [memberAdminState, setMemberAdminState] =
    useState<Record<string, MemberAdminState>>(SEED_MEMBER_ADMIN);
  const [companyAdminState, setCompanyAdminState] =
    useState<Record<string, CompanyAdminState>>(SEED_COMPANY_ADMIN);
  const [opportunityAdminState, setOpportunityAdminState] =
    useState<Record<string, OpportunityAdminState>>(SEED_OPP_ADMIN);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(SEED_AUDIT_EVENTS);

  useEffect(() => {
    const storedConvos = readStored<Conversation[] | null>(
      KEY_CONVERSATIONS,
      null
    );
    if (storedConvos) setConversations(storedConvos);
    const storedNotifs = readStored<Notification[] | null>(
      KEY_NOTIFICATIONS,
      null
    );
    if (storedNotifs) setNotifications(storedNotifs);
    const storedOpps = readStored<string[] | null>(KEY_SAVED_OPPS, null);
    if (storedOpps) setSavedOpportunityIds(storedOpps);
    const storedCos = readStored<string[] | null>(KEY_SAVED_COMPANIES, null);
    if (storedCos) setSavedCompanyIds(storedCos);
    const storedListings = readStored<ListingRecord[] | null>(
      KEY_LISTINGS,
      null
    );
    if (storedListings) setListings(storedListings);
    const storedDocs = readStored<DataRoomDocument[] | null>(
      KEY_DOCUMENTS,
      null
    );
    if (storedDocs) setDocuments(storedDocs);
    const storedReqs = readStored<AccessRequest[] | null>(
      KEY_ACCESS_REQUESTS,
      null
    );
    if (storedReqs) setAccessRequests(storedReqs);
    const storedActivity = readStored<DocumentActivity[] | null>(
      KEY_DOCUMENT_ACTIVITY,
      null
    );
    if (storedActivity) setDocumentActivity(storedActivity);
    const storedProfile = readStored<UserProfile | null>(KEY_PROFILE, null);
    if (storedProfile) setProfile(storedProfile);
    const storedUserOpps = readStored<Opportunity[] | null>(
      KEY_USER_OPPORTUNITIES,
      null
    );
    if (storedUserOpps) setUserOpportunities(storedUserOpps);
    const storedUserMembers = readStored<CreatedMember[] | null>(
      KEY_USER_MEMBERS,
      null
    );
    if (storedUserMembers) setUserMembers(storedUserMembers);
    const storedUserCompanies = readStored<CreatedCompany[] | null>(
      KEY_USER_COMPANIES,
      null
    );
    if (storedUserCompanies) setUserCompanies(storedUserCompanies);
    const storedPatches = readStored<Record<string, Partial<Opportunity>> | null>(
      KEY_OPPORTUNITY_PATCHES,
      null
    );
    if (storedPatches) setOpportunityPatches(storedPatches);
    const storedCompanyMedia = readStored<Record<string, CompanyMediaPatch> | null>(
      KEY_COMPANY_MEDIA,
      null
    );
    if (storedCompanyMedia) setCompanyMediaPatches(storedCompanyMedia);
    const storedMemberMedia = readStored<Record<string, MemberMediaPatch> | null>(
      KEY_MEMBER_MEDIA,
      null
    );
    if (storedMemberMedia) setMemberMediaPatches(storedMemberMedia);
    const storedIntros = readStored<IntroductionRequest[] | null>(
      KEY_INTRODUCTIONS,
      null
    );
    if (storedIntros) setIntroductionRequests(storedIntros);
    const storedConnections = readStored<DirectConnection[] | null>(
      KEY_CONNECTIONS,
      null
    );
    if (storedConnections) setDirectConnections(storedConnections);
    const storedDeals = readStored<Deal[] | null>(KEY_DEALS, null);
    // Phase 1 reshaped the Deal record (sponsor/investor/targetInvestment).
    // Pre-Phase-1 stored deals lack those fields — discard them and start
    // from the new seed rather than render half-broken rows.
    if (
      storedDeals &&
      storedDeals.length > 0 &&
      storedDeals.every(
        (d) => d && typeof d.targetInvestment === "number" && !!d.sponsor
      )
    ) {
      setDeals(storedDeals);
    }
    const storedRole = readStored<Role | null>(KEY_ROLE, null);
    if (storedRole) setCurrentRoleState(storedRole);
    const storedMemberAdmin = readStored<Record<string, MemberAdminState> | null>(
      KEY_MEMBER_ADMIN,
      null
    );
    if (storedMemberAdmin) setMemberAdminState(storedMemberAdmin);
    const storedCompanyAdmin = readStored<Record<string, CompanyAdminState> | null>(
      KEY_COMPANY_ADMIN,
      null
    );
    if (storedCompanyAdmin) setCompanyAdminState(storedCompanyAdmin);
    const storedOppAdmin = readStored<Record<string, OpportunityAdminState> | null>(
      KEY_OPP_ADMIN,
      null
    );
    if (storedOppAdmin) setOpportunityAdminState(storedOppAdmin);
    const storedAudit = readStored<AuditEvent[] | null>(KEY_AUDIT, null);
    // Only adopt a stored trail that actually has rows — an empty stored
    // array (from before the seeds existed) would otherwise hide the seed
    // history that makes the Audit Log demo-able on first load.
    if (storedAudit && storedAudit.length > 0) setAuditEvents(storedAudit);
    setHydrated(true);
  }, []);

  // Persistence on change (after hydration only)
  useEffect(() => {
    if (!hydrated) return;
    writeStored(KEY_CONVERSATIONS, conversations);
  }, [conversations, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    writeStored(KEY_NOTIFICATIONS, notifications);
  }, [notifications, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    writeStored(KEY_SAVED_OPPS, savedOpportunityIds);
  }, [savedOpportunityIds, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    writeStored(KEY_SAVED_COMPANIES, savedCompanyIds);
  }, [savedCompanyIds, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    writeStored(KEY_LISTINGS, listings);
  }, [listings, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    writeStored(KEY_DOCUMENTS, documents);
  }, [documents, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    writeStored(KEY_ACCESS_REQUESTS, accessRequests);
  }, [accessRequests, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    writeStored(KEY_DOCUMENT_ACTIVITY, documentActivity);
  }, [documentActivity, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    writeStored(KEY_PROFILE, profile);
  }, [profile, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    writeStored(KEY_USER_OPPORTUNITIES, userOpportunities);
  }, [userOpportunities, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    writeStored(KEY_USER_MEMBERS, userMembers);
  }, [userMembers, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    writeStored(KEY_USER_COMPANIES, userCompanies);
  }, [userCompanies, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    writeStored(KEY_OPPORTUNITY_PATCHES, opportunityPatches);
  }, [opportunityPatches, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    writeStored(KEY_COMPANY_MEDIA, companyMediaPatches);
  }, [companyMediaPatches, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    writeStored(KEY_MEMBER_MEDIA, memberMediaPatches);
  }, [memberMediaPatches, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    writeStored(KEY_INTRODUCTIONS, introductionRequests);
  }, [introductionRequests, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    writeStored(KEY_CONNECTIONS, directConnections);
  }, [directConnections, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    writeStored(KEY_DEALS, deals);
  }, [deals, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    writeStored(KEY_ROLE, currentRole);
  }, [currentRole, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    writeStored(KEY_MEMBER_ADMIN, memberAdminState);
  }, [memberAdminState, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    writeStored(KEY_COMPANY_ADMIN, companyAdminState);
  }, [companyAdminState, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    writeStored(KEY_OPP_ADMIN, opportunityAdminState);
  }, [opportunityAdminState, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    writeStored(KEY_AUDIT, auditEvents);
  }, [auditEvents, hydrated]);

  // After hydration, scan all known opportunity image lists for IDB-backed
  // tokens and eagerly resolve each to a cached object URL. This way the
  // sync resolver hits cache on the very first card/hero render, avoiding
  // a flash-of-empty while async resolution catches up.
  useEffect(() => {
    if (!hydrated) return;
    const tokens = new Set<string>();
    for (const opp of userOpportunities) {
      for (const src of opp.images ?? []) {
        if (isStoredImageToken(src)) tokens.add(src);
      }
    }
    for (const patch of Object.values(opportunityPatches)) {
      for (const src of patch.images ?? []) {
        if (isStoredImageToken(src)) tokens.add(src);
      }
    }
    for (const patch of Object.values(companyMediaPatches)) {
      if (isStoredImageToken(patch.logo)) tokens.add(patch.logo);
      if (isStoredImageToken(patch.coverImage)) tokens.add(patch.coverImage);
      for (const g of patch.gallery ?? []) {
        if (isStoredImageToken(g.src)) tokens.add(g.src);
      }
    }
    for (const patch of Object.values(memberMediaPatches)) {
      if (isStoredImageToken(patch.avatar)) tokens.add(patch.avatar);
      if (isStoredImageToken(patch.coverImage)) tokens.add(patch.coverImage);
      for (const src of patch.gallery ?? []) {
        if (isStoredImageToken(src)) tokens.add(src);
      }
    }
    if (tokens.size === 0) return;
    void prewarmTokens([...tokens]);
  }, [
    hydrated,
    userOpportunities,
    opportunityPatches,
    companyMediaPatches,
    memberMediaPatches,
  ]);

  const updateProfile = useCallback((partial: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetProfile = useCallback(() => {
    setProfile(SEED_PROFILE);
  }, []);

  // ---- Audit architecture (central event stream; /admin/audit comes later) ----

  const recordAudit = useCallback(
    (
      action: AuditAction,
      target: { kind: AuditTargetKind; id: string; label?: string },
      detail?: string,
      change?: { before?: string; after?: string }
    ) => {
      setAuditEvents((prev) => {
        let max = 0;
        for (const e of prev) {
          const m = /^AUD-(\d+)$/.exec(e.id);
          if (m) max = Math.max(max, parseInt(m[1], 10));
        }
        const entry: AuditEvent = {
          id: `AUD-${String(max + 1).padStart(6, "0")}`,
          action,
          actorName: profile.name,
          actorRole: currentRole,
          targetKind: target.kind,
          targetId: target.id,
          targetLabel: target.label,
          detail,
          before: change?.before,
          after: change?.after,
          createdAt: new Date().toISOString(),
        };
        return [entry, ...prev];
      });
    },
    [profile.name, currentRole]
  );

  // ---- Role switcher (Super Admin impersonation, testing only) ----

  const setCurrentRole = useCallback(
    (role: Role) => {
      if (currentRole !== role) {
        // Stamped against the platform account itself.
        recordAudit(
          "Role Changed",
          { kind: "role", id: "me", label: profile.name },
          "Active role switched (impersonation)",
          { before: currentRole, after: role }
        );
      }
      setCurrentRoleState(role);
    },
    [recordAudit, profile.name, currentRole]
  );

  // ---- Member administration ----

  const setMemberRole = useCallback(
    (memberId: string, role: Role, memberName?: string) => {
      const prevRole = memberAdminState[memberId]?.role ?? "Member";
      setMemberAdminState((prev) => ({
        ...prev,
        [memberId]: { ...prev[memberId], role },
      }));
      recordAudit(
        "Role Changed",
        { kind: "member", id: memberId, label: memberName },
        undefined,
        { before: prevRole, after: role }
      );
    },
    [recordAudit, memberAdminState]
  );

  const suspendMember = useCallback(
    (memberId: string, memberName?: string) => {
      setMemberAdminState((prev) => ({
        ...prev,
        [memberId]: { ...prev[memberId], status: "Suspended" },
      }));
      recordAudit(
        "Member Suspended",
        { kind: "member", id: memberId, label: memberName },
        undefined,
        { before: "Active", after: "Suspended" }
      );
    },
    [recordAudit]
  );

  const activateMember = useCallback(
    (memberId: string, memberName?: string) => {
      setMemberAdminState((prev) => ({
        ...prev,
        [memberId]: { ...prev[memberId], status: "Active" },
      }));
      recordAudit(
        "Member Activated",
        { kind: "member", id: memberId, label: memberName },
        undefined,
        { before: "Suspended", after: "Active" }
      );
    },
    [recordAudit]
  );

  const deleteMember = useCallback(
    (memberId: string, memberName?: string) => {
      setMemberAdminState((prev) => ({
        ...prev,
        [memberId]: { ...prev[memberId], status: "Deleted" },
      }));
      recordAudit("Member Deleted", { kind: "member", id: memberId, label: memberName });
    },
    [recordAudit]
  );

  const verifyMember = useCallback(
    (memberId: string, memberName?: string) => {
      setMemberAdminState((prev) => ({
        ...prev,
        [memberId]: { ...prev[memberId], verificationOverride: "Verified" },
      }));
      recordAudit(
        "Member Verified",
        { kind: "member", id: memberId, label: memberName },
        "Verified badge granted"
      );
    },
    [recordAudit]
  );

  const approveMember = useCallback(
    (memberId: string, memberName?: string) => {
      setMemberAdminState((prev) => ({
        ...prev,
        [memberId]: {
          ...prev[memberId],
          status: "Active",
          approved: true,
          verificationOverride:
            prev[memberId]?.verificationOverride ?? "Verified",
        },
      }));
      recordAudit(
        "Member Approved",
        { kind: "member", id: memberId, label: memberName },
        "Approved into the directory"
      );
    },
    [recordAudit]
  );

  const toggleMemberFeatured = useCallback(
    (memberId: string, featured: boolean, memberName?: string) => {
      setMemberAdminState((prev) => ({
        ...prev,
        [memberId]: { ...prev[memberId], featuredOverride: featured },
      }));
      recordAudit(
        "Member Featured",
        { kind: "member", id: memberId, label: memberName },
        featured ? "Featured in the directory" : "Removed from featured"
      );
    },
    [recordAudit]
  );

  const createMember = useCallback(
    (input: CreateMemberInput): string => {
      const now = new Date().toISOString();
      const takenIds = new Set([
        ...SEED_MEMBERS.map((m) => m.id),
        ...userMembers.map((m) => m.id),
      ]);
      let n = takenIds.size + 1;
      let id = `MEM-${String(n).padStart(6, "0")}`;
      while (takenIds.has(id)) {
        n += 1;
        id = `MEM-${String(n).padStart(6, "0")}`;
      }
      const takenSlugs = new Set([
        ...SEED_MEMBERS.map((m) => m.slug),
        ...userMembers.map((m) => m.slug),
      ]);
      const slug = uniqueRecordSlug(slugifyName(input.name), takenSlugs);
      const member = buildMember(input, { id, slug, nowIso: now });
      setUserMembers((prev) => [{ ...member, createdAt: now }, ...prev]);
      recordAudit(
        "Member Created",
        { kind: "member", id, label: member.name },
        `${member.memberType} · ${member.company}`
      );
      return id;
    },
    [recordAudit, userMembers]
  );

  // ---- Company administration ----

  const verifyCompany = useCallback(
    (companyId: string, companyName?: string, premium = false) => {
      const before = companyAdminState[companyId]?.verificationOverride ?? "Pending";
      const after = premium ? "Premium Verified" : "Verified";
      setCompanyAdminState((prev) => ({
        ...prev,
        [companyId]: { ...prev[companyId], verificationOverride: after },
      }));
      recordAudit(
        "Company Verified",
        { kind: "company", id: companyId, label: companyName },
        undefined,
        { before, after }
      );
    },
    [recordAudit, companyAdminState]
  );

  const toggleCompanyFeatured = useCallback(
    (companyId: string, featured: boolean, companyName?: string) => {
      setCompanyAdminState((prev) => ({
        ...prev,
        [companyId]: { ...prev[companyId], featuredOverride: featured },
      }));
      recordAudit(
        "Company Featured",
        { kind: "company", id: companyId, label: companyName },
        featured ? "Featured on the directory" : "Removed from featured"
      );
    },
    [recordAudit]
  );

  const suspendCompany = useCallback(
    (companyId: string, companyName?: string) => {
      setCompanyAdminState((prev) => ({
        ...prev,
        [companyId]: { ...prev[companyId], status: "Suspended" },
      }));
      recordAudit("Company Suspended", { kind: "company", id: companyId, label: companyName });
    },
    [recordAudit]
  );

  const activateCompany = useCallback((companyId: string) => {
    setCompanyAdminState((prev) => ({
      ...prev,
      [companyId]: { ...prev[companyId], status: "Active" },
    }));
  }, []);

  const deleteCompany = useCallback(
    (companyId: string, companyName?: string) => {
      setCompanyAdminState((prev) => ({
        ...prev,
        [companyId]: { ...prev[companyId], status: "Deleted" },
      }));
      recordAudit("Company Deleted", { kind: "company", id: companyId, label: companyName });
    },
    [recordAudit]
  );

  const assignCompanyEditor = useCallback(
    (companyId: string, editor: string, companyName?: string) => {
      setCompanyAdminState((prev) => ({
        ...prev,
        [companyId]: { ...prev[companyId], assignedEditor: editor },
      }));
      recordAudit(
        "Company Editor Assigned",
        { kind: "company", id: companyId, label: companyName },
        `Editor: ${editor}`
      );
    },
    [recordAudit]
  );

  const assignCompanyAdmin = useCallback(
    (companyId: string, admin: string, companyName?: string) => {
      setCompanyAdminState((prev) => ({
        ...prev,
        [companyId]: { ...prev[companyId], assignedAdmin: admin },
      }));
      recordAudit(
        "Company Admin Assigned",
        { kind: "company", id: companyId, label: companyName },
        `Admin: ${admin}`
      );
    },
    [recordAudit]
  );

  const createCompany = useCallback(
    (input: CreateCompanyInput): string => {
      const now = new Date().toISOString();
      const takenIds = new Set([
        ...SEED_COMPANIES.map((c) => c.id),
        ...userCompanies.map((c) => c.id),
      ]);
      let n = takenIds.size + 1;
      let id = `COMP-${String(n).padStart(6, "0")}`;
      while (takenIds.has(id)) {
        n += 1;
        id = `COMP-${String(n).padStart(6, "0")}`;
      }
      const takenSlugs = new Set([
        ...SEED_COMPANIES.map((c) => c.slug),
        ...userCompanies.map((c) => c.slug),
      ]);
      const slug = uniqueRecordSlug(slugifyName(input.name), takenSlugs);
      const company = buildCompany(input, { id, slug, nowIso: now });
      setUserCompanies((prev) => [{ ...company, createdAt: now }, ...prev]);
      recordAudit(
        "Company Created",
        { kind: "company", id, label: company.name },
        company.industry
      );
      return id;
    },
    [recordAudit, userCompanies]
  );

  // ---- Opportunity administration / moderation ----

  const approveOpportunity = useCallback(
    (oppId: string, title?: string) => {
      const before = opportunityAdminState[oppId]?.moderation ?? "Approved";
      setOpportunityAdminState((prev) => ({
        ...prev,
        [oppId]: { ...prev[oppId], moderation: "Approved" },
      }));
      recordAudit(
        "Opportunity Approved",
        { kind: "opportunity", id: oppId, label: title },
        undefined,
        { before, after: "Approved" }
      );
    },
    [recordAudit, opportunityAdminState]
  );

  const rejectOpportunity = useCallback(
    (oppId: string, title?: string) => {
      const before = opportunityAdminState[oppId]?.moderation ?? "Approved";
      setOpportunityAdminState((prev) => ({
        ...prev,
        [oppId]: { ...prev[oppId], moderation: "Rejected" },
      }));
      recordAudit(
        "Opportunity Rejected",
        { kind: "opportunity", id: oppId, label: title },
        undefined,
        { before, after: "Rejected" }
      );
    },
    [recordAudit, opportunityAdminState]
  );

  const archiveOpportunityAdmin = useCallback(
    (oppId: string, title?: string) => {
      setOpportunityAdminState((prev) => ({
        ...prev,
        [oppId]: { ...prev[oppId], archived: true },
      }));
      recordAudit("Opportunity Archived", { kind: "opportunity", id: oppId, label: title });
    },
    [recordAudit]
  );

  const deleteOpportunityAdmin = useCallback(
    (oppId: string, title?: string) => {
      setOpportunityAdminState((prev) => ({
        ...prev,
        [oppId]: { ...prev[oppId], deleted: true },
      }));
      recordAudit("Opportunity Deleted", { kind: "opportunity", id: oppId, label: title });
    },
    [recordAudit]
  );

  const toggleOpportunityFeatured = useCallback(
    (oppId: string, featured: boolean, title?: string) => {
      setOpportunityPatches((prev) => ({
        ...prev,
        [oppId]: { ...(prev[oppId] ?? {}), featured },
      }));
      recordAudit(
        "Opportunity Featured",
        { kind: "opportunity", id: oppId, label: title },
        featured ? "Featured" : "Unfeatured"
      );
    },
    [recordAudit]
  );

  const assignOpportunityModerator = useCallback(
    (oppId: string, moderator: string, title?: string) => {
      setOpportunityAdminState((prev) => ({
        ...prev,
        [oppId]: { ...prev[oppId], assignedModerator: moderator },
      }));
      recordAudit(
        "Opportunity Moderator Assigned",
        { kind: "opportunity", id: oppId, label: title },
        `Moderator: ${moderator}`
      );
    },
    [recordAudit]
  );

  const assignOpportunityEditor = useCallback(
    (oppId: string, editor: string, title?: string) => {
      setOpportunityAdminState((prev) => ({
        ...prev,
        [oppId]: { ...prev[oppId], assignedEditor: editor },
      }));
      recordAudit(
        "Opportunity Editor Assigned",
        { kind: "opportunity", id: oppId, label: title },
        `Editor: ${editor}`
      );
    },
    [recordAudit]
  );

  // ---- Introductions / Direct Connections ----

  function nextIntroductionId(existing: IntroductionRequest[]): string {
    let max = 0;
    for (const r of existing) {
      const m = /^INT-(\d+)$/.exec(r.id);
      if (m) {
        const n = parseInt(m[1], 10);
        if (!Number.isNaN(n) && n > max) max = n;
      }
    }
    return `INT-${String(max + 1).padStart(6, "0")}`;
  }

  function nextConnectionId(existing: DirectConnection[]): string {
    let max = 0;
    for (const c of existing) {
      const m = /^CONN-(\d+)$/.exec(c.connectionId);
      if (m) {
        const n = parseInt(m[1], 10);
        if (!Number.isNaN(n) && n > max) max = n;
      }
    }
    return `CONN-${String(max + 1).padStart(6, "0")}`;
  }

  const submitIntroductionRequest = useCallback(
    (input: {
      targetMemberId: string;
      targetMemberName: string;
      reason: string;
      message: string;
      opportunitySlug?: string;
      opportunityTitle?: string;
      companyId?: string;
      companyName?: string;
    }): string => {
      let id = "";
      setIntroductionRequests((prev) => {
        id = nextIntroductionId(prev);
        const entry: IntroductionRequest = {
          id,
          requesterId: "me",
          requesterName: profile.name,
          targetMemberId: input.targetMemberId,
          targetMemberName: input.targetMemberName,
          reason: input.reason,
          message: input.message,
          opportunitySlug: input.opportunitySlug,
          opportunityTitle: input.opportunityTitle,
          companyId: input.companyId,
          companyName: input.companyName,
          status: "Pending",
          createdAt: new Date().toISOString(),
        };
        return [entry, ...prev];
      });
      return id;
    },
    [profile.name]
  );

  const updateIntroductionStatus = useCallback(
    (id: string, status: IntroductionStatus, note?: string) => {
      const now = new Date().toISOString();
      setIntroductionRequests((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          const next: IntroductionRequest = { ...r, status };
          if (note !== undefined) next.decisionNote = note;
          if (status === "Approved" || status === "Rejected") {
            next.decidedAt = now;
          }
          if (status === "Completed") {
            if (!next.decidedAt) next.decidedAt = now;
            next.completedAt = now;
          }
          return next;
        })
      );
    },
    []
  );

  const approveIntroduction = useCallback(
    (id: string, note?: string) => {
      updateIntroductionStatus(id, "Approved", note);
      recordAudit("Introduction Approved", { kind: "introduction", id }, note);
    },
    [updateIntroductionStatus, recordAudit]
  );
  const rejectIntroduction = useCallback(
    (id: string, note?: string) => {
      updateIntroductionStatus(id, "Rejected", note);
      recordAudit("Introduction Rejected", { kind: "introduction", id }, note);
    },
    [updateIntroductionStatus, recordAudit]
  );
  const completeIntroduction = useCallback(
    (id: string, note?: string) => {
      updateIntroductionStatus(id, "Completed", note);
      recordAudit("Introduction Completed", { kind: "introduction", id }, note);
    },
    [updateIntroductionStatus, recordAudit]
  );
  const archiveIntroduction = useCallback(
    (id: string) => {
      setIntroductionRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, archived: true } : r))
      );
      recordAudit("Introduction Archived", { kind: "introduction", id });
    },
    [recordAudit]
  );
  const restoreIntroduction = useCallback(
    (id: string) => {
      setIntroductionRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, archived: false } : r))
      );
      recordAudit("Introduction Restored", { kind: "introduction", id });
    },
    [recordAudit]
  );
  const deleteIntroduction = useCallback(
    (id: string) => {
      setIntroductionRequests((prev) => prev.filter((r) => r.id !== id));
      recordAudit("Introduction Deleted", { kind: "introduction", id });
    },
    [recordAudit]
  );

  const createDirectConnection = useCallback(
    (input: { memberA: string; memberB: string; introductionId?: string }): string => {
      let connId = "";
      setDirectConnections((prev) => {
        connId = nextConnectionId(prev);
        const entry: DirectConnection = {
          connectionId: connId,
          memberA: input.memberA,
          memberB: input.memberB,
          approvedBy: "me",
          approvedDate: new Date().toISOString(),
          status: "Active",
          introductionId: input.introductionId,
        };
        return [entry, ...prev];
      });
      return connId;
    },
    []
  );

  // ---- Deal Desk (Phase 1 — Platform Operations Center) ----

  function nextDealId(existing: Deal[]): string {
    let max = 0;
    for (const d of existing) {
      const m = /^DEAL-(\d+)$/.exec(d.dealId);
      if (m) {
        const n = parseInt(m[1], 10);
        if (!Number.isNaN(n) && n > max) max = n;
      }
    }
    return `DEAL-${String(max + 1).padStart(6, "0")}`;
  }

  // Structured, audit-ready record: who / role / what / related ref.
  function makeDealActivity(
    existing: DealActivity[],
    kind: DealActivityKind,
    title: string,
    body?: string,
    ref?: { kind: string; id: string }
  ): DealActivity {
    return {
      id: `act-${String(existing.length + 1).padStart(2, "0")}`,
      kind,
      title,
      body,
      createdAt: new Date().toISOString(),
      actor: profile.name,
      actorRole: currentRole,
      ref,
    };
  }

  /** Shared mutate-one-deal helper: patches + stamps activity + updatedDate. */
  const mutateDeal = useCallback(
    (
      dealId: string,
      patch: Partial<Deal> | ((d: Deal) => Partial<Deal>),
      act?: {
        kind: DealActivityKind;
        title: string;
        body?: string;
        ref?: { kind: string; id: string };
      }
    ) => {
      setDeals((prev) =>
        prev.map((d) => {
          if (d.dealId !== dealId) return d;
          const resolved = typeof patch === "function" ? patch(d) : patch;
          const next: Deal = {
            ...d,
            ...resolved,
            updatedDate: new Date().toISOString(),
          };
          if (act) {
            next.activity = [
              ...next.activity,
              makeDealActivity(d.activity, act.kind, act.title, act.body, act.ref),
            ];
          }
          return next;
        })
      );
    },
    [profile.name]
  );

  const getDeal = useCallback(
    (dealId: string): Deal | undefined => deals.find((d) => d.dealId === dealId),
    [deals]
  );

  const createDeal = useCallback(
    (
      input: Omit<
        Deal,
        | "dealId"
        | "createdDate"
        | "updatedDate"
        | "status"
        | "notes"
        | "internalNotes"
        | "activity"
        | "participants"
        | "documents"
        | "conversationIds"
      > &
        Partial<
          Pick<
            Deal,
            "notes" | "internalNotes" | "participants" | "documents" | "conversationIds"
          >
        >
    ): string => {
      let id = "";
      setDeals((prev) => {
        id = nextDealId(prev);
        const now = new Date().toISOString();
        const record: Deal = {
          ...input,
          dealId: id,
          status: statusForStage(input.stage),
          createdDate: now,
          updatedDate: now,
          notes: input.notes ?? [],
          internalNotes: input.internalNotes ?? [],
          participants: input.participants ?? [],
          documents: input.documents ?? [],
          conversationIds: input.conversationIds ?? [],
          activity: [
            {
              id: "act-01",
              kind: "created",
              title: "Deal created",
              body: `Opened by ${profile.name}.`,
              createdAt: now,
              actor: profile.name,
              actorRole: CURRENT_USER_ROLE,
            },
          ],
        };
        return [record, ...prev];
      });
      recordAudit("Deal Created", { kind: "deal", id, label: input.title });
      return id;
    },
    [profile.name, recordAudit]
  );

  const convertIntroductionToDeal = useCallback(
    (introductionId: string): string | null => {
      const intro = introductionRequests.find((r) => r.id === introductionId);
      if (!intro) return null;
      const existing = deals.find(
        (d) => d.sourceType === "Introduction Request" && d.sourceId === introductionId
      );
      if (existing) return existing.dealId;
      const opp = intro.opportunitySlug
        ? featuredOpportunities.find((o) => o.slug === intro.opportunitySlug)
        : undefined;
      const target = opp?.fundingAmount ?? 0;
      const pct = 2.5;
      const sponsorMember = getMemberById(intro.targetMemberId);
      const id = createDeal({
        title: opp
          ? `${opp.title} — ${intro.requesterName}`
          : `${intro.requesterName} → ${intro.targetMemberName}`,
        opportunityId: opp?.id,
        opportunitySlug: intro.opportunitySlug,
        companyId: intro.companyId,
        sponsor: {
          name: intro.targetMemberName,
          memberId: intro.targetMemberId,
          companyId: intro.companyId,
        },
        investor: { name: intro.requesterName, memberId: intro.requesterId },
        assignedAdmin: profile.name,
        stage: "Introduction Approved",
        priority: "Normal",
        targetInvestment: target,
        commissionPct: pct,
        estimatedCommission: Math.round((target * pct) / 100),
        sourceType: "Introduction Request",
        sourceId: introductionId,
        introductionId,
        sourceName: `${introductionId} — ${intro.requesterName} → ${intro.targetMemberName}`,
        summaryNote: intro.reason,
        tags: ["Introduction"],
        lastContactDate: new Date().toISOString(),
        participants: [
          {
            id: "p-sponsor",
            name: intro.targetMemberName,
            company: sponsorMember?.company ?? intro.companyName ?? "—",
            role: "Sponsor",
            status: "Active",
            memberId: intro.targetMemberId,
          },
          {
            id: "p-investor",
            name: intro.requesterName,
            company: "—",
            role: "Investor",
            status: "Active",
          },
          {
            id: "p-admin",
            name: profile.name,
            company: "Capital Circle",
            role: "Admin",
            status: "Active",
          },
        ],
      });
      // Stamp the introduction trail onto the new deal.
      mutateDeal(id, {}, {
        kind: "introduction_requested",
        title: "Introduction requested",
        body: intro.message.slice(0, 140),
        ref: { kind: "introduction", id: introductionId },
      });
      mutateDeal(id, {}, {
        kind: "introduction_approved",
        title: "Introduction approved",
        ref: { kind: "introduction", id: introductionId },
      });
      recordAudit(
        "Introduction Converted",
        { kind: "introduction", id: introductionId },
        `Converted to ${id}`
      );
      return id;
    },
    [introductionRequests, deals, profile.name, createDeal, mutateDeal, recordAudit]
  );

  const updateDealStage = useCallback(
    (dealId: string, stage: DealStage, note?: string) => {
      const prevStage = deals.find((d) => d.dealId === dealId)?.stage;
      const kind: DealActivityKind =
        stage === "Closed Won"
          ? "closed_won"
          : stage === "Closed Lost"
            ? "closed_lost"
            : stage === "Archived"
              ? "archived"
              : "stage_change";
      mutateDeal(
        dealId,
        { stage, status: statusForStage(stage) },
        { kind, title: `Stage → ${stage}`, body: note }
      );
      // Closed / Archived flows log their own dedicated audit actions.
      if (kind === "stage_change" && prevStage !== stage) {
        recordAudit(
          "Deal Stage Changed",
          { kind: "deal", id: dealId },
          note,
          { before: prevStage, after: stage }
        );
      }
    },
    [mutateDeal, deals, recordAudit]
  );

  const updateDealFields = useCallback(
    (dealId: string, patch: Partial<Deal>) => {
      mutateDeal(
        dealId,
        (d) => ({
          ...patch,
          status: patch.stage ? statusForStage(patch.stage) : d.status,
        }),
        { kind: "updated", title: "Deal updated" }
      );
    },
    [mutateDeal]
  );

  const addDealNote = useCallback(
    (dealId: string, text: string, internal = false): string => {
      const now = new Date().toISOString();
      let noteId = "";
      setDeals((prev) =>
        prev.map((d) => {
          if (d.dealId !== dealId) return d;
          const list = internal ? d.internalNotes : d.notes;
          noteId = `note-${String(list.length + 1).padStart(2, "0")}`;
          const entry: DealNote = {
            id: noteId,
            text,
            authorId: "me",
            authorName: profile.name,
            createdAt: now,
          };
          return {
            ...d,
            updatedDate: now,
            notes: internal ? d.notes : [entry, ...d.notes],
            internalNotes: internal ? [entry, ...d.internalNotes] : d.internalNotes,
            activity: [
              ...d.activity,
              makeDealActivity(
                d.activity,
                internal ? "internal_note_added" : "note_added",
                internal ? "Internal note added" : "Note added",
                text.slice(0, 120)
              ),
            ],
          };
        })
      );
      return noteId;
    },
    [profile.name]
  );

  const setDealPriority = useCallback(
    (dealId: string, priority: DealPriority) => {
      mutateDeal(dealId, { priority }, {
        kind: "priority_change",
        title: `Priority → ${priority}`,
      });
    },
    [mutateDeal]
  );

  const setDealHealth = useCallback(
    (dealId: string, health: DealHealth) => {
      mutateDeal(dealId, { health }, {
        kind: "health_change",
        title: `Health → ${health}`,
      });
    },
    [mutateDeal]
  );

  /** Log a lifecycle milestone (NDA signed, LOI received, …) onto the timeline. */
  const logDealMilestone = useCallback(
    (dealId: string, kind: DealActivityKind, title: string, body?: string) => {
      mutateDeal(dealId, {}, { kind, title, body });
    },
    [mutateDeal]
  );

  const setDealFollowUp = useCallback(
    (
      dealId: string,
      patch: { lastContactDate?: string; nextFollowUpDate?: string }
    ) => {
      mutateDeal(dealId, patch, { kind: "updated", title: "Follow-up updated" });
    },
    [mutateDeal]
  );

  const assignDealAdmin = useCallback(
    (dealId: string, admin: string) => {
      mutateDeal(dealId, { assignedAdmin: admin }, {
        kind: "assigned",
        title: `Assigned to ${admin}`,
      });
      recordAudit("Deal Assigned", { kind: "deal", id: dealId }, `Assigned to ${admin}`);
    },
    [mutateDeal, recordAudit]
  );

  const closeDeal = useCallback(
    (dealId: string, outcome: "won" | "lost", note?: string) => {
      updateDealStage(dealId, outcome === "won" ? "Closed Won" : "Closed Lost", note);
      if (outcome === "won") {
        mutateDeal(dealId, (d) => ({
          actualInvestment: d.actualInvestment ?? d.targetInvestment,
          actualCommission:
            d.actualCommission ??
            Math.round(((d.actualInvestment ?? d.targetInvestment) * d.commissionPct) / 100),
        }));
      }
      recordAudit(
        "Deal Closed",
        { kind: "deal", id: dealId },
        outcome === "won" ? "Closed Won" : "Closed Lost"
      );
    },
    [updateDealStage, mutateDeal, recordAudit]
  );

  const reopenDeal = useCallback(
    (dealId: string) => {
      mutateDeal(
        dealId,
        { stage: "Negotiating", status: "Open" },
        { kind: "reopened", title: "Deal reopened", body: "Returned to Negotiating." }
      );
      recordAudit("Deal Reopened", { kind: "deal", id: dealId });
    },
    [mutateDeal, recordAudit]
  );

  const archiveDeal = useCallback(
    (dealId: string) => {
      updateDealStage(dealId, "Archived");
      recordAudit("Deal Archived", { kind: "deal", id: dealId });
    },
    [updateDealStage, recordAudit]
  );

  const restoreDeal = useCallback(
    (dealId: string) => {
      mutateDeal(
        dealId,
        { stage: "New Lead", status: "Open" },
        { kind: "restored", title: "Deal restored", body: "Returned to New Lead." }
      );
      recordAudit("Deal Restored", { kind: "deal", id: dealId });
    },
    [mutateDeal, recordAudit]
  );

  const deleteDeal = useCallback(
    (dealId: string) => {
      setDeals((prev) => prev.filter((d) => d.dealId !== dealId));
      recordAudit("Deal Deleted", { kind: "deal", id: dealId });
    },
    [recordAudit]
  );

  const addDealParticipant = useCallback(
    (dealId: string, input: Omit<DealParticipant, "id">) => {
      mutateDeal(
        dealId,
        (d) => ({
          participants: [
            ...d.participants,
            { ...input, id: `p-${String(d.participants.length + 1).padStart(2, "0")}` },
          ],
        }),
        {
          kind:
            input.role === "Investor"
              ? "investor_added"
              : input.role === "Sponsor"
                ? "sponsor_added"
                : "participant_added",
          title: `${input.role} added — ${input.name}`,
        }
      );
    },
    [mutateDeal]
  );

  const removeDealParticipant = useCallback(
    (dealId: string, participantId: string) => {
      mutateDeal(
        dealId,
        (d) => ({
          participants: d.participants.filter((p) => p.id !== participantId),
        }),
        { kind: "participant_removed", title: "Participant removed" }
      );
    },
    [mutateDeal]
  );

  const addDealDocument = useCallback(
    (dealId: string, input: { name: string; type: DealDocumentType; linkedDocumentId?: string }) => {
      mutateDeal(
        dealId,
        (d) => ({
          documents: [
            ...d.documents,
            {
              id: `doc-${String(d.documents.length + 1).padStart(2, "0")}`,
              name: input.name,
              type: input.type,
              linkedDocumentId: input.linkedDocumentId,
              addedAt: new Date().toISOString(),
              addedBy: profile.name,
            },
          ],
        }),
        { kind: "document_added", title: `Document added — ${input.name}` }
      );
    },
    [mutateDeal, profile.name]
  );

  const removeDealDocument = useCallback(
    (dealId: string, documentId: string) => {
      mutateDeal(
        dealId,
        (d) => ({ documents: d.documents.filter((doc) => doc.id !== documentId) }),
        { kind: "document_removed", title: "Document reference removed" }
      );
    },
    [mutateDeal]
  );


  const upsertConversation = useCallback(
    (
      context: ConversationContext,
      stage: NegotiationStage,
      seedMessages: Message[]
    ): string => {
      const id = makeId("conv");
      const now = new Date().toISOString();
      const stamped: Message[] = seedMessages.map((m) => ({
        ...m,
        conversationId: id,
      }));
      const lastTextMessage = [...stamped]
        .reverse()
        .find((m): m is Extract<Message, { kind: "text" }> => m.kind === "text");
      const newConversation: Conversation = {
        id,
        companyId: context.companyId,
        opportunitySlug: context.opportunitySlug,
        opportunityTitle: context.opportunityTitle,
        opportunityCategory: context.opportunityCategory,
        opportunityLocation: context.opportunityLocation,
        opportunityImage: context.opportunityImage,
        startedAt: now,
        lastMessageAt: now,
        lastMessagePreview:
          lastTextMessage?.text ??
          (stage === "Negotiation Active" ? "Negotiation Started" : "Interest Submitted"),
        unreadCount: 0,
        stage,
        messages: stamped,
      };
      setConversations((prev) => [newConversation, ...prev]);
      return id;
    },
    []
  );

  // Append a notification to the in-memory list. Used by every workflow that
  // changes conversation / negotiation / access-request state so the bell
  // reflects actual activity (audit item: "Notifications never created by
  // app actions").
  const pushNotification = useCallback(
    (n: Omit<Notification, "id" | "createdAt" | "read">) => {
      const entry: Notification = {
        ...n,
        id: makeId("notif"),
        createdAt: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [entry, ...prev]);
    },
    []
  );

  const createInterestConversation = useCallback(
    (context: ConversationContext, optionalNote?: string): string => {
      const now = new Date().toISOString();
      const messages: Message[] = [
        {
          id: makeId("sysmsg"),
          conversationId: "",
          kind: "system",
          variant: "interest",
          text: "Interest Submitted",
          createdAt: now,
        },
      ];
      const note = optionalNote?.trim();
      if (note) {
        messages.push({
          id: makeId("msg"),
          conversationId: "",
          kind: "text",
          authorId: ME.authorId,
          authorName: ME.authorName,
          authorInitials: ME.authorInitials,
          text: note,
          createdAt: now,
        });
      }
      const id = upsertConversation(context, "Interest Submitted", messages);
      pushNotification({
        kind: "message",
        title: "Interest submitted",
        body: context.opportunityTitle
          ? `You opened a conversation about ${context.opportunityTitle}.`
          : "You opened a new conversation.",
        href: `/messages?conversation=${id}`,
        companyId: context.companyId,
      });
      return id;
    },
    [upsertConversation, pushNotification]
  );

  const createNegotiationConversation = useCallback(
    (context: ConversationContext): string => {
      const now = new Date().toISOString();
      const messages: Message[] = [
        {
          id: makeId("sysmsg"),
          conversationId: "",
          kind: "system",
          variant: "interest",
          text: "Interest Submitted",
          createdAt: now,
        },
        {
          id: makeId("sysmsg"),
          conversationId: "",
          kind: "system",
          variant: "negotiation_start",
          text: "Negotiation Started",
          createdAt: now,
        },
        {
          id: makeId("msg"),
          conversationId: "",
          kind: "text",
          authorId: ME.authorId,
          authorName: ME.authorName,
          authorInitials: ME.authorInitials,
          text:
            "Opened a formal negotiation. Looking forward to discussing terms — happy to schedule a working session.",
          createdAt: now,
        },
      ];
      const id = upsertConversation(context, "Negotiation Active", messages);
      pushNotification({
        kind: "negotiation_update",
        title: "Negotiation started",
        body: context.opportunityTitle
          ? `You opened a formal negotiation on ${context.opportunityTitle}.`
          : "You opened a formal negotiation.",
        href: `/messages?conversation=${id}`,
        companyId: context.companyId,
      });
      return id;
    },
    [upsertConversation, pushNotification]
  );

  const sendMessage = useCallback(
    (conversationId: string, text: string, attachments?: Attachment[]) => {
      const value = text.trim();
      const hasAttachments = !!attachments && attachments.length > 0;
      // Allow sending a message that is attachments-only.
      if (!value && !hasAttachments) return;
      const now = new Date().toISOString();
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c;
          const message: Message = {
            id: makeId("msg"),
            conversationId,
            kind: "text",
            authorId: ME.authorId,
            authorName: ME.authorName,
            authorInitials: ME.authorInitials,
            text: value,
            attachments: hasAttachments ? attachments : undefined,
            createdAt: now,
          };
          const preview = value
            ? value
            : hasAttachments
              ? attachments!.length === 1
                ? `Attachment: ${attachments![0].name}`
                : `${attachments!.length} attachments`
              : "";
          return {
            ...c,
            messages: [...c.messages, message],
            lastMessageAt: now,
            lastMessagePreview: preview,
          };
        })
      );
      pushNotification({
        kind: hasAttachments ? "attachment" : "message",
        title: hasAttachments ? "Attachment sent" : "Message sent",
        body: value
          ? value.slice(0, 120)
          : attachments && attachments.length === 1
            ? `You sent ${attachments[0].name}`
            : `You sent ${attachments?.length ?? 0} attachments`,
        href: `/messages?conversation=${conversationId}`,
      });
    },
    [pushNotification]
  );

  const markConversationRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  const advanceStage = useCallback(
    (conversationId: string, stage: NegotiationStage) => {
      let companyId: string | undefined;
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c;
          companyId = c.companyId;
          return {
            ...c,
            stage,
            messages: [
              ...c.messages,
              {
                id: makeId("sysmsg"),
                conversationId,
                kind: "system",
                variant: "stage_change",
                text: stage,
                createdAt: new Date().toISOString(),
              },
            ],
          };
        })
      );
      pushNotification({
        kind: "negotiation_update",
        title: "Negotiation stage updated",
        body: `Stage advanced to ${stage}.`,
        href: `/messages?conversation=${conversationId}`,
        companyId,
      });
    },
    [pushNotification]
  );

  const toggleSavedOpportunity = useCallback((opportunityId: string) => {
    setSavedOpportunityIds((prev) =>
      prev.includes(opportunityId)
        ? prev.filter((id) => id !== opportunityId)
        : [opportunityId, ...prev]
    );
  }, []);

  const toggleSavedCompany = useCallback((companyId: string) => {
    setSavedCompanyIds((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [companyId, ...prev]
    );
  }, []);

  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // ---- Listing actions ----

  function nextListingId(existing: ListingRecord[]): string {
    let maxNum = 0;
    for (const listing of existing) {
      const match = /^LST-(\d+)$/.exec(listing.id);
      if (match) {
        const value = parseInt(match[1], 10);
        if (!Number.isNaN(value) && value > maxNum) maxNum = value;
      }
    }
    return `LST-${String(maxNum + 1).padStart(6, "0")}`;
  }

  function makeActivityEntry(
    listingId: string,
    existing: ListingActivity[],
    kind: ListingActivityKind,
    title: string,
    body: string,
    extras: { opportunitySlug?: string; companyId?: string } = {}
  ): ListingActivity {
    const seq = existing.length + 1;
    return {
      id: `${listingId}-act-${String(seq).padStart(2, "0")}`,
      kind,
      title,
      body,
      createdAt: new Date().toISOString(),
      listingId,
      opportunitySlug: extras.opportunitySlug,
      companyId: extras.companyId,
    };
  }

  const createListingFromOpportunity = useCallback(
    (opportunityId: string): string => {
      const opp = featuredOpportunities.find((o) => o.id === opportunityId);
      let newId = "";
      setListings((prev) => {
        newId = nextListingId(prev);
        const now = new Date().toISOString();
        const baseTitle = opp?.title ?? "New Listing";
        const record: ListingRecord = {
          id: newId,
          opportunityId: opp?.id,
          opportunitySlug: opp?.slug,
          title: baseTitle,
          category: opp?.category,
          dealType: opp?.dealType,
          status: "Draft",
          views: 0,
          saves: 0,
          interests: 0,
          negotiations: 0,
          messages: 0,
          lastUpdatedAt: now,
          createdAt: now,
          analyticsSeries: [],
          activity: [],
        };
        record.activity.push(
          makeActivityEntry(
            newId,
            record.activity,
            "edit",
            "Draft created from opportunity",
            `Started a new draft from opportunity ${opp?.title ?? opportunityId}.`,
            { opportunitySlug: opp?.slug }
          )
        );
        return [record, ...prev];
      });
      return newId;
    },
    []
  );

  const duplicateListing = useCallback((id: string): string => {
    let newId = "";
    setListings((prev) => {
      const source = prev.find((l) => l.id === id);
      if (!source) return prev;
      newId = nextListingId(prev);
      const now = new Date().toISOString();
      const activity: ListingActivity[] = [];
      const initial: ListingRecord = {
        ...source,
        id: newId,
        title: `${source.title} (Copy)`,
        status: "Draft",
        duplicatedFromId: source.id,
        lastUpdatedAt: now,
        createdAt: now,
        views: 0,
        saves: 0,
        interests: 0,
        negotiations: 0,
        messages: 0,
        analyticsSeries: [],
        activity,
      };
      initial.activity.push(
        makeActivityEntry(
          newId,
          initial.activity,
          "edit",
          `Duplicated to ${newId}`,
          `New draft duplicated from listing ${source.id} — ${source.title}.`,
          { opportunitySlug: source.opportunitySlug }
        )
      );
      // Also log the duplication on the source listing's activity.
      const updated = prev.map((l) =>
        l.id === source.id
          ? {
              ...l,
              activity: [
                ...l.activity,
                makeActivityEntry(
                  source.id,
                  l.activity,
                  "edit",
                  `Duplicated to ${newId}`,
                  `Owner duplicated this listing into a new draft (${newId}).`,
                  { opportunitySlug: l.opportunitySlug }
                ),
              ],
            }
          : l
      );
      return [initial, ...updated];
    });
    return newId;
  }, []);

  const archiveListing = useCallback(
    (id: string) => {
      setListings((prev) =>
        prev.map((l) =>
          l.id === id
            ? {
                ...l,
                status: "Archived",
                lastUpdatedAt: new Date().toISOString(),
                activity: [
                  ...l.activity,
                  makeActivityEntry(
                    l.id,
                    l.activity,
                    "edit",
                    "Archived",
                    "Listing was archived and removed from the active marketplace.",
                    { opportunitySlug: l.opportunitySlug }
                  ),
                ],
              }
            : l
        )
      );
      recordAudit("Listing Archived", { kind: "listing", id });
    },
    [recordAudit]
  );

  const restoreListing = useCallback((id: string) => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: "Draft",
              lastUpdatedAt: new Date().toISOString(),
              activity: [
                ...l.activity,
                makeActivityEntry(
                  l.id,
                  l.activity,
                  "edit",
                  "Restored from archive",
                  "Listing was restored from archive and moved back to Draft.",
                  { opportunitySlug: l.opportunitySlug }
                ),
              ],
            }
          : l
      )
    );
    recordAudit("Listing Restored", { kind: "listing", id });
  }, [recordAudit]);

  const markListingClosed = useCallback((id: string) => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: "Closed",
              lastUpdatedAt: new Date().toISOString(),
              activity: [
                ...l.activity,
                makeActivityEntry(
                  l.id,
                  l.activity,
                  "stage_change",
                  "Marked as Closed",
                  "Listing was marked as Closed by the owner.",
                  { opportunitySlug: l.opportunitySlug }
                ),
              ],
            }
          : l
      )
    );
  }, []);

  const updateListingStatus = useCallback(
    (id: string, status: ListingStatus) => {
      setListings((prev) =>
        prev.map((l) =>
          l.id === id
            ? {
                ...l,
                status,
                lastUpdatedAt: new Date().toISOString(),
                activity: [
                  ...l.activity,
                  makeActivityEntry(
                    l.id,
                    l.activity,
                    "stage_change",
                    `Status changed to ${status}`,
                    `Listing status was updated to ${status}.`,
                    { opportunitySlug: l.opportunitySlug }
                  ),
                ],
              }
            : l
        )
      );
    },
    []
  );

  const saveListingDraft = useCallback(
    (id: string, draftPayload: unknown) => {
      setListings((prev) =>
        prev.map((l) =>
          l.id === id
            ? {
                ...l,
                draftPayload,
                lastUpdatedAt: new Date().toISOString(),
                activity: [
                  ...l.activity,
                  makeActivityEntry(
                    l.id,
                    l.activity,
                    "edit",
                    "Draft saved",
                    "Owner saved updates to the listing draft.",
                    { opportunitySlug: l.opportunitySlug }
                  ),
                ],
              }
            : l
        )
      );
    },
    []
  );

  const deleteListing = useCallback(
    (id: string) => {
      let deletedOpportunityId: string | undefined;
      setListings((prev) => {
        const target = prev.find((l) => l.id === id);
        if (target) deletedOpportunityId = target.opportunityId;
        return prev.filter((l) => l.id !== id);
      });
      if (deletedOpportunityId) {
        setUserOpportunities((prev) =>
          prev.filter((o) => o.id !== deletedOpportunityId)
        );
      }
      setDocuments((prev) => prev.filter((d) => d.listingId !== id));
      setAccessRequests((prev) => prev.filter((r) => r.listingId !== id));
      setDocumentActivity((prev) => prev.filter((a) => a.listingId !== id));
      recordAudit("Listing Deleted", { kind: "listing", id });
    },
    [recordAudit]
  );

  const updateListingFields = useCallback(
    (
      listingId: string,
      patch: {
        listing?: Partial<
          Pick<
            ListingRecord,
            | "title"
            | "subtitle"
            | "category"
            | "dealType"
            | "status"
            | "visibility"
            | "contactPreferences"
          >
        >;
        opportunity?: Partial<Opportunity>;
      }
    ) => {
      const now = new Date().toISOString();
      // Resolve BEFORE dispatching. Capturing inside the setListings updater
      // and branching afterwards only works when React eagerly evaluates the
      // updater — which it skips whenever another update is already queued,
      // silently dropping the opportunity patch.
      const targetOpportunityId = listings.find(
        (l) => l.id === listingId
      )?.opportunityId;
      setListings((prev) =>
        prev.map((l) => {
          if (l.id !== listingId) return l;
          return {
            ...l,
            ...(patch.listing ?? {}),
            lastUpdatedAt: now,
            activity: [
              ...l.activity,
              makeActivityEntry(
                l.id,
                l.activity,
                "edit",
                "Details edited",
                "Sponsor updated listing details from the inline editor.",
                { opportunitySlug: l.opportunitySlug }
              ),
            ],
          };
        })
      );
      if (patch.opportunity && targetOpportunityId) {
        // Write to userOpportunities only when the opp is user-created — keeps
        // the in-memory list mutation consistent for those.
        if (userOpportunities.some((o) => o.id === targetOpportunityId)) {
          setUserOpportunities((prev) =>
            prev.map((o) =>
              o.id === targetOpportunityId
                ? { ...o, ...(patch.opportunity ?? {}) }
                : o
            )
          );
        }
        // Always record the patch in the overlay. Public readers merge the
        // overlay on top of the seed catalog AND user opportunities, so this
        // is the path that makes seed-backed listings editable end-to-end.
        const oppId = targetOpportunityId;
        setOpportunityPatches((prev) => ({
          ...prev,
          [oppId]: {
            ...(prev[oppId] ?? {}),
            ...(patch.opportunity ?? {}),
          },
        }));
      }
    },
    [listings, userOpportunities]
  );

  const updateListingImages = useCallback(
    (listingId: string, images: string[]) => {
      // Same rule as updateListingFields: resolve from current state, not
      // from inside the updater — eager evaluation is not guaranteed.
      const targetOpportunityId = listings.find(
        (l) => l.id === listingId
      )?.opportunityId;
      setListings((prev) =>
        prev.map((l) => {
          if (l.id !== listingId) return l;
          return {
            ...l,
            lastUpdatedAt: new Date().toISOString(),
            activity: [
              ...l.activity,
              makeActivityEntry(
                l.id,
                l.activity,
                "edit",
                "Gallery updated",
                `Image set updated to ${images.length} ${
                  images.length === 1 ? "photo" : "photos"
                }.`,
                { opportunitySlug: l.opportunitySlug }
              ),
            ],
          };
        })
      );
      if (targetOpportunityId) {
        // Keep user opportunities consistent when the opp is user-created.
        setUserOpportunities((prev) =>
          prev.map((o) =>
            o.id === targetOpportunityId ? { ...o, images } : o
          )
        );
        // Always write the new image set to the overlay so seed-backed
        // listings' galleries actually propagate to public surfaces.
        const oppId = targetOpportunityId;
        setOpportunityPatches((prev) => ({
          ...prev,
          [oppId]: {
            ...(prev[oppId] ?? {}),
            images,
          },
        }));
      }
    },
    [listings]
  );

  // ---- User-created opportunities (wizard target) ----

  const createListing = useCallback(
    (
      formData: CreateListingFormState,
      options: { status: "Draft" | "Active" }
    ): { listingId: string; opportunityId: string; slug: string } => {
      const now = new Date().toISOString();
      const isDraft = options.status === "Draft";

      // Compute new IDs against ALL known opportunities (seed + user) and
      // listings to avoid collisions.
      const allOppIds = [
        ...featuredOpportunities.map((o) => o.id),
        ...userOpportunities.map((o) => o.id),
      ];
      const takenSlugs = new Set([
        ...featuredOpportunities.map((o) => o.slug),
        ...userOpportunities.map((o) => o.slug),
      ]);

      const opportunityId = nextOpportunityIdInternal(allOppIds);
      const baseSlug = slugifyTitle(formData.title);
      const slug = uniqueSlugInternal(baseSlug, takenSlugs);
      const companyId = profile.id?.startsWith("USER-")
        ? "COMP-000001"
        : "COMP-000001";
      const postedBy =
        formData.companyName.trim() || profile.company || "Capital Circle Member";

      const newOpportunity: Opportunity = formStateToOpportunity(formData, {
        opportunityId,
        slug,
        companyId,
        postedBy,
        nowIso: now,
      });

      let newListingId = "";
      setListings((prev) => {
        newListingId = nextListingId(prev);
        const initialStatus: ListingStatus = isDraft ? "Draft" : "Active";
        const activity: ListingActivity[] = [];
        const record: ListingRecord = {
          id: newListingId,
          opportunityId,
          opportunitySlug: slug,
          title: newOpportunity.title,
          category: newOpportunity.category,
          dealType: newOpportunity.dealType,
          status: initialStatus,
          views: 0,
          saves: 0,
          interests: 0,
          negotiations: 0,
          messages: 0,
          lastUpdatedAt: now,
          createdAt: now,
          analyticsSeries: [],
          activity,
          draftPayload: formData,
        };
        record.activity.push(
          makeActivityEntry(
            newListingId,
            record.activity,
            isDraft ? "edit" : "stage_change",
            isDraft ? "Draft saved" : "Listing created",
            isDraft
              ? "Draft was saved and is hidden from public surfaces until published."
              : "Listing was created and is now live on the marketplace.",
            { opportunitySlug: slug }
          )
        );
        return [record, ...prev];
      });

      setUserOpportunities((prev) => {
        // If a draft, we still insert the opportunity so the edit flow can
        // resume against a live record. Public surfaces respect the listing's
        // status when deciding to show it.
        return [newOpportunity, ...prev];
      });

      return { listingId: newListingId, opportunityId, slug };
    },
    [profile, userOpportunities]
  );

  const updateUserOpportunity = useCallback(
    (opportunityId: string, patch: Partial<Opportunity>) => {
      setUserOpportunities((prev) =>
        prev.map((o) => (o.id === opportunityId ? { ...o, ...patch } : o))
      );
    },
    []
  );

  const commitListingEdit = useCallback(
    (listingId: string, formData: CreateListingFormState) => {
      const now = new Date().toISOString();
      setListings((prev) =>
        prev.map((l) =>
          l.id === listingId
            ? {
                ...l,
                title: formData.title.trim() || l.title,
                category: formData.category ?? l.category,
                dealType: formData.dealType ?? l.dealType,
                draftPayload: formData,
                lastUpdatedAt: now,
                activity: [
                  ...l.activity,
                  makeActivityEntry(
                    l.id,
                    l.activity,
                    "edit",
                    "Listing edited",
                    "Owner saved an edit to the listing.",
                    { opportunitySlug: l.opportunitySlug }
                  ),
                ],
              }
            : l
        )
      );
      const targetListing = listings.find((l) => l.id === listingId);
      const oppId = targetListing?.opportunityId;
      if (oppId) {
        const patch = formStateToOpportunityPatch(formData);
        if (userOpportunities.some((o) => o.id === oppId)) {
          setUserOpportunities((prev) =>
            prev.map((o) => (o.id === oppId ? { ...o, ...patch } : o))
          );
        }
        // Persist via overlay regardless of seed-vs-user origin.
        setOpportunityPatches((prev) => ({
          ...prev,
          [oppId]: {
            ...(prev[oppId] ?? {}),
            ...patch,
          },
        }));
      }
    },
    [listings, userOpportunities]
  );

  const getListing = useCallback(
    (id: string): ListingRecord | undefined =>
      listings.find((l) => l.id === id),
    [listings]
  );

  // Returns the live opportunity for an id by merging seed catalog (or user
  // catalog) with the overlay patch. The overlay is the source of truth for
  // every Edit Details / Image Manager mutation.
  const getOpportunity = useCallback(
    (opportunityId: string): Opportunity | undefined => {
      const seed = featuredOpportunities.find((o) => o.id === opportunityId);
      const userOpp = userOpportunities.find((o) => o.id === opportunityId);
      const base = userOpp ?? seed;
      if (!base) return undefined;
      const patch = opportunityPatches[opportunityId];
      if (!patch) return base;
      return { ...base, ...patch };
    },
    [userOpportunities, opportunityPatches]
  );

  const getOpportunityBySlug = useCallback(
    (slug: string): Opportunity | undefined => {
      const userOpp = userOpportunities.find((o) => o.slug === slug);
      const seed = featuredOpportunities.find((o) => o.slug === slug);
      const base = userOpp ?? seed;
      if (!base) return undefined;
      const patch = opportunityPatches[base.id];
      if (!patch) return base;
      return { ...base, ...patch };
    },
    [userOpportunities, opportunityPatches]
  );


  // ---- Company / member media overlays ----
  //
  // Same architecture proven by the opportunity overlay: seed records stay
  // immutable, media edits land in a patch map keyed by id, persisted to
  // localStorage, and merged at read time. Blobs live in IndexedDB via
  // idb:// tokens. No second image system.

  const getCompanyLive = useCallback(
    (companyId: string): Company | undefined => {
      const base = getCompanyById(companyId);
      if (!base) return undefined;
      const patch = companyMediaPatches[companyId];
      return patch ? { ...base, ...patch } : base;
    },
    [companyMediaPatches]
  );

  const getMemberLive = useCallback(
    (memberId: string): Member | undefined => {
      const base = getMemberById(memberId);
      if (!base) return undefined;
      const patch = memberMediaPatches[memberId];
      return patch ? { ...base, ...patch } : base;
    },
    [memberMediaPatches]
  );

  const updateCompanyMedia = useCallback(
    (companyId: string, media: CompanyMediaPatch) => {
      setCompanyMediaPatches((prev) => ({
        ...prev,
        [companyId]: { ...(prev[companyId] ?? {}), ...media },
      }));
    },
    []
  );

  const updateMemberMedia = useCallback(
    (memberId: string, media: MemberMediaPatch) => {
      setMemberMediaPatches((prev) => ({
        ...prev,
        [memberId]: { ...(prev[memberId] ?? {}), ...media },
      }));
    },
    []
  );

  // ---- Document / Access Request actions ----

  function nextRequestId(existing: AccessRequest[]): string {
    let maxNum = 0;
    for (const r of existing) {
      const match = /^REQ-(\d+)$/.exec(r.id);
      if (match) {
        const value = parseInt(match[1], 10);
        if (!Number.isNaN(value) && value > maxNum) maxNum = value;
      }
    }
    return `REQ-${String(maxNum + 1).padStart(6, "0")}`;
  }

  function nextDocActivityId(existing: DocumentActivity[]): string {
    let maxNum = 0;
    for (const a of existing) {
      const match = /^DACT-(\d+)$/.exec(a.id);
      if (match) {
        const value = parseInt(match[1], 10);
        if (!Number.isNaN(value) && value > maxNum) maxNum = value;
      }
    }
    return `DACT-${String(maxNum + 1).padStart(6, "0")}`;
  }

  const pushDocActivity = useCallback(
    (
      listingId: string,
      kind: DocumentActivityKind,
      title: string,
      body: string,
      actor: string,
      documentId?: string
    ) => {
      setDocumentActivity((prev) => {
        const id = nextDocActivityId(prev);
        const entry: DocumentActivity = {
          id,
          listingId,
          documentId,
          kind,
          title,
          body,
          actor,
          createdAt: new Date().toISOString(),
        };
        return [entry, ...prev];
      });
    },
    []
  );

  // ---- Document management (post-publication, no wizard) ----

  function nextDocId(existing: DataRoomDocument[]): string {
    let maxNum = 0;
    for (const d of existing) {
      const match = /^DOC-(\d+)$/.exec(d.id);
      if (match) {
        const value = parseInt(match[1], 10);
        if (!Number.isNaN(value) && value > maxNum) maxNum = value;
      }
    }
    return `DOC-${String(maxNum + 1).padStart(6, "0")}`;
  }

  const addDocument = useCallback(
    (
      input: Omit<DataRoomDocument, "id" | "uploadedAt" | "updatedAt">
    ): string => {
      const now = new Date().toISOString();
      let id = "";
      setDocuments((prev) => {
        id = nextDocId(prev);
        const entry: DataRoomDocument = {
          ...input,
          id,
          uploadedAt: now,
          updatedAt: now,
        };
        return [entry, ...prev];
      });
      pushDocActivity(
        input.listingId,
        "uploaded",
        "Document uploaded",
        `${ME.authorName} uploaded “${input.name}”.`,
        ME.authorName,
        id
      );
      setListings((prev) =>
        prev.map((l) =>
          l.id === input.listingId
            ? {
                ...l,
                lastUpdatedAt: now,
                activity: [
                  ...l.activity,
                  makeActivityEntry(
                    l.id,
                    l.activity,
                    "edit",
                    "Document uploaded",
                    `${input.name} was added to the data room.`,
                    { opportunitySlug: l.opportunitySlug }
                  ),
                ],
              }
            : l
        )
      );
      recordAudit(
        "Document Uploaded",
        { kind: "document", id, label: input.name },
        `Listing ${input.listingId}`
      );
      return id;
    },
    [pushDocActivity, recordAudit]
  );

  const deleteDocument = useCallback(
    (documentId: string) => {
      // Resolve before dispatching — updater capture is unreliable.
      const target = documents.find((d) => d.id === documentId);
      const targetListingId = target?.listingId;
      const targetName = target?.name;
      setDocuments((prev) => prev.filter((d) => d.id !== documentId));
      if (targetListingId && targetName) {
        pushDocActivity(
          targetListingId,
          "uploaded", // closest existing kind for "removed"
          "Document removed",
          `${ME.authorName} removed “${targetName}”.`,
          ME.authorName
        );
      }
      recordAudit(
        "Document Deleted",
        { kind: "document", id: documentId, label: targetName },
        targetListingId ? `Listing ${targetListingId}` : undefined
      );
    },
    [documents, pushDocActivity, recordAudit]
  );

  const replaceDocument = useCallback(
    (
      documentId: string,
      patch: Partial<Omit<DataRoomDocument, "id" | "listingId" | "uploadedAt">>
    ) => {
      // Resolve before dispatching — updater capture is unreliable.
      const target = documents.find((d) => d.id === documentId);
      const targetListingId = target?.listingId;
      const nextName = target ? patch.name ?? target.name : undefined;
      setDocuments((prev) =>
        prev.map((d) => {
          if (d.id !== documentId) return d;
          return {
            ...d,
            ...patch,
            updatedAt: new Date().toISOString(),
          };
        })
      );
      if (targetListingId) {
        pushDocActivity(
          targetListingId,
          "uploaded",
          "Document replaced",
          `${ME.authorName} replaced the document with “${nextName ?? "an updated file"}”.`,
          ME.authorName,
          documentId
        );
      }
      recordAudit(
        "Document Replaced",
        { kind: "document", id: documentId, label: nextName },
        targetListingId ? `Listing ${targetListingId}` : undefined
      );
    },
    [documents, pushDocActivity, recordAudit]
  );

  const requestDocumentAccess = useCallback(
    (listingId: string, message?: string): string => {
      let id = "";
      setAccessRequests((prev) => {
        id = nextRequestId(prev);
        const request: AccessRequest = {
          id,
          listingId,
          requesterId: ME.authorId,
          requesterName: ME.authorName,
          requesterInitials: ME.authorInitials,
          requesterCompany: "Pacific Coast Development Group",
          message: message?.trim() || undefined,
          status: "Requested",
          requestedAt: new Date().toISOString(),
        };
        return [request, ...prev];
      });
      pushDocActivity(
        listingId,
        "access_requested",
        "Access requested",
        message?.trim()
          ? `${ME.authorName} requested data room access — “${message.trim()}”`
          : `${ME.authorName} requested data room access.`,
        ME.authorName
      );
      return id;
    },
    [pushDocActivity]
  );

  const approveAccessRequest = useCallback(
    (requestId: string) => {
      let listingId = "";
      let requesterName = "";
      setAccessRequests((prev) =>
        prev.map((r) => {
          if (r.id !== requestId) return r;
          listingId = r.listingId;
          requesterName = r.requesterName;
          return {
            ...r,
            status: "Approved",
            decidedAt: new Date().toISOString(),
          };
        })
      );
      if (listingId) {
        pushDocActivity(
          listingId,
          "access_approved",
          "Access approved",
          `${requesterName} has been approved for private documents.`,
          ME.authorName
        );
        pushNotification({
          kind: "company_response",
          title: "Access approved",
          body: `${requesterName} can now view the data room.`,
          href: `/data-room/${listingId}`,
        });
        recordAudit(
          "Access Approved",
          { kind: "document", id: requestId, label: requesterName },
          `Data room ${listingId}`,
          { before: "Requested", after: "Approved" }
        );
      }
    },
    [pushDocActivity, pushNotification, recordAudit]
  );

  const denyAccessRequest = useCallback(
    (requestId: string) => {
      let listingId = "";
      let requesterName = "";
      setAccessRequests((prev) =>
        prev.map((r) => {
          if (r.id !== requestId) return r;
          listingId = r.listingId;
          requesterName = r.requesterName;
          return {
            ...r,
            status: "Denied",
            decidedAt: new Date().toISOString(),
          };
        })
      );
      if (listingId) {
        pushDocActivity(
          listingId,
          "access_denied",
          "Access denied",
          `${requesterName} was not approved at this time.`,
          ME.authorName
        );
        pushNotification({
          kind: "company_response",
          title: "Access denied",
          body: `${requesterName} was not approved for the data room.`,
          href: `/data-room/${listingId}`,
        });
        recordAudit(
          "Access Denied",
          { kind: "document", id: requestId, label: requesterName },
          `Data room ${listingId}`,
          { before: "Requested", after: "Denied" }
        );
      }
    },
    [pushDocActivity, pushNotification, recordAudit]
  );

  const markDocumentViewed = useCallback(
    (documentId: string) => {
      const doc = documents.find((d) => d.id === documentId);
      if (!doc) return;
      pushDocActivity(
        doc.listingId,
        "viewed",
        "Document viewed",
        `${ME.authorName} opened “${doc.name}”.`,
        ME.authorName,
        doc.id
      );
    },
    [documents, pushDocActivity]
  );

  const markDocumentDownloaded = useCallback(
    (documentId: string) => {
      const doc = documents.find((d) => d.id === documentId);
      if (!doc) return;
      pushDocActivity(
        doc.listingId,
        "downloaded",
        "Document downloaded",
        `${ME.authorName} downloaded “${doc.name}”.`,
        ME.authorName,
        doc.id
      );
    },
    [documents, pushDocActivity]
  );

  const hasApprovedAccess = useCallback(
    (listingId: string): boolean =>
      accessRequests.some(
        (r) =>
          r.listingId === listingId &&
          r.requesterId === ME.authorId &&
          r.status === "Approved"
      ),
    [accessRequests]
  );

  const hasPendingAccess = useCallback(
    (listingId: string): boolean =>
      accessRequests.some(
        (r) =>
          r.listingId === listingId &&
          r.requesterId === ME.authorId &&
          r.status === "Requested"
      ),
    [accessRequests]
  );

  const totalPendingAccessRequests = useMemo(
    () => accessRequests.filter((r) => r.status === "Requested").length,
    [accessRequests]
  );

  const totalUnreadConversations = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.unreadCount > 0 ? 1 : 0), 0),
    [conversations]
  );

  const totalUnreadNotifications = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const value: MessagingValue = {
    hydrated,
    conversations,
    notifications,
    savedOpportunityIds,
    savedCompanyIds,
    listings,
    totalUnreadConversations,
    totalUnreadNotifications,
    createInterestConversation,
    createNegotiationConversation,
    sendMessage,
    markConversationRead,
    advanceStage,
    isOpportunitySaved: (id: string) => savedOpportunityIds.includes(id),
    toggleSavedOpportunity,
    isCompanySaved: (id: string) => savedCompanyIds.includes(id),
    toggleSavedCompany,
    markNotificationRead,
    markAllNotificationsRead,
    createListingFromOpportunity,
    duplicateListing,
    archiveListing,
    restoreListing,
    markListingClosed,
    updateListingStatus,
    saveListingDraft,
    getListing,
    deleteListing,
    updateListingImages,
    updateListingFields,
    addDocument,
    deleteDocument,
    replaceDocument,
    userOpportunities,
    opportunityPatches,
    getOpportunity,
    getOpportunityBySlug,
    getCompanyLive,
    getMemberLive,
    updateCompanyMedia,
    updateMemberMedia,
    createListing,
    updateUserOpportunity,
    commitListingEdit,
    documents,
    accessRequests,
    documentActivity,
    totalPendingAccessRequests,
    requestDocumentAccess,
    approveAccessRequest,
    denyAccessRequest,
    markDocumentViewed,
    markDocumentDownloaded,
    hasApprovedAccess,
    hasPendingAccess,
    profile,
    updateProfile,
    resetProfile,
    introductionRequests,
    submitIntroductionRequest,
    updateIntroductionStatus,
    approveIntroduction,
    rejectIntroduction,
    completeIntroduction,
    archiveIntroduction,
    restoreIntroduction,
    deleteIntroduction,
    directConnections,
    createDirectConnection,
    deals,
    getDeal,
    createDeal,
    convertIntroductionToDeal,
    updateDealStage,
    updateDealFields,
    addDealNote,
    setDealPriority,
    setDealHealth,
    logDealMilestone,
    setDealFollowUp,
    assignDealAdmin,
    closeDeal,
    reopenDeal,
    archiveDeal,
    restoreDeal,
    deleteDeal,
    addDealParticipant,
    removeDealParticipant,
    addDealDocument,
    removeDealDocument,
    currentRole,
    setCurrentRole,
    memberAdminState,
    setMemberRole,
    suspendMember,
    activateMember,
    deleteMember,
    verifyMember,
    approveMember,
    toggleMemberFeatured,
    userMembers,
    createMember,
    companyAdminState,
    verifyCompany,
    toggleCompanyFeatured,
    suspendCompany,
    activateCompany,
    deleteCompany,
    assignCompanyEditor,
    assignCompanyAdmin,
    userCompanies,
    createCompany,
    opportunityAdminState,
    approveOpportunity,
    rejectOpportunity,
    archiveOpportunityAdmin,
    deleteOpportunityAdmin,
    toggleOpportunityFeatured,
    assignOpportunityModerator,
    assignOpportunityEditor,
    auditEvents,
    recordAudit,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMessaging(): MessagingValue {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useMessaging must be used inside MessagingProvider");
  }
  return ctx;
}
