"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Images, FileText, FileBadge, ArrowUpRight } from "lucide-react";

import type { Company } from "@/data/companies";
import Lightbox, { useLightbox } from "@/components/common/Lightbox";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { useResolvedImages } from "@/lib/imageStore";
import { useCompanyOpportunityProfile } from "@/lib/company/profile";

type DocRow = { name: string; type: string; pages: number; slug: string; oppTitle: string };

export default function CompanyMedia({ company }: { company: Company }) {
  const { getCompanyLive } = useMessaging();
  const gallery = (getCompanyLive(company.id) ?? company).gallery ?? [];
  const resolved = useResolvedImages(gallery.map((g) => g.src));
  const lb = useLightbox(
    gallery.map((g, i) => ({ src: resolved[i] || g.src, alt: g.alt, caption: g.caption }))
  );

  const { active } = useCompanyOpportunityProfile(company.id, 0);
  const documents = useMemo<DocRow[]>(() => {
    const rows: DocRow[] = [];
    const seen = new Set<string>();
    for (const o of active) {
      for (const d of o.documents ?? []) {
        const key = `${d.type}:${d.name}`;
        if (seen.has(key)) continue;
        seen.add(key);
        rows.push({ name: d.name, type: d.type, pages: d.pages, slug: o.slug, oppTitle: o.title });
      }
    }
    return rows.slice(0, 6);
  }, [active]);

  if (gallery.length === 0 && documents.length === 0) return null;

  const lead = gallery[0];
  const thumbs = gallery.slice(1, 5);
  const extra = Math.max(0, gallery.length - 5);

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
            <Images className="h-3.5 w-3.5" strokeWidth={2.2} />
            Media &amp; Materials
          </div>
          <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">
            Inside {company.name}
          </h2>
        </div>
        {gallery.length > 0 ? (
          <span className="text-xs uppercase tracking-[0.14em] text-navy-700/60 font-semibold">
            {gallery.length} photos
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_minmax(0,1fr)] gap-4 md:gap-5">
        {/* Gallery — lead image + thumbnail strip */}
        {gallery.length > 0 ? (
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => lb.openAt(0)}
              className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-navy-900/5 ring-1 ring-navy-900/[0.06] group text-left"
              aria-label={`Open ${lead.caption ?? lead.alt}`}
            >
              {resolved[0] ? (
                <Image
                  src={resolved[0]}
                  alt={lead.alt}
                  fill
                  sizes="(min-width: 1024px) 640px, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 bg-navy-900/[0.06] animate-pulse" />
              )}
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-navy-900/85 to-transparent pointer-events-none" />
              <span className="absolute top-3 left-3 inline-flex items-center text-[10px] uppercase tracking-[0.16em] font-bold rounded-full px-2.5 py-1 bg-gold-500 text-navy-900">
                {lead.category}
              </span>
              {lead.caption ? (
                <span className="absolute inset-x-4 bottom-3 text-white text-sm font-medium drop-shadow">{lead.caption}</span>
              ) : null}
            </button>

            {thumbs.length > 0 ? (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {thumbs.map((image, idx) => {
                  const i = idx + 1;
                  const isLast = idx === thumbs.length - 1 && extra > 0;
                  return (
                    <button
                      key={image.src + i}
                      type="button"
                      onClick={() => lb.openAt(i)}
                      className="relative aspect-square rounded-xl overflow-hidden bg-navy-900/5 ring-1 ring-navy-900/[0.06] group text-left"
                      aria-label={`Open ${image.caption ?? image.alt}`}
                    >
                      {resolved[i] ? (
                        <Image
                          src={resolved[i]}
                          alt={image.alt}
                          fill
                          sizes="160px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 bg-navy-900/[0.06] animate-pulse" />
                      )}
                      {isLast ? (
                        <span className="absolute inset-0 bg-navy-900/70 flex items-center justify-center text-white text-sm font-semibold">
                          +{extra}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : null}

            <Lightbox images={lb.images} initialIndex={lb.index} open={lb.open} onClose={lb.close} />
          </div>
        ) : null}

        {/* Documents & decks — aggregated from this sponsor's listings */}
        <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5">
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-navy-700/55 font-bold">
            <FileBadge className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
            Documents &amp; Decks
          </div>
          {documents.length > 0 ? (
            <ul className="mt-3 divide-y divide-navy-900/[0.06]">
              {documents.map((d) => (
                <li key={`${d.type}:${d.name}`}>
                  <Link
                    href={`/opportunity/${d.slug}`}
                    className="group flex items-center gap-3 py-3 first:pt-0"
                  >
                    <div className="h-9 w-9 rounded-lg bg-navy-900/[0.04] ring-1 ring-navy-900/[0.06] inline-flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-gold-600" strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-navy-900 leading-snug truncate group-hover:text-gold-700 transition-colors">
                        {d.name}
                      </div>
                      <div className="text-[11px] text-navy-700/55">
                        {d.type} · {d.pages} pages · {d.oppTitle}
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-navy-700/30 group-hover:text-gold-600 transition-colors shrink-0" strokeWidth={2.2} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-navy-700/60 leading-relaxed">
              Detailed materials — pitch decks, financial models, and project overviews — are shared
              through each opportunity&apos;s data room on request.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
