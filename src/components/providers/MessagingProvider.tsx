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
  const [opportunityPatches, setOpportunityPatches] = useState<
    Record<string, Partial<Opportunity>>
  >({});

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
    const storedPatches = readStored<Record<string, Partial<Opportunity>> | null>(
      KEY_OPPORTUNITY_PATCHES,
      null
    );
    if (storedPatches) setOpportunityPatches(storedPatches);
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
    writeStored(KEY_OPPORTUNITY_PATCHES, opportunityPatches);
  }, [opportunityPatches, hydrated]);

  const updateProfile = useCallback((partial: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetProfile = useCallback(() => {
    setProfile(SEED_PROFILE);
  }, []);

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

  const archiveListing = useCallback((id: string) => {
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
  }, []);

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
  }, []);

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

  const deleteListing = useCallback((id: string) => {
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
  }, []);

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
      let targetOpportunityId: string | undefined;
      setListings((prev) =>
        prev.map((l) => {
          if (l.id !== listingId) return l;
          targetOpportunityId = l.opportunityId;
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
    [userOpportunities]
  );

  const updateListingImages = useCallback(
    (listingId: string, images: string[]) => {
      let targetOpportunityId: string | undefined;
      setListings((prev) =>
        prev.map((l) => {
          if (l.id !== listingId) return l;
          targetOpportunityId = l.opportunityId;
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
    []
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
      return id;
    },
    [pushDocActivity]
  );

  const deleteDocument = useCallback(
    (documentId: string) => {
      let targetListingId: string | undefined;
      let targetName: string | undefined;
      setDocuments((prev) => {
        const target = prev.find((d) => d.id === documentId);
        if (target) {
          targetListingId = target.listingId;
          targetName = target.name;
        }
        return prev.filter((d) => d.id !== documentId);
      });
      if (targetListingId && targetName) {
        pushDocActivity(
          targetListingId,
          "uploaded", // closest existing kind for "removed"
          "Document removed",
          `${ME.authorName} removed “${targetName}”.`,
          ME.authorName
        );
      }
    },
    [pushDocActivity]
  );

  const replaceDocument = useCallback(
    (
      documentId: string,
      patch: Partial<Omit<DataRoomDocument, "id" | "listingId" | "uploadedAt">>
    ) => {
      let targetListingId: string | undefined;
      let nextName: string | undefined;
      setDocuments((prev) =>
        prev.map((d) => {
          if (d.id !== documentId) return d;
          targetListingId = d.listingId;
          nextName = patch.name ?? d.name;
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
    },
    [pushDocActivity]
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
      }
    },
    [pushDocActivity, pushNotification]
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
      }
    },
    [pushDocActivity, pushNotification]
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
