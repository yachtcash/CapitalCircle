export const NEGOTIATION_STAGES = [
  "Interest Submitted",
  "Discussion Active",
  "Documents Shared",
  "Negotiation Active",
  "Under Review",
  "Agreement Reached",
] as const;

export type NegotiationStage = (typeof NEGOTIATION_STAGES)[number];

export type NegotiationStageMeta = {
  stage: NegotiationStage;
  index: number;
  shortLabel: string;
  description: string;
};

export const STAGE_META: Record<NegotiationStage, NegotiationStageMeta> = {
  "Interest Submitted": {
    stage: "Interest Submitted",
    index: 0,
    shortLabel: "Interest",
    description: "Interest submitted to the sponsor.",
  },
  "Discussion Active": {
    stage: "Discussion Active",
    index: 1,
    shortLabel: "Discussion",
    description: "Conversation is active. Sponsor has responded.",
  },
  "Documents Shared": {
    stage: "Documents Shared",
    index: 2,
    shortLabel: "Documents",
    description: "Deal documents have been exchanged.",
  },
  "Negotiation Active": {
    stage: "Negotiation Active",
    index: 3,
    shortLabel: "Negotiation",
    description: "Both sides are actively negotiating terms.",
  },
  "Under Review": {
    stage: "Under Review",
    index: 4,
    shortLabel: "Review",
    description: "Terms are being reviewed by your counsel or IC.",
  },
  "Agreement Reached": {
    stage: "Agreement Reached",
    index: 5,
    shortLabel: "Agreement",
    description: "Deal terms agreed in principle.",
  },
};

export function getStageIndex(stage: NegotiationStage): number {
  return STAGE_META[stage].index;
}
