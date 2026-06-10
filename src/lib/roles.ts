// Role architecture — placeholder layer ahead of a real auth system.
//
// There is NO authentication in this build (explicitly out of scope). The
// current user is hardcoded as Super Admin so the platform owner can edit,
// delete, and manage every listing, image, and gallery. When auth lands,
// the only change needed is to resolve CURRENT_USER_ROLE from the session
// instead of the constant below — every call site already routes through
// these helpers.

export type Role =
  | "Member"
  | "Moderator"
  | "Editor"
  | "Admin"
  | "Super Admin";

export const ROLES: Role[] = [
  "Member",
  "Moderator",
  "Editor",
  "Admin",
  "Super Admin",
];

/** Mock session: the platform owner is always Super Admin in this build. */
export const CURRENT_USER_ROLE: Role = "Super Admin";

const ROLE_RANK: Record<Role, number> = {
  "Member": 0,
  "Moderator": 1,
  "Editor": 2,
  "Admin": 3,
  "Super Admin": 4,
};

export function hasRoleAtLeast(min: Role, role: Role = CURRENT_USER_ROLE): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[min];
}

export function isSuperAdmin(role: Role = CURRENT_USER_ROLE): boolean {
  return role === "Super Admin";
}

// ---- Permission placeholders ----
// Each helper expresses one capability. Today they all collapse to role
// rank checks; later they can grow per-resource logic without touching
// the components that call them.

/** Admin+ can manage (edit / image / gallery / delete) ANY listing. */
export function canManageAnyListing(role: Role = CURRENT_USER_ROLE): boolean {
  return hasRoleAtLeast("Admin", role);
}

/** Owner always manages their own listing; Admin+ manages everything. */
export function canManageListing(
  isOwner: boolean,
  role: Role = CURRENT_USER_ROLE
): boolean {
  return isOwner || canManageAnyListing(role);
}

/** Gallery operations (add / replace / delete / reorder / set cover). */
export function canManageGallery(
  isOwner: boolean,
  role: Role = CURRENT_USER_ROLE
): boolean {
  return canManageListing(isOwner, role);
}

/** Hard-delete privileges. */
export function canDeleteAnyListing(role: Role = CURRENT_USER_ROLE): boolean {
  return hasRoleAtLeast("Admin", role);
}

/** Editor+ can curate featured flags, collections, copy edits. */
export function canEditContent(role: Role = CURRENT_USER_ROLE): boolean {
  return hasRoleAtLeast("Editor", role);
}

/** Moderator+ can hide reported content. */
export function canModerateContent(role: Role = CURRENT_USER_ROLE): boolean {
  return hasRoleAtLeast("Moderator", role);
}

/** Editor+ can read internal deal notes. Moderators and Members cannot. */
export function canViewInternalNotes(role: Role = CURRENT_USER_ROLE): boolean {
  return hasRoleAtLeast("Editor", role);
}

/** Admin+ run the Deal Desk: create / edit / delete / stage / assign. */
export function canManageDeals(role: Role = CURRENT_USER_ROLE): boolean {
  return hasRoleAtLeast("Admin", role);
}
