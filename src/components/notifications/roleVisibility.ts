import type { CcNotification } from "@/data/notifications/types";
import { canAccessAdmin, canReviewQueue, type Role } from "@/lib/roles";

/**
 * Role-aware notification visibility. Members see only their own world —
 * Admin notifications require Admin+, Moderation requires Moderator+.
 * (Guests never reach notification surfaces; they're gated upstream.)
 */
export function visibleNotificationsForRole(
  notifications: CcNotification[],
  role: Role
): CcNotification[] {
  return notifications.filter((n) => {
    if (n.category === "Admin" && !canAccessAdmin(role)) return false;
    if (n.category === "Moderation" && !canReviewQueue(role)) return false;
    return true;
  });
}
