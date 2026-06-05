import type { Company } from "./types";

// Helper to make 4-image gallery from a listing folder, with category labels.
function listingGallery(
  slug: string,
  labels: { category: import("./types").GalleryCategory; caption: string }[]
) {
  return labels.map((label, i) => ({
    src: `/listings/${slug}/${i + 1}.jpg`,
    alt: `${label.category} — ${label.caption}`,
    category: label.category,
    caption: label.caption,
  }));
}

export const companies: Company[] = [
  {
    id: "COMP-000001",
    slug: "pacific-coast-development-group",
    name: "Pacific Coast Development Group",
    tagline:
      "Owner-operator of design-led coastal hospitality across the Sea of Cortez and Pacific coast of Mexico.",
    industry: "Luxury Hospitality",
    headquarters: { country: "Mexico", state: "Baja California Sur", city: "Cabo San Lucas" },
    website: "https://pacificcoastdev.example",
    websiteLabel: "pacificcoastdev.example",
    foundedYear: 2013,
    employees: "50–100",
    verification: "Verified",
    coverImage: "/listings/beachfront-boutique-hotel/1.jpg",
    about: {
      overview:
        "Pacific Coast Development Group is a vertically integrated owner-operator of boutique hospitality assets in the Mexican Riviera. The firm acquires, develops, and manages design-led properties under 60 keys with a focus on stabilized cash flow and brand-quality experience.",
      mission:
        "To build the most respected portfolio of boutique coastal hospitality in Latin America — quietly profitable, beautifully designed, and rooted in the communities that surround it.",
      background:
        "Founded in 2013 by a team of operators previously at branded resort groups, Pacific Coast started with a single 18-key acquisition on Médano Beach. Over the next decade the firm scaled to 11 owned properties, an in-house design studio, and a vertically integrated construction and F&B operation.",
      trackRecord:
        "$420M deployed across 11 hospitality assets · 2 full-cycle exits returning 2.6× and 2.9× MOIC to investors · 100% completion record on developed properties.",
    },
    team: [
      {
        name: "Stevie Cabrera",
        role: "CEO",
        bio: "Twelve years operating boutique coastal hospitality across Mexico. Previously head of development at a branded resort group.",
        initials: "SC",
        yearsAtFirm: 12,
      },
      {
        name: "Mariana Reyes",
        role: "President",
        bio: "Former general counsel for a Latin American hospitality REIT. Leads capital strategy and partner relationships.",
        initials: "MR",
        yearsAtFirm: 9,
      },
      {
        name: "Diego Salinas",
        role: "Director of Acquisitions",
        bio: "Twenty deals closed across Baja and the Pacific coast. Origination, underwriting, and entitlement work.",
        initials: "DS",
        yearsAtFirm: 6,
      },
      {
        name: "Luisa Vásquez",
        role: "Managing Partner",
        bio: "Co-leads the firm's design and operations practice. Background at international branded operators.",
        initials: "LV",
        yearsAtFirm: 10,
      },
    ],
    pastProjects: [
      {
        id: "PROJ-PCG-01",
        name: "Casa del Mar — 22 Keys",
        location: "La Paz, Mexico",
        year: 2019,
        description:
          "Ground-up boutique hotel on the Espíritu Santo channel. Exited to a regional operator at 2.9× MOIC in year four.",
      },
      {
        id: "PROJ-PCG-02",
        name: "Médano Heights Resort",
        location: "Cabo San Lucas, Mexico",
        year: 2017,
        description:
          "30-key cliffside conversion with in-house F&B program. Stabilized at 82% occupancy, $720 ADR.",
      },
      {
        id: "PROJ-PCG-03",
        name: "Punta Pescadero Inn",
        location: "Pescadero, Mexico",
        year: 2021,
        description:
          "12-key off-grid retreat with solar and water reclamation. Sold to a private owner at 2.6× MOIC.",
      },
    ],
    gallery: listingGallery("beachfront-boutique-hotel", [
      { category: "Project", caption: "Médano Beach property — aerial" },
      { category: "Facility", caption: "Pool and beach club" },
      { category: "Project", caption: "Ocean elevation" },
      { category: "Office", caption: "Reception and lobby" },
    ]),
    closedOpportunitiesCount: 10,
    searchKeywords: [
      "hotels",
      "hospitality",
      "boutique",
      "Mexico",
      "Cabo",
      "Baja",
      "resort",
      "coastal",
    ],
  },
  {
    id: "COMP-000002",
    slug: "aurora-capital-partners",
    name: "Aurora Capital Partners",
    tagline:
      "Vertically integrated developer of for-sale high-rise residential in South Florida.",
    industry: "Real Estate Development",
    headquarters: { country: "United States", state: "Florida", city: "Miami" },
    website: "https://auroracapital.example",
    websiteLabel: "auroracapital.example",
    foundedYear: 2007,
    employees: "100–250",
    verification: "Premium Verified",
    coverImage: "/listings/mixed-use-tower-development/1.jpg",
    about: {
      overview:
        "Aurora Capital Partners develops, builds, and sells high-rise residential and mixed-use towers across South Florida. The firm runs in-house teams across entitlement, construction, sales, and capital markets — a single operating platform from site to closing.",
      mission:
        "To deliver landmark towers that define their submarkets and reward the institutional capital that backs them. Discipline on basis, ambition on execution.",
      background:
        "Founded in 2007 in Miami by a team of vertically integrated developers, Aurora has weathered two real estate cycles without a principal loss to its investor base. The firm's bench has held together for nearly two decades.",
      trackRecord:
        "$2.1B of completed development · 6 towers delivered · zero principal losses to investor base · 100% delivered on or ahead of construction schedule.",
    },
    team: [
      {
        name: "David Ashford",
        role: "CEO",
        bio: "Twenty-five years of South Florida residential development. Personally led every Aurora tower from site control to closing.",
        initials: "DA",
        yearsAtFirm: 19,
      },
      {
        name: "Catherine Whitfield",
        role: "President",
        bio: "Heads design, sales, and brand positioning. Previously global VP for a luxury hospitality flag.",
        initials: "CW",
        yearsAtFirm: 14,
      },
      {
        name: "Marcus Chen",
        role: "Director of Capital Markets",
        bio: "Structures equity and debt for Aurora's tower pipeline. Twelve years across investment banking and private real estate.",
        initials: "MC",
        yearsAtFirm: 7,
      },
      {
        name: "Stephen Rosenberg",
        role: "Managing Partner",
        bio: "Co-founded Aurora in 2007. Leads construction, GMP negotiation, and trade relationships.",
        initials: "SR",
        yearsAtFirm: 19,
      },
    ],
    pastProjects: [
      {
        id: "PROJ-AUR-01",
        name: "Aurora Bayfront",
        location: "Miami, FL",
        year: 2018,
        description:
          "28-story tower, 184 units, ground-floor retail. Sold out within nine months of TCO.",
      },
      {
        id: "PROJ-AUR-02",
        name: "Aurora Sunset",
        location: "Hollywood, FL",
        year: 2021,
        description:
          "Two-tower mixed-use community of 312 residences. Delivered three months ahead of schedule.",
      },
      {
        id: "PROJ-AUR-03",
        name: "Aurora Brickell Reserve",
        location: "Miami, FL",
        year: 2023,
        description:
          "42-story luxury condo tower with $1,440 PSF average closing price.",
      },
    ],
    gallery: listingGallery("mixed-use-tower-development", [
      { category: "Project", caption: "Edgewater tower elevation" },
      { category: "Office", caption: "Sales center interior" },
      { category: "Project", caption: "Skyline integration" },
      { category: "Facility", caption: "Amenity rendering" },
    ]),
    closedOpportunitiesCount: 5,
    searchKeywords: [
      "real estate",
      "tower",
      "high-rise",
      "Miami",
      "Florida",
      "residential",
      "mixed-use",
    ],
  },
  {
    id: "COMP-000003",
    slug: "riviera-land-group",
    name: "Riviera Land Group",
    tagline:
      "Specialist coastal land aggregator across the Riviera Nayarit and Costa Alegre.",
    industry: "Land Aggregation & Brokerage",
    headquarters: { country: "Mexico", state: "Nayarit", city: "Punta Mita" },
    website: "https://rivieraland.example",
    websiteLabel: "rivieraland.example",
    foundedYear: 2011,
    employees: "10–50",
    verification: "Verified",
    coverImage: "/listings/coastal-development-land/1.jpg",
    about: {
      overview:
        "Riviera Land Group acquires, entitles, and transacts large coastal parcels along Mexico's Pacific coast. The firm operates as both principal investor and seller-side broker, with a focus on parcels of 20+ acres suitable for resort or branded development.",
      mission:
        "To shepherd the next generation of Mexico's coastline into responsible, branded ownership. Clean title, transparent process, generational outcomes.",
      background:
        "Founded in 2011 in Punta Mita by a former resort developer, the firm has spent over a decade building relationships with title holders, ejidos, and federal authorities across the Riviera Nayarit and Costa Alegre.",
      trackRecord:
        "$310M of land transactions closed · 14 master-planned parcels assembled · zero title disputes post-close · longstanding relationships across federal and state land authorities.",
    },
    team: [
      {
        name: "Roberto Salazar",
        role: "CEO",
        bio: "Twenty years acquiring and entitling Mexican coastal land. Former GM of a Pacific resort development.",
        initials: "RS",
        yearsAtFirm: 13,
      },
      {
        name: "Ana Quintero",
        role: "President",
        bio: "Leads title, entitlement, and federal coordination. Former environmental counsel.",
        initials: "AQ",
        yearsAtFirm: 9,
      },
      {
        name: "Héctor Mendoza",
        role: "Director of Acquisitions",
        bio: "Originates and underwrites every parcel. Twelve years of land brokerage across Nayarit.",
        initials: "HM",
        yearsAtFirm: 8,
      },
      {
        name: "Elena Vega",
        role: "Managing Partner",
        bio: "Manages investor relationships and capital partner structures.",
        initials: "EV",
        yearsAtFirm: 11,
      },
    ],
    pastProjects: [
      {
        id: "PROJ-RLG-01",
        name: "Sayulita North Parcel — 110 Acres",
        location: "Sayulita, Mexico",
        year: 2020,
        description:
          "Assembled from five smaller titles. Sold to a branded resort developer at $32M.",
      },
      {
        id: "PROJ-RLG-02",
        name: "Costalegre Bay Parcel",
        location: "Tomatlán, Mexico",
        year: 2018,
        description:
          "62 acres with 600m of frontage. Joint venture into a 90-key resort, exited at 2.4× MOIC.",
      },
      {
        id: "PROJ-RLG-03",
        name: "Litibú Bluff Parcel",
        location: "Higuera Blanca, Mexico",
        year: 2022,
        description:
          "38 acres re-zoned for branded residential. Closed direct sale at $19M.",
      },
    ],
    gallery: listingGallery("coastal-development-land", [
      { category: "Project", caption: "Aerial view of parcel" },
      { category: "Project", caption: "Beach frontage" },
      { category: "Facility", caption: "Coastline contour" },
      { category: "Project", caption: "Approach from inland" },
    ]),
    closedOpportunitiesCount: 13,
    searchKeywords: [
      "land",
      "coastal",
      "Mexico",
      "Nayarit",
      "Punta Mita",
      "title",
      "entitlement",
    ],
  },
  {
    id: "COMP-000004",
    slug: "global-logistics-holdings",
    name: "Global Logistics Holdings",
    tagline:
      "Lower-middle-market M&A advisory specialising in industrial and logistics transitions.",
    industry: "Freight & Logistics M&A",
    headquarters: { country: "United States", state: "Texas", city: "Dallas" },
    website: "https://globallogistics.example",
    websiteLabel: "globallogistics.example",
    foundedYear: 2009,
    employees: "10–50",
    verification: "Verified",
    coverImage: "/listings/regional-logistics-acquisition/1.jpg",
    about: {
      overview:
        "Global Logistics Holdings represents sellers of profitable, founder-led freight and logistics companies in the South-Central US. The firm handles confidential offers, Quality-of-Earnings work, financing syndication, and seller transition planning.",
      mission:
        "To deliver maximum value and continuity for retiring founders of essential infrastructure businesses. Every transition done right.",
      background:
        "Founded by ex-bulge-bracket industrials bankers in 2009, GLH has closed transactions across nineteen states with a 92% close rate post-LOI. The firm's reputation is built on diligence quality and post-close client outcomes.",
      trackRecord:
        "62 closed transactions · $1.4B aggregate enterprise value · 92% close rate post-LOI · referrals from prior clients account for 70% of deal flow.",
    },
    team: [
      {
        name: "Thomas Carter",
        role: "CEO",
        bio: "Twenty-one years in industrial M&A, twelve of them leading GLH. Previously head of industrials at a regional bank.",
        initials: "TC",
        yearsAtFirm: 15,
      },
      {
        name: "Sarah Whitmore",
        role: "President",
        bio: "Leads transaction execution and client management. Former Big Four QofE partner.",
        initials: "SW",
        yearsAtFirm: 11,
      },
      {
        name: "James O'Brien",
        role: "Director of Operations",
        bio: "Heads diligence and integration planning. Background in 3PL operations management.",
        initials: "JO",
        yearsAtFirm: 8,
      },
      {
        name: "Robert Sterling",
        role: "Managing Partner",
        bio: "Co-founded GLH in 2009. Manages the firm's senior banker relationships.",
        initials: "RS",
        yearsAtFirm: 15,
      },
    ],
    pastProjects: [
      {
        id: "PROJ-GLH-01",
        name: "Midwest Drayage Co. — Sale",
        location: "St. Louis, MO",
        year: 2022,
        description:
          "Founder transition for a $42M revenue intermodal carrier. Sold to a strategic at 5.1× normalized EBITDA.",
      },
      {
        id: "PROJ-GLH-02",
        name: "Texas Reefer Logistics — Recap",
        location: "Houston, TX",
        year: 2021,
        description:
          "Sponsor recapitalization for a 60-truck refrigerated carrier. Founder rolled 20%, sponsor took control.",
      },
      {
        id: "PROJ-GLH-03",
        name: "Gulf Coast Last Mile — Sale",
        location: "Mobile, AL",
        year: 2023,
        description:
          "Hub-and-spoke last-mile operator with 28 vehicles. Sold to a Fortune-500 industrial at 4.8× EBITDA.",
      },
    ],
    gallery: listingGallery("regional-logistics-acquisition", [
      { category: "Facility", caption: "Distribution interior" },
      { category: "Project", caption: "Loading bay exterior" },
      { category: "Facility", caption: "Inventory racks" },
      { category: "Office", caption: "Operations center" },
    ]),
    closedOpportunitiesCount: 61,
    searchKeywords: [
      "logistics",
      "freight",
      "M&A",
      "acquisition",
      "Dallas",
      "Texas",
      "industrial",
    ],
  },
  {
    id: "COMP-000005",
    slug: "sonora-energy-partners",
    name: "Sonora Energy Partners",
    tagline:
      "Independent power producer building utility-scale renewables across Mexico and Central America.",
    industry: "Utility-Scale Renewables",
    headquarters: { country: "Mexico", state: "Sonora", city: "Hermosillo" },
    website: "https://sonoraenergy.example",
    websiteLabel: "sonoraenergy.example",
    foundedYear: 2016,
    employees: "100–250",
    verification: "Verified",
    coverImage: "/listings/sonora-solar-storage-portfolio/1.jpg",
    about: {
      overview:
        "Sonora Energy Partners develops, finances, builds, and operates utility-scale solar and storage assets across Mexico and Central America. The firm holds long-term ownership of operating projects and partners with industrial offtakers under multi-decade PPAs.",
      mission:
        "To accelerate the energy transition in Latin America with bankable, long-term assets that pay back capital and reduce regional emissions.",
      background:
        "Founded in 2016 by a team of former Iberdrola and Enel project leaders. The firm has been profitable on every operating project to date and maintains a 100% on-schedule completion record across utility-scale builds.",
      trackRecord:
        "780 MW developed across 14 projects · 410 MW currently operating · 100% project completion on schedule · $1.6B of project debt arranged.",
    },
    team: [
      {
        name: "Dr. Carlos Méndez",
        role: "CEO",
        bio: "Former senior PM at Iberdrola Mexico. PhD in Electrical Engineering. Has led 1.2 GW of utility-scale builds in his career.",
        initials: "CM",
        yearsAtFirm: 9,
      },
      {
        name: "Alicia Romero",
        role: "President",
        bio: "Heads project finance and capital partner relationships. Former director at IDB Invest.",
        initials: "AR",
        yearsAtFirm: 7,
      },
      {
        name: "Eduardo Vargas",
        role: "Director of Engineering",
        bio: "Designs and commissions every Sonora Energy project. Former EPC lead at Enel Green Power.",
        initials: "EV",
        yearsAtFirm: 8,
      },
      {
        name: "Patricia Solano",
        role: "Managing Partner",
        bio: "Manages operating asset portfolio and offtaker relationships across Mexico and Central America.",
        initials: "PS",
        yearsAtFirm: 6,
      },
    ],
    pastProjects: [
      {
        id: "PROJ-SEP-01",
        name: "Hermosillo Solar I — 80 MW",
        location: "Hermosillo, Mexico",
        year: 2019,
        description:
          "First utility-scale build. Delivered on schedule, currently 6 years into a 25-year PPA with an investment-grade utility.",
      },
      {
        id: "PROJ-SEP-02",
        name: "Chiapas Sun — 120 MW",
        location: "Chiapas, Mexico",
        year: 2021,
        description:
          "Bifacial array with 30 MWh battery storage. Generated 3% over P50 in its first operating year.",
      },
      {
        id: "PROJ-SEP-03",
        name: "Pacific Coast Solar — 210 MW",
        location: "Oaxaca, Mexico",
        year: 2023,
        description:
          "Mexico's largest single-site bifacial array at COD. Multi-offtaker PPA structure.",
      },
    ],
    gallery: listingGallery("sonora-solar-storage-portfolio", [
      { category: "Project", caption: "Solar array — aerial" },
      { category: "Facility", caption: "Inverter substation" },
      { category: "Project", caption: "Panel detail" },
      { category: "Facility", caption: "O&M building" },
    ]),
    closedOpportunitiesCount: 9,
    searchKeywords: [
      "energy",
      "solar",
      "renewables",
      "Mexico",
      "Sonora",
      "PPA",
      "utility",
    ],
  },
  {
    id: "COMP-000006",
    slug: "yucatan-development-co",
    name: "Yucatán Development Co.",
    tagline:
      "Branded residence developer for the Riviera Maya and the Caribbean basin.",
    industry: "Branded Residential",
    headquarters: { country: "Mexico", state: "Quintana Roo", city: "Tulum" },
    website: "https://yucatandev.example",
    websiteLabel: "yucatandev.example",
    foundedYear: 2015,
    employees: "50–100",
    verification: "Pending",
    coverImage: "/listings/branded-residences-tulum-jv/1.jpg",
    about: {
      overview:
        "Yucatán Development Co. designs and builds branded residential developments under license from global hospitality flags. The firm operates exclusively on titled beachfront in the Riviera Maya and along the Caribbean basin.",
      mission:
        "To bring globally branded residential living to Mexico's most protected coastlines, without compromising the environments that make those coastlines worth living on.",
      background:
        "Founded in 2015 by a small team of designers and developers from Riviera Maya operating partners. The firm carries exclusive operating agreements with two of the world's top-five hospitality groups.",
      trackRecord:
        "5 branded projects delivered · $1.1B aggregate residential sell-out · 100% brand-license renewal record · zero post-close warranty escalations to the operator.",
    },
    team: [
      {
        name: "Rafael Castellanos",
        role: "CEO",
        bio: "Co-founded the firm in 2015. Background in luxury hospitality development at a Caribbean operator.",
        initials: "RC",
        yearsAtFirm: 10,
      },
      {
        name: "Sofía Lazaro",
        role: "President",
        bio: "Leads brand-license negotiation and operator relationships. Former hospitality counsel.",
        initials: "SL",
        yearsAtFirm: 7,
      },
      {
        name: "Marco Ferreira",
        role: "Director of Design",
        bio: "Principal-in-charge for every project. Award-winning luxury residential architect.",
        initials: "MF",
        yearsAtFirm: 8,
      },
      {
        name: "Isabella Cruz",
        role: "Managing Partner",
        bio: "Manages sales, marketing, and pre-sales contract execution across active projects.",
        initials: "IC",
        yearsAtFirm: 9,
      },
    ],
    pastProjects: [
      {
        id: "PROJ-YDC-01",
        name: "Akumal Branded Residences",
        location: "Akumal, Mexico",
        year: 2019,
        description:
          "36-residence branded development. Sold out at $1,820 PSF — 38% brand premium versus unbranded comps.",
      },
      {
        id: "PROJ-YDC-02",
        name: "Costa Mujeres Beach Villas",
        location: "Costa Mujeres, Mexico",
        year: 2021,
        description:
          "24 standalone branded villas on a private 8-acre beachfront site. Sold out within 14 months.",
      },
      {
        id: "PROJ-YDC-03",
        name: "Mayakoba Bay Residences",
        location: "Playa del Carmen, Mexico",
        year: 2023,
        description:
          "62-residence beachfront tower. Currently in delivery — 88% pre-sold at $2,140 PSF average.",
      },
    ],
    gallery: listingGallery("branded-residences-tulum-jv", [
      { category: "Project", caption: "Resort pool deck" },
      { category: "Facility", caption: "Lounge area" },
      { category: "Project", caption: "Beachfront elevation" },
      { category: "Office", caption: "Design studio" },
    ]),
    closedOpportunitiesCount: 4,
    searchKeywords: [
      "branded residential",
      "Mexico",
      "Tulum",
      "Riviera Maya",
      "luxury",
      "beachfront",
      "Caribbean",
    ],
  },
];
