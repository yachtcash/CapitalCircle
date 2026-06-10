// Role architecture + permissions matrix.
//
// There is NO authentication in this build (explicitly out of scope). The
// LIVE role lives in MessagingProvider state (`currentRole`, persisted to
// cc:role:v1) so the Super Admin can impersonate lower roles via the role
// switcher for testing. These helpers are pure: pass the live role in.
// CURRENT_USER_ROLE remains as the default for legacy call sites.
//
// Matrix:
//   Super Admin — full access, including role management
//   Admin       — manage everything except Super Admin settings/roles
//   Editor      — edit content (listings, opportunities, companies);
//                 cannot delete members, cannot change roles
//   Moderator   — approve/reject content, suspend members, handle reports;
//                 cannot edit platform settings
//   Member      — normal access

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

/** Default role for legacy call sites; live role comes from the provider. */
export const CURRENT_USER_ROLE: Role = "Super Admin";

const ROLE_RANK: Record<Role, number> = {
  "Member": 0,
  "Moderator": 1,
  "Editor": 2,
  "Admin": 3,
  "Super Admin": 4,
};

// ---- Core predicates ----

/** True when `role` is at least `min` in the hierarchy. */
export function hasRole(min: Role, role: Role = CURRENT_USER_ROLE): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[min];
}

/** True when `role` is one of the listed roles (exact match). */
export function hasAnyRole(roles: Role[], role: Role = CURRENT_USER_ROLE): boolean {
  return roles.includes(role);
}

/** Back-compat alias. */
export const hasRoleAtLeast = hasRole;

export function isSuperAdmin(role: Role = CURRENT_USER_ROLE): boolean {
  return role === "Super Admin";
}

// ---- Permissions matrix ----

/** Admin+ — view/suspend/activate/delete members. */
export function canManageMembers(role: Role = CURRENT_USER_ROLE): boolean {
  return hasRole("Admin", role);
}

/** Admin+ — full Deal Desk control. */
export function canManageDeals(role: Role = CURRENT_USER_ROLE): boolean {
  return hasRole("Admin", role);
}

/** Editor+ — edit listings. */
export function canManageListings(role: Role = CURRENT_USER_ROLE): boolean {
  return hasRole("Editor", role);
}

/** Editor+ — edit companies (verify/feature need Admin; see below). */
export function canManageCompanies(role: Role = CURRENT_USER_ROLE): boolean {
  return hasRole("Editor", role);
}

/** Admin+ — approve/reject/convert introductions. */
export function canManageIntroductions(role: Role = CURRENT_USER_ROLE): boolean {
  return hasRole("Admin", role);
}

/** Super Admin only — promote/demote/assign roles. */
export function canManageRoles(role: Role = CURRENT_USER_ROLE): boolean {
  return isSuperAdmin(role);
}

/** Moderator+ — approve/reject content, suspend members, handle reports. */
export function canModerateContent(role: Role = CURRENT_USER_ROLE): boolean {
  return hasRole("Moderator", role);
}

/** Admin+ — read the audit trail. */
export function canViewAuditLogs(role: Role = CURRENT_USER_ROLE): boolean {
  return hasRole("Admin", role);
}

/** Admin+ — the Admin Control Center is visible at all. */
export function canAccessAdmin(role: Role = CURRENT_USER_ROLE): boolean {
  return hasRole("Admin", role);
}

/** Moderator+ — suspend/activate member accounts. */
export function canSuspendMembers(role: Role = CURRENT_USER_ROLE): boolean {
  return hasRole("Moderator", role);
}

/** Admin+ — hard-delete records (members, companies, opportunities). */
export function canDeleteRecords(role: Role = CURRENT_USER_ROLE): boolean {
  return hasRole("Admin", role);
}

// ---- Listing-level helpers (kept from earlier passes) ----

export function canManageAnyListing(role: Role = CURRENT_USER_ROLE): boolean {
  return hasRole("Admin", role);
}

export function canManageListing(
  isOwner: boolean,
  role: Role = CURRENT_USER_ROLE
): boolean {
  return isOwner || canManageAnyListing(role);
}

export function canManageGallery(
  isOwner: boolean,
  role: Role = CURRENT_USER_ROLE
): boolean {
  return canManageListing(isOwner, role);
}

export function canDeleteAnyListing(role: Role = CURRENT_USER_ROLE): boolean {
  return hasRole("Admin", role);
}

export function canEditContent(role: Role = CURRENT_USER_ROLE): boolean {
  return hasRole("Editor", role);
}

/** Editor+ — internal deal notes. Moderators and Members cannot see them. */
export function canViewInternalNotes(role: Role = CURRENT_USER_ROLE): boolean {
  return hasRole("Editor", role);
}
