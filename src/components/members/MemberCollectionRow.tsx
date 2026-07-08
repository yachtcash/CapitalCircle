import MemberCard from "./MemberCard";
import type { MemberDirectoryCollection } from "@/data/members/collections";
import { getCollectionMembers } from "@/data/members/collections";

type Props = {
  collection: MemberDirectoryCollection;
};

/**
 * Horizontal member discovery rail — mirrors the opportunity/company
 * CollectionRow pattern and reuses the existing MemberCard. (No "View all"
 * link: the member grid below is filtered client-side, not by URL.)
 */
export default function MemberCollectionRow({ collection }: Props) {
  const items = getCollectionMembers(collection);
  if (items.length === 0) return null;

  return (
    <section className="bg-cream">
      <div className="max-w-7xl mx-auto px-5 md:px-10 pt-6 md:pt-8 pb-2">
        <header className="mb-3">
          <h3 className="text-lg md:text-xl font-semibold text-navy-900 tracking-tight">
            {collection.title}
            <span className="ml-2 text-xs font-normal text-navy-700/55">
              · {items.length}
            </span>
          </h3>
          <p className="mt-0.5 text-sm text-navy-700/65">{collection.description}</p>
        </header>

        <div className="-mx-5 md:-mx-10 px-5 md:px-10 overflow-x-auto snap-x snap-mandatory pb-3">
          <div className="flex gap-4 md:gap-5">
            {items.map((member) => (
              <div
                key={member.id}
                className="snap-start shrink-0 w-[280px] sm:w-[320px] md:w-[360px]"
              >
                <MemberCard member={member} />
              </div>
            ))}
            <div className="shrink-0 w-1" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
