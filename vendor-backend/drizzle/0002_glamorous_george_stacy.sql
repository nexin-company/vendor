-- Migración: Agregar external_product_id y product_sku a order_items
-- Solo agregar las columnas nuevas, las tablas ya existen

ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "external_product_id" integer;
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "product_sku" text;
