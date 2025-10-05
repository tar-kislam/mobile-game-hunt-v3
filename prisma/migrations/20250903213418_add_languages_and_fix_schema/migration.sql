/*
  Warnings:

  - The values [PENDING_REVIEW] on the enum `ProductStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."MakerRole" AS ENUM ('MAKER', 'DESIGNER', 'DEVELOPER', 'PUBLISHER', 'HUNTER');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ProductStatus_new" AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED', 'ARCHIVED');
ALTER TABLE "public"."Product" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Product" ALTER COLUMN "status" TYPE "public"."ProductStatus_new" USING ("status"::text::"public"."ProductStatus_new");
ALTER TYPE "public"."ProductStatus" RENAME TO "ProductStatus_old";
ALTER TYPE "public"."ProductStatus_new" RENAME TO "ProductStatus";
DROP TYPE "public"."ProductStatus_old";
ALTER TABLE "public"."Product" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "crowdfundingPledge" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "demoUrl" TEXT,
ADD COLUMN     "engine" TEXT,
ADD COLUMN     "gallery" JSONB,
ADD COLUMN     "gameplayGifUrl" TEXT,
ADD COLUMN     "gamificationTags" TEXT[],
ADD COLUMN     "languages" JSONB,
ADD COLUMN     "launchDate" TIMESTAMP(3),
ADD COLUMN     "launchType" TEXT,
ADD COLUMN     "monetization" TEXT,
ADD COLUMN     "playtestExpiry" TIMESTAMP(3),
ADD COLUMN     "playtestQuota" INTEGER,
ADD COLUMN     "pricing" TEXT,
ADD COLUMN     "promoCode" TEXT,
ADD COLUMN     "promoExpiry" TIMESTAMP(3),
ADD COLUMN     "promoOffer" TEXT,
ADD COLUMN     "sponsorNote" TEXT,
ADD COLUMN     "sponsorRequest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "studioName" TEXT,
ADD COLUMN     "thumbnail" TEXT,
ADD COLUMN     "videoUrl" TEXT;

-- CreateTable
CREATE TABLE "public"."PressKit" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "features" TEXT[],
    "media" TEXT[],
    "zipUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PressKit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Playtest" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "quota" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playtest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlaytestClaim" (
    "id" TEXT NOT NULL,
    "playtestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaytestClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tag" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductTag" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductCategory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductMaker" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "role" "public"."MakerRole" NOT NULL DEFAULT 'MAKER',
    "isCreator" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductMaker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Studio" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Studio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PressKit_gameId_key" ON "public"."PressKit"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaytestClaim_playtestId_userId_key" ON "public"."PlaytestClaim"("playtestId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "public"."Tag"("slug");

-- CreateIndex
CREATE INDEX "ProductTag_tagId_idx" ON "public"."ProductTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTag_productId_tagId_key" ON "public"."ProductTag"("productId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "public"."Category"("name");

-- CreateIndex
CREATE INDEX "ProductCategory_categoryId_idx" ON "public"."ProductCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_productId_categoryId_key" ON "public"."ProductCategory"("productId", "categoryId");

-- CreateIndex
CREATE INDEX "ProductMaker_userId_idx" ON "public"."ProductMaker"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductMaker_productId_userId_key" ON "public"."ProductMaker"("productId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Studio_name_key" ON "public"."Studio"("name");

-- CreateIndex
CREATE INDEX "Studio_userId_idx" ON "public"."Studio"("userId");

-- CreateIndex
CREATE INDEX "Studio_name_idx" ON "public"."Studio"("name");

-- CreateIndex
CREATE INDEX "idx_product_createdAt" ON "public"."Product"("createdAt");

-- CreateIndex
CREATE INDEX "idx_product_status_createdAt" ON "public"."Product"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."PressKit" ADD CONSTRAINT "PressKit_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Playtest" ADD CONSTRAINT "Playtest_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlaytestClaim" ADD CONSTRAINT "PlaytestClaim_playtestId_fkey" FOREIGN KEY ("playtestId") REFERENCES "public"."Playtest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlaytestClaim" ADD CONSTRAINT "PlaytestClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductTag" ADD CONSTRAINT "ProductTag_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductTag" ADD CONSTRAINT "ProductTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductCategory" ADD CONSTRAINT "ProductCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductCategory" ADD CONSTRAINT "ProductCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductMaker" ADD CONSTRAINT "ProductMaker_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductMaker" ADD CONSTRAINT "ProductMaker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Studio" ADD CONSTRAINT "Studio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
