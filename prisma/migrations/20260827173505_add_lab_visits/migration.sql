-- CreateTable
CREATE TABLE "Laboratory" (
    "id" TEXT NOT NULL,
    "sigla" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Laboratory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabVisit" (
    "id" TEXT NOT NULL,
    "labId" TEXT NOT NULL,
    "responsibleName" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "studentCount" INTEGER NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "shift" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "googleCalendarEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Laboratory_sigla_key" ON "Laboratory"("sigla");

-- CreateIndex
CREATE INDEX "Laboratory_isActive_idx" ON "Laboratory"("isActive");

-- CreateIndex
CREATE INDEX "LabVisit_labId_visitDate_shift_idx" ON "LabVisit"("labId", "visitDate", "shift");

-- CreateIndex
CREATE INDEX "LabVisit_status_idx" ON "LabVisit"("status");

-- AddForeignKey
ALTER TABLE "LabVisit" ADD CONSTRAINT "LabVisit_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Laboratory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
