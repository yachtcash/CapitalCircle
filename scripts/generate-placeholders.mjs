// Generate brand-palette SVG placeholders for opportunities + companies.
//
// Image organization (per Capital Circle brief):
//   public/opportunities/OPP-XXXXXX/{1..N}.svg
//   public/companies/COMP-XXXXXX/cover.svg
//   public/companies/COMP-XXXXXX/logo.svg
//   public/companies/COMP-XXXXXX/gallery/{1..3}.svg
//
// Each placeholder is a self-contained 1600x900 (or 600x600 for logos) SVG
// with a category-keyed gradient, subtle grid, slide counter, and category
// label. The look matches the rest of the platform — no third-party assets.

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, "..");

// ---- Brand palette by category ---------------------------------------------

const PALETTES = {
  hotels: { from: "#0A1628", to: "#1A3160", accent: "#D4AF37", icon: "M" },
  realEstate: { from: "#112344", to: "#294378", accent: "#D4AF37", icon: "▲" },
  land: { from: "#1A3160", to: "#4B6CA8", accent: "#E8CB73", icon: "◯" },
  construction: { from: "#0A1628", to: "#8C6F14", accent: "#D4AF37", icon: "✦" },
  investment: { from: "#112344", to: "#0A1628", accent: "#D4AF37", icon: "$" },
  manufacturing: { from: "#1A3160", to: "#0A1628", accent: "#E8CB73", icon: "⚙" },
  infrastructure: { from: "#294378", to: "#112344", accent: "#D4AF37", icon: "═" },
  energy: { from: "#B8941F", to: "#0A1628", accent: "#FFD75E", icon: "☼" },
  hospitality: { from: "#0A1628", to: "#1A3160", accent: "#D4AF37", icon: "✦" },
  commercial: { from: "#112344", to: "#294378", accent: "#D4AF37", icon: "▭" },
  acquisitions: { from: "#1A3160", to: "#112344", accent: "#E8CB73", icon: "✓" },
  jointVentures: { from: "#0A1628", to: "#4B6CA8", accent: "#D4AF37", icon: "⋈" },
  suppliers: { from: "#294378", to: "#0A1628", accent: "#D4AF37", icon: "▦" },
  company: { from: "#0A1628", to: "#1A3160", accent: "#D4AF37", icon: "" },
};

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function makeOppSvg({ paletteKey, label, slide, total, oppId }) {
  const p = PALETTES[paletteKey] ?? PALETTES.hotels;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(label)} placeholder ${slide} of ${total}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p.from}"/>
      <stop offset="100%" stop-color="${p.to}"/>
    </linearGradient>
    <radialGradient id="halo" cx="0.85" cy="0.15" r="0.7">
      <stop offset="0%" stop-color="${p.accent}" stop-opacity="0.45"/>
      <stop offset="60%" stop-color="${p.accent}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="halo2" cx="0.15" cy="0.95" r="0.6">
      <stop offset="0%" stop-color="${p.accent}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${p.accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
      <path d="M80 0 L0 0 0 80" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1600" height="900" fill="url(#bg)"/>
  <rect width="1600" height="900" fill="url(#grid)"/>
  <rect width="1600" height="900" fill="url(#halo)"/>
  <rect width="1600" height="900" fill="url(#halo2)"/>
  <g opacity="0.10" fill="${p.accent}">
    <text x="50%" y="50%" font-family="Inter, system-ui, sans-serif" font-size="640" font-weight="700" text-anchor="middle" dominant-baseline="middle">${esc(p.icon)}</text>
  </g>
  <g font-family="Inter, system-ui, sans-serif" fill="#FFFFFF">
    <text x="80" y="120" font-size="22" font-weight="700" letter-spacing="6" opacity="0.85">${esc(oppId.toUpperCase())}</text>
    <text x="80" y="780" font-size="56" font-weight="700" letter-spacing="-1">${esc(label)}</text>
    <text x="80" y="830" font-size="22" font-weight="600" opacity="0.7" letter-spacing="4">CAPITAL CIRCLE · ${esc(paletteKey.toUpperCase())}</text>
  </g>
  <g transform="translate(1420, 80)">
    <rect width="100" height="40" rx="20" fill="rgba(0,0,0,0.35)" stroke="${p.accent}" stroke-width="1.5"/>
    <text x="50" y="26" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="700" fill="#FFFFFF" text-anchor="middle">${slide} / ${total}</text>
  </g>
</svg>`;
}

function makeCompanyCoverSvg({ paletteKey, name, compId }) {
  const p = PALETTES[paletteKey] ?? PALETTES.company;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(name)} cover">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0.4">
      <stop offset="0%" stop-color="${p.from}"/>
      <stop offset="100%" stop-color="${p.to}"/>
    </linearGradient>
    <radialGradient id="halo" cx="0.85" cy="0.15" r="0.7">
      <stop offset="0%" stop-color="${p.accent}" stop-opacity="0.40"/>
      <stop offset="100%" stop-color="${p.accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
      <path d="M80 0 L0 0 0 80" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1600" height="600" fill="url(#bg)"/>
  <rect width="1600" height="600" fill="url(#grid)"/>
  <rect width="1600" height="600" fill="url(#halo)"/>
  <g font-family="Inter, system-ui, sans-serif" fill="#FFFFFF">
    <text x="80" y="120" font-size="22" font-weight="700" letter-spacing="6" opacity="0.85">${esc(compId)}</text>
    <text x="80" y="500" font-size="64" font-weight="700" letter-spacing="-1">${esc(name)}</text>
  </g>
</svg>`;
}

function makeCompanyLogoSvg({ paletteKey, initials }) {
  const p = PALETTES[paletteKey] ?? PALETTES.company;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" role="img" aria-label="${esc(initials)} logo">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p.from}"/>
      <stop offset="100%" stop-color="${p.to}"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" rx="80" fill="url(#bg)"/>
  <text x="300" y="335" font-family="Inter, system-ui, sans-serif" font-size="260" font-weight="700" fill="${p.accent}" text-anchor="middle">${esc(initials)}</text>
</svg>`;
}

function makeCompanyGallerySvg({ paletteKey, caption, idx, compId }) {
  const p = PALETTES[paletteKey] ?? PALETTES.company;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(caption)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p.from}"/>
      <stop offset="100%" stop-color="${p.to}"/>
    </linearGradient>
    <radialGradient id="halo" cx="0.85" cy="0.2" r="0.7">
      <stop offset="0%" stop-color="${p.accent}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${p.accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M60 0 L0 0 0 60" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)"/>
  <rect width="1200" height="800" fill="url(#grid)"/>
  <rect width="1200" height="800" fill="url(#halo)"/>
  <g font-family="Inter, system-ui, sans-serif" fill="#FFFFFF">
    <text x="60" y="100" font-size="18" font-weight="700" letter-spacing="5" opacity="0.75">${esc(compId)} · GALLERY ${idx}</text>
    <text x="60" y="700" font-size="40" font-weight="700" letter-spacing="-0.5">${esc(caption)}</text>
  </g>
</svg>`;
}

// ---- Data --------------------------------------------------------------------

// Opportunity placeholders: (oppId, label, paletteKey, total slides)
// Existing OPP-000001..OPP-000006 already have real JPEGs under
// public/listings/<slug>/ — DO NOT overwrite. Generate from OPP-000007 onward.
const OPPORTUNITY_PLACEHOLDERS = [
  // Hotels & Resorts
  { id: "OPP-000007", label: "Pacific Bluff Resort Development", paletteKey: "hotels", slides: 5 },
  { id: "OPP-000008", label: "Riviera Marina Hotel — 96 Keys", paletteKey: "hotels", slides: 5 },
  { id: "OPP-000009", label: "Mountain Pine Golf Resort", paletteKey: "hotels", slides: 5 },
  { id: "OPP-000010", label: "Costa Brava Boutique Inn", paletteKey: "hotels", slides: 4 },
  // Land Opportunities
  { id: "OPP-000011", label: "Oceanfront Parcel — 142 Acres", paletteKey: "land", slides: 5 },
  { id: "OPP-000012", label: "Highway Frontage Commercial Land", paletteKey: "land", slides: 4 },
  { id: "OPP-000013", label: "Industrial Park Land — 64 Acres", paletteKey: "land", slides: 4 },
  { id: "OPP-000014", label: "Master-Planned Development Land", paletteKey: "land", slides: 5 },
  // Real Estate Development
  { id: "OPP-000015", label: "Wynwood Mixed-Use Development", paletteKey: "realEstate", slides: 5 },
  { id: "OPP-000016", label: "Brickell Office Conversion", paletteKey: "realEstate", slides: 4 },
  // Construction Projects
  { id: "OPP-000017", label: "GMP Hospital Expansion", paletteKey: "construction", slides: 5 },
  { id: "OPP-000018", label: "Bridge Replacement Project", paletteKey: "construction", slides: 4 },
  // Manufacturing & Materials
  { id: "OPP-000019", label: "Tiny Home Factory — 80 Units/Yr", paletteKey: "manufacturing", slides: 5 },
  { id: "OPP-000020", label: "Modular Home Production Line", paletteKey: "manufacturing", slides: 4 },
  { id: "OPP-000021", label: "Container Home Manufacturer", paletteKey: "manufacturing", slides: 4 },
  // Infrastructure
  { id: "OPP-000022", label: "Highway Expansion — 38 km", paletteKey: "infrastructure", slides: 5 },
  { id: "OPP-000023", label: "Port Terminal Development", paletteKey: "infrastructure", slides: 5 },
  { id: "OPP-000024", label: "Regional Airport Improvement", paletteKey: "infrastructure", slides: 4 },
  // Energy
  { id: "OPP-000025", label: "Solar Farm — 80 MW", paletteKey: "energy", slides: 5 },
  { id: "OPP-000026", label: "Battery Storage Portfolio", paletteKey: "energy", slides: 4 },
  { id: "OPP-000027", label: "Wind Project — 120 MW", paletteKey: "energy", slides: 5 },
  // Suppliers & Logistics
  { id: "OPP-000028", label: "Marble Supplier — Carrara Direct", paletteKey: "suppliers", slides: 5 },
  { id: "OPP-000029", label: "Granite Supplier — Brazilian Slabs", paletteKey: "suppliers", slides: 4 },
  { id: "OPP-000030", label: "Steel Rebar Supplier — North America", paletteKey: "suppliers", slides: 4 },
  { id: "OPP-000031", label: "Lumber Supplier — Pacific Northwest", paletteKey: "suppliers", slides: 4 },
  { id: "OPP-000032", label: "Construction Equipment — Fleet Lease", paletteKey: "suppliers", slides: 4 },
  // Hospitality (operations)
  { id: "OPP-000033", label: "Branded F&B Operator — Expansion", paletteKey: "hospitality", slides: 4 },
  { id: "OPP-000034", label: "Spa Operator — Premium License", paletteKey: "hospitality", slides: 4 },
  // Commercial Services
  { id: "OPP-000035", label: "Property Management Platform", paletteKey: "commercial", slides: 4 },
  { id: "OPP-000036", label: "Construction Software License", paletteKey: "commercial", slides: 4 },
  // Investment Opportunities
  { id: "OPP-000037", label: "Hospitality Debt Fund — Series II", paletteKey: "investment", slides: 4 },
  { id: "OPP-000038", label: "Industrial Real Estate Fund", paletteKey: "investment", slides: 4 },
  // Business Acquisitions
  { id: "OPP-000039", label: "Roofing Contractor — Founder Exit", paletteKey: "acquisitions", slides: 4 },
  { id: "OPP-000040", label: "Hospitality Linen Services Co.", paletteKey: "acquisitions", slides: 4 },
  // Joint Ventures
  { id: "OPP-000041", label: "Coastal Wellness Brand JV", paletteKey: "jointVentures", slides: 5 },
  { id: "OPP-000042", label: "Latin America Energy JV", paletteKey: "jointVentures", slides: 4 },
  // Extras to round out coverage
  { id: "OPP-000043", label: "Sustainable Concrete Manufacturer", paletteKey: "manufacturing", slides: 4 },
  { id: "OPP-000044", label: "Regional Cold Chain Logistics", paletteKey: "suppliers", slides: 4 },
  { id: "OPP-000045", label: "Coastal Wind + Storage Hybrid", paletteKey: "energy", slides: 5 },
  { id: "OPP-000046", label: "Glamping Resort Development", paletteKey: "hotels", slides: 5 },
];

const COMPANY_PLACEHOLDERS = [
  // COMP-000007 onward — existing 1..6 keep real photos
  { id: "COMP-000007", name: "Cordillera Construction Group", initials: "CC", paletteKey: "construction", gallery: ["Hospital expansion site", "Tower crane lift", "Quality inspection"] },
  { id: "COMP-000008", name: "Northstar Manufacturing Co.", initials: "NS", paletteKey: "manufacturing", gallery: ["Assembly line", "Factory floor", "QA station"] },
  { id: "COMP-000009", name: "Pacific Wind & Solar", initials: "PW", paletteKey: "energy", gallery: ["Wind farm overview", "Solar array", "Substation"] },
  { id: "COMP-000010", name: "Atlas Engineering Partners", initials: "AE", paletteKey: "infrastructure", gallery: ["Bridge survey", "Highway alignment", "Site control"] },
  { id: "COMP-000011", name: "Verde Stone & Marble", initials: "VS", paletteKey: "suppliers", gallery: ["Carrara quarry", "Slab warehouse", "Finished panels"] },
  { id: "COMP-000012", name: "Heartland Steel Supply", initials: "HS", paletteKey: "suppliers", gallery: ["Rebar yard", "Coil rack", "Distribution truck"] },
  { id: "COMP-000013", name: "Cascadia Lumber Co.", initials: "CL", paletteKey: "suppliers", gallery: ["Mill operations", "Drying yard", "Outbound truck"] },
  { id: "COMP-000014", name: "Modular North Builders", initials: "MN", paletteKey: "manufacturing", gallery: ["Module assembly", "Finishing bay", "Truck loading"] },
  { id: "COMP-000015", name: "Caldera Hospitality Group", initials: "CH", paletteKey: "hospitality", gallery: ["Brand lobby", "Spa suite", "F&B service"] },
  { id: "COMP-000016", name: "Meridian Investment Partners", initials: "MI", paletteKey: "investment", gallery: ["Investment review", "Trading floor", "Portfolio meeting"] },
  { id: "COMP-000017", name: "Cobalt Logistics Holdings", initials: "CL", paletteKey: "suppliers", gallery: ["Cold chain depot", "Fleet bay", "Sorting hub"] },
  { id: "COMP-000018", name: "Sunrise Land Holdings", initials: "SL", paletteKey: "land", gallery: ["Aerial parcel", "Boundary survey", "Site visit"] },
  { id: "COMP-000019", name: "Vanguard Property Management", initials: "VP", paletteKey: "commercial", gallery: ["Operations center", "Tenant lobby", "Maintenance hub"] },
  { id: "COMP-000020", name: "Skyline Tower Developers", initials: "ST", paletteKey: "realEstate", gallery: ["Construction site", "Sales gallery", "Tower elevation"] },
  { id: "COMP-000021", name: "Halcyon Resort Group", initials: "HR", paletteKey: "hotels", gallery: ["Resort pool", "Reception lobby", "Beach cabana"] },
  { id: "COMP-000022", name: "Iron Forge Equipment Rental", initials: "IF", paletteKey: "suppliers", gallery: ["Equipment yard", "Excavator detail", "Fleet inventory"] },
  { id: "COMP-000023", name: "Lighthouse Engineering Consultants", initials: "LE", paletteKey: "infrastructure", gallery: ["Drafting room", "Site survey", "Lab analysis"] },
  { id: "COMP-000024", name: "Borealis Renewables", initials: "BR", paletteKey: "energy", gallery: ["Battery container", "Inverter detail", "Grid tie-in"] },
  { id: "COMP-000025", name: "Continental Hospitality Holdings", initials: "CH", paletteKey: "hospitality", gallery: ["Hotel ballroom", "Lobby bar", "Suite living"] },
  { id: "COMP-000026", name: "Western Cement & Aggregates", initials: "WC", paletteKey: "manufacturing", gallery: ["Cement plant", "Aggregate pile", "Loader at work"] },
];

// ---- IO ----------------------------------------------------------------------

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

async function writeIfMissing(path, content) {
  // Always overwrite — the script is idempotent and the placeholders are deterministic.
  await ensureDir(dirname(path));
  await writeFile(path, content, "utf8");
}

async function main() {
  let written = 0;

  for (const opp of OPPORTUNITY_PLACEHOLDERS) {
    const folder = join(ROOT, "public", "opportunities", opp.id);
    for (let i = 1; i <= opp.slides; i++) {
      const svg = makeOppSvg({
        paletteKey: opp.paletteKey,
        label: opp.label,
        slide: i,
        total: opp.slides,
        oppId: opp.id,
      });
      await writeIfMissing(join(folder, `${i}.svg`), svg);
      written++;
    }
  }

  for (const c of COMPANY_PLACEHOLDERS) {
    const folder = join(ROOT, "public", "companies", c.id);
    await writeIfMissing(
      join(folder, "cover.svg"),
      makeCompanyCoverSvg({ paletteKey: c.paletteKey, name: c.name, compId: c.id })
    );
    await writeIfMissing(
      join(folder, "logo.svg"),
      makeCompanyLogoSvg({ paletteKey: c.paletteKey, initials: c.initials })
    );
    for (let i = 0; i < c.gallery.length; i++) {
      await writeIfMissing(
        join(folder, "gallery", `${i + 1}.svg`),
        makeCompanyGallerySvg({
          paletteKey: c.paletteKey,
          caption: c.gallery[i],
          idx: i + 1,
          compId: c.id,
        })
      );
    }
    written += 2 + c.gallery.length;
  }

  console.log(`Wrote ${written} placeholder SVGs.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
