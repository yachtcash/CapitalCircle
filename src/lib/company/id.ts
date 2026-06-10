// ID and storage-path helpers for company-owned assets.
//
// Canonical layout (see public/images/README.md for the full convention):
//   public/images/companies/<COMP-ID>/logo.svg
//   public/images/companies/<COMP-ID>/cover.jpg
//   public/images/companies/<COMP-ID>/gallery/1.jpg … N.jpg
//
// Folder ids are stable padded public ids (COMP-000001), never company
// names or slugs. Always build local image paths through these helpers.

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
 *   companyCoverPath({ id: "COMP-000001" }) → "/images/companies/COMP-000001/cover.jpg"
 */
export function companyCoverPath(idOrEntity: string | { id: string }): string {
  return `/images/companies/${companyFolderId(idOrEntity)}/cover.jpg`;
}

/**
 * Path to the canonical company logo file.
 *   companyLogoPath({ id: "COMP-000001" }) → "/images/companies/COMP-000001/logo.svg"
 */
export function companyLogoPath(idOrEntity: string | { id: string }): string {
  return `/images/companies/${companyFolderId(idOrEntity)}/logo.svg`;
}

/**
 * Path to a numbered gallery image for a company folder.
 *   companyGalleryPath({ id: "COMP-000001" }, 1) → "/images/companies/COMP-000001/gallery/1.jpg"
 */
export function companyGalleryPath(
  idOrEntity: string | { id: string },
  index: number
): string {
  return `/images/companies/${companyFolderId(idOrEntity)}/gallery/${index}.jpg`;
}
