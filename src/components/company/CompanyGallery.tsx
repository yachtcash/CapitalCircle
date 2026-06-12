"use client";

import Image from "next/image";
import { Images } from "lucide-react";
import type { Company, GalleryImage } from "@/data/companies";
import Lightbox, { useLightbox } from "@/components/common/Lightbox";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { useResolvedImages } from "@/lib/imageStore";

const categoryStyles: Record<GalleryImage["category"], string> = {
  Project: "bg-gold-500 text-navy-900",
  Office: "bg-white text-navy-900 ring-1 ring-navy-900/15",
  Facility: "bg-navy-900 text-gold-400",
  Team: "bg-emerald-500 text-white",
};

export default function CompanyGallery({ company }: { company: Company }) {
  // Live overlay-applied gallery so Media Manager edits show instantly;
  // idb:// tokens resolve to object URLs.
  const { getCompanyLive } = useMessaging();
  const gallery = (getCompanyLive(company.id) ?? company).gallery;
  const resolved = useResolvedImages(gallery.map((g) => g.src));
  const lb = useLightbox(
    gallery.map((g, i) => ({
      src: resolved[i] || g.src,
      alt: g.alt,
      caption: g.caption,
    }))
  );

  if (gallery.length === 0) return null;
  return (
    <section>
      <SectionHeader
        eyebrow="Gallery"
        title="Offices, projects, and facilities"
        meta={`${gallery.length} photos`}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {gallery.map((image, i) => (
          <button
            key={image.src + i}
            type="button"
            onClick={() => lb.openAt(i)}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-navy-900/5 ring-1 ring-navy-900/[0.06] group text-left"
            aria-label={`Open ${image.caption ?? image.alt} in gallery`}
          >
            {resolved[i] ? (
              <Image
                src={resolved[i]}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 bg-navy-900/[0.06] animate-pulse" />
            )}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy-900/85 to-transparent pointer-events-none" />
            <span
              className={`absolute top-3 left-3 inline-flex items-center text-[10px] uppercase tracking-[0.16em] font-bold rounded-full px-2.5 py-1 ${categoryStyles[image.category]}`}
            >
              {image.category}
            </span>
            {image.caption ? (
              <span className="absolute inset-x-3 bottom-3 text-white text-xs font-medium drop-shadow">
                {image.caption}
              </span>
            ) : null}
          </button>
        ))}
      </div>
      <Lightbox
        images={lb.images}
        initialIndex={lb.index}
        open={lb.open}
        onClose={lb.close}
      />
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  meta,
}: {
  eyebrow: string;
  title: string;
  meta?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
          <Images className="h-3.5 w-3.5" strokeWidth={2.2} />
          {eyebrow}
        </div>
        <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">
          {title}
        </h2>
      </div>
      {meta ? (
        <span className="text-xs uppercase tracking-[0.14em] text-navy-700/60 font-semibold">
          {meta}
        </span>
      ) : null}
    </div>
  );
}
