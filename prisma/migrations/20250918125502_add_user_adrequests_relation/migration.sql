-- AlterTable
ALTER TABLE "public"."AdvertiseCampaign" ADD COLUMN     "campaignTagline" TEXT,
ADD COLUMN     "creativeUrl" TEXT;

-- CreateTable
CREATE TABLE "public"."AdRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "gameName" TEXT NOT NULL,
    "promotionType" TEXT NOT NULL,
    "package" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "status" "public"."RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdRequest_userId_createdAt_idx" ON "public"."AdRequest"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."AdRequest" ADD CONSTRAINT "AdRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
