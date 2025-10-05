/*
  Warnings:

  - You are about to drop the column `gameId` on the `Follow` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Follow` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[followerId,followingId]` on the table `Follow` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `followerId` to the `Follow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `followingId` to the `Follow` table without a default value. This is not possible if the table is not empty.

*/
-- First, create the new GameFollow table
CREATE TABLE "public"."GameFollow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameFollow_pkey" PRIMARY KEY ("id")
);

-- Migrate existing game follow data to GameFollow table
INSERT INTO "public"."GameFollow" ("id", "userId", "gameId", "createdAt")
SELECT "id", "userId", "gameId", "createdAt" FROM "public"."Follow";

-- Now we can safely drop the old Follow table structure
-- DropForeignKey
ALTER TABLE "public"."Follow" DROP CONSTRAINT "Follow_gameId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Follow" DROP CONSTRAINT "Follow_userId_fkey";

-- DropIndex
DROP INDEX "public"."Follow_userId_gameId_key";

-- DropIndex
DROP INDEX "public"."idx_follow_gameId_createdAt";

-- Clear all data from Follow table since we've moved it to GameFollow
DELETE FROM "public"."Follow";

-- AlterTable - now safe since table is empty
ALTER TABLE "public"."Follow" DROP COLUMN "gameId",
DROP COLUMN "userId",
ADD COLUMN     "followerId" TEXT NOT NULL,
ADD COLUMN     "followingId" TEXT NOT NULL;


-- CreateIndex
CREATE INDEX "idx_gamefollow_gameId_createdAt" ON "public"."GameFollow"("gameId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GameFollow_userId_gameId_key" ON "public"."GameFollow"("userId", "gameId");

-- CreateIndex
CREATE INDEX "idx_follow_followerId_createdAt" ON "public"."Follow"("followerId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_follow_followingId_createdAt" ON "public"."Follow"("followingId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followingId_key" ON "public"."Follow"("followerId", "followingId");

-- AddForeignKey
ALTER TABLE "public"."Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameFollow" ADD CONSTRAINT "GameFollow_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameFollow" ADD CONSTRAINT "GameFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
