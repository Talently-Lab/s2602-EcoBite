-- CreateEnum
CREATE TYPE "rol" AS ENUM ('CLIENTE', 'ADMIN');

-- CreateEnum
CREATE TYPE "tipo_transporte" AS ENUM ('BICICLETA', 'VEHICULO_ELECTRICO');

-- CreateEnum
CREATE TYPE "pedido_estado" AS ENUM ('PENDIENTE', 'COMPLETADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" UUID NOT NULL,
    "nombre_completo" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion_habitual" TEXT,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_edicion" TIMESTAMP(3) NOT NULL,
    "activo_usuario" BOOLEAN NOT NULL DEFAULT true,
    "password_hash" TEXT NOT NULL,
    "rol" "rol" NOT NULL DEFAULT 'CLIENTE',
    "id_zona_habitual" UUID,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "zona" (
    "id_zona" UUID NOT NULL,
    "nombre_barrio" VARCHAR(100) NOT NULL,
    "comuna" INTEGER NOT NULL,
    "codigo_postal" VARCHAR(10) NOT NULL,
    "activo_zona" BOOLEAN NOT NULL DEFAULT true,
    "distancia_promedio_km" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "zona_pkey" PRIMARY KEY ("id_zona")
);

-- CreateTable
CREATE TABLE "restaurantes" (
    "id_restaurante" UUID NOT NULL,
    "nombre_restaurante" TEXT NOT NULL,
    "categoria" TEXT,
    "es_100_eco" BOOLEAN NOT NULL DEFAULT true,
    "activo_restaurante" BOOLEAN NOT NULL DEFAULT true,
    "id_zona" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_edicion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurantes_pkey" PRIMARY KEY ("id_restaurante")
);

-- CreateTable
CREATE TABLE "producto" (
    "id_producto" UUID NOT NULL,
    "id_restaurante" UUID NOT NULL,
    "nombre_producto" TEXT NOT NULL,
    "categoria_comida" TEXT NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_edicion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "producto_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id_pedido" UUID NOT NULL,
    "id_usuario" UUID NOT NULL,
    "id_restaurante" UUID NOT NULL,
    "direccion_entrega" TEXT NOT NULL,
    "monto_total" DECIMAL(10,2) NOT NULL,
    "distancia_estimada_km" DECIMAL(5,2) NOT NULL,
    "tipo_transporte" "tipo_transporte" NOT NULL,
    "total_envases_evitados" INTEGER NOT NULL DEFAULT 0,
    "co2_ahorrado_kg" DECIMAL(6,3) NOT NULL DEFAULT 0,
    "gramos_plastico_evitados_total" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "pedido_estado" "pedido_estado" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_edicion" TIMESTAMP(3) NOT NULL,
    "id_zona_destino" UUID NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id_pedido")
);

-- CreateTable
CREATE TABLE "detalle" (
    "id_detalle" UUID NOT NULL,
    "id_pedido" UUID NOT NULL,
    "producto_nombre" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "gramos_plastico_evitados_item" DECIMAL(8,2) NOT NULL,
    "envases_item" INTEGER NOT NULL,
    "id_producto" UUID NOT NULL,

    CONSTRAINT "detalle_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateTable
CREATE TABLE "empaques" (
    "id_empaque" UUID NOT NULL,
    "nombre_envase" VARCHAR(100) NOT NULL,
    "material_tradicional" VARCHAR(100) NOT NULL,
    "peso_base_g" DECIMAL(8,2) NOT NULL,
    "material_ecobite" VARCHAR(100) NOT NULL,
    "peso_ecobite_g" DECIMAL(8,2) NOT NULL,
    "gramos_plastico_evitados" DECIMAL(8,2) NOT NULL,
    "uso_habitual" VARCHAR(100),

    CONSTRAINT "empaques_pkey" PRIMARY KEY ("id_empaque")
);

-- CreateTable
CREATE TABLE "producto_empaque" (
    "id_producto" UUID NOT NULL,
    "id_empaque" UUID NOT NULL,
    "envases_por_unidad" INTEGER NOT NULL,

    CONSTRAINT "producto_empaque_pkey" PRIMARY KEY ("id_producto","id_empaque"),
    CONSTRAINT "envases_por_unidad_min_1" CHECK ("envases_por_unidad" >= 1)
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE INDEX "usuario_id_zona_habitual_idx" ON "usuario"("id_zona_habitual");

-- CreateIndex
CREATE UNIQUE INDEX "zona_nombre_barrio_key" ON "zona"("nombre_barrio");

-- CreateIndex
CREATE UNIQUE INDEX "restaurantes_email_key" ON "restaurantes"("email");

-- CreateIndex
CREATE INDEX "restaurantes_id_zona_idx" ON "restaurantes"("id_zona");

-- CreateIndex
CREATE INDEX "restaurantes_activo_restaurante_es_100_eco_idx" ON "restaurantes"("activo_restaurante", "es_100_eco");

-- CreateIndex
CREATE INDEX "producto_id_restaurante_idx" ON "producto"("id_restaurante");

-- CreateIndex
CREATE INDEX "producto_disponible_idx" ON "producto"("disponible");

-- CreateIndex
CREATE INDEX "pedidos_id_usuario_idx" ON "pedidos"("id_usuario");

-- CreateIndex
CREATE INDEX "pedidos_id_restaurante_idx" ON "pedidos"("id_restaurante");

-- CreateIndex
CREATE INDEX "pedidos_id_zona_destino_idx" ON "pedidos"("id_zona_destino");

-- CreateIndex
CREATE INDEX "pedidos_pedido_estado_idx" ON "pedidos"("pedido_estado");

-- CreateIndex
CREATE INDEX "detalle_id_pedido_idx" ON "detalle"("id_pedido");

-- CreateIndex
CREATE INDEX "detalle_id_producto_idx" ON "detalle"("id_producto");

-- CreateIndex
CREATE UNIQUE INDEX "empaques_nombre_envase_key" ON "empaques"("nombre_envase");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_zona_habitual_fkey" FOREIGN KEY ("id_zona_habitual") REFERENCES "zona"("id_zona") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurantes" ADD CONSTRAINT "restaurantes_id_zona_fkey" FOREIGN KEY ("id_zona") REFERENCES "zona"("id_zona") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_id_restaurante_fkey" FOREIGN KEY ("id_restaurante") REFERENCES "restaurantes"("id_restaurante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_id_restaurante_fkey" FOREIGN KEY ("id_restaurante") REFERENCES "restaurantes"("id_restaurante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_id_zona_destino_fkey" FOREIGN KEY ("id_zona_destino") REFERENCES "zona"("id_zona") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle" ADD CONSTRAINT "detalle_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedidos"("id_pedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle" ADD CONSTRAINT "detalle_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_empaque" ADD CONSTRAINT "producto_empaque_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_empaque" ADD CONSTRAINT "producto_empaque_id_empaque_fkey" FOREIGN KEY ("id_empaque") REFERENCES "empaques"("id_empaque") ON DELETE RESTRICT ON UPDATE CASCADE;
