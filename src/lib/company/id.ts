// ID and storage helpers for company-owned assets.
//
// Going forward, company-owned media (logos, cover photos, office and
// project galleries) lives under /public/companies/<COMP-ID>/ using stable
// padded IDs like COMP-000001 — not the company name or slug. Mock data
// today references listing folders (since each company maps 1:1 to a
// listing) but new uploads should use these helpers.

const FOLDER_PREFIX = "COMP";
const ID_WIDTH = 6;

/**
 * Convert any internal company id (e.g. "COMP-000001") into the canonical
 * folder id. Numeric ids without a prefix also work.
 *
 *   companyFolderId("COMP-000001") → "COMP-000001"
 *   companyFolderId({ id: "COMP-2" }) → "COMP-000002"
 */
export function companyFolderId(idOrEntity: string | { id: string }): string {
  const id = typeof idOrEntity === "string" ? idOrEntity : idOrEntity.id;
  const digits = id.replace(/\D/g, "");
  if (!digits) return `${FOLDER_PREFIX}-${"0".repeat(ID_WIDTH)}`;
  return `${FOLDER_PREFIX}-${digits.padStart(ID_WIDTH, "0")}`;
}

/**
 * Path to the canonical cover image for a company folder.
 *   companyCoverPath({ id: "COMP-000001" }) → "/companies/COMP-000001/cover.jpg"
 */
export function companyCoverPath(idOrEntity: string | { id: string }): string {
  return `/companies/${companyFolderId(idOrEntity)}/cover.jpg`;
}

/**
 * Path to the canonical company logo file.
 *   companyLogoPath({ id: "COMP-000001" }) → "/companies/COMP-000001/logo.svg"
 */
export function companyLogoPath(idOrEntity: string | { id: string }): string {
  return `/companies/${companyFolderId(idOrEntity)}/logo.svg`;
}

/**
 * Path to a numbered gallery image for a company folder.
 *   companyGalleryPath({ id: "COMP-000001" }, 1) → "/companies/COMP-000001/gallery-01.jpg"
 */
export function companyGalleryPath(
  idOrEntity: string | { id: string },
  index: number
): string {
  const padded = String(index).padStart(2, "0");
  return `/companies/${companyFolderId(idOrEntity)}/gallery-${padded}.jpg`;
}
