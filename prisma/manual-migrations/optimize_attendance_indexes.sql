-- OptimizeAttendanceRecordIndexes
-- Adiciona índices compostos otimizados para queries comuns de AttendanceRecord

-- Remover índices antigos (se existirem)
DROP INDEX IF EXISTS "AttendanceRecord_userId_timestamp_idx";
DROP INDEX IF EXISTS "AttendanceRecord_machineId_timestamp_idx";
DROP INDEX IF EXISTS "AttendanceRecord_userId_type_timestamp_idx";
DROP INDEX IF EXISTS "AttendanceRecord_timestamp_idx";

-- Criar novos índices otimizados com ordenação DESC
CREATE INDEX "AttendanceRecord_userId_timestamp_idx" ON "AttendanceRecord"("userId", "timestamp" DESC);
CREATE INDEX "AttendanceRecord_machineId_timestamp_idx" ON "AttendanceRecord"("machineId", "timestamp" DESC);
CREATE INDEX "AttendanceRecord_userId_type_timestamp_idx" ON "AttendanceRecord"("userId", "type", "timestamp" DESC);
CREATE INDEX "AttendanceRecord_timestamp_idx" ON "AttendanceRecord"("timestamp" DESC);
CREATE INDEX "AttendanceRecord_userId_timestamp_type_idx" ON "AttendanceRecord"("userId", "timestamp" DESC, "type");
CREATE INDEX "AttendanceRecord_hash_idx" ON "AttendanceRecord"("hash");

-- Comentários explicativos
COMMENT ON INDEX "AttendanceRecord_userId_timestamp_idx" IS 'Otimiza queries de dashboard e histórico por usuário';
COMMENT ON INDEX "AttendanceRecord_machineId_timestamp_idx" IS 'Otimiza queries de atividades por máquina';
COMMENT ON INDEX "AttendanceRecord_userId_type_timestamp_idx" IS 'Otimiza filtros por tipo (ENTRY/EXIT)';
COMMENT ON INDEX "AttendanceRecord_timestamp_idx" IS 'Otimiza queries de atividades recentes globais';
COMMENT ON INDEX "AttendanceRecord_userId_timestamp_type_idx" IS 'Otimiza dashboard com filtro de tipo';
COMMENT ON INDEX "AttendanceRecord_hash_idx" IS 'Otimiza verificação de integridade de registros';
