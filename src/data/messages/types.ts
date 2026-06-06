import type { NegotiationStage } from "@/data/negotiations";

export type AttachmentType =
  | "jpg"
  | "png"
  | "pdf"
  | "docx"
  | "xlsx"
  | "pptx"
  | "zip";

export type Attachment = {
  id: string;
  name: string;
  type: AttachmentType;
  sizeBytes: number;
};

export type TextMessage = {
  id: string;
  conversationId: string;
  kind: "text";
  authorId: string; // "me" or company person id
  authorName: string;
  authorInitials: string;
  text: string;
  attachments?: Attachment[];
  createdAt: string; // ISO timestamp
};

export type SystemVariant =
  | "interest"
  | "negotiation_start"
  | "documents_shared"
  | "stage_change"
  | "agreement";

export type SystemMessage = {
  id: string;
  conversationId: string;
  kind: "system";
  variant: SystemVariant;
  text: string;
  createdAt: string;
};

export type Message = TextMessage | SystemMessage;

export type Conversation = {
  id: string;
  companyId: string; // COMP-XXXXXX
  opportunitySlug?: string;
  opportunityTitle?: string;
  opportunityCategory?: string;
  opportunityLocation?: string;
  opportunityImage?: string;
  startedAt: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCount: number;
  stage: NegotiationStage;
  messages: Message[];
};

export type NotificationKind =
  | "message"
  | "attachment"
  | "negotiation_update"
  | "company_response";

export type Notification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
  companyId?: string;
};
