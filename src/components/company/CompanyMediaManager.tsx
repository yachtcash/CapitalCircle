"use client";

import { Images } from "lucide-react";
import type { Company, GalleryImage } from "@/data/companies";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { canManageCompanies } from "@/lib/roles";
import MediaGalleryManager from "@/components/media/MediaGalleryManager";
import SingleImageManager from "@/components/media/SingleImageManager";

/** The signed-in member's own company (matches createListing's mapping). */
const OWN_COMPANY_ID = "COMP-000001";

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Company Media Manager — visible management section on the company
 * profile. Owner (your own company) plus Admin / Super Admin see it on
 * every company. Logo, cover, and the full gallery all persist through
 * the provider's company media overlay — the same IndexedDB + token +
 * localStorage architecture as the verified Opportunity Gallery Manager.
 */
export default function CompanyMediaManager({ company }: { company: Company }) {
  const { getCompanyLive, updateCompanyMedia, recordAudit, currentRole } =
    useMessaging();

  const canManage =
    canManageCompanies(currentRole) || company.id === OWN_COMPANY_ID;
  if (!canManage) return null;

  const live = getCompanyLive(company.id) ?? company;

  // The shared gallery works on plain src lists; map back to GalleryImage[]
  // preserving alt/category/caption for srcs that survive the edit and
  // defaulting new uploads to the Project category.
  const gallerySrcs = live.gallery.map((g) => g.src);
  const persistGallery = (next: string[]) => {
    const bySrc = new Map(live.gallery.map((g) => [g.src, g]));
    const nextGallery: GalleryImage[] = next.map((src, i) => {
      const existing = bySrc.get(src);
      if (existing) return existing;
      return {
        src,
        alt: `${live.name} — photo ${i + 1}`,
        category: "Project",
      };
    });
    updateCompanyMedia(company.id, { gallery: nextGallery });
  };

  return (
    <section
      id="company-media-manager"
      className="scroll-mt-24 rounded-3xl bg-white ring-2 ring-gold-500/40 shadow-sm p-5 md:p-7 space-y-5"
    >
      <header>
        <div className="text-[11px] uppercase tracking-[0.22em] text-gold-700 font-bold inline-flex items-center gap-1.5">
          <Images className="h-3.5 w-3.5" strokeWidth={2.4} />
          Company Media Manager
        </div>
        <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">
          Manage Company Gallery
        </h2>
        <p className="mt-1 text-xs text-navy-700/65 max-w-xl leading-relaxed">
          Replace the logo, swap the cover, and curate the gallery. Changes
          save automatically and appear across the profile, the company
          directory, and every preview immediately.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SingleImageManager
          label="Company Logo"
          value={live.logo}
          shape="square"
          fallbackText={initialsFor(live.name)}
          removable
          onChange={(next) => {
            updateCompanyMedia(company.id, { logo: next });
            recordAudit(
              "Company Logo Changed",
              { kind: "company", id: company.id, label: live.name },
              next ? "Logo replaced" : "Logo removed"
            );
          }}
        />
        <SingleImageManager
          label="Cover Image"
          value={live.coverImage}
          shape="wide"
          onChange={(next) => {
            // Cover is required on the Company model — ignore removals.
            if (!next) return;
            updateCompanyMedia(company.id, { coverImage: next });
            recordAudit(
              "Company Cover Changed",
              { kind: "company", id: company.id, label: live.name },
              "Cover image replaced"
            );
          }}
        />
      </div>

      <MediaGalleryManager
        images={gallerySrcs}
        title={live.name}
        eyebrow="Company Gallery Manager"
        onPersist={persistGallery}
        auditTarget={{ kind: "company", id: company.id }}
        auditActions={{
          uploaded: "Company Image Uploaded",
          replaced: "Company Image Replaced",
          deleted: "Company Image Deleted",
          reordered: "Company Gallery Reordered",
          cleared: "Company Gallery Cleared",
          coverChanged: "Company Cover Changed",
        }}
      />
    </section>
  );
}
