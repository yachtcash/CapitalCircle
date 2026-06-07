// Public, customer-facing opportunity IDs.
//
// Internally each opportunity carries a short slug-friendly id like "cc-001".
// For the marketplace directory we present a stable, padded public id —
// "OPP-XXXXXX" — that maps 1:1 to the internal record. Display IDs through
// the directory; never depend on titles for identity.

const PREFIX = "OPP";
const ID_WIDTH = 6;

export function publicOpportunityId(idOrEntity: string | { id: string }): string {
  const id = typeof idOrEntity === "string" ? idOrEntity : idOrEntity.id;
  const digits = id.replace(/\D/g, "");
  if (!digits) return `${PREFIX}-${"0".repeat(ID_WIDTH)}`;
  return `${PREFIX}-${digits.padStart(ID_WIDTH, "0")}`;
}

export function parsePublicOpportunityId(publicId: string): string | null {
  const match = /^OPP-(\d+)$/i.exec(publicId.trim());
  if (!match) return null;
  const num = parseInt(match[1], 10);
  if (Number.isNaN(num) || num <= 0) return null;
  return `cc-${String(num).padStart(3, "0")}`;
}
