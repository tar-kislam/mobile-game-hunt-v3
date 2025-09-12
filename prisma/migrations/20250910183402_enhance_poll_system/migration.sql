/*
  Warnings:

  - You are about to drop the column `optionIndex` on the `PollVote` table. All the data in the column will be lost.
  - You are about to drop the column `postId` on the `PollVote` table. All the data in the column will be lost.
  - You are about to drop the column `poll` on the `Post` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,optionId]` on the table `PollVote` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pollId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `optionId` to the `PollVote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."PollVote" DROP CONSTRAINT "PollVote_postId_fkey";

-- DropIndex
DROP INDEX "public"."PollVote_postId_idx";

-- DropIndex
DROP INDEX "public"."PollVote_userId_postId_key";

-- AlterTable
ALTER TABLE "public"."PollVote" DROP COLUMN "optionIndex",
DROP COLUMN "postId",
ADD COLUMN     "optionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Post" DROP COLUMN "poll",
ADD COLUMN     "pollId" TEXT,
ALTER COLUMN "content" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."Poll" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Poll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PollOption" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PollOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Poll_expiresAt_idx" ON "public"."Poll"("expiresAt");

-- CreateIndex
CREATE INDEX "Poll_createdAt_idx" ON "public"."Poll"("createdAt");

-- CreateIndex
CREATE INDEX "PollOption_pollId_idx" ON "public"."PollOption"("pollId");

-- CreateIndex
CREATE INDEX "PollVote_optionId_idx" ON "public"."PollVote"("optionId");

-- CreateIndex
CREATE UNIQUE INDEX "PollVote_userId_optionId_key" ON "public"."PollVote"("userId", "optionId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_pollId_key" ON "public"."Post"("pollId");

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "public"."Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PollOption" ADD CONSTRAINT "PollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "public"."Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PollVote" ADD CONSTRAINT "PollVote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "public"."PollOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
