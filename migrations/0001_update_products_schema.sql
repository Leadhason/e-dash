-- Migration to update products table schema
-- Remove old columns and add new ones

-- Add new columns first
ALTER TABLE "products" ADD COLUMN "detailed_specifications" text;
ALTER TABLE "products" ADD COLUMN "selling_price" numeric(10, 2);

-- Copy data from old columns to new ones
UPDATE "products" SET "selling_price" = "price";

-- Make selling_price NOT NULL after copying data
ALTER TABLE "products" ALTER COLUMN "selling_price" SET NOT NULL;

-- Drop old columns
ALTER TABLE "products" DROP COLUMN "price";
ALTER TABLE "products" DROP COLUMN "weight";
ALTER TABLE "products" DROP COLUMN "dimensions";
ALTER TABLE "products" DROP COLUMN "technical_specs";
ALTER TABLE "products" DROP COLUMN "safety_compliance";
ALTER TABLE "products" DROP COLUMN "warranty_months";
ALTER TABLE "products" DROP COLUMN "is_seasonal";