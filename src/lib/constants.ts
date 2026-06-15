// ── Indian States ──────────────────────────────────────────────────────────
export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Jammu and Kashmir",
  "Ladakh",
] as const;

export type IndianState = (typeof INDIAN_STATES)[number];

// ── Categories (Seat Types) ────────────────────────────────────────────────
export const CATEGORIES = [
  "OPEN",
  "EWS",
  "OBC-NCL",
  "SC",
  "ST",
] as const;

export type Category = (typeof CATEGORIES)[number];

// ── Genders ────────────────────────────────────────────────────────────────
export const GENDERS = ["Male", "Female"] as const;
export type Gender = (typeof GENDERS)[number];

// ── Institute Types ────────────────────────────────────────────────────────
export const INSTITUTE_TYPES = ["NIT", "IIIT", "GFTI"] as const;
export type InstituteType = (typeof INSTITUTE_TYPES)[number];

// ── College Type Filters (user-facing) ─────────────────────────────────────
export const COLLEGE_TYPE_FILTERS = [
  { value: "NIT", label: "NIT" },
  { value: "IIIT", label: "IIIT" },
  { value: "GFTI", label: "GFTI" },
  { value: "NIELIT", label: "NIELIT" },
  { value: "CENTRAL_UNIV", label: "Central University" },
] as const;

// ── Course Durations ──────────────────────────────────────────────────────
export const COURSE_DURATIONS = [
  { value: 4, label: "4 Years" },
  { value: 5, label: "5 Years" },
] as const;

// ── Degree Filters ─────────────────────────────────────────────────────────
export const DEGREE_FILTERS = [
  { value: "B.Tech", label: "B.Tech", matchPatterns: ["Bachelor of Technology", "B. Tech / B. Tech (Hons.)"] },
  { value: "B.Sc+M.Sc", label: "B.Sc + M.Sc", matchPatterns: ["Bachelor of Science and Master of Science", "Integrated Bachelor of Science-Master of Science", "Integrated Master of Science"] },
  { value: "B.Tech+M.Tech", label: "B.Tech + M.Tech", matchPatterns: ["Bachelor and Master of Technology", "Integrated B. Tech. and M. Tech.", "Integrated Master of Technology", "Integrated Masters in Technology", "B.Tech. + M.Tech./MS (Dual Degree)"] },
  { value: "B.Tech+MBA", label: "B.Tech + MBA", matchPatterns: ["Bachelor of Technology and MBA", "Integrated B. Tech. and MBA", "Bachelor of Science and MBA"] },
  { value: "B.Des", label: "B.Des", matchPatterns: ["Bachelor of Design"] },
  { value: "B.Arch", label: "B.Arch", matchPatterns: ["Bachelor of Architecture"] },
  { value: "B.Planning", label: "B.Planning", matchPatterns: ["Bachelor of Planning"] },
  { value: "B.Sc", label: "B.Sc", matchPatterns: ["Bachelor of Science"] },
] as const;

// ── Branch Type Categories ─────────────────────────────────────────────────
export const BRANCH_CATEGORIES = [
  {
    value: "cs_allied",
    label: "Computer Science & Allied Branches",
    keywords: [
      "computer science", "information technology", "software", "data science",
      "artificial intelligence", "machine learning", "cyber security",
      "information security", "data engineering", "data analytics",
      "ai ", "ai and", "cse", "it ", "cloud computing",
      "mathematics and computing", "mathematics & computing", "math", "statistics",
      "computational", "operations research", "mnc",
    ],
  },
  {
    value: "electronics_electrical",
    label: "Electronics & Electrical Branches",
    keywords: [
      "electronics", "electrical", "vlsi", "communication engineering",
      "instrumentation", "signal processing", "power", "microelectronics",
      "ece", "eee", "telecommunication",
    ],
  },
  {
    value: "mechanical_industrial",
    label: "Mechanical & Industrial Branches",
    keywords: [
      "mechanical", "industrial", "production", "manufacturing",
      "automobile", "automotive", "mechatronics", "robotics",
      "textile", "printing",
    ],
  },
  {
    value: "civil_chemical",
    label: "Civil & Chemical",
    keywords: [
      "civil", "chemical", "environmental", "petroleum",
      "ocean", "marine", "water", "infrastructure",
      "planning", "geotechnical", "structural",
    ],
  },
  {
    value: "architecture",
    label: "Architecture",
    keywords: ["architecture", "planning"],
  },
  {
    value: "biotech_life",
    label: "Biotechnology, Biomedical & Life Sciences",
    keywords: [
      "biotechnology", "biomedical", "bio engineering", "biochemical",
      "bioscience", "biological", "food technology", "pharmaceutical",
      "bio technology", "life science", "agricultural",
      "food process", "dairy",
    ],
  },
  {
    value: "aerospace",
    label: "Aerospace & Aviation",
    keywords: ["aerospace", "aeronautical", "aviation", "avionics"],
  },
  {
    value: "metallurgical_materials",
    label: "Metallurgical, Materials & Mining",
    keywords: [
      "metallurg", "materials", "mining", "mineral",
      "ceramic", "polymer",
    ],
  },
  {
    value: "pure_sciences",
    label: "Pure Sciences (Physics, Chemistry, Economics, Earth Sciences, etc.)",
    keywords: [
      "physics", "chemistry", "economics", "earth science",
      "geophysics", "geology", "applied science",
      "humanities", "liberal arts", "energy engineering",
      "engineering physics", "engineering science",
      "bs in", "b.sc", "applied geophysics",
    ],
  },
  {
    value: "management_dual",
    label: "B.Tech + MBA / Management Dual Degrees",
    keywords: ["mba", "management"],
  },
  {
    value: "other_specialized",
    label: "Other Specialized or Interdisciplinary Programs",
    keywords: [
      "design", "naval", "carpet", "handloom",
      "general engineering", "multidisciplinary", "interdisciplinary",
      "animation", "vfx",
    ],
  },
] as const;

export type BranchCategory = (typeof BRANCH_CATEGORIES)[number]["value"];

// ── Probability Levels ─────────────────────────────────────────────────────
export const PROBABILITY_LEVELS = [
  { value: "high", label: "High", color: "#248a3d", bgColor: "#eafaf1" },
  { value: "medium", label: "Medium", color: "#c97500", bgColor: "#fff7ea" },
  { value: "low", label: "Low", color: "#d12b21", bgColor: "#fdf3f2" },
] as const;

export type ProbabilityLevel = "high" | "medium" | "low";

// ── JoSAA Quota Mappings ──────────────────────────────────────────────────
export const JOSAA_QUOTAS: Record<string, string> = {
  AI: "All India",
  HS: "Home State",
  OS: "Other State",
  GO: "Goa",
  JK: "Jammu & Kashmir",
  LA: "Ladakh",
};
