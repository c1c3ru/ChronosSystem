-- AddGeolocationToMachine
-- Adiciona campos de latitude e longitude ao modelo Machine para validação de proximidade

ALTER TABLE "Machine" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "Machine" ADD COLUMN "longitude" DOUBLE PRECISION;

-- Comentários explicativos
COMMENT ON COLUMN "Machine"."latitude" IS 'Latitude da máquina para validação de geolocalização (-90 a 90)';
COMMENT ON COLUMN "Machine"."longitude" IS 'Longitude da máquina para validação de geolocalização (-180 a 180)';
