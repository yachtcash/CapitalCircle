// Profile data model for the current Capital Circle member.
//
// Mock-only — held in MessagingProvider state and persisted to
// localStorage. There's no auth layer; "me" always resolves to a single
// stored profile that the user can edit locally.

export type PrivacyLevel = "Private" | "Approved Contacts Only" | "Public";

export type MemberTier = "Founding Member" | "Premium Member" | "Member";

export type ProfileExperience = {
  id: string;
  company: string;
  title: string;
  startYear: number;
  endYear?: number; // undefined = current role
  description?: string;
  location?: string;
};

export type ProfilePrivacy = {
  email: PrivacyLevel;
  phone: PrivacyLevel;
};

export type UserProfile = {
  id: string; // "USER-000001"
  name: string;
  title: string;
  company: string;
  industry: string;
  country: string;
  state?: string;
  city: string;

  email: string;
  phone: string;
  website: string;
  websiteLabel: string;

  bio: string; // one-line tagline
  about: string; // longer narrative

  expertise: string[];
  experience: ProfileExperience[];

  privacy: ProfilePrivacy;

  /** Reference key to a named cover gradient (rendered in CSS). */
  coverGradient: "navy-gold" | "navy-deep" | "twilight" | "sunrise";
  initials: string;

  joinedYear: number;
  memberTier: MemberTier;
};

export const PRIVACY_OPTIONS: { value: PrivacyLevel; label: string; hint: string }[] = [
  {
    value: "Private",
    label: "Private",
    hint: "Hidden from every member.",
  },
  {
    value: "Approved Contacts Only",
    label: "Approved contacts only",
    hint: "Only members you've approved or negotiated with see this.",
  },
  {
    value: "Public",
    label: "Public",
    hint: "Visible to every Capital Circle member.",
  },
];

/** Recommended expertise vocabulary surfaced in the tag editor. */
export const EXPERTISE_SUGGESTIONS: string[] = [
  "Real Estate Development",
  "Hotels & Resorts",
  "Hospitality",
  "Capital Raising",
  "Construction",
  "Infrastructure",
  "Energy",
  "Renewables",
  "Manufacturing",
  "Logistics",
  "Land Opportunities",
  "Joint Ventures",
  "Business Acquisitions",
  "Investor Relations",
  "Asset Management",
  "Brand Licensing",
];
