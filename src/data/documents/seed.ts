import type {
  AccessRequest,
  DataRoomDocument,
  DocumentActivity,
} from "./types";

// All seed timestamps anchored to 2026-06-06T12:00:00.000Z — deterministic.
const ANCHOR = new Date("2026-06-06T12:00:00.000Z").getTime();

function isoAt(daysAgo: number, hoursAgo: number = 0): string {
  const ms = ANCHOR - daysAgo * 86_400_000 - hoursAgo * 3_600_000;
  return new Date(ms).toISOString();
}

// Helper: bytes from MB/KB shorthand
const MB = (n: number) => Math.round(n * 1024 * 1024);
const KB = (n: number) => Math.round(n * 1024);

export const SEED_DOCUMENTS: DataRoomDocument[] = [
  // ============== LST-000001 — Beachfront Boutique Hotel (8 docs)
  { id: "DOC-000001", listingId: "LST-000001", name: "Project Overview — Médano Beach.pdf", fileType: "pdf", category: "Project Overview", visibility: "Public", sizeBytes: MB(2.4), pages: 14, uploadedAt: isoAt(18), updatedAt: isoAt(3), description: "Public-facing overview of the property, expansion, and operating model." },
  { id: "DOC-000002", listingId: "LST-000001", name: "Marketing Brochure — Cabo Boutique.pdf", fileType: "pdf", category: "Marketing Brochure", visibility: "Public", sizeBytes: MB(6.8), pages: 22, uploadedAt: isoAt(15), updatedAt: isoAt(5), description: "Investor marketing brochure with property photography." },
  { id: "DOC-000003", listingId: "LST-000001", name: "Property Photos — High Res.zip", fileType: "zip", category: "Photos & Renderings", visibility: "Public", sizeBytes: MB(48.2), uploadedAt: isoAt(20), updatedAt: isoAt(20), description: "Archive of high-resolution property photography." },
  { id: "DOC-000004", listingId: "LST-000001", name: "Pacific Coast — Cabo Hotel Pitch Deck.pdf", fileType: "pdf", category: "Pitch Deck", visibility: "Private", sizeBytes: MB(8.2), pages: 34, uploadedAt: isoAt(12), updatedAt: isoAt(3), description: "Confidential investor deck — full deal terms and IRR scenarios." },
  { id: "DOC-000005", listingId: "LST-000001", name: "Five-Year Financial Model.xlsx", fileType: "xlsx", category: "Financial Model", visibility: "Private", sizeBytes: KB(612), uploadedAt: isoAt(10), updatedAt: isoAt(7), description: "Operating model with sensitivity tabs and exit scenarios." },
  { id: "DOC-000006", listingId: "LST-000001", name: "Feasibility Study — 18-Key Expansion.pdf", fileType: "pdf", category: "Feasibility Study", visibility: "Private", sizeBytes: MB(4.6), pages: 41, uploadedAt: isoAt(14), updatedAt: isoAt(14), description: "Third-party feasibility study commissioned 2025-Q4." },
  { id: "DOC-000007", listingId: "LST-000001", name: "Architectural Plans — Expansion.pdf", fileType: "pdf", category: "Architectural Plans", visibility: "Private", sizeBytes: MB(18.4), pages: 28, uploadedAt: isoAt(12), updatedAt: isoAt(9), description: "Schematic + GMP-priced construction set for the 18-key add." },
  { id: "DOC-000008", listingId: "LST-000001", name: "Title & Survey — Médano Parcel.pdf", fileType: "pdf", category: "Survey", visibility: "Private", sizeBytes: MB(2.1), pages: 8, uploadedAt: isoAt(22), updatedAt: isoAt(22), description: "Title commitment + ALTA survey." },

  // ============== LST-000002 — Mixed-Use Tower Development (9 docs)
  { id: "DOC-000009", listingId: "LST-000002", name: "Edgewater Tower — Project Overview.pdf", fileType: "pdf", category: "Project Overview", visibility: "Public", sizeBytes: MB(3.1), pages: 18, uploadedAt: isoAt(22), updatedAt: isoAt(4), description: "Public overview of the 32-story tower and unit mix." },
  { id: "DOC-000010", listingId: "LST-000002", name: "Edgewater Brochure — Brand Story.pdf", fileType: "pdf", category: "Marketing Brochure", visibility: "Public", sizeBytes: MB(11.2), pages: 28, uploadedAt: isoAt(19), updatedAt: isoAt(6), description: "Sales brochure with architectural renderings." },
  { id: "DOC-000011", listingId: "LST-000002", name: "Lobby Renderings.zip", fileType: "zip", category: "Photos & Renderings", visibility: "Public", sizeBytes: MB(62.4), uploadedAt: isoAt(20), updatedAt: isoAt(20) },
  { id: "DOC-000012", listingId: "LST-000002", name: "Edgewater Tower — Investor Deck.pdf", fileType: "pdf", category: "Investor Deck", visibility: "Private", sizeBytes: MB(12.4), pages: 41, uploadedAt: isoAt(11), updatedAt: isoAt(4), description: "Investor deck. Pref equity terms with 22% IRR cap." },
  { id: "DOC-000013", listingId: "LST-000002", name: "Capital Stack & Returns Model.xlsx", fileType: "xlsx", category: "Financial Model", visibility: "Private", sizeBytes: KB(884), uploadedAt: isoAt(8), updatedAt: isoAt(2), description: "Pref-equity waterfall with sensitivity." },
  { id: "DOC-000014", listingId: "LST-000002", name: "Sales Comps — Edgewater Submarket.xlsx", fileType: "xlsx", category: "Operations", visibility: "Private", sizeBytes: KB(412), uploadedAt: isoAt(13), updatedAt: isoAt(13) },
  { id: "DOC-000015", listingId: "LST-000002", name: "Renderings & Drawings.pptx", fileType: "pptx", category: "Architectural Plans", visibility: "Private", sizeBytes: MB(28.1), pages: 36, uploadedAt: isoAt(15), updatedAt: isoAt(15) },
  { id: "DOC-000016", listingId: "LST-000002", name: "GMP Contract — Signed.pdf", fileType: "pdf", category: "Contracts", visibility: "Private", sizeBytes: MB(3.4), pages: 122, uploadedAt: isoAt(9), updatedAt: isoAt(9) },
  { id: "DOC-000017", listingId: "LST-000002", name: "Permit Set — Full Plans.zip", fileType: "zip", category: "Architectural Plans", visibility: "Private", sizeBytes: MB(184.6), uploadedAt: isoAt(14), updatedAt: isoAt(14) },

  // ============== LST-000003 — Coastal Development Land (6 docs)
  { id: "DOC-000018", listingId: "LST-000003", name: "Punta Mita Parcel — Information Memorandum.pdf", fileType: "pdf", category: "Project Overview", visibility: "Public", sizeBytes: MB(5.4), pages: 26, uploadedAt: isoAt(16), updatedAt: isoAt(4), description: "Public IM describing the 84-acre parcel." },
  { id: "DOC-000019", listingId: "LST-000003", name: "Aerial Photography.zip", fileType: "zip", category: "Photos & Renderings", visibility: "Public", sizeBytes: MB(94.2), uploadedAt: isoAt(18), updatedAt: isoAt(18) },
  { id: "DOC-000020", listingId: "LST-000003", name: "Land Basis & Comparables.xlsx", fileType: "xlsx", category: "Financial Model", visibility: "Private", sizeBytes: KB(248), uploadedAt: isoAt(12), updatedAt: isoAt(7) },
  { id: "DOC-000021", listingId: "LST-000003", name: "Survey + Topographic Map.pdf", fileType: "pdf", category: "Survey", visibility: "Private", sizeBytes: MB(14.6), pages: 12, uploadedAt: isoAt(20), updatedAt: isoAt(8) },
  { id: "DOC-000022", listingId: "LST-000003", name: "Zoning Amendment Application.docx", fileType: "docx", category: "Legal", visibility: "Private", sizeBytes: KB(420), uploadedAt: isoAt(11), updatedAt: isoAt(11) },
  { id: "DOC-000023", listingId: "LST-000003", name: "Environmental Assessment.pdf", fileType: "pdf", category: "Feasibility Study", visibility: "Private", sizeBytes: MB(8.1), pages: 38, uploadedAt: isoAt(15), updatedAt: isoAt(15) },

  // ============== LST-000004 — Regional Logistics Acquisition (8 docs)
  { id: "DOC-000024", listingId: "LST-000004", name: "Logistics Acquisition — Project Overview.pdf", fileType: "pdf", category: "Project Overview", visibility: "Public", sizeBytes: MB(2.8), pages: 12, uploadedAt: isoAt(14), updatedAt: isoAt(3) },
  { id: "DOC-000025", listingId: "LST-000004", name: "Fleet & Distribution Marketing.pdf", fileType: "pdf", category: "Marketing Brochure", visibility: "Public", sizeBytes: MB(4.2), pages: 16, uploadedAt: isoAt(12), updatedAt: isoAt(5) },
  { id: "DOC-000026", listingId: "LST-000004", name: "DC1 — Loading Dock.jpg", fileType: "jpg", category: "Photos & Renderings", visibility: "Public", sizeBytes: MB(3.4), uploadedAt: isoAt(13), updatedAt: isoAt(13) },
  { id: "DOC-000027", listingId: "LST-000004", name: "Confidential Information Memorandum.pdf", fileType: "pdf", category: "Investor Deck", visibility: "Private", sizeBytes: MB(11.8), pages: 48, uploadedAt: isoAt(9), updatedAt: isoAt(2) },
  { id: "DOC-000028", listingId: "LST-000004", name: "Quality of Earnings — Summary.pdf", fileType: "pdf", category: "Financial Model", visibility: "Private", sizeBytes: MB(2.6), pages: 32, uploadedAt: isoAt(10), updatedAt: isoAt(5) },
  { id: "DOC-000029", listingId: "LST-000004", name: "TTM Financials — Detailed.xlsx", fileType: "xlsx", category: "Financial Model", visibility: "Private", sizeBytes: KB(940), uploadedAt: isoAt(8), updatedAt: isoAt(3) },
  { id: "DOC-000030", listingId: "LST-000004", name: "Master Service Agreements.zip", fileType: "zip", category: "Contracts", visibility: "Private", sizeBytes: MB(22.4), uploadedAt: isoAt(11), updatedAt: isoAt(11) },
  { id: "DOC-000031", listingId: "LST-000004", name: "Operations & Fleet Overview.pptx", fileType: "pptx", category: "Operations", visibility: "Private", sizeBytes: MB(9.4), pages: 19, uploadedAt: isoAt(13), updatedAt: isoAt(13) },

  // ============== LST-000005 — Solar + Storage Portfolio (9 docs)
  { id: "DOC-000032", listingId: "LST-000005", name: "Sonora Portfolio — Project Overview.pdf", fileType: "pdf", category: "Project Overview", visibility: "Public", sizeBytes: MB(3.6), pages: 18, uploadedAt: isoAt(8), updatedAt: isoAt(2) },
  { id: "DOC-000033", listingId: "LST-000005", name: "Site Layout — Public.pdf", fileType: "pdf", category: "Marketing Brochure", visibility: "Public", sizeBytes: MB(7.2), pages: 24, uploadedAt: isoAt(9), updatedAt: isoAt(4) },
  { id: "DOC-000034", listingId: "LST-000005", name: "Aerial Site Photo.png", fileType: "png", category: "Photos & Renderings", visibility: "Public", sizeBytes: MB(8.2), uploadedAt: isoAt(10), updatedAt: isoAt(10) },
  { id: "DOC-000035", listingId: "LST-000005", name: "Sonora Portfolio — Investor Deck.pdf", fileType: "pdf", category: "Investor Deck", visibility: "Private", sizeBytes: MB(14.8), pages: 52, uploadedAt: isoAt(7), updatedAt: isoAt(1) },
  { id: "DOC-000036", listingId: "LST-000005", name: "Capital Structure & DSCR Model.xlsx", fileType: "xlsx", category: "Financial Model", visibility: "Private", sizeBytes: MB(1.2), uploadedAt: isoAt(6), updatedAt: isoAt(1) },
  { id: "DOC-000037", listingId: "LST-000005", name: "PPA — Mining Major (Executed).pdf", fileType: "pdf", category: "Contracts", visibility: "Private", sizeBytes: MB(3.8), pages: 84, uploadedAt: isoAt(9), updatedAt: isoAt(9) },
  { id: "DOC-000038", listingId: "LST-000005", name: "PPA — Industrial Cluster (Executed).pdf", fileType: "pdf", category: "Contracts", visibility: "Private", sizeBytes: MB(3.2), pages: 72, uploadedAt: isoAt(9), updatedAt: isoAt(9) },
  { id: "DOC-000039", listingId: "LST-000005", name: "Interconnection & Resource Brief.pdf", fileType: "pdf", category: "Feasibility Study", visibility: "Private", sizeBytes: MB(6.4), pages: 36, uploadedAt: isoAt(11), updatedAt: isoAt(11) },
  { id: "DOC-000040", listingId: "LST-000005", name: "Substation Site Photos.zip", fileType: "zip", category: "Photos & Renderings", visibility: "Private", sizeBytes: MB(52.4), uploadedAt: isoAt(12), updatedAt: isoAt(12) },

  // ============== LST-000006 — Branded Residences JV (8 docs)
  { id: "DOC-000041", listingId: "LST-000006", name: "Tulum Residences — Project Overview.pdf", fileType: "pdf", category: "Project Overview", visibility: "Public", sizeBytes: MB(4.4), pages: 22, uploadedAt: isoAt(20), updatedAt: isoAt(6) },
  { id: "DOC-000042", listingId: "LST-000006", name: "Brand Renderings.zip", fileType: "zip", category: "Photos & Renderings", visibility: "Public", sizeBytes: MB(72.4), uploadedAt: isoAt(22), updatedAt: isoAt(22) },
  { id: "DOC-000043", listingId: "LST-000006", name: "Tulum Branded Residences — LP Deck.pdf", fileType: "pdf", category: "Investor Deck", visibility: "Private", sizeBytes: MB(10.6), pages: 38, uploadedAt: isoAt(18), updatedAt: isoAt(6) },
  { id: "DOC-000044", listingId: "LST-000006", name: "JV Waterfall & Promote.xlsx", fileType: "xlsx", category: "Financial Model", visibility: "Private", sizeBytes: KB(548), uploadedAt: isoAt(16), updatedAt: isoAt(7) },
  { id: "DOC-000045", listingId: "LST-000006", name: "Brand Operator Agreement (Draft).pdf", fileType: "pdf", category: "Contracts", visibility: "Private", sizeBytes: MB(2.4), pages: 96, uploadedAt: isoAt(12), updatedAt: isoAt(5) },
  { id: "DOC-000046", listingId: "LST-000006", name: "Coastal Site Plans.zip", fileType: "zip", category: "Architectural Plans", visibility: "Private", sizeBytes: MB(18.4), uploadedAt: isoAt(17), updatedAt: isoAt(17) },
  { id: "DOC-000047", listingId: "LST-000006", name: "Comparable Branded Comps.xlsx", fileType: "xlsx", category: "Operations", visibility: "Private", sizeBytes: KB(284), uploadedAt: isoAt(14), updatedAt: isoAt(14) },
  { id: "DOC-000048", listingId: "LST-000006", name: "Federal Concession & Coastal Setback.pdf", fileType: "pdf", category: "Legal", visibility: "Private", sizeBytes: MB(1.8), pages: 22, uploadedAt: isoAt(19), updatedAt: isoAt(19) },
];

export const SEED_ACCESS_REQUESTS: AccessRequest[] = [
  {
    id: "REQ-000001",
    listingId: "LST-000002",
    requesterId: "user-meridian-cap",
    requesterName: "James Carrington",
    requesterCompany: "Meridian Capital Group",
    requesterInitials: "JC",
    message:
      "Strong fit with our Florida pref-equity sleeve. Looking at a $5M LP allocation. Can we get into the model + capital stack?",
    status: "Requested",
    requestedAt: isoAt(2, 6),
  },
  {
    id: "REQ-000002",
    listingId: "LST-000005",
    requesterId: "user-cerro-ventures",
    requesterName: "Patricia Solano",
    requesterCompany: "Cerro Ventures",
    requesterInitials: "PS",
    message:
      "Our renewables strategy is overweight Mexico project finance. Would like to review the DSCR model and PPA structures.",
    status: "Requested",
    requestedAt: isoAt(1, 3),
  },
  {
    id: "REQ-000003",
    listingId: "LST-000001",
    requesterId: "user-tropic-leisure",
    requesterName: "Mariana Costa",
    requesterCompany: "Tropic Leisure Partners",
    requesterInitials: "MC",
    message: "Reviewing for our hospitality micro-fund. Can we see the model and feasibility?",
    status: "Approved",
    requestedAt: isoAt(8),
    decidedAt: isoAt(7, 4),
  },
  {
    id: "REQ-000004",
    listingId: "LST-000004",
    requesterId: "user-omega-industrials",
    requesterName: "Brett Holloway",
    requesterCompany: "Omega Industrials Fund",
    requesterInitials: "BH",
    status: "Denied",
    message: "Add-on candidate for our Texas freight platform.",
    requestedAt: isoAt(10),
    decidedAt: isoAt(9, 2),
  },
  {
    id: "REQ-000005",
    listingId: "LST-000003",
    requesterId: "user-pacific-rim",
    requesterName: "Daniela Vasquez",
    requesterCompany: "Pacific Rim Developers",
    requesterInitials: "DV",
    status: "Requested",
    message: "Looking to JV with land contribution. Need to see survey + zoning status.",
    requestedAt: isoAt(0, 4),
  },
  {
    id: "REQ-000006",
    listingId: "LST-000006",
    requesterId: "user-baja-norte",
    requesterName: "Roberto Castellanos",
    requesterCompany: "Baja Norte Capital",
    requesterInitials: "RC",
    status: "Approved",
    requestedAt: isoAt(12),
    decidedAt: isoAt(11, 2),
  },
];

export const SEED_DOCUMENT_ACTIVITY: DocumentActivity[] = [
  // LST-000001
  { id: "DACT-000001", listingId: "LST-000001", documentId: "DOC-000007", kind: "uploaded", title: "Architectural Plans uploaded", body: "Expansion construction set added to private documents.", actor: "Stevie Cabrera", createdAt: isoAt(12) },
  { id: "DACT-000002", listingId: "LST-000001", kind: "access_requested", title: "Access requested", body: "Tropic Leisure Partners requested access to the data room.", actor: "Mariana Costa", createdAt: isoAt(8) },
  { id: "DACT-000003", listingId: "LST-000001", kind: "access_approved", title: "Access approved", body: "Tropic Leisure Partners approved for private documents.", actor: "Stevie Cabrera", createdAt: isoAt(7, 4) },
  { id: "DACT-000004", listingId: "LST-000001", documentId: "DOC-000004", kind: "viewed", title: "Pitch deck viewed", body: "Mariana Costa opened the Pitch Deck.", actor: "Mariana Costa", createdAt: isoAt(6, 8) },
  { id: "DACT-000005", listingId: "LST-000001", documentId: "DOC-000005", kind: "downloaded", title: "Financial model downloaded", body: "Mariana Costa downloaded Five-Year Financial Model.xlsx.", actor: "Mariana Costa", createdAt: isoAt(5, 2) },

  // LST-000002
  { id: "DACT-000006", listingId: "LST-000002", documentId: "DOC-000013", kind: "uploaded", title: "Capital stack model uploaded", body: "Pref-equity waterfall + sensitivity added.", actor: "Stevie Cabrera", createdAt: isoAt(8) },
  { id: "DACT-000007", listingId: "LST-000002", kind: "access_requested", title: "Access requested", body: "Meridian Capital Group requested data room access.", actor: "James Carrington", createdAt: isoAt(2, 6) },
  { id: "DACT-000008", listingId: "LST-000002", documentId: "DOC-000010", kind: "viewed", title: "Brochure viewed", body: "12 unique members opened the Edgewater Brochure this week.", actor: "Multiple members", createdAt: isoAt(1, 2) },

  // LST-000003
  { id: "DACT-000009", listingId: "LST-000003", documentId: "DOC-000021", kind: "uploaded", title: "Survey uploaded", body: "Survey + topographic map added to the data room.", actor: "Stevie Cabrera", createdAt: isoAt(8) },
  { id: "DACT-000010", listingId: "LST-000003", kind: "access_requested", title: "Access requested", body: "Pacific Rim Developers requested access.", actor: "Daniela Vasquez", createdAt: isoAt(0, 4) },

  // LST-000004
  { id: "DACT-000011", listingId: "LST-000004", documentId: "DOC-000027", kind: "uploaded", title: "CIM uploaded", body: "Confidential Information Memorandum added.", actor: "Stevie Cabrera", createdAt: isoAt(9) },
  { id: "DACT-000012", listingId: "LST-000004", kind: "access_denied", title: "Access denied", body: "Omega Industrials Fund — duplicate request to existing relationship.", actor: "Stevie Cabrera", createdAt: isoAt(9, 2) },

  // LST-000005
  { id: "DACT-000013", listingId: "LST-000005", documentId: "DOC-000035", kind: "uploaded", title: "Investor deck uploaded", body: "Sonora portfolio investor deck v3.", actor: "Stevie Cabrera", createdAt: isoAt(7) },
  { id: "DACT-000014", listingId: "LST-000005", documentId: "DOC-000036", kind: "uploaded", title: "DSCR model uploaded", body: "Capital structure + DSCR model added.", actor: "Stevie Cabrera", createdAt: isoAt(6) },
  { id: "DACT-000015", listingId: "LST-000005", kind: "access_requested", title: "Access requested", body: "Cerro Ventures requested access for renewables review.", actor: "Patricia Solano", createdAt: isoAt(1, 3) },

  // LST-000006
  { id: "DACT-000016", listingId: "LST-000006", documentId: "DOC-000043", kind: "uploaded", title: "LP deck uploaded", body: "Tulum branded residences LP deck added.", actor: "Stevie Cabrera", createdAt: isoAt(18) },
  { id: "DACT-000017", listingId: "LST-000006", kind: "access_approved", title: "Access approved", body: "Baja Norte Capital approved for private documents.", actor: "Stevie Cabrera", createdAt: isoAt(11, 2) },
  { id: "DACT-000018", listingId: "LST-000006", documentId: "DOC-000043", kind: "downloaded", title: "LP deck downloaded", body: "Roberto Castellanos downloaded the LP deck.", actor: "Roberto Castellanos", createdAt: isoAt(10) },
];
