import { BRANCH_CATEGORIES, type BranchCategory } from "./constants";

/**
 * Classifies an academic program name into a branch category.
 * Uses keyword matching against the program name (case-insensitive).
 */
export function classifyBranch(programName: string): BranchCategory {
  const lower = programName.toLowerCase();

  // Check MBA/management first (specific dual degree programs)
  if (lower.includes("mba") || lower.includes("management")) {
    return "management_dual";
  }

  // Check architecture/planning early
  if (lower.includes("architecture") || lower.includes("planning")) {
    if (lower.includes("planning") && !lower.includes("architecture")) {
      return "architecture"; // Planning programs group with architecture
    }
    return "architecture";
  }

  // Helper to check keywords for a category
  const hasKeywords = (value: BranchCategory): boolean => {
    const keywords = BRANCH_CATEGORIES.find((c) => c.value === value)?.keywords || [];
    for (const kw of keywords) {
      if (lower.includes(kw)) return true;
    }
    return false;
  };

  // Check CS/IT first (most common and important to catch)
  if (hasKeywords("cs_allied")) return "cs_allied";

  // Check electronics/electrical
  if (hasKeywords("electronics_electrical")) return "electronics_electrical";

  // Check aerospace (before mechanical since some overlap)
  if (hasKeywords("aerospace")) return "aerospace";

  // Check biotech/life sciences (before mechanical/chemical)
  if (hasKeywords("biotech_life")) return "biotech_life";

  // Check metallurgical/materials
  if (hasKeywords("metallurgical_materials")) return "metallurgical_materials";

  // Check mechanical/industrial
  if (hasKeywords("mechanical_industrial")) return "mechanical_industrial";

  // Check civil/chemical
  if (hasKeywords("civil_chemical")) return "civil_chemical";

  // Check pure sciences
  if (hasKeywords("pure_sciences")) return "pure_sciences";

  // Check other specialized
  if (hasKeywords("other_specialized")) return "other_specialized";

  return "other_specialized";
}

/**
 * Get the human-readable label for a branch category value.
 */
export function getBranchLabel(value: BranchCategory): string {
  const found = BRANCH_CATEGORIES.find((b) => b.value === value);
  return found ? found.label : value;
}
