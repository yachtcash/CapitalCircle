export type OpportunityStatus = "Open" | "Funding" | "Closing Soon";

export type Opportunity = {
  id: string;
  title: string;
  category: string;
  location: string;
  investmentRange: string;
  expectedReturn: string;
  status: OpportunityStatus;
  description: string;
  gradient: string;
  postedBy: string;
  postedAgo: string;
};

export const featuredOpportunities: Opportunity[] = [
  {
    id: "cc-001",
    title: "Beachfront Boutique Hotel — 42 Keys",
    category: "Hotels & Resorts",
    location: "Cabo San Lucas, Mexico",
    investmentRange: "$8M – $12M",
    expectedReturn: "18% IRR",
    status: "Funding",
    description:
      "Established cash-flowing boutique with expansion entitlements for 18 additional keys and a beach club.",
    gradient: "card-gradient-1",
    postedBy: "Pacific Coast Holdings",
    postedAgo: "2 days ago",
  },
  {
    id: "cc-002",
    title: "Mixed-Use Tower Development",
    category: "Real Estate Development",
    location: "Miami, FL",
    investmentRange: "$45M – $60M",
    expectedReturn: "22% IRR",
    status: "Open",
    description:
      "32-story project with 240 residences, 18k sqft retail, and structured parking. Permits secured.",
    gradient: "card-gradient-2",
    postedBy: "Aurora Capital Partners",
    postedAgo: "5 days ago",
  },
  {
    id: "cc-003",
    title: "Coastal Development Land — 84 Acres",
    category: "Land Opportunities",
    location: "Punta Mita, Mexico",
    investmentRange: "$14M",
    expectedReturn: "Sale + JV options",
    status: "Open",
    description:
      "Master-planned parcel with ocean views, road access, and tentative resort zoning approval.",
    gradient: "card-gradient-3",
    postedBy: "Riviera Land Group",
    postedAgo: "1 week ago",
  },
  {
    id: "cc-004",
    title: "Regional Logistics Operator Acquisition",
    category: "Business Acquisitions",
    location: "Dallas, TX",
    investmentRange: "$22M – $28M",
    expectedReturn: "4.2x EBITDA",
    status: "Closing Soon",
    description:
      "Profitable 28-truck fleet servicing Fortune 500 manufacturers. Owner retiring, clean books.",
    gradient: "card-gradient-4",
    postedBy: "Confidential Seller",
    postedAgo: "3 days ago",
  },
  {
    id: "cc-005",
    title: "Solar + Storage Portfolio — 120 MW",
    category: "Energy",
    location: "Sonora, Mexico",
    investmentRange: "$95M",
    expectedReturn: "14% IRR",
    status: "Funding",
    description:
      "Three interconnected utility-scale sites with signed PPAs and grid interconnection in place.",
    gradient: "card-gradient-5",
    postedBy: "Helios Infrastructure",
    postedAgo: "1 day ago",
  },
  {
    id: "cc-006",
    title: "Joint Venture — Branded Residences",
    category: "Joint Ventures",
    location: "Tulum, Mexico",
    investmentRange: "$30M LP",
    expectedReturn: "2.4x MOIC",
    status: "Open",
    description:
      "Operator-led JV with major hospitality flag. Seeking LP for equity tranche, 4-year hold.",
    gradient: "card-gradient-6",
    postedBy: "Yucatán Development Co.",
    postedAgo: "6 days ago",
  },
];
