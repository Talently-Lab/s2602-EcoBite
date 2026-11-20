-- Zone centroids for restaurant-to-destination distance.
-- Source: GCBA open data, barrios.geojson (WGS84), geometric centroid.
-- Official names BOCA, MONSERRAT, PATERNAL and VILLA GRAL. MITRE are stored
-- under the seed names La Boca, Montserrat, La Paternal and Villa General Mitre.
--
-- This migration does not change distancia_promedio_km and does not rewrite
-- pedidos. Those columns stay the Obelisco reference and the historical CO2.
-- Centroids do not reproduce distancia_promedio_km (median gap 0.13 km,
-- maximum 0.59 km in Villa Riachuelo).
--
-- It also adds the restaurant catalog fields: restaurantes.descripcion and
-- imagen_url (public business data) and solicitud_restaurante.descripcion
-- (applicant free text; kept out of the analytics views as PII).

-- AlterTable
ALTER TABLE "zona"
  ADD COLUMN "latitud" DECIMAL(9,6),
  ADD COLUMN "longitud" DECIMAL(9,6);

-- AlterTable
ALTER TABLE "restaurantes"
  ADD COLUMN "descripcion" TEXT,
  ADD COLUMN "imagen_url" TEXT;

-- AlterTable
ALTER TABLE "solicitud_restaurante"
  ADD COLUMN "descripcion" TEXT;

-- Backfill zone centroids from GCBA barrios.geojson. On a fresh database
-- `migrate deploy` runs before the reference seed, so an empty zona table is
-- legitimate: the seed inserts all 48 rows with their centroids. Otherwise the
-- update must hit exactly the 48 seeded barrios and leave none without coords.
DO $$
DECLARE
  updated_count integer;
BEGIN
  IF (SELECT count(*) FROM zona) = 0 THEN
    RETURN;
  END IF;

  UPDATE zona AS z
  SET latitud = v.latitud, longitud = v.longitud
  FROM (VALUES
    ('Retiro', -34.588397, -58.375994),
    ('San Nicolás', -34.603666, -58.380515),
    ('Puerto Madero', -34.609210, -58.356354),
    ('San Telmo', -34.621521, -58.371541),
    ('Montserrat', -34.612686, -58.379648),
    ('Constitución', -34.625044, -58.384388),
    ('Recoleta', -34.585778, -58.394929),
    ('Balvanera', -34.609099, -58.403062),
    ('San Cristóbal', -34.623865, -58.401884),
    ('La Boca', -34.631070, -58.356819),
    ('Barracas', -34.646403, -58.384272),
    ('Parque Patricios', -34.637550, -58.401675),
    ('Nueva Pompeya', -34.650515, -58.418882),
    ('Almagro', -34.609227, -58.421745),
    ('Boedo', -34.629960, -58.418839),
    ('Caballito', -34.616825, -58.443603),
    ('Flores', -34.636803, -58.458268),
    ('Parque Chacabuco', -34.635940, -58.437696),
    ('Villa Soldati', -34.665421, -58.446587),
    ('Villa Riachuelo', -34.691858, -58.463350),
    ('Villa Lugano', -34.674993, -58.476167),
    ('Liniers', -34.643796, -58.519128),
    ('Mataderos', -34.658373, -58.501737),
    ('Parque Avellaneda', -34.648642, -58.476455),
    ('Villa Real', -34.619493, -58.526039),
    ('Monte Castro', -34.619298, -58.506581),
    ('Versalles', -34.630123, -58.522417),
    ('Floresta', -34.627686, -58.483588),
    ('Vélez Sarsfield', -34.631361, -58.493277),
    ('Villa Luro', -34.636413, -58.502729),
    ('Villa General Mitre', -34.610029, -58.468943),
    ('Villa Devoto', -34.602355, -58.514283),
    ('Villa del Parque', -34.604247, -58.490677),
    ('Villa Santa Rita', -34.616193, -58.482957),
    ('Coghlan', -34.560624, -58.474944),
    ('Saavedra', -34.553076, -58.488745),
    ('Villa Urquiza', -34.571541, -58.487856),
    ('Villa Pueyrredón', -34.582103, -58.503499),
    ('Nuñez', -34.543481, -58.462751),
    ('Belgrano', -34.554763, -58.450241),
    ('Colegiales', -34.574642, -58.450968),
    ('Palermo', -34.573855, -58.422342),
    ('Chacarita', -34.588369, -58.454180),
    ('Villa Crespo', -34.598830, -58.442725),
    ('La Paternal', -34.597421, -58.468665),
    ('Villa Ortúzar', -34.580973, -58.467651),
    ('Agronomía', -34.592945, -58.488673),
    ('Parque Chas', -34.585523, -58.479121)
  ) AS v(nombre_barrio, latitud, longitud)
  WHERE z.nombre_barrio = v.nombre_barrio;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 48
     OR EXISTS (SELECT 1 FROM zona WHERE latitud IS NULL OR longitud IS NULL) THEN
    RAISE EXCEPTION 'Expected 48 zone centroids, updated %', updated_count;
  END IF;
END $$;

ALTER TABLE zona
  ALTER COLUMN latitud SET NOT NULL,
  ALTER COLUMN longitud SET NOT NULL;

-- Analytics views: Postgres OR REPLACE only allows appending columns, so the
-- new fields go at the end. descripcion/imagen_url are public catalog data;
-- solicitud_restaurante.descripcion is applicant free text and stays out.
CREATE OR REPLACE VIEW analytics.zona AS
SELECT id_zona, nombre_barrio, comuna, codigo_postal, activo_zona,
       distancia_promedio_km, latitud, longitud
FROM public.zona;

CREATE OR REPLACE VIEW analytics.restaurantes AS
SELECT id_restaurante, nombre_restaurante, direccion, categoria, es_100_eco,
       activo_restaurante, id_zona, fecha_creacion, fecha_edicion,
       descripcion, imagen_url
FROM public.restaurantes;

-- Keep the analyst role working where it exists (production Neon): recreating
-- the views dropped their previous grants. The role does not exist in
-- local/dev databases, so the grant is conditional and replays safely.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'analista_datos') THEN
        GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO analista_datos;
    END IF;
END $$;
