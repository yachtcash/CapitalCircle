// Derived moderation state — pure helpers over the provider's sanction arrays.

import type {
  Warning,
  Restriction,
  Suspension,
  Ban,
  RestrictionType,
} from "@/data/moderation";

export type MemberSanctionSummary = {
  warningCount: number;
  activeRestrictions: Restriction[];
  restrictionTypes: RestrictionType[];
  activeSuspension?: Suspension;
  activeBan?: Ban;
};

export function memberSanctions(
  memberId: string,
  data: {
    warnings: Warning[];
    restrictions: Restriction[];
    suspensions: Suspension[];
    bans: Ban[];
  }
): MemberSanctionSummary {
  const activeRestrictions = data.restrictions.filter(
    (r) => r.memberId === memberId && r.active
  );
  const restrictionTypes = [
    ...new Set(activeRestrictions.flatMap((r) => r.types)),
  ];
  return {
    warningCount: data.warnings.filter((w) => w.memberId === memberId).length,
    activeRestrictions,
    restrictionTypes,
    activeSuspension: data.suspensions.find((s) => s.memberId === memberId && s.active),
    activeBan: data.bans.find((b) => b.memberId === memberId && b.active),
  };
}

/** True if the member is currently blocked from `type` by an active restriction. */
export function isRestricted(
  memberId: string,
  type: RestrictionType,
  restrictions: Restriction[]
): boolean {
  return restrictions.some(
    (r) =>
      r.memberId === memberId &&
      r.active &&
      (r.types.includes(type) || r.types.includes("Read Only"))
  );
}
