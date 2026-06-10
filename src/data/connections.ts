// Direct Connection — schema-only data model.
//
// A future-ready record describing a platform-approved direct connection
// between two members. Today only the schema is wired up; full permission
// flows (who can write what, when contact info is exposed) are explicitly
// out of scope per the platform-as-middleman policy.

export type DirectConnectionStatus =
  | "Active"
  | "Suspended"
  | "Revoked";

export type DirectConnection = {
  connectionId: string; // "CONN-XXXXXX"
  memberA: string; // Member id
  memberB: string; // Member id
  approvedBy: string; // Platform owner / admin id
  approvedDate: string; // ISO timestamp
  status: DirectConnectionStatus;
  /** Optional reference to the introduction that produced this connection. */
  introductionId?: string;
};

// No seed rows by design — direct connections must be explicitly approved.
export const SEED_DIRECT_CONNECTIONS: DirectConnection[] = [];
