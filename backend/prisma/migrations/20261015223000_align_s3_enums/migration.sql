-- Preserve existing administrator accounts rather than replacing their rows.
-- Requires PostgreSQL 12+: ALTER TYPE ... ADD VALUE runs inside the migration transaction.
ALTER TYPE "rol" RENAME VALUE 'ADMIN' TO 'ADMIN_PLATAFORMA';
ALTER TYPE "rol" ADD VALUE 'RESTAURANTE_ADMIN';
ALTER TYPE "pedido_estado" ADD VALUE 'EN_PREPARACION';
