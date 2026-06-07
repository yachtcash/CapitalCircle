// Storage + ID helpers for data room documents.
//
// Going forward, document binaries live under
// /public/documents/<LST-ID>/<DOC-ID>.<ext>
// — stable padded ids only, never titles. The seed today references
// no real files; these helpers exist so future uploads / migrations
// land in the canonical structure.

const FOLDER_PREFIX_LIST = "LST";
const FOLDER_PREFIX_DOC = "DOC";
const ID_WIDTH = 6;

function pad(idLike: string | number, prefix: string): string {
  const digits = String(idLike).replace(/\D/g, "");
  return `${prefix}-${digits.padStart(ID_WIDTH, "0")}`;
}

export function documentFolderId(idOrEntity: string | { id: string }): string {
  const id = typeof idOrEntity === "string" ? idOrEntity : idOrEntity.id;
  return pad(id, FOLDER_PREFIX_LIST);
}

export function documentFileId(idOrEntity: string | { id: string }): string {
  const id = typeof idOrEntity === "string" ? idOrEntity : idOrEntity.id;
  return pad(id, FOLDER_PREFIX_DOC);
}

/**
 * Canonical filesystem path for a stored document.
 *   documentStoragePath("LST-000001", "DOC-000005", "pdf")
 *     → "/documents/LST-000001/DOC-000005.pdf"
 */
export function documentStoragePath(
  listingId: string | { id: string },
  documentId: string | { id: string },
  extension: string
): string {
  const cleanExt = extension.startsWith(".") ? extension.slice(1) : extension;
  return `/documents/${documentFolderId(listingId)}/${documentFileId(documentId)}.${cleanExt}`;
}
