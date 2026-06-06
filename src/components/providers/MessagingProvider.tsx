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
  type Conversation,
  type Message,
  type Notification,
} from "@/data/messages";
import type { NegotiationStage } from "@/data/negotiations";

const KEY_CONVERSATIONS = "cc:conversations:v1";
const KEY_NOTIFICATIONS = "cc:notifications:v1";
const KEY_SAVED_OPPS = "cc:saved-opps:v1";
const KEY_SAVED_COMPANIES = "cc:saved-companies:v1";

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

  totalUnreadConversations: number;
  totalUnreadNotifications: number;

  createInterestConversation: (
    context: ConversationContext,
    optionalNote?: string
  ) => string;
  createNegotiationConversation: (
    context: ConversationContext
  ) => string;
  sendMessage: (conversationId: string, text: string) => void;
  markConversationRead: (conversationId: string) => void;
  advanceStage: (conversationId: string, stage: NegotiationStage) => void;

  isOpportunitySaved: (opportunityId: string) => boolean;
  toggleSavedOpportunity: (opportunityId: string) => void;
  isCompanySaved: (companyId: string) => boolean;
  toggleSavedCompany: (companyId: string) => void;

  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
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
      return upsertConversation(context, "Interest Submitted", messages);
    },
    [upsertConversation]
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
      return upsertConversation(context, "Negotiation Active", messages);
    },
    [upsertConversation]
  );

  const sendMessage = useCallback(
    (conversationId: string, text: string) => {
      const value = text.trim();
      if (!value) return;
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
            createdAt: now,
          };
          return {
            ...c,
            messages: [...c.messages, message],
            lastMessageAt: now,
            lastMessagePreview: value,
          };
        })
      );
    },
    []
  );

  const markConversationRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  const advanceStage = useCallback(
    (conversationId: string, stage: NegotiationStage) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
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
              }
            : c
        )
      );
    },
    []
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
