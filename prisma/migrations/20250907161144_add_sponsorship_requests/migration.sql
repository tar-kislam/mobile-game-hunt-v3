-- CreateEnum
CREATE TYPE "public"."RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."SponsorshipRequest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "gameUrl" TEXT NOT NULL,
    "developer" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "notes" TEXT,
    "status" "public"."RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SponsorshipRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SponsorshipRequest_status_idx" ON "public"."SponsorshipRequest"("status");

-- CreateIndex
CREATE INDEX "SponsorshipRequest_createdAt_idx" ON "public"."SponsorshipRequest"("createdAt");
