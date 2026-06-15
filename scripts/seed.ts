/**
 * Seed script: imports CSV data into the SQLite database via Prisma.
 * 
 * Usage: npx tsx scripts/seed.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

const DATA_DIR = path.join(__dirname, "..", "data");

function createPrisma() {
  const adapter = new PrismaBetterSqlite3({
    url: "file:./prisma/dev.db",
  });
  return new PrismaClient({ adapter });
}

/**
 * Parse a rank string, stripping the 'P' suffix for PwD ranks.
 */
function parseRank(rankStr: string): { rank: number; isPwd: boolean } {
  const trimmed = rankStr.trim();
  if (trimmed.endsWith("P")) {
    const numStr = trimmed.slice(0, -1);
    return { rank: parseInt(numStr, 10), isPwd: true };
  }
  const num = parseInt(trimmed, 10);
  return { rank: isNaN(num) ? 0 : num, isPwd: false };
}

/**
 * Normalize seat type: strip " (PwD)" suffix for consistent categorization.
 */
function normalizeSeatType(seatType: string): { type: string; isPwd: boolean } {
  if (seatType.includes("(PwD)")) {
    return { type: seatType.replace(" (PwD)", ""), isPwd: true };
  }
  return { type: seatType, isPwd: false };
}

async function main() {
  console.log("🌱 Starting seed...\n");
  const prisma = createPrisma();

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.cutoffCsab.deleteMany();
  await prisma.cutoffJosaa.deleteMany();
  await prisma.institute.deleteMany();

  // ── Step 1: Import institutes ──────────────────────────────────────────
  console.log("📋 Importing institutes...");
  const institutesPath = path.join(DATA_DIR, "institutes-CMrzjr11.csv");
  const institutesRaw = fs.readFileSync(institutesPath, "utf-8");
  const institutes = parse(institutesRaw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Array<{ "Institute Code": string; "Institute Name": string; Type: string }>;

  let instCount = 0;
  for (const inst of institutes) {
    await prisma.institute.create({
      data: {
        code: parseInt(inst["Institute Code"], 10),
        name: inst["Institute Name"],
        type: inst["Type"],
      },
    });
    instCount++;
  }
  console.log(`   ✅ Imported ${instCount} institutes\n`);

  // Get valid institute codes
  const validCodes = new Set(institutes.map((i) => parseInt(i["Institute Code"], 10)));

  // ── Step 2: Import JoSAA cutoffs ──────────────────────────────────────
  console.log("📊 Importing JoSAA cutoffs (this may take a moment)...");
  const josaaPath = path.join(DATA_DIR, "refine_joosa-CFMYHpJL.csv");
  const josaaRaw = fs.readFileSync(josaaPath, "utf-8");
  const josaaRows = parse(josaaRaw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Array<Record<string, string>>;

  let josaaCount = 0;
  let josaaSkipped = 0;
  const josaaData: Parameters<typeof prisma.cutoffJosaa.create>[0]["data"][] = [];

  for (const row of josaaRows) {
    const instCode = parseInt(row["Institute Code"], 10);
    if (!validCodes.has(instCode)) {
      josaaSkipped++;
      continue;
    }

    const opening = parseRank(row["Opening Rank"]);
    const closing = parseRank(row["Closing Rank"]);
    const seatNorm = normalizeSeatType(row["Seat Type"]);
    const isPwd = opening.isPwd || closing.isPwd || seatNorm.isPwd;

    if (isPwd) {
      josaaSkipped++;
      continue;
    }

    if (opening.rank === 0 || closing.rank === 0) {
      josaaSkipped++;
      continue;
    }

    josaaData.push({
      programName: row["Academic Program Name"],
      quota: row["Quota"],
      seatType: seatNorm.type,
      gender: row["Gender"],
      openingRank: opening.rank,
      closingRank: closing.rank,
      round: parseInt(row["Round"], 10),
      instituteCode: instCode,
      programDuration: parseInt(row["Program Duration"], 10),
      programType: row["Program Type"],
      isPwd: false,
    });
  }

  // Insert in batches
  const BATCH_SIZE = 200;
  for (let i = 0; i < josaaData.length; i += BATCH_SIZE) {
    const batch = josaaData.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map((d) => prisma.cutoffJosaa.create({ data: d })));
    josaaCount += batch.length;
    process.stdout.write(`\r   Processing JoSAA: ${josaaCount}/${josaaData.length}...`);
  }
  console.log(`\n   ✅ Imported ${josaaCount} JoSAA rows (skipped ${josaaSkipped})\n`);

  // ── Step 3: Import CSAB cutoffs ───────────────────────────────────────
  console.log("📊 Importing CSAB cutoffs...");
  const csabPath = path.join(DATA_DIR, "refine_csab_2025-DXZZdPTh.csv");
  const csabRaw = fs.readFileSync(csabPath, "utf-8");
  const csabRows = parse(csabRaw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Array<Record<string, string>>;

  let csabCount = 0;
  let csabSkipped = 0;
  const csabData: Parameters<typeof prisma.cutoffCsab.create>[0]["data"][] = [];

  for (const row of csabRows) {
    const instCode = parseInt(row["Institute Code"], 10);
    if (!validCodes.has(instCode)) {
      csabSkipped++;
      continue;
    }

    const opening = parseRank(row["Opening Rank"]);
    const closing = parseRank(row["Closing Rank"]);
    const seatNorm = normalizeSeatType(row["Seat Type"]);
    const isPwd = opening.isPwd || closing.isPwd || seatNorm.isPwd;

    if (isPwd) {
      csabSkipped++;
      continue;
    }

    const quota = row["Quota"];
    if (quota.startsWith("DASA")) {
      csabSkipped++;
      continue;
    }

    if (opening.rank === 0 || closing.rank === 0) {
      csabSkipped++;
      continue;
    }

    csabData.push({
      programName: row["Academic Program Name"],
      quota: quota,
      seatType: seatNorm.type,
      gender: row["Gender"],
      openingRank: opening.rank,
      closingRank: closing.rank,
      round: parseInt(row["Round"], 10),
      instituteCode: instCode,
      programDuration: parseInt(row["Program Duration"], 10),
      programType: row["Program Type"],
      isPwd: false,
    });
  }

  for (let i = 0; i < csabData.length; i += BATCH_SIZE) {
    const batch = csabData.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map((d) => prisma.cutoffCsab.create({ data: d })));
    csabCount += batch.length;
    process.stdout.write(`\r   Processing CSAB: ${csabCount}/${csabData.length}...`);
  }
  console.log(`\n   ✅ Imported ${csabCount} CSAB rows (skipped ${csabSkipped})\n`);

  // ── Summary ──────────────────────────────────────────────────────────
  const totalInstitutes = await prisma.institute.count();
  const totalJosaa = await prisma.cutoffJosaa.count();
  const totalCsab = await prisma.cutoffCsab.count();

  console.log("🎉 Seed completed!");
  console.log(`   Institutes: ${totalInstitutes}`);
  console.log(`   JoSAA cutoffs: ${totalJosaa}`);
  console.log(`   CSAB cutoffs: ${totalCsab}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
