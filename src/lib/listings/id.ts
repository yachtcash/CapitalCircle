// ID and storage helpers for listing images.
//
// Going forward, listing images should live under /public/listings/<OPP-ID>/
// using stable padded IDs like OPP-000001, not the listing title or slug.
// Existing listings still reference slug-based folders for backward
// compatibility; new listings (or migrated ones) should use these helpers
// to derive their image paths from the listing record's `id`.

const FOLDER_PREFIX = "OPP";
const ID_WIDTH = 6;

/**
 * Convert any internal listing id (e.g. "cc-001") into the canonical
 * folder id (e.g. "OPP-000001").
 */
export function listingFolderId(idOrEntity: string | { id: string }): string {
  const id = typeof idOrEntity === "string" ? idOrEntity : idOrEntity.id;
  const digits = id.replace(/\D/g, "");
  if (!digits) return `${FOLDER_PREFIX}-${"0".repeat(ID_WIDTH)}`;
  return `${FOLDER_PREFIX}-${digits.padStart(ID_WIDTH, "0")}`;
}

/**
 * Path to the canonical cover image for a listing folder.
 *   listingCoverPath({ id: "cc-001" }) → "/listings/OPP-000001/cover.jpg"
 */
export function listingCoverPath(idOrEntity: string | { id: string }): string {
  return `/listings/${listingFolderId(idOrEntity)}/cover.jpg`;
}

/**
 * Path to a numbered gallery image for a listing folder.
 *   listingGalleryPath({ id: "cc-001" }, 1) → "/listings/OPP-000001/gallery-01.jpg"
 */
export function listingGalleryPath(
  idOrEntity: string | { id: string },
  index: number
): string {
  const padded = String(index).padStart(2, "0");
  return `/listings/${listingFolderId(idOrEntity)}/gallery-${padded}.jpg`;
}

/**
 * Build the full ordered image array for a listing in the canonical layout.
 * `galleryCount` is the number of gallery images alongside the cover.
 *
 *   listingImageSet({ id: "cc-001" }, 6) → [
 *     "/listings/OPP-000001/cover.jpg",
 *     "/listings/OPP-000001/gallery-01.jpg",
 *     ...
 *   ]
 */
export function listingImageSet(
  idOrEntity: string | { id: string },
  galleryCount: number
): string[] {
  const out: string[] = [listingCoverPath(idOrEntity)];
  for (let i = 1; i <= galleryCount; i++) {
    out.push(listingGalleryPath(idOrEntity, i));
  }
  return out;
}
