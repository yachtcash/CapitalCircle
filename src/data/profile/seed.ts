import type { UserProfile } from "./types";

export const SEED_PROFILE: UserProfile = {
  id: "USER-000001",
  name: "Stevie Cabrera",
  title: "CEO & Founder",
  company: "Pacific Coast Development Group",
  industry: "Luxury Hospitality",
  country: "Mexico",
  state: "Baja California Sur",
  city: "Cabo San Lucas",

  email: "s.cabrera@example.com",
  phone: "+52 624 555 0142",
  website: "https://pacificcoastdev.example",
  websiteLabel: "pacificcoastdev.example",

  bio: "Sponsor and operator of design-led coastal hospitality across Mexico and the Caribbean.",
  about:
    "Twelve years of experience originating, structuring, and operating boutique hotels and branded residence projects between $5M and $80M. I lead Pacific Coast Development Group as principal — every deal we touch is one we live with day-to-day.",

  expertise: [
    "Hotels & Resorts",
    "Hospitality",
    "Joint Ventures",
    "Real Estate Development",
    "Land Opportunities",
    "Capital Raising",
  ],

  experience: [
    {
      id: "exp-pcg",
      company: "Pacific Coast Development Group",
      title: "CEO & Founder",
      startYear: 2013,
      location: "Cabo San Lucas, Mexico",
      description:
        "Founded the firm to develop, own, and operate boutique hospitality on the Sea of Cortez and Pacific coast of Mexico. $420M deployed across 11 hospitality assets, 2 full-cycle exits at 2.6× and 2.9× MOIC.",
    },
    {
      id: "exp-rosewood",
      company: "Rosewood Hotels & Resorts",
      title: "Vice President, Development — LatAm",
      startYear: 2008,
      endYear: 2013,
      location: "Mexico City, Mexico",
      description:
        "Led site selection, deal structuring, and pre-opening for branded resort assets across Mexico and the Caribbean. Delivered three flagship properties across five years.",
    },
    {
      id: "exp-st-regis",
      company: "St. Regis Hospitality",
      title: "Director, Acquisitions",
      startYear: 2004,
      endYear: 2008,
      location: "Miami, FL",
      description:
        "Underwrote and closed hospitality acquisitions across the Caribbean and Central America for the development pipeline.",
    },
  ],

  privacy: {
    email: "Approved Contacts Only",
    phone: "Private",
  },

  coverGradient: "navy-gold",
  initials: "SC",

  joinedYear: 2024,
  memberTier: "Founding Member",
};
