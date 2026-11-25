-- Horário por dia da semana (lib/weekly-schedule.ts). Coluna opcional:
-- cadastros existentes ficam com NULL e seguem o horário único antigo.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "weeklySchedule" JSONB;
