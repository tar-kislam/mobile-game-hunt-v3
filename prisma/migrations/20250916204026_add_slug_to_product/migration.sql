/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the table `Product` table without a default value. This is not possible if the table is not empty.

*/

-- Add slug column as nullable first
ALTER TABLE "public"."Product" ADD COLUMN "slug" TEXT;

-- Generate slugs from existing titles with uniqueness handling
WITH slug_generation AS (
  SELECT 
    "id",
    "title",
    LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE("title", '[^a-zA-Z0-9\s]', '', 'g'),
          '\s+', '-', 'g'
        ),
        '^-+|-+$', '', 'g'
      )
    ) as base_slug,
    ROW_NUMBER() OVER (PARTITION BY LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE("title", '[^a-zA-Z0-9\s]', '', 'g'),
          '\s+', '-', 'g'
        ),
        '^-+|-+$', '', 'g'
      )
    ) ORDER BY "createdAt") as rn
  FROM "public"."Product"
)
UPDATE "public"."Product" 
SET "slug" = CASE 
  WHEN sg.rn = 1 THEN sg.base_slug
  ELSE sg.base_slug || '-' || sg.rn::text
END
FROM slug_generation sg
WHERE "public"."Product"."id" = sg."id";

-- Make slug column NOT NULL
ALTER TABLE "public"."Product" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "public"."Product"("slug");