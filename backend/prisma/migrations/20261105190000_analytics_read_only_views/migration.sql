-- Read-only analytics surface for the data analyst (issue #47).
-- The analyst connects through a scoped read-only Neon role restricted to the
-- "analytics" schema; views exclude password_hash and PII (email, telefono,
-- direccion_habitual, nombre_completo, direccion_entrega). UUIDs are kept as
-- pseudonymous identifiers for cohort analysis.
-- Idempotent (OR REPLACE / IF NOT EXISTS): the objects were applied to the
-- production Neon branch before this file existed, so a later `migrate deploy`
-- must be able to replay them safely.

CREATE SCHEMA IF NOT EXISTS analytics;

CREATE OR REPLACE VIEW analytics.usuario AS
SELECT id_usuario, rol, fecha_registro, fecha_edicion, activo_usuario, id_zona_habitual
FROM public.usuario;

CREATE OR REPLACE VIEW analytics.zona AS
SELECT id_zona, nombre_barrio, comuna, codigo_postal, activo_zona, distancia_promedio_km
FROM public.zona;

CREATE OR REPLACE VIEW analytics.restaurantes AS
SELECT id_restaurante, nombre_restaurante, categoria, es_100_eco,
       activo_restaurante, id_zona, fecha_creacion, fecha_edicion
FROM public.restaurantes;

CREATE OR REPLACE VIEW analytics.producto AS
SELECT id_producto, id_restaurante, nombre_producto, categoria_comida,
       precio, disponible, fecha_creacion, fecha_edicion
FROM public.producto;

CREATE OR REPLACE VIEW analytics.pedidos AS
SELECT id_pedido, id_usuario, id_restaurante, monto_total, distancia_estimada_km,
       tipo_transporte, total_envases_evitados, co2_ahorrado_kg,
       gramos_plastico_evitados_total, pedido_estado, fecha_creacion,
       fecha_edicion, id_zona_destino
FROM public.pedidos;

CREATE OR REPLACE VIEW analytics.detalle AS
SELECT id_detalle, id_pedido, producto_nombre, cantidad, precio_unitario,
       gramos_plastico_evitados_item, envases_item, id_producto
FROM public.detalle;

CREATE OR REPLACE VIEW analytics.empaques AS
SELECT id_empaque, nombre_envase, material_tradicional, peso_base_g,
       material_ecobite, peso_ecobite_g, gramos_plastico_evitados, uso_habitual
FROM public.empaques;

CREATE OR REPLACE VIEW analytics.producto_empaque AS
SELECT id_producto, id_empaque, envases_por_unidad
FROM public.producto_empaque;
