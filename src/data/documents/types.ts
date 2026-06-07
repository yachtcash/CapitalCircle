// Data Room + Document Center type system.

export type DocumentVisibility = "Public" | "Private";

export type DocumentFileType =
  | "pdf"
  | "docx"
  | "xlsx"
  | "pptx"
  | "jpg"
  | "png"
  | "zip";

export type DocumentCategory =
  | "Project Overview"
  | "Marketing Brochure"
  | "Pitch Deck"
  | "Financial Model"
  | "Investor Deck"
  | "Feasibility Study"
  | "Survey"
  | "Architectural Plans"
  | "Contracts"
  | "Photos & Renderings"
  | "Operations"
  | "Legal";

export type DataRoomDocument = {
  id: string; // "DOC-XXXXXX"
  listingId: string; // "LST-XXXXXX"
  name: string;
  fileType: DocumentFileType;
  category: DocumentCategory;
  visibility: DocumentVisibility;
  sizeBytes: number;
  pages?: number;
  uploadedAt: string; // ISO
  updatedAt: string; // ISO
  description?: string;
};

export type AccessRequestStatus = "Requested" | "Approved" | "Denied";

export type AccessRequest = {
  id: string; // "REQ-XXXXXX"
  listingId: string;
  requesterId: string;
  requesterName: string;
  requesterCompany?: string;
  requesterInitials: string;
  message?: string;
  status: AccessRequestStatus;
  requestedAt: string;
  decidedAt?: string;
};

export type DocumentActivityKind =
  | "uploaded"
  | "access_requested"
  | "access_approved"
  | "access_denied"
  | "viewed"
  | "downloaded";

export type DocumentActivity = {
  id: string; // "DACT-XXXXXX"
  listingId: string;
  documentId?: string;
  kind: DocumentActivityKind;
  title: string;
  body: string;
  actor: string; // human-readable name
  createdAt: string;
};
