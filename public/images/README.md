# Image Storage Convention

Single source of truth for where images live and how they are referenced.
Everything image-shaped belongs under one of the four tiers below — no
loose files, no per-feature folders at the public root.

## Tier 1 — Local static files (`public/images/`)

The ONLY directory tree for content images shipped with the repo:

```
public/images/
  placeholders/                  # generic fallbacks (committed)
    opportunity.svg
    company.svg
  opportunities/                 # real local photos, when added
    OPP-000001/
      cover.jpg
      gallery/1.jpg … N.jpg
  companies/
    COMP-000001/
      logo.svg
      cover.jpg
      gallery/1.jpg … N.jpg
  members/
    USER-000001/
      avatar.jpg
      cover.jpg
  documents/
    DOC-000001/
      preview.jpg
```

Folder names are the public record ids (`OPP-`, `COMP-`, `USER-`,
`DOC-` + six digits). Path builders live in `src/lib/listings/id.ts`
(`listingCoverPath`, `listingGalleryPath`) and `src/lib/company/id.ts`
(`companyCoverPath`, `companyLogoPath`, `companyGalleryPath`) — always
build paths through them, never by hand.

Today no local content photos exist — every seed record resolves to
Tier 2 — but this tree is the contract for when they come back.

## Tier 2 — Seeded remote photos (Loremflickr)

All 46 seed opportunities and 26 seed companies resolve their images at
module load through `src/data/imageSets.ts` — topic-tagged, deterministic
(`?lock=N`) Flickr CC photo URLs. Nothing on disk; allowed hosts are
declared in `next.config.ts` (`loremflickr.com`, `live.staticflickr.com`).

## Tier 3 — User uploads (IndexedDB)

Files uploaded through the Gallery Manager or Create Listing wizard are
stored as blobs in the `cc-images` IndexedDB database and referenced
everywhere as `idb://img-<uuid>.<ext>` tokens (`src/lib/imageStore.ts`).
Components resolve tokens to object URLs at render time via
`useResolvedImage(s)`. Delete and replace free the underlying blob —
no orphaned storage records.

## Tier 4 — Profile images (data URLs)

Avatar and profile cover images are small data URLs persisted inside the
profile record (`cc:profile:v1` in localStorage), capped at 4 MB each.

## App branding (not content imagery)

`public/branding/` holds the master SVGs + large PNGs consumed by
`scripts/generate-icons.mjs` (favicon / apple-icon / OG are emitted into
`src/app/`). Keep it at the public root — the icon pipeline depends on it.
