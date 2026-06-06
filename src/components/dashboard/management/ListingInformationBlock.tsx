import Image from "next/image";
import {
  Tag,
  Briefcase,
  Activity as ActivityIcon,
  MapPin,
  DollarSign,
  TrendingUp,
  User,
  Hash,
} from "lucide-react";

import type { ListingRecord, ListingStatus } from "@/data/listings";
import type { Opportunity } from "@/data/opportunities";
import { cn } from "@/lib/cn";

const statusStyles: Record<ListingStatus, string> = {
  Draft: "bg-navy-900/10 text-navy-700 ring-navy-900/15",
  Active: "bg-emerald-500 text-white ring-emerald-500/30",
  "Seeking Capital": "bg-gold-500 text-navy-900 ring-gold-500/30",
  Negotiating: "bg-amber-500 text-white ring-amber-500/30",
  "Under Review": "bg-sky-500 text-white ring-sky-500/30",
  Closed: "bg-rose-500 text-white ring-rose-500/30",
  Archived: "bg-navy-900 text-gold-400 ring-navy-900/30",
};

type Props = {
  listing: ListingRecord;
  opportunity?: Opportunity;
};

function formatLocation(opp?: Opportunity): string {
  if (!opp) return "—";
  const parts = [opp.place?.city, opp.place?.state, opp.place?.country].filter(
    (s): s is string => Boolean(s && s.trim())
  );
  return parts.join(", ") || opp.location || "—";
}

export default function ListingInformationBlock({ listing, opportunity }: Props) {
  const coverImage = opportunity?.images?.[0];

  const fields: { label: string; value: string; Icon: typeof Tag }[] = [
    { label: "Listing ID", value: listing.id, Icon: Hash },
    { label: "Category", value: listing.category ?? "—", Icon: Tag },
    { label: "Deal type", value: listing.dealType ?? "—", Icon: Briefcase },
    { label: "Location", value: formatLocation(opportunity), Icon: MapPin },
    {
      label: "Investment range",
      value: opportunity?.investmentRange ?? "—",
      Icon: DollarSign,
    },
    {
      label: "Expected return",
      value: opportunity?.expectedReturn ?? "—",
      Icon: TrendingUp,
    },
    {
      label: "Posted by",
      value: opportunity?.postedBy ?? "—",
      Icon: User,
    },
    {
      label: "Status",
      value: listing.status,
      Icon: ActivityIcon,
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <SectionHeader eyebrow="Overview" title="Listing Information" />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 md:gap-8 items-start">
        {/* Cover image + title */}
        <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] overflow-hidden">
          <div className="relative aspect-[16/9] bg-navy-900/5">
            {coverImage ? (
              <Image
                src={coverImage}
                alt={listing.title}
                fill
                sizes="(min-width: 1024px) 600px, 100vw"
                className="object-cover"
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center text-white/70 text-sm"
                style={{
                  background:
                    "linear-gradient(135deg, rgb(15,23,42) 0%, rgb(30,41,59) 100%)",
                }}
              >
                No cover photo
              </div>
            )}
          </div>
          <div className="p-5 md:p-6">
            <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
              {listing.category ?? "Listing"}
            </div>
            <h3 className="mt-1.5 text-lg md:text-xl font-semibold text-navy-900 tracking-tight">
              {listing.title}
            </h3>
            {opportunity?.executiveSummary ? (
              <p className="mt-3 text-sm text-navy-700/75 leading-relaxed line-clamp-4">
                {opportunity.executiveSummary}
              </p>
            ) : null}
          </div>
        </div>

        {/* Key fields */}
        <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-6">
          <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
            Key info
          </div>
          <h3 className="mt-1.5 text-base md:text-lg font-semibold text-navy-900 tracking-tight">
            Quick reference
          </h3>

          <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
            {fields.map(({ label, value, Icon }) => (
              <div key={label} className="min-w-0">
                <dt className="text-[10px] uppercase tracking-[0.16em] text-navy-700/60 font-semibold inline-flex items-center gap-1.5">
                  <Icon className="h-3 w-3 text-gold-600" strokeWidth={2.4} />
                  {label}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-navy-900 truncate">
                  {label === "Status" ? (
                    <span
                      className={cn(
                        "inline-flex items-center text-[10px] uppercase tracking-[0.18em] font-bold rounded-full px-2.5 py-1 ring-1",
                        statusStyles[listing.status]
                      )}
                    >
                      {listing.status}
                    </span>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
        {eyebrow}
      </div>
      <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">
        {title}
      </h2>
    </div>
  );
}
