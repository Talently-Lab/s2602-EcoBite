-- Restaurant onboarding (S6 wave 2): solicitud_restaurante table, restaurant
-- category enum and address, usuario -> restaurante admin link, and removal of
-- legacy restaurantes.password_hash (restaurant admins authenticate via usuario).
-- The analytics views are refreshed to expose the new non-sensitive columns and
-- the solicitud funnel, still excluding email and direccion as PII.

-- CreateEnum
CREATE TYPE "estado_solicitud" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "categoria_restaurante" AS ENUM ('COMIDA_SALUDABLE', 'COMIDA_DE_ESTACION', 'COMIDA_VEGANA', 'COMIDA_CASERA');

-- CreateTable
CREATE TABLE "solicitud_restaurante" (
    "id_solicitud" UUID NOT NULL,
    "id_usuario" UUID NOT NULL,
    "nombre_restaurante" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "categoria" "categoria_restaurante" NOT NULL,
    "estado_solicitud" "estado_solicitud" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_aceptacion_compromiso" TIMESTAMP(3) NOT NULL,
    "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_revision" TIMESTAMP(3),
    "id_admin_revisor" UUID,
    "id_zona" UUID NOT NULL,

    CONSTRAINT "solicitud_restaurante_pkey" PRIMARY KEY ("id_solicitud")
);

-- AlterTable: link an approved restaurant administrator to their restaurant
ALTER TABLE "usuario" ADD COLUMN "id_restaurante" UUID;

-- AlterTable: backfill direccion for pre-existing rows, then enforce NOT NULL
ALTER TABLE "restaurantes" ADD COLUMN "direccion" TEXT NOT NULL DEFAULT '';
ALTER TABLE "restaurantes" ALTER COLUMN "direccion" DROP DEFAULT;

-- The analytics.restaurantes view depends on categoria; drop it before the type
-- change (recreated below, and the analista grant is re-applied at the end).
DROP VIEW IF EXISTS analytics.restaurantes;

-- Abort early with the offending labels when a stored value cannot be mapped:
-- the fold below (lowercase, trimmed, accents removed, same as the importer)
-- already tolerates case/whitespace variants, so anything left over is an
-- unknown label and must not reach the USING clause as NULL.
DO $$
DECLARE
    offending text;
BEGIN
    SELECT string_agg(DISTINCT coalesce(quote_literal("categoria"), 'NULL'), ', ')
      INTO offending
      FROM "restaurantes"
     WHERE "categoria" IS NULL
        OR lower(btrim(translate("categoria", 'ÁÉÍÓÚÜáéíóúü', 'AEIOUUaeiouu'))) NOT IN (
            'comida saludable', 'comida de estacion', 'comida vegana', 'comida casera');
    IF offending IS NOT NULL THEN
        RAISE EXCEPTION 'restaurantes.categoria has labels that do not map to categoria_restaurante: %', offending;
    END IF;
END $$;

-- AlterTable: map existing display labels to the enum after folding them like
-- the importer does; the guard above keeps SET NOT NULL from failing on NULLs
-- produced by an unmatched CASE
ALTER TABLE "restaurantes" ALTER COLUMN "categoria" SET DATA TYPE "categoria_restaurante" USING CASE lower(btrim(translate("categoria", 'ÁÉÍÓÚÜáéíóúü', 'AEIOUUaeiouu')))
    WHEN 'comida saludable' THEN 'COMIDA_SALUDABLE'
    WHEN 'comida de estacion' THEN 'COMIDA_DE_ESTACION'
    WHEN 'comida vegana' THEN 'COMIDA_VEGANA'
    WHEN 'comida casera' THEN 'COMIDA_CASERA'
END::"categoria_restaurante";
ALTER TABLE "restaurantes" ALTER COLUMN "categoria" SET NOT NULL;

-- AlterTable: legacy per-restaurant credentials; auth is centralized in usuario
ALTER TABLE "restaurantes" DROP COLUMN "password_hash";

-- CreateIndex
CREATE UNIQUE INDEX "solicitud_restaurante_email_key" ON "solicitud_restaurante"("email");

-- CreateIndex
CREATE INDEX "solicitud_restaurante_id_usuario_idx" ON "solicitud_restaurante"("id_usuario");

-- CreateIndex
CREATE INDEX "solicitud_restaurante_id_admin_revisor_idx" ON "solicitud_restaurante"("id_admin_revisor");

-- CreateIndex
CREATE INDEX "solicitud_restaurante_id_zona_idx" ON "solicitud_restaurante"("id_zona");

-- CreateIndex
CREATE INDEX "solicitud_restaurante_estado_solicitud_idx" ON "solicitud_restaurante"("estado_solicitud");

-- CreateIndex
CREATE INDEX "usuario_id_restaurante_idx" ON "usuario"("id_restaurante");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_restaurante_fkey" FOREIGN KEY ("id_restaurante") REFERENCES "restaurantes"("id_restaurante") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_restaurante" ADD CONSTRAINT "solicitud_restaurante_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_restaurante" ADD CONSTRAINT "solicitud_restaurante_id_admin_revisor_fkey" FOREIGN KEY ("id_admin_revisor") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_restaurante" ADD CONSTRAINT "solicitud_restaurante_id_zona_fkey" FOREIGN KEY ("id_zona") REFERENCES "zona"("id_zona") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Analytics views: expose the new columns and the solicitud funnel. Restaurant
-- direccion is public business data (shown in the catalog); solicitud email and
-- direccion are applicant data and stay excluded as PII. Idempotent OR REPLACE
-- so the same file replays cleanly where the objects already exist.
CREATE OR REPLACE VIEW analytics.usuario AS
SELECT id_usuario, rol, fecha_registro, fecha_edicion, activo_usuario,
       id_zona_habitual, id_restaurante
FROM public.usuario;

CREATE OR REPLACE VIEW analytics.restaurantes AS
SELECT id_restaurante, nombre_restaurante, direccion, categoria, es_100_eco,
       activo_restaurante, id_zona, fecha_creacion, fecha_edicion
FROM public.restaurantes;

CREATE OR REPLACE VIEW analytics.solicitud_restaurante AS
SELECT id_solicitud, id_usuario, nombre_restaurante, categoria, estado_solicitud,
       fecha_aceptacion_compromiso, fecha_solicitud, fecha_revision,
       id_admin_revisor, id_zona
FROM public.solicitud_restaurante;

-- Keep the analyst role working where it exists (production Neon): the new
-- solicitud view needs a grant, and recreating analytics.restaurantes dropped
-- its previous grant. The role does not exist in local/dev databases, so the
-- grant is conditional and replays safely everywhere.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'analista_datos') THEN
        GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO analista_datos;
    END IF;
END $$;
