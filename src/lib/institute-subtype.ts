/**
 * Sub-classifies GFTI institutes into NIELIT, Central University, and Others.
 */

// NIELIT institute codes
const NIELIT_CODES = new Set([408, 445, 446, 447, 448]);

// Central University institute codes
const CENTRAL_UNIV_CODES = new Set([
  401, // Assam University Silchar
  403, // Gurukula Kangri Vishwavidyalaya Haridwar
  411, // Mizoram University
  412, // Tezpur University
  421, // University of Hyderabad
  423, // JNU Delhi
  428, // Central University of Rajasthan
  436, // NEHU Shillong
  437, // Central University of Jammu
  438, // Dr. H.S. Gour University Sagar
  439, // Central University of Haryana
  444, // CU Jharkhand
  450, // IUST Kashmir
]);

export type InstituteSubtype = "IIT" | "NIT" | "IIIT" | "GFTI" | "NIELIT" | "CENTRAL_UNIV";

export function getInstituteSubtype(
  code: number,
  type: string,
): InstituteSubtype {
  if (type === "IIT") return "IIT";
  if (type === "NIT") return "NIT";
  if (type === "IIIT") return "IIIT";

  // GFTI sub-classification
  if (NIELIT_CODES.has(code)) return "NIELIT";
  if (CENTRAL_UNIV_CODES.has(code)) return "CENTRAL_UNIV";

  return "GFTI";
}

/**
 * Check if an institute matches a given college type filter.
 */
export function matchesCollegeType(
  code: number,
  type: string,
  filterType: string,
): boolean {
  const subtype = getInstituteSubtype(code, type);

  switch (filterType) {
    case "IIT":
      return subtype === "IIT";
    case "NIT":
      return subtype === "NIT";
    case "IIIT":
      return subtype === "IIIT";
    case "GFTI":
      // "GFTI" filter matches all GFTIs including NIELIT and Central Univ
      return type === "GFTI";
    case "NIELIT":
      return subtype === "NIELIT";
    case "CENTRAL_UNIV":
      return subtype === "CENTRAL_UNIV";
    default:
      return false;
  }
}
