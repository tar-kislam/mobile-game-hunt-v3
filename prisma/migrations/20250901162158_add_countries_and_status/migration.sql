-- CreateEnum
CREATE TYPE "public"."ProductStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'PENDING_REVIEW');

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "countries" TEXT[],
ADD COLUMN     "status" "public"."ProductStatus" NOT NULL DEFAULT 'DRAFT';
