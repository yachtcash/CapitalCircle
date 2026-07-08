// Curated discovery rails for the /members directory — presentation-layer
// selection over the existing MEMBERS dataset. Mirrors the opportunity and
// company collection configs: predicate + optional sort + sparse-hide.

import { MEMBERS } from "@/data/members";
import type { Member } from "@/data/members";

export type MemberCollectionPredicate = (member: Member) => boolean;

export type MemberDirectoryCollection = {
  slug: string;
  title: string;
  description: string;
  predicate: MemberCollectionPredicate;
  fallbackPredicate?: MemberCollectionPredicate;
  sort?: (a: Member, b: Member) => number;
  /** Rails hide below this size so sparse themes never render as a lonely card. */
  minCount?: number;
};

const byNewest = (a: Member, b: Member) =>
  (b.joinedAt || "").localeCompare(a.joinedAt || "");

export const MEMBER_COLLECTIONS: MemberDirectoryCollection[] = [
  {
    slug: "featured-members",
    title: "Featured Members",
    description: "Profiles curated by the Capital Circle desk.",
    predicate: (m) => m.featured,
    sort: byNewest,
    minCount: 2,
  },
  {
    slug: "sponsors",
    title: "Sponsors & Operators",
    description: "Deal sponsors, developers, and operating partners.",
    predicate: (m) =>
      m.memberType === "Sponsor" ||
      m.memberType === "Developer" ||
      m.memberType === "Operator",
    sort: (a, b) => b.listingsCount - a.listingsCount,
    minCount: 2,
  },
  {
    slug: "investors",
    title: "Investors & Lenders",
    description: "Capital allocators across equity and credit.",
    predicate: (m) => m.memberType === "Investor" || m.memberType === "Lender",
    sort: byNewest,
    minCount: 2,
  },
  {
    slug: "brokers",
    title: "Brokers & Advisors",
    description: "Intermediaries and transaction advisors.",
    predicate: (m) =>
      m.memberType === "Broker" ||
      m.memberType === "Consultant" ||
      m.memberType === "Attorney",
    sort: byNewest,
    minCount: 2,
  },
  {
    slug: "recently-joined",
    title: "Recently Joined",
    description: "The newest members of the network.",
    predicate: () => true,
    sort: byNewest,
  },
  {
    slug: "most-active",
    title: "Most Active",
    description: "Members with the most live listings and mandates.",
    predicate: (m) => m.trending || m.listingsCount > 0,
    sort: (a, b) =>
      Number(b.trending) - Number(a.trending) || b.listingsCount - a.listingsCount,
    minCount: 2,
  },
];

/** Max cards per rail — the grid below carries the full set. */
const RAIL_LIMIT = 10;

export function getCollectionMembers(
  collection: MemberDirectoryCollection,
  pool: Member[] = MEMBERS
): Member[] {
  let items = pool.filter(collection.predicate);
  if (items.length === 0 && collection.fallbackPredicate) {
    items = pool.filter(collection.fallbackPredicate);
  }
  if (items.length < (collection.minCount ?? 1)) return [];
  if (collection.sort) items = [...items].sort(collection.sort);
  return items.slice(0, RAIL_LIMIT);
}
