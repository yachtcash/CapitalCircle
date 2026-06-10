export * from "./types";
export { MEMBERS } from "./seed";

import { MEMBERS } from "./seed";
import type { Member, MemberType } from "./types";

export function getMemberBySlug(slug: string): Member | undefined {
  return MEMBERS.find((m) => m.slug === slug);
}

export function getMemberById(id: string): Member | undefined {
  return MEMBERS.find((m) => m.id === id);
}

export function getFeaturedMembers(limit = 6): Member[] {
  return MEMBERS.filter((m) => m.featured).slice(0, limit);
}

export function getTrendingMembers(limit = 6): Member[] {
  return MEMBERS.filter((m) => m.trending).slice(0, limit);
}

export const MEMBER_TYPES: MemberType[] = [
  "Investor",
  "Developer",
  "Sponsor",
  "Broker",
  "Service Provider",
  "Supplier",
  "Consultant",
  "Contractor",
  "Manufacturer",
  "Attorney",
  "Accountant",
  "Lender",
  "Architect",
  "Engineer",
  "Property Owner",
  "Operator",
  "General Member",
];
