-- CreateTable
CREATE TABLE "Institute" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CutoffJosaa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "programName" TEXT NOT NULL,
    "quota" TEXT NOT NULL,
    "seatType" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "openingRank" INTEGER NOT NULL,
    "closingRank" INTEGER NOT NULL,
    "round" INTEGER NOT NULL,
    "programDuration" INTEGER NOT NULL,
    "programType" TEXT NOT NULL,
    "isPwd" BOOLEAN NOT NULL DEFAULT false,
    "instituteCode" INTEGER NOT NULL,
    CONSTRAINT "CutoffJosaa_instituteCode_fkey" FOREIGN KEY ("instituteCode") REFERENCES "Institute" ("code") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CutoffCsab" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "programName" TEXT NOT NULL,
    "quota" TEXT NOT NULL,
    "seatType" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "openingRank" INTEGER NOT NULL,
    "closingRank" INTEGER NOT NULL,
    "round" INTEGER NOT NULL,
    "programDuration" INTEGER NOT NULL,
    "programType" TEXT NOT NULL,
    "isPwd" BOOLEAN NOT NULL DEFAULT false,
    "instituteCode" INTEGER NOT NULL,
    CONSTRAINT "CutoffCsab_instituteCode_fkey" FOREIGN KEY ("instituteCode") REFERENCES "Institute" ("code") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserPrediction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "crlRank" INTEGER NOT NULL,
    "categoryRank" INTEGER,
    "category" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "homeState" TEXT NOT NULL,
    "predictorType" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Institute_code_key" ON "Institute"("code");

-- CreateIndex
CREATE INDEX "CutoffJosaa_seatType_gender_round_idx" ON "CutoffJosaa"("seatType", "gender", "round");

-- CreateIndex
CREATE INDEX "CutoffJosaa_instituteCode_idx" ON "CutoffJosaa"("instituteCode");

-- CreateIndex
CREATE INDEX "CutoffJosaa_round_idx" ON "CutoffJosaa"("round");

-- CreateIndex
CREATE INDEX "CutoffJosaa_quota_seatType_gender_round_idx" ON "CutoffJosaa"("quota", "seatType", "gender", "round");

-- CreateIndex
CREATE INDEX "CutoffCsab_seatType_gender_round_idx" ON "CutoffCsab"("seatType", "gender", "round");

-- CreateIndex
CREATE INDEX "CutoffCsab_instituteCode_idx" ON "CutoffCsab"("instituteCode");

-- CreateIndex
CREATE INDEX "CutoffCsab_round_idx" ON "CutoffCsab"("round");

-- CreateIndex
CREATE INDEX "CutoffCsab_quota_seatType_gender_round_idx" ON "CutoffCsab"("quota", "seatType", "gender", "round");

