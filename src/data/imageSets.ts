// Category-tagged stock photo URLs for opportunity and company seeds.
//
// Photos are served by Loremflickr — a topic-tagged Flickr Creative Commons
// proxy widely used for development and demo work. URLs follow the pattern:
//   https://loremflickr.com/<w>/<h>/<tags>?lock=<seed>
// where `tags` is a comma-separated keyword list and `lock` seeds the
// deterministic photo selection so the same URL always returns the same
// photo. Sources are CC-licensed Flickr photographs.
//
// Pools are organized so each opportunity / company gets a visually
// coherent gallery that actually matches the listing — hotel listings show
// resorts, marble listings show slabs and quarries, rebar listings show
// construction steel, and so on.

const W = 1600;
const H = 1000;

/** Build a deterministic Loremflickr URL for a given tag set + seed. */
function lf(tags: string, seed: number): string {
  return `https://loremflickr.com/${W}/${H}/${tags}?lock=${seed}`;
}

// Image pools keyed by topic. Each pool has at least six entries with
// varying tag combinations so different opportunities in the same category
// get visually distinct galleries.

const POOLS = {
  hotel: [
    lf("luxury,hotel,resort", 11),
    lf("hotel,pool,beach", 12),
    lf("resort,lobby,interior", 13),
    lf("hotel,suite,bed", 14),
    lf("oceanfront,hotel,sunset", 15),
    lf("rooftop,bar,resort", 16),
    lf("resort,facade,palm", 17),
    lf("hotel,restaurant,dining", 18),
  ],
  hospitality_branded: [
    lf("branded,residence,modern", 21),
    lf("luxury,villa,oceanfront", 22),
    lf("resort,architecture,modern", 23),
    lf("hotel,architecture,exterior", 24),
    lf("residence,beachfront,villa", 25),
    lf("luxury,hotel,facade", 26),
    lf("resort,pool,ocean", 27),
  ],
  development: [
    lf("skyline,tower,construction", 31),
    lf("mixed-use,tower,urban", 32),
    lf("highrise,architecture,modern", 33),
    lf("city,skyline,sunset", 34),
    lf("crane,construction,tower", 35),
    lf("urban,development,glass", 36),
    lf("building,architecture,city", 37),
  ],
  land: [
    lf("coastal,land,acreage", 41),
    lf("ocean,cliff,coastline", 42),
    lf("aerial,land,coastline", 43),
    lf("beach,land,palms", 44),
    lf("survey,land,landscape", 45),
    lf("oceanfront,property,view", 46),
    lf("topography,land,aerial", 47),
  ],
  acquisition: [
    lf("warehouse,fleet,truck", 51),
    lf("fleet,truck,logistics", 52),
    lf("business,office,interior", 53),
    lf("shipping,warehouse,industrial", 54),
    lf("logistics,truck,depot", 55),
    lf("office,corporate,boardroom", 56),
    lf("warehouse,industrial,goods", 57),
  ],
  energy_solar: [
    lf("solar,farm,panels", 61),
    lf("solar,panels,desert", 62),
    lf("solar,power,plant", 63),
    lf("photovoltaic,solar,field", 64),
    lf("solar,energy,renewable", 65),
    lf("solar,array,sunset", 66),
    lf("solar,farm,aerial", 67),
  ],
  energy_wind: [
    lf("wind,turbine,farm", 71),
    lf("wind,energy,turbine", 72),
    lf("turbine,sky,renewable", 73),
    lf("wind,farm,coast", 74),
    lf("turbine,blade,wind", 75),
    lf("offshore,wind,turbine", 76),
  ],
  energy_storage: [
    lf("battery,storage,facility", 81),
    lf("substation,grid,electrical", 82),
    lf("transformer,electrical,utility", 83),
    lf("powerline,utility,grid", 84),
    lf("substation,industrial,energy", 85),
    lf("battery,industrial,storage", 86),
  ],
  joint_ventures: [
    lf("boardroom,meeting,handshake", 91),
    lf("contract,signing,office", 92),
    lf("partners,meeting,corporate", 93),
    lf("blueprint,planning,office", 94),
    lf("handshake,deal,suit", 95),
    lf("conference,table,meeting", 96),
    lf("boardroom,glass,city", 97),
  ],
  construction: [
    lf("construction,site,crane", 101),
    lf("hardhat,workers,construction", 102),
    lf("scaffolding,building,construction", 103),
    lf("concrete,foundation,construction", 104),
    lf("crane,steel,construction", 105),
    lf("blueprint,construction,plans", 106),
    lf("worker,construction,safety", 107),
  ],
  manufacturing: [
    lf("factory,manufacturing,industrial", 111),
    lf("assembly,line,factory", 112),
    lf("warehouse,manufacturing,production", 113),
    lf("industrial,machinery,factory", 114),
    lf("factory,interior,production", 115),
    lf("manufacturing,plant,exterior", 116),
    lf("welding,metal,industrial", 117),
  ],
  tiny_homes: [
    lf("tiny,house,modern", 121),
    lf("tiny,home,cabin", 122),
    lf("modular,home,prefab", 123),
    lf("tiny,house,wheels", 124),
    lf("cabin,small,wood", 125),
    lf("compact,home,interior", 126),
    lf("modular,prefab,construction", 127),
  ],
  marble: [
    lf("marble,slab,quarry", 131),
    lf("marble,stone,texture", 132),
    lf("marble,quarry,carrara", 133),
    lf("marble,workshop,cutting", 134),
    lf("marble,white,polished", 135),
    lf("stone,marble,warehouse", 136),
    lf("granite,marble,slabs", 137),
  ],
  granite: [
    lf("granite,slab,quarry", 141),
    lf("granite,stone,texture", 142),
    lf("granite,countertop,polished", 143),
    lf("granite,quarry,industrial", 144),
    lf("granite,workshop,cutting", 145),
    lf("granite,warehouse,slabs", 146),
  ],
  rebar: [
    lf("rebar,steel,construction", 151),
    lf("rebar,bundle,construction", 152),
    lf("reinforcement,steel,bars", 153),
    lf("rebar,foundation,construction", 154),
    lf("steel,bars,construction", 155),
    lf("rebar,grid,concrete", 156),
    lf("reinforcement,bars,steel", 157),
  ],
  lumber: [
    lf("lumber,wood,stacked", 161),
    lf("timber,logs,forest", 162),
    lf("sawmill,lumber,wood", 163),
    lf("lumber,yard,wood", 164),
    lf("timber,planks,wood", 165),
    lf("logs,forestry,industrial", 166),
  ],
  infrastructure: [
    lf("bridge,highway,infrastructure", 171),
    lf("highway,tunnel,infrastructure", 172),
    lf("port,crane,infrastructure", 173),
    lf("airport,runway,infrastructure", 174),
    lf("railway,bridge,industrial", 175),
    lf("dam,water,infrastructure", 176),
    lf("port,shipping,container", 177),
  ],
  logistics: [
    lf("warehouse,logistics,forklift", 181),
    lf("truck,fleet,highway", 182),
    lf("container,port,shipping", 183),
    lf("warehouse,goods,pallets", 184),
    lf("logistics,cargo,terminal", 185),
    lf("freight,truck,depot", 186),
    lf("warehouse,inventory,industrial", 187),
  ],
  cold_chain: [
    lf("refrigerated,truck,logistics", 191),
    lf("cold,storage,warehouse", 192),
    lf("refrigeration,industrial,facility", 193),
    lf("freezer,warehouse,industrial", 194),
    lf("cold,chain,logistics", 195),
  ],
  containers: [
    lf("container,shipping,port", 201),
    lf("container,stacked,industrial", 202),
    lf("container,yard,crane", 203),
    lf("intermodal,container,rail", 204),
    lf("shipping,container,yard", 205),
  ],
  aerospace: [
    lf("aerospace,engineering,turbine", 211),
    lf("aircraft,engine,industrial", 212),
    lf("aerospace,manufacturing,parts", 213),
    lf("jet,engine,turbine", 214),
    lf("aerospace,factory,industrial", 215),
  ],
  investment: [
    lf("finance,chart,trading", 221),
    lf("office,boardroom,city", 222),
    lf("financial,district,skyline", 223),
    lf("wealth,management,office", 224),
    lf("conference,corporate,city", 225),
  ],
  green_materials: [
    lf("sustainable,materials,green", 231),
    lf("eco,construction,wood", 232),
    lf("green,building,sustainable", 233),
    lf("biomaterial,natural,texture", 234),
    lf("hemp,construction,sustainable", 235),
  ],
  proptech: [
    lf("smart,home,technology", 241),
    lf("office,technology,modern", 242),
    lf("real,estate,interior", 243),
    lf("smart,building,technology", 244),
    lf("apartment,interior,modern", 245),
  ],
  equipment: [
    lf("excavator,construction,equipment", 251),
    lf("bulldozer,construction,site", 252),
    lf("crane,construction,equipment", 253),
    lf("heavy,machinery,construction", 254),
    lf("equipment,rental,yard", 255),
  ],
  commercial: [
    lf("retail,storefront,city", 261),
    lf("commercial,building,office", 262),
    lf("shopping,center,retail", 263),
    lf("plaza,commercial,modern", 264),
    lf("office,corporate,exterior", 265),
  ],
};

type PoolKey = keyof typeof POOLS;

const KEYWORD_TO_POOL: { match: RegExp; pool: PoolKey }[] = [
  { match: /tiny home|tiny house|modular home/i, pool: "tiny_homes" },
  { match: /marble/i, pool: "marble" },
  { match: /granite/i, pool: "granite" },
  { match: /rebar|reinforcement steel|reinforcing/i, pool: "rebar" },
  { match: /lumber|timber|forestry/i, pool: "lumber" },
  { match: /solar/i, pool: "energy_solar" },
  { match: /wind/i, pool: "energy_wind" },
  { match: /battery|energy storage|substation/i, pool: "energy_storage" },
  { match: /cold[\s-]?chain|refrigerat/i, pool: "cold_chain" },
  { match: /container/i, pool: "containers" },
  { match: /aerospace|aviation/i, pool: "aerospace" },
  { match: /bridge|highway|port infrastructure|infrastructure/i, pool: "infrastructure" },
  { match: /branded residen/i, pool: "hospitality_branded" },
];

const CATEGORY_TO_POOL: Record<string, PoolKey> = {
  "Hotels & Resorts": "hotel",
  "Hospitality": "hotel",
  "Real Estate Development": "development",
  "Land Opportunities": "land",
  "Business Acquisitions": "acquisition",
  "Energy": "energy_solar",
  "Joint Ventures": "joint_ventures",
  "Construction Projects": "construction",
  "Manufacturing & Materials": "manufacturing",
  "Infrastructure": "infrastructure",
  "Suppliers & Logistics": "logistics",
  "Commercial Services": "commercial",
  "Investment Opportunities": "investment",
};

const INDUSTRY_TO_POOL: { match: RegExp; pool: PoolKey }[] = [
  { match: /hospitality|hotel|resort|residential/i, pool: "hotel" },
  { match: /land/i, pool: "land" },
  { match: /freight|logistic|distribution/i, pool: "logistics" },
  { match: /cold/i, pool: "cold_chain" },
  { match: /renewable|solar|wind|energy/i, pool: "energy_solar" },
  { match: /storage/i, pool: "energy_storage" },
  { match: /general contracting|contracting/i, pool: "construction" },
  { match: /modular/i, pool: "tiny_homes" },
  { match: /engineering|aerospace/i, pool: "infrastructure" },
  { match: /steel/i, pool: "rebar" },
  { match: /lumber|timber/i, pool: "lumber" },
  { match: /materials|marble|granite|stone/i, pool: "marble" },
  { match: /investment|wealth/i, pool: "investment" },
  { match: /proptech|services|management/i, pool: "proptech" },
  { match: /equipment|rental/i, pool: "equipment" },
  { match: /green|sustain/i, pool: "green_materials" },
  { match: /development|real estate/i, pool: "development" },
];

function resolvePool(opts: {
  category?: string;
  industry?: string;
  title?: string;
}): PoolKey {
  const haystack = `${opts.title ?? ""} ${opts.industry ?? ""} ${opts.category ?? ""}`;
  for (const { match, pool } of KEYWORD_TO_POOL) if (match.test(haystack)) return pool;
  if (opts.industry) {
    for (const { match, pool } of INDUSTRY_TO_POOL) if (match.test(opts.industry)) return pool;
  }
  if (opts.category && opts.category in CATEGORY_TO_POOL) {
    return CATEGORY_TO_POOL[opts.category];
  }
  return "investment";
}

/** Hash a string to a non-negative integer for seed offsetting. */
function strHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Pick `count` images from the appropriate pool for a listing. The `seed`
 * string (typically the opportunity id) deterministically offsets the
 * starting index so different opportunities in the same category get
 * different rotations of the same pool.
 */
export function pickOpportunityImages(
  opts: { category?: string; industry?: string; title?: string; id?: string; count: number }
): string[] {
  const pool = POOLS[resolvePool(opts)];
  const offset = opts.id ? strHash(opts.id) % pool.length : 0;
  return Array.from({ length: opts.count }, (_, i) => pool[(offset + i) % pool.length]);
}

/** Single cover image for a company. */
export function pickCompanyCover(opts: {
  industry?: string;
  id?: string;
}): string {
  const pool = POOLS[resolvePool({ industry: opts.industry })];
  const offset = opts.id ? strHash(opts.id) % pool.length : 0;
  return pool[offset];
}

/** N gallery images for a company. */
export function pickCompanyGallery(opts: {
  industry?: string;
  id?: string;
  count: number;
}): string[] {
  const pool = POOLS[resolvePool({ industry: opts.industry })];
  const offset = opts.id ? (strHash(opts.id) + 1) % pool.length : 0;
  return Array.from({ length: opts.count }, (_, i) => pool[(offset + i) % pool.length]);
}
