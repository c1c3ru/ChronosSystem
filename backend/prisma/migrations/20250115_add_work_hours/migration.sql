-- AlterTable
ALTER TABLE "users" ADD COLUMN     "contractStartDate" TIMESTAMP(3),
ADD COLUMN     "contractEndDate" TIMESTAMP(3),
ADD COLUMN     "totalContractHours" INTEGER,
ADD COLUMN     "weeklyHours" INTEGER DEFAULT 30,
ADD COLUMN     "dailyHours" INTEGER DEFAULT 6;

-- CreateTable
CREATE TABLE "work_summaries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "firstEntry" TIMESTAMP(3),
    "lastExit" TIMESTAMP(3),
    "totalMinutes" INTEGER NOT NULL DEFAULT 0,
    "breakMinutes" INTEGER NOT NULL DEFAULT 0,
    "workedMinutes" INTEGER NOT NULL DEFAULT 0,
    "hasIncomplete" BOOLEAN NOT NULL DEFAULT false,
    "hasExtraHours" BOOLEAN NOT NULL DEFAULT false,
    "hasViolation" BOOLEAN NOT NULL DEFAULT false,
    "violationReason" TEXT,
    "entriesCount" INTEGER NOT NULL DEFAULT 0,
    "exitsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "work_summaries_userId_date_idx" ON "work_summaries"("userId", "date");

-- CreateIndex
CREATE INDEX "work_summaries_date_idx" ON "work_summaries"("date");

-- CreateIndex
CREATE UNIQUE INDEX "work_summaries_userId_date_key" ON "work_summaries"("userId", "date");

-- AddForeignKey
ALTER TABLE "work_summaries" ADD CONSTRAINT "work_summaries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
