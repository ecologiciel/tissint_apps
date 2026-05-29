import type { ScanDecision, VerdictCode, MarketplaceStatus } from "./domain";

export const SCORE_THRESHOLDS = {
  rejected: 0.5,
  eligible: 0.85,
  rareHold: 0.9,
} as const;

export function scoreToPercent(score: number): number {
  return Math.round(score * 100);
}

export function normalizeScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  if (score > 1) return Math.max(0, Math.min(1, score / 100));
  return Math.max(0, Math.min(1, score));
}

export function evaluateScanDecision(input: {
  fusionScore: number;
  className: string;
  isRare?: boolean;
}): ScanDecision {
  const fusionScore = normalizeScore(input.fusionScore);
  const isRare = Boolean(input.isRare);

  let verdict: VerdictCode;
  let marketplaceStatus: MarketplaceStatus | undefined;

  if (fusionScore < SCORE_THRESHOLDS.rejected) {
    verdict = "earth_rock";
  } else if (isRare && fusionScore >= SCORE_THRESHOLDS.rareHold) {
    verdict = "rare_hold";
    marketplaceStatus = "institutional_hold_24h";
  } else if (fusionScore >= SCORE_THRESHOLDS.eligible) {
    verdict = "eligible";
    marketplaceStatus = "published";
  } else {
    verdict = "needs_cut";
  }

  return {
    verdict,
    fusionScore,
    className: input.className,
    isRare,
    canAddToCollection: verdict !== "earth_rock",
    canPublishMarketplace: verdict === "eligible" || verdict === "rare_hold",
    needsInteriorCut: verdict === "needs_cut",
    marketplaceStatus,
    messageKey: `scan.verdict.${verdict}`,
  };
}

export function isPremiumRole(role: string): boolean {
  return role === "premium" || role === "admin";
}

export function quotaLimitForRole(role: string): number {
  if (role === "premium" || role === "admin") return 10;
  return 5;
}

export function canRevealSellerContact(role: string, status: MarketplaceStatus): boolean {
  if (status === "institutional_hold_24h") return role === "admin";
  return isPremiumRole(role);
}
