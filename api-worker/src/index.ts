export interface Env {
  DB: D1Database;
  API_SECRET_KEY: string;
}

const ALLOWED_ORIGINS = [
  "collegepredictor-e88.pages.dev",
  "collegepredictor.pages.dev",
  "college-predictor.pages.dev",
  "jee.qzz.io",
  "qzz.io"
];

function isOriginAllowed(origin: string): boolean {
  try {
    const url = new URL(origin);
    const hostname = url.hostname;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return true;
    }

    return ALLOWED_ORIGINS.some(domain => {
      return hostname === domain || hostname.endsWith("." + domain);
    });
  } catch {
    return false;
  }
}

function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  let allowedOrigin = "https://jee.qzz.io";

  if (requestOrigin && isOriginAllowed(requestOrigin)) {
    allowedOrigin = requestOrigin;
  }

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

// Input validation constants
const VALID_CATEGORIES = ["OPEN", "EWS", "OBC-NCL", "SC", "ST"] as const;
const VALID_GENDERS = ["Male", "Female"] as const;
const VALID_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam",
  "Bihar", "Chandigarh", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Jammu and Kashmir", "Ladakh",
] as const;

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MIN_RANK = 1;
const MAX_RANK = 999999;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_PATTERN = /^[a-zA-Z\s.'-]+$/;

interface ValidationResult {
  valid: boolean;
  error?: string;
}

function validatePredictionInput(body: Record<string, unknown>): ValidationResult {
  const { crlRank, categoryRank, category, gender, homeState, name, email } = body;

  if (typeof name !== "string" || name.length < 1 || name.length > MAX_NAME_LENGTH || !NAME_PATTERN.test(name)) {
    return { valid: false, error: "Invalid name" };
  }
  if (typeof email !== "string" || email.length < 3 || email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    return { valid: false, error: "Invalid email" };
  }
  const rank = Number(crlRank);
  if (!Number.isInteger(rank) || rank < MIN_RANK || rank > MAX_RANK) {
    return { valid: false, error: "Invalid CRL rank" };
  }
  if (categoryRank !== undefined && categoryRank !== null) {
    const catRank = Number(categoryRank);
    if (!Number.isInteger(catRank) || catRank < MIN_RANK || catRank > MAX_RANK) {
      return { valid: false, error: "Invalid category rank" };
    }
  }
  if (typeof category !== "string" || !(VALID_CATEGORIES as readonly string[]).includes(category)) {
    return { valid: false, error: "Invalid category" };
  }
  if (typeof gender !== "string" || !(VALID_GENDERS as readonly string[]).includes(gender)) {
    return { valid: false, error: "Invalid gender" };
  }
  if (typeof homeState !== "string" || !(VALID_STATES as readonly string[]).includes(homeState)) {
    return { valid: false, error: "Invalid home state" };
  }

  return { valid: true };
}

// Simple in-memory rate limiter (per-isolate; sufficient for edge workers)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 300_000; // 5 minutes
const RATE_LIMIT_MAX = 30;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// Periodic cleanup to prevent memory leaks from stale entries
function pruneRateLimitMap(): void {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now >= entry.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}

// Institute state mappings and prediction helpers

export type ProbabilityLevel = "high" | "medium" | "low";

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

export function getInstituteState(code: number): string {
  return INSTITUTE_STATE_MAP[code] || "Unknown";
}

export function classifyProbability(
  userRank: number,
  closingRank: number
): ProbabilityLevel | null {
  if (closingRank <= 0) return null;

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

export function getEffectiveRank(
  crlRank: number,
  categoryRank: number | undefined,
  category: string,
  seatType: string
): number {
  if (seatType === "OPEN") return crlRank;
  if (categoryRank && category !== "OPEN") return categoryRank;
  return crlRank;
}

export function getGenderFilters(gender: string): string[] {
  if (gender === "Female") {
    return ["Gender-Neutral", "Female-only (including Supernumerary)"];
  }
  return ["Gender-Neutral"];
}

export function getSeatTypeFilters(category: string): string[] {
  const types = ["OPEN"];
  if (category !== "OPEN") {
    types.push(category);
  }
  return types;
}

export function getCsabQuota(
  instituteState: string,
  userHomeState: string
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

export function getJosaaQuotas(
  instituteState: string,
  userHomeState: string,
  instituteType: string
): string[] {
  if (instituteType === "IIT") {
    return ["AI"];
  }

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

async function getAESKey(windowStr: string, secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(windowStr);

  const hmacKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const keyMaterial = await crypto.subtle.sign(
    "HMAC",
    hmacKey,
    messageData
  );

  return await crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

function uint8ArrayToBase64(arr: Uint8Array): string {
  let binary = "";
  const len = arr.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  return btoa(binary);
}

async function encryptData(data: string, key: CryptoKey): Promise<{ iv: string; ciphertext: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedData
  );

  const ivBase64 = btoa(String.fromCharCode(...iv));
  const ciphertextBase64 = uint8ArrayToBase64(new Uint8Array(ciphertext));

  return { iv: ivBase64, ciphertext: ciphertextBase64 };
}

async function verifyAuthToken(authHeader: string | null, secret: string): Promise<boolean> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;

  const token = authHeader.substring(7);
  
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  
  const [windowStr, signature] = parts;
  const tokenWindow = Number(windowStr);
  if (isNaN(tokenWindow)) return false;
  
  // Check if tokenWindow is within [current - 1, current + 1] to allow window transitions
  const currentWindow = Math.floor(Date.now() / 300000);
  const diff = Math.abs(currentWindow - tokenWindow);
  if (diff > 1) {
    console.error("Token window expired. Worker window:", currentWindow, "Token window:", tokenWindow);
    return false;
  }
  
  // Generate the expected HMAC signature
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(windowStr);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Convert hex signature back to Uint8Array
    const sigBytes = new Uint8Array(
      signature.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    );

    const isValid = await crypto.subtle.verify(
      "HMAC",
      cryptoKey,
      sigBytes,
      messageData
    );

    return isValid;
  } catch (err) {
    console.error("Error during crypto verification:", err);
    return false;
  }
}

// Cloudflare Worker entry point

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const corsHeaders = getCorsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === "/api/health" && request.method === "GET") {
      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // Require API_SECRET_KEY to be configured
    if (!env.API_SECRET_KEY) {
      console.error("API_SECRET_KEY environment variable is not configured");
      return new Response(JSON.stringify({ error: "Service unavailable" }), {
        status: 503,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // Rate limit check using connecting IP
    const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";
    if (!checkRateLimit(clientIp)) {
      return new Response(JSON.stringify({ error: "Too many requests. Try again later." }), {
        status: 429,
        headers: { "Content-Type": "application/json", "Retry-After": "300", ...corsHeaders }
      });
    }

    // Schedule periodic cleanup of stale rate limit entries
    ctx.waitUntil(Promise.resolve().then(pruneRateLimitMap));

    // Token verification
    const authHeader = request.headers.get("Authorization");
    const isAuthorized = await verifyAuthToken(authHeader, env.API_SECRET_KEY);
    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // Determine the window used for encryption key derivation
    let encryptionWindow = Math.floor(Date.now() / 300000).toString();
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const tokenVal = authHeader.substring(7);
      const parts = tokenVal.split(".");
      if (parts.length === 2 && !isNaN(Number(parts[0]))) {
        encryptionWindow = parts[0];
      }
    }

    // JoSAA prediction
    if (url.pathname === "/api/predict/josaa" && request.method === "POST") {
      try {
        const body = (await request.json()) as Record<string, unknown>;
        const validation = validatePredictionInput(body);
        if (!validation.valid) {
          return new Response(JSON.stringify({ error: validation.error }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }

        const { crlRank, categoryRank, category, gender, homeState, name, email } = body as {
          crlRank: number; categoryRank?: number; category: string;
          gender: string; homeState: string; name: string; email: string;
        };

        await env.DB.prepare(
          `INSERT INTO UserPrediction (name, email, crlRank, categoryRank, category, gender, homeState, predictorType, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          name,
          email,
          Number(crlRank),
          categoryRank ? Number(categoryRank) : null,
          category,
          gender,
          homeState,
          "josaa",
          new Date().toISOString()
        ).run();

        // Build query filters
        const genderFilters = getGenderFilters(gender);
        const seatTypeFilters = getSeatTypeFilters(category);

        const seatTypePlaceholder = seatTypeFilters.map(() => "?").join(",");
        const genderPlaceholder = genderFilters.map(() => "?").join(",");

        // Fetch matching cutoff rows
        const sql = `
          SELECT c.programName, c.quota, c.seatType, c.gender, c.openingRank, c.closingRank, c.round, c.programDuration, c.programType, c.instituteCode,
                 i.name as instituteName, i.type as instituteType
          FROM CutoffJosaa c
          JOIN Institute i ON c.instituteCode = i.code
          WHERE c.round = 6
            AND c.isPwd = 0
            AND i.type != 'IIT'
            AND c.seatType IN (${seatTypePlaceholder})
            AND c.gender IN (${genderPlaceholder})
          ORDER BY c.closingRank ASC
        `;

        const params = [...seatTypeFilters, ...genderFilters];
        const { results } = await env.DB.prepare(sql).bind(...params).all();

        // Match and classify results
        const matched = [];
        for (const row of results as any[]) {
          const instituteState = getInstituteState(row.instituteCode);
          const relevantQuotas = getJosaaQuotas(instituteState, homeState, row.instituteType);

          if (!relevantQuotas.includes(row.quota)) continue;

          const effectiveRank = getEffectiveRank(
            crlRank,
            categoryRank ?? undefined,
            category,
            row.seatType
          );

          const probability = classifyProbability(effectiveRank, row.closingRank);
          if (!probability) continue;



          matched.push({
            instituteName: row.instituteName,
            instituteCode: row.instituteCode,
            instituteType: row.instituteType,
            programName: row.programName,
            programType: row.programType,
            programDuration: row.programDuration,
            openingRank: row.openingRank,
            closingRank: row.closingRank,
            probability,
            quota: row.quota,
            seatType: row.seatType,
            round: row.round,
          });
        }

        // Sort by probability first, then closing rank
        const probOrder = { high: 0, medium: 1, low: 2 };
        matched.sort((a, b) => {
          const pDiff = probOrder[a.probability] - probOrder[b.probability];
          if (pDiff !== 0) return pDiff;
          return a.closingRank - b.closingRank;
        });

        const payloadJson = JSON.stringify({ results: matched, total: matched.length });
        const aesKey = await getAESKey(encryptionWindow, env.API_SECRET_KEY);
        const encryptedRes = await encryptData(payloadJson, aesKey);

        return new Response(JSON.stringify({
          encrypted: encryptedRes.ciphertext,
          iv: encryptedRes.iv,
          window: encryptionWindow
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      } catch (err) {
        console.error("Prediction error:", err);
        return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
    }

    // CSAB prediction
    if (url.pathname === "/api/predict/csab" && request.method === "POST") {
      try {
        const body = (await request.json()) as Record<string, unknown>;
        const validation = validatePredictionInput(body);
        if (!validation.valid) {
          return new Response(JSON.stringify({ error: validation.error }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }

        const { crlRank, category, gender, homeState, name, email } = body as {
          crlRank: number; category: string; gender: string;
          homeState: string; name: string; email: string;
        };

        await env.DB.prepare(
          `INSERT INTO UserPrediction (name, email, crlRank, categoryRank, category, gender, homeState, predictorType, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          name,
          email,
          Number(crlRank),
          null,
          category,
          gender,
          homeState,
          "csab",
          new Date().toISOString()
        ).run();

        // Build query filters
        const genderFilters = getGenderFilters(gender);
        const seatTypeFilters = getSeatTypeFilters(category);

        const seatTypePlaceholder = seatTypeFilters.map(() => "?").join(",");
        const genderPlaceholder = genderFilters.map(() => "?").join(",");

        // Fetch matching cutoff rows
        const sql = `
          SELECT c.programName, c.quota, c.seatType, c.gender, c.openingRank, c.closingRank, c.round, c.programDuration, c.programType, c.instituteCode,
                 i.name as instituteName, i.type as instituteType
          FROM CutoffCsab c
          JOIN Institute i ON c.instituteCode = i.code
          WHERE c.round = 3
            AND c.isPwd = 0
            AND i.type != 'IIT'
            AND c.seatType IN (${seatTypePlaceholder})
            AND c.gender IN (${genderPlaceholder})
          ORDER BY c.closingRank ASC
        `;

        const params = [...seatTypeFilters, ...genderFilters];
        const { results } = await env.DB.prepare(sql).bind(...params).all();

        // Match and classify results
        const matched = [];
        for (const row of results as any[]) {
          const instituteState = getInstituteState(row.instituteCode);
          const relevantQuotas = getCsabQuota(instituteState, homeState);

          if (!relevantQuotas.includes(row.quota)) continue;

          const probability = classifyProbability(crlRank, row.closingRank);
          if (!probability) continue;



          matched.push({
            instituteName: row.instituteName,
            instituteCode: row.instituteCode,
            instituteType: row.instituteType,
            programName: row.programName,
            programType: row.programType,
            programDuration: row.programDuration,
            openingRank: row.openingRank,
            closingRank: row.closingRank,
            probability,
            quota: row.quota,
            seatType: row.seatType,
            round: row.round,
          });
        }

        // Sort by probability first, then closing rank
        const probOrder = { high: 0, medium: 1, low: 2 };
        matched.sort((a, b) => {
          const pDiff = probOrder[a.probability] - probOrder[b.probability];
          if (pDiff !== 0) return pDiff;
          return a.closingRank - b.closingRank;
        });

        const payloadJson = JSON.stringify({ results: matched, total: matched.length });
        const aesKey = await getAESKey(encryptionWindow, env.API_SECRET_KEY);
        const encryptedRes = await encryptData(payloadJson, aesKey);

        return new Response(JSON.stringify({
          encrypted: encryptedRes.ciphertext,
          iv: encryptedRes.iv,
          window: encryptionWindow
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      } catch (err) {
        console.error("Prediction error:", err);
        return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
    }

    return new Response("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain", ...corsHeaders }
    });
  }
};
