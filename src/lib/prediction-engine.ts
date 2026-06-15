import type { ProbabilityLevel } from "./constants";

export interface PredictionInput {
  crlRank: number;
  categoryRank?: number;
  category: string;
  gender: string;
  homeState: string;
  predictorType: "josaa" | "csab";
}

export interface CutoffRow {
  id: number;
  programName: string;
  quota: string;
  seatType: string;
  gender: string;
  openingRank: number;
  closingRank: number;
  round: number;
  instituteCode: number;
  programDuration: number;
  programType: string;
  isPwd: boolean;
  instituteName: string;
  instituteType: string;
}

export interface PredictionResult {
  instituteName: string;
  instituteCode: number;
  instituteType: string;
  programName: string;
  programType: string;
  programDuration: number;
  openingRank: number;
  closingRank: number;
  probability: ProbabilityLevel;
  quota: string;
  seatType: string;
  round: number;
}

/**
 * Classifies the probability of admission based on user's rank vs closing rank.
 * 
 * - High:   rank ≤ 80% of closing rank (strong buffer)
 * - Medium: rank between 80–105% of closing rank (borderline)
 * - Low:    rank between 105–130% of closing rank (slim chance)
 * - null:   rank > 130% (no realistic chance)
 */
export function classifyProbability(
  userRank: number,
  closingRank: number,
): ProbabilityLevel | null {
  if (closingRank <= 0) return null;

  // Proportional margins capped at absolute limits (10k / 5k / 20k)
  // For numerically smaller ranks (competitive), margins are tighter.
  const highMargin = Math.min(10000, closingRank * 0.10);
  const midMargin = Math.min(5000, closingRank * 0.05);
  const lowMargin = Math.min(20000, closingRank * 0.20);

  if (userRank <= closingRank - highMargin) {
    return "high";
  }
  if (userRank <= closingRank + midMargin) {
    return "medium";
  }
  if (userRank <= closingRank + lowMargin) {
    return "low";
  }
  return null;
}

/**
 * Determines which rank to use for matching.
 * For OPEN category, always use CRL rank.
 * For reserved categories (EWS, OBC, SC, ST), use category rank if provided, else CRL.
 */
export function getEffectiveRank(
  crlRank: number,
  categoryRank: number | undefined,
  category: string,
  seatType: string,
): number {
  // For OPEN seats, always use CRL
  if (seatType === "OPEN") return crlRank;

  // For reserved category seats, use category rank if available
  if (categoryRank && category !== "OPEN") return categoryRank;

  return crlRank;
}

/**
 * Determines the gender filter values based on user gender.
 * Males can only get Gender-Neutral seats.
 * Females can get both Gender-Neutral and Female-only seats.
 */
export function getGenderFilters(gender: string): string[] {
  if (gender === "Female") {
    return ["Gender-Neutral", "Female-only (including Supernumerary)"];
  }
  return ["Gender-Neutral"];
}

/**
 * Gets the seat types to query based on user's category.
 * Always include OPEN + the user's specific category.
 */
export function getSeatTypeFilters(category: string): string[] {
  const types = ["OPEN"];
  if (category !== "OPEN") {
    types.push(category);
  }
  return types;
}

/**
 * Determines the relevant quota for CSAB based on institute state and user's home state.
 */
export function getCsabQuota(
  instituteState: string,
  userHomeState: string,
): string[] {
  const quotas = ["All India"];
  if (instituteState === userHomeState) {
    quotas.push("Home State");
    if (userHomeState === "Goa") {
      quotas.push("Home State for Goa");
    }
    if (userHomeState === "Jammu and Kashmir") {
      quotas.push("Jammu & Kashmir (UT)");
    }
    if (userHomeState === "Ladakh") {
      quotas.push("Ladakh (UT)");
    }
  } else {
    quotas.push("Other State");
  }
  return quotas;
}

/**
 * Determines the relevant quotas for JoSAA based on user's home state and institute.
 * JoSAA quotas: AI (All India), HS (Home State), OS (Other State), GO (Goa), JK (J&K), LA (Ladakh)
 */
export function getJosaaQuotas(
  instituteState: string,
  userHomeState: string,
  instituteType: string,
): string[] {
  // IITs only have AI quota
  if (instituteType === "IIT") {
    return ["AI"];
  }

  // NITs and IIITs have HS/OS/AI quotas
  const quotas = ["AI"];

  if (instituteState === userHomeState) {
    quotas.push("HS");
    if (userHomeState === "Goa") quotas.push("GO");
    if (userHomeState === "Jammu and Kashmir") quotas.push("JK");
    if (userHomeState === "Ladakh") quotas.push("LA");
  } else {
    quotas.push("OS");
  }

  return quotas;
}
