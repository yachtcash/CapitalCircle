import Link from "next/link";
import { Pencil, X } from "lucide-react";

import CreateListingClient from "./CreateListingClient";

type SearchParams = { listingId?: string };

export default async function CreateListingPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { listingId } = await searchParams;
  const editingId = typeof listingId === "string" ? listingId : undefined;

  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)] flex flex-col">
      {editingId ? <EditingBanner listingId={editingId} /> : null}
      <CreateListingClient initialListingId={editingId} />
    </div>
  );
}

function EditingBanner({ listingId }: { listingId: string }) {
  return (
    <div className="bg-gold-500/15 ring-1 ring-gold-500/40 border-b border-gold-500/30">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-500 text-navy-900 ring-1 ring-gold-700/20">
            <Pencil className="h-3.5 w-3.5" strokeWidth={2.4} />
          </span>
          <div className="text-sm text-navy-900 leading-snug">
            <span className="font-semibold">{`Editing ${listingId}`}</span>
            <span className="text-navy-900/70">
              {" — changes save locally as a draft."}
            </span>
          </div>
        </div>
        <Link
          href="/create-listing"
          className="inline-flex items-center gap-1.5 rounded-full bg-white/80 hover:bg-white ring-1 ring-navy-900/10 text-navy-900 font-semibold px-3 py-1.5 text-xs transition-colors"
        >
          <X className="h-3 w-3" strokeWidth={2.6} />
          Cancel edit
        </Link>
      </div>
    </div>
  );
}
