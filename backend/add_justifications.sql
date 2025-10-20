-- CreateEnum para JustificationStatus
CREATE TYPE "JustificationStatus" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

-- CreateEnum para JustificationType  
CREATE TYPE "JustificationType" AS ENUM ('ATESTADO_MEDICO', 'COMPROMISSO_PESSOAL', 'PROBLEMA_FAMILIAR', 'TRANSPORTE', 'OUTROS');

-- CreateTable para AbsenceJustification
CREATE TABLE "absence_justifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "type" "JustificationType" NOT NULL,
    "reason" TEXT NOT NULL,
    "documentLinks" TEXT,
    "status" "JustificationStatus" NOT NULL DEFAULT 'PENDENTE',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "absence_justifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "absence_justifications_userId_date_key" ON "absence_justifications"("userId", "date");

-- CreateIndex
CREATE INDEX "absence_justifications_userId_status_idx" ON "absence_justifications"("userId", "status");

-- CreateIndex
CREATE INDEX "absence_justifications_date_idx" ON "absence_justifications"("date");

-- CreateIndex
CREATE INDEX "absence_justifications_status_idx" ON "absence_justifications"("status");

-- AddForeignKey
ALTER TABLE "absence_justifications" ADD CONSTRAINT "absence_justifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absence_justifications" ADD CONSTRAINT "absence_justifications_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
