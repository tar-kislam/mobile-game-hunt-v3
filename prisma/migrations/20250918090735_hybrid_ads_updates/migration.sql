-- CreateEnum
CREATE TYPE "public"."CampaignStatus" AS ENUM ('PENDING', 'APPROVED', 'ACTIVE', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."AdvertiseCampaign" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "goal" TEXT NOT NULL,
    "placements" TEXT[],
    "durationType" TEXT NOT NULL,
    "totalPrice" INTEGER NOT NULL DEFAULT 0,
    "priceBreakdown" JSONB,
    "gameId" TEXT,
    "budgetDaily" INTEGER NOT NULL,
    "budgetTotal" INTEGER NOT NULL,
    "duration" TEXT NOT NULL,
    "countries" TEXT[],
    "platforms" TEXT[],
    "ageGroups" TEXT[],
    "promotionFocus" TEXT[],
    "bannerPlacement" TEXT NOT NULL,
    "featuredSlot" TEXT NOT NULL,
    "newsletterHighlight" TEXT NOT NULL,
    "status" "public"."CampaignStatus" NOT NULL DEFAULT 'PENDING',
    "strategySuggestion" TEXT,
    "contactEmail" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdvertiseCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdvertiseCampaign_userId_createdAt_idx" ON "public"."AdvertiseCampaign"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."AdvertiseCampaign" ADD CONSTRAINT "AdvertiseCampaign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
