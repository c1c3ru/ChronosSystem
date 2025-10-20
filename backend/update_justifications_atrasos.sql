-- Adicionar novos tipos de justificativa
ALTER TYPE "JustificationType" ADD VALUE 'ATRASO_TRANSPORTE';
ALTER TYPE "JustificationType" ADD VALUE 'ATRASO_MEDICO';
ALTER TYPE "JustificationType" ADD VALUE 'ATRASO_PESSOAL';

-- Criar enum para categoria
CREATE TYPE "JustificationCategory" AS ENUM ('FALTA', 'ATRASO', 'SAIDA_ANTECIPADA');

-- Remover constraint único antigo
ALTER TABLE "absence_justifications" DROP CONSTRAINT "absence_justifications_userId_date_key";

-- Adicionar nova coluna category
ALTER TABLE "absence_justifications" ADD COLUMN "category" "JustificationCategory" NOT NULL DEFAULT 'FALTA';

-- Adicionar campos específicos para atrasos
ALTER TABLE "absence_justifications" ADD COLUMN "delayMinutes" INTEGER;
ALTER TABLE "absence_justifications" ADD COLUMN "expectedTime" TIMESTAMP(3);
ALTER TABLE "absence_justifications" ADD COLUMN "actualTime" TIMESTAMP(3);

-- Criar novo constraint único
ALTER TABLE "absence_justifications" ADD CONSTRAINT "absence_justifications_userId_date_category_key" UNIQUE ("userId", "date", "category");

-- Criar novos índices
CREATE INDEX "absence_justifications_category_idx" ON "absence_justifications"("category");
CREATE INDEX "absence_justifications_delayMinutes_idx" ON "absence_justifications"("delayMinutes");
