import type {
  AccessRequest,
  DataRoomDocument,
  DocumentActivity,
  DocumentCategory,
} from "./types";
import {
  SEED_ACCESS_REQUESTS,
  SEED_DOCUMENTS,
  SEED_DOCUMENT_ACTIVITY,
} from "./seed";

export function getDocumentById(
  pool: DataRoomDocument[],
  id: string
): DataRoomDocument | undefined {
  return pool.find((d) => d.id === id);
}

export function getDocumentsForListing(
  pool: DataRoomDocument[],
  listingId: string
): DataRoomDocument[] {
  return pool.filter((d) => d.listingId === listingId);
}

export function getPublicDocumentsForListing(
  pool: DataRoomDocument[],
  listingId: string
): DataRoomDocument[] {
  return pool.filter((d) => d.listingId === listingId && d.visibility === "Public");
}

export function getPrivateDocumentsForListing(
  pool: DataRoomDocument[],
  listingId: string
): DataRoomDocument[] {
  return pool.filter((d) => d.listingId === listingId && d.visibility === "Private");
}

export function getAccessRequestsForListing(
  pool: AccessRequest[],
  listingId: string
): AccessRequest[] {
  return pool.filter((r) => r.listingId === listingId);
}

export function getPendingAccessRequests(pool: AccessRequest[]): AccessRequest[] {
  return pool.filter((r) => r.status === "Requested");
}

export function getApprovedAccessRequests(pool: AccessRequest[]): AccessRequest[] {
  return pool.filter((r) => r.status === "Approved");
}

export function getDeniedAccessRequests(pool: AccessRequest[]): AccessRequest[] {
  return pool.filter((r) => r.status === "Denied");
}

export function getActivityForListing(
  pool: DocumentActivity[],
  listingId: string
): DocumentActivity[] {
  return pool
    .filter((a) => a.listingId === listingId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getRecentDocumentActivity(
  pool: DocumentActivity[],
  limit?: number
): DocumentActivity[] {
  const sorted = [...pool].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

export function groupDocumentsByCategory(
  documents: DataRoomDocument[]
): Map<DocumentCategory, DataRoomDocument[]> {
  const map = new Map<DocumentCategory, DataRoomDocument[]>();
  for (const d of documents) {
    const list = map.get(d.category) ?? [];
    list.push(d);
    map.set(d.category, list);
  }
  return map;
}

// Convenience accessors against the seeds — primarily useful at build time
// (e.g. generateStaticParams). At runtime, prefer the provider's live state.
export const seededDocuments = SEED_DOCUMENTS;
export const seededAccessRequests = SEED_ACCESS_REQUESTS;
export const seededActivity = SEED_DOCUMENT_ACTIVITY;
