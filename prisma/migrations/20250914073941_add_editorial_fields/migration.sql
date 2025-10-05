-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "editorial_boost" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "editorial_override" BOOLEAN NOT NULL DEFAULT false;
