/**
 * Maps institute codes to their state locations.
 * Derived from institute names in the CSV data.
 */
export const INSTITUTE_STATE_MAP: Record<number, string> = {
  // IITs
  101: "Odisha",           // IIT Bhubaneswar
  102: "Maharashtra",      // IIT Bombay
  103: "Himachal Pradesh",  // IIT Mandi
  104: "Delhi",             // IIT Delhi
  105: "Madhya Pradesh",    // IIT Indore
  106: "West Bengal",       // IIT Kharagpur
  107: "Telangana",         // IIT Hyderabad
  108: "Rajasthan",         // IIT Jodhpur
  109: "Uttar Pradesh",     // IIT Kanpur
  110: "Tamil Nadu",        // IIT Madras
  111: "Gujarat",           // IIT Gandhinagar
  112: "Bihar",             // IIT Patna
  113: "Uttarakhand",       // IIT Roorkee
  114: "Jharkhand",         // IIT (ISM) Dhanbad
  115: "Punjab",            // IIT Ropar
  116: "Uttar Pradesh",     // IIT (BHU) Varanasi
  117: "Assam",             // IIT Guwahati
  118: "Chhattisgarh",      // IIT Bhilai
  119: "Goa",               // IIT Goa
  120: "Kerala",            // IIT Palakkad
  121: "Andhra Pradesh",    // IIT Tirupati
  122: "Jammu and Kashmir", // IIT Jammu
  123: "Karnataka",         // IIT Dharwad

  // NITs
  201: "Punjab",            // NIT Jalandhar
  202: "Rajasthan",         // MNIT Jaipur
  203: "Madhya Pradesh",    // MANIT Bhopal
  204: "Uttar Pradesh",     // MNNIT Allahabad
  205: "Tripura",           // NIT Agartala
  206: "Kerala",            // NIT Calicut
  207: "Delhi",             // NIT Delhi
  208: "West Bengal",       // NIT Durgapur
  209: "Goa",               // NIT Goa
  210: "Himachal Pradesh",  // NIT Hamirpur
  211: "Karnataka",         // NIT Karnataka Surathkal
  212: "Meghalaya",         // NIT Meghalaya
  213: "Nagaland",          // NIT Nagaland
  214: "Bihar",             // NIT Patna
  215: "Puducherry",        // NIT Puducherry
  216: "Chhattisgarh",      // NIT Raipur
  217: "Sikkim",            // NIT Sikkim
  218: "Arunachal Pradesh", // NIT Arunachal Pradesh
  219: "Jharkhand",         // NIT Jamshedpur
  220: "Haryana",           // NIT Kurukshetra
  221: "Manipur",           // NIT Manipur
  222: "Mizoram",           // NIT Mizoram
  223: "Odisha",            // NIT Rourkela
  224: "Assam",             // NIT Silchar
  225: "Jammu and Kashmir", // NIT Srinagar
  226: "Tamil Nadu",        // NIT Tiruchirappalli
  227: "Uttarakhand",       // NIT Uttarakhand
  228: "Telangana",         // NIT Warangal
  229: "Gujarat",           // SVNIT Surat
  230: "Maharashtra",       // VNIT Nagpur
  231: "Andhra Pradesh",    // NIT Andhra Pradesh
  232: "West Bengal",       // IIEST Shibpur

  // IIITs
  301: "Madhya Pradesh",    // IIITM Gwalior
  302: "Rajasthan",         // IIIT Kota
  303: "Assam",             // IIIT Guwahati
  304: "West Bengal",       // IIIT Kalyani
  305: "Haryana",           // IIIT Sonepat
  306: "Himachal Pradesh",  // IIIT Una
  307: "Andhra Pradesh",    // IIIT Sri City
  308: "Gujarat",           // IIIT Vadodara
  309: "Uttar Pradesh",     // IIIT Allahabad
  310: "Tamil Nadu",        // IIITDM Kancheepuram
  311: "Madhya Pradesh",    // IIITDM Jabalpur
  313: "Manipur",           // IIIT Senapati Manipur
  314: "Tamil Nadu",        // IIIT Tiruchirappalli
  315: "Uttar Pradesh",     // IIIT Lucknow
  316: "Karnataka",         // IIIT Dharwad
  317: "Andhra Pradesh",    // IIITDM Kurnool
  318: "Kerala",            // IIIT Kottayam
  319: "Jharkhand",         // IIIT Ranchi
  320: "Maharashtra",       // IIIT Nagpur
  321: "Maharashtra",       // IIIT Pune
  322: "Bihar",             // IIIT Bhagalpur
  323: "Madhya Pradesh",    // IIIT Bhopal
  324: "Gujarat",           // IIIT Surat
  325: "Tripura",           // IIIT Agartala
  326: "Karnataka",         // IIIT Raichur
  327: "Dadra and Nagar Haveli", // IIIT Vadodara International Campus Diu

  // GFTIs
  401: "Assam",             // Assam University Silchar
  402: "Jharkhand",         // BIT Mesra Ranchi
  403: "Uttarakhand",       // Gurukula Kangri Vishwavidyalaya
  404: "Uttar Pradesh",     // Indian Institute of Carpet Technology
  405: "Gujarat",           // IITRAM Ahmedabad
  406: "Chhattisgarh",      // Guru Ghasidas Vishwavidyalaya
  407: "Uttar Pradesh",     // University of Allahabad
  408: "Maharashtra",       // NIELIT Aurangabad
  409: "Jharkhand",         // NIAM Ranchi
  410: "Punjab",            // SLIET Longowal
  411: "Mizoram",           // Mizoram University
  412: "Assam",             // Tezpur University
  413: "Madhya Pradesh",    // SPA Bhopal
  414: "Delhi",             // SPA New Delhi
  415: "Andhra Pradesh",    // SPA Vijayawada
  416: "Jammu and Kashmir", // SMVDU Katra
  420: "Chhattisgarh",      // IIIT Naya Raipur
  421: "Telangana",         // University of Hyderabad
  422: "Chandigarh",        // PEC Chandigarh
  423: "Delhi",             // JNU Delhi
  424: "Odisha",            // IIIT Bhubaneswar
  425: "Assam",             // CIT Kokrajhar
  426: "Puducherry",        // Puducherry Technological University
  427: "West Bengal",       // GKCIET Malda
  428: "Rajasthan",         // Central University of Rajasthan
  430: "Haryana",           // NIFTEM Kundli
  431: "Tamil Nadu",        // NIFTEM Thanjavur
  432: "Arunachal Pradesh", // NERIST Itanagar
  433: "Uttar Pradesh",     // IIHT Varanasi
  434: "Chhattisgarh",      // CSVTU Bhilai
  435: "Odisha",            // ICT Mumbai-IOC Campus Bhubaneswar
  436: "Meghalaya",         // NEHU Shillong
  437: "Jammu and Kashmir", // Central University of Jammu
  438: "Madhya Pradesh",    // Dr. H.S. Gour University Sagar
  439: "Haryana",           // Central University of Haryana
  440: "Jharkhand",         // BIT Deoghar Off-Campus
  441: "Bihar",             // BIT Patna Off-Campus
  442: "Tamil Nadu",        // IIHT Salem
  443: "Gujarat",           // Gati Shakti Vishwavidyalaya Vadodara
  444: "Jharkhand",         // CU Jharkhand
  445: "Punjab",            // NIELIT Ropar
  446: "Bihar",             // NIELIT Patna
  447: "Rajasthan",         // NIELIT Ajmer
  448: "Uttar Pradesh",     // NIELIT Gorakhpur
  449: "Uttar Pradesh",     // RGNU Amethi
  450: "Jammu and Kashmir", // IUST Kashmir
  451: "Madhya Pradesh",    // SGSITS Indore
};

/**
 * Get state for an institute code. Returns "Unknown" if not found.
 */
export function getInstituteState(code: number): string {
  return INSTITUTE_STATE_MAP[code] || "Unknown";
}

/**
 * Nearby states mapping - states geographically close to each other.
 * Used for "Near My Domicile State" filter.
 */
export const NEARBY_STATES: Record<string, string[]> = {
  "Delhi": ["Haryana", "Uttar Pradesh", "Rajasthan", "Uttarakhand", "Punjab", "Chandigarh"],
  "Haryana": ["Delhi", "Punjab", "Rajasthan", "Uttar Pradesh", "Uttarakhand", "Himachal Pradesh", "Chandigarh"],
  "Uttar Pradesh": ["Delhi", "Haryana", "Rajasthan", "Madhya Pradesh", "Chhattisgarh", "Bihar", "Jharkhand", "Uttarakhand"],
  "Maharashtra": ["Gujarat", "Madhya Pradesh", "Chhattisgarh", "Karnataka", "Telangana", "Goa"],
  "Karnataka": ["Maharashtra", "Goa", "Kerala", "Tamil Nadu", "Telangana", "Andhra Pradesh"],
  "Tamil Nadu": ["Kerala", "Karnataka", "Andhra Pradesh", "Puducherry"],
  "West Bengal": ["Bihar", "Jharkhand", "Odisha", "Assam", "Sikkim"],
  "Rajasthan": ["Gujarat", "Madhya Pradesh", "Uttar Pradesh", "Haryana", "Delhi", "Punjab"],
  "Gujarat": ["Rajasthan", "Maharashtra", "Madhya Pradesh"],
  "Madhya Pradesh": ["Rajasthan", "Uttar Pradesh", "Chhattisgarh", "Maharashtra", "Gujarat"],
  "Bihar": ["Uttar Pradesh", "Jharkhand", "West Bengal"],
  "Punjab": ["Haryana", "Himachal Pradesh", "Rajasthan", "Delhi", "Chandigarh", "Jammu and Kashmir"],
  "Telangana": ["Maharashtra", "Chhattisgarh", "Karnataka", "Andhra Pradesh"],
  "Andhra Pradesh": ["Telangana", "Karnataka", "Tamil Nadu", "Odisha", "Chhattisgarh"],
  "Kerala": ["Tamil Nadu", "Karnataka"],
  "Odisha": ["West Bengal", "Jharkhand", "Chhattisgarh", "Andhra Pradesh"],
  "Jharkhand": ["Bihar", "West Bengal", "Odisha", "Chhattisgarh", "Uttar Pradesh"],
  "Assam": ["West Bengal", "Meghalaya", "Nagaland", "Manipur", "Mizoram", "Tripura", "Arunachal Pradesh"],
  "Chhattisgarh": ["Madhya Pradesh", "Uttar Pradesh", "Jharkhand", "Odisha", "Telangana", "Maharashtra"],
  "Uttarakhand": ["Uttar Pradesh", "Himachal Pradesh", "Haryana", "Delhi"],
  "Himachal Pradesh": ["Punjab", "Haryana", "Uttarakhand", "Chandigarh", "Jammu and Kashmir"],
  "Jammu and Kashmir": ["Himachal Pradesh", "Punjab", "Ladakh"],
  "Goa": ["Maharashtra", "Karnataka"],
  "Chandigarh": ["Punjab", "Haryana", "Himachal Pradesh"],
  "Tripura": ["Assam", "Mizoram", "West Bengal"],
  "Meghalaya": ["Assam"],
  "Manipur": ["Assam", "Nagaland", "Mizoram"],
  "Nagaland": ["Assam", "Manipur", "Arunachal Pradesh"],
  "Mizoram": ["Assam", "Manipur", "Tripura"],
  "Arunachal Pradesh": ["Assam", "Nagaland"],
  "Sikkim": ["West Bengal"],
  "Puducherry": ["Tamil Nadu"],
  "Ladakh": ["Jammu and Kashmir"],
  "Andaman and Nicobar Islands": [],
};
