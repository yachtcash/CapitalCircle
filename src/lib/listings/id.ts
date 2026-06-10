// ID and storage-path helpers for listing images.
//
// Canonical layout (see public/images/README.md for the full convention):
//   public/images/opportunities/<OPP-ID>/cover.jpg
//   public/images/opportunities/<OPP-ID>/gallery/1.jpg … N.jpg
//
// Folder ids are stable padded public ids (OPP-000001), never titles or
// slugs. Always build local image paths through these helpers — no
// hand-written paths in seeds or components.

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
 *   listingCoverPath({ id: "cc-001" }) → "/images/opportunities/OPP-000001/cover.jpg"
 */
export function listingCoverPath(idOrEntity: string | { id: string }): string {
  return `/images/opportunities/${listingFolderId(idOrEntity)}/cover.jpg`;
}

/**
 * Path to a numbered gallery image for a listing folder.
 *   listingGalleryPath({ id: "cc-001" }, 1) → "/images/opportunities/OPP-000001/gallery/1.jpg"
 */
export function listingGalleryPath(
  idOrEntity: string | { id: string },
  index: number
): string {
  return `/images/opportunities/${listingFolderId(idOrEntity)}/gallery/${index}.jpg`;
}

/**
 * Build the full ordered image array for a listing in the canonical layout.
 * `galleryCount` is the number of gallery images alongside the cover.
 *
 *   listingImageSet({ id: "cc-001" }, 6) → [
 *     "/images/opportunities/OPP-000001/cover.jpg",
 *     "/images/opportunities/OPP-000001/gallery/1.jpg",
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
