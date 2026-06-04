import {
  Building2,
  Hotel,
  Mountain,
  HardHat,
  TrendingUp,
  Factory,
  TrainTrack,
  Zap,
  UtensilsCrossed,
  Briefcase,
  Tag,
  Handshake,
  Truck,
  type LucideIcon,
} from "lucide-react";

export type Category = {
  slug: string;
  label: string;
  icon: LucideIcon;
  description: string;
  count: number;
  accent: string;
};

export const categories: Category[] = [
  {
    slug: "real-estate-development",
    label: "Real Estate Development",
    icon: Building2,
    description: "Ground-up and value-add projects",
    count: 142,
    accent: "from-navy-700 to-navy-600",
  },
  {
    slug: "hotels-resorts",
    label: "Hotels & Resorts",
    icon: Hotel,
    description: "Branded and boutique hospitality",
    count: 87,
    accent: "from-navy-800 to-navy-700",
  },
  {
    slug: "land-opportunities",
    label: "Land Opportunities",
    icon: Mountain,
    description: "Entitled and raw land parcels",
    count: 64,
    accent: "from-navy-700 to-navy-800",
  },
  {
    slug: "construction-projects",
    label: "Construction Projects",
    icon: HardHat,
    description: "Active and pre-construction builds",
    count: 53,
    accent: "from-navy-600 to-navy-700",
  },
  {
    slug: "investment-opportunities",
    label: "Investment Opportunities",
    icon: TrendingUp,
    description: "Equity, debt, and structured deals",
    count: 198,
    accent: "from-navy-700 to-gold-700",
  },
  {
    slug: "manufacturing-materials",
    label: "Manufacturing & Materials",
    icon: Factory,
    description: "Production capacity and supply",
    count: 41,
    accent: "from-navy-800 to-navy-600",
  },
  {
    slug: "infrastructure",
    label: "Infrastructure",
    icon: TrainTrack,
    description: "Roads, ports, utilities, telecom",
    count: 29,
    accent: "from-navy-700 to-navy-800",
  },
  {
    slug: "energy",
    label: "Energy",
    icon: Zap,
    description: "Renewables, oil & gas, storage",
    count: 35,
    accent: "from-navy-800 to-gold-700",
  },
  {
    slug: "hospitality",
    label: "Hospitality",
    icon: UtensilsCrossed,
    description: "Restaurants, clubs, entertainment",
    count: 47,
    accent: "from-navy-700 to-navy-600",
  },
  {
    slug: "commercial-services",
    label: "Commercial Services",
    icon: Briefcase,
    description: "Professional and B2B services",
    count: 58,
    accent: "from-navy-600 to-navy-800",
  },
  {
    slug: "business-acquisitions",
    label: "Business Acquisitions",
    icon: Tag,
    description: "Operating companies for sale",
    count: 76,
    accent: "from-navy-800 to-navy-700",
  },
  {
    slug: "joint-ventures",
    label: "Joint Ventures",
    icon: Handshake,
    description: "Partnerships and co-investment",
    count: 92,
    accent: "from-navy-700 to-gold-700",
  },
  {
    slug: "suppliers-logistics",
    label: "Suppliers & Logistics",
    icon: Truck,
    description: "Vendors, freight, and distribution",
    count: 38,
    accent: "from-navy-600 to-navy-700",
  },
];
