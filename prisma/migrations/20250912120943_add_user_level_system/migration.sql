/*
  Warnings:

  - A unique constraint covering the columns `[postId]` on the table `Poll` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Post" DROP CONSTRAINT "Post_pollId_fkey";

-- AlterTable
ALTER TABLE "public"."Poll" ADD COLUMN     "postId" TEXT;

-- AlterTable
ALTER TABLE "public"."PollVote" ADD COLUMN     "pollId" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Poll_postId_key" ON "public"."Poll"("postId");

-- AddForeignKey
ALTER TABLE "public"."Poll" ADD CONSTRAINT "Poll_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PollVote" ADD CONSTRAINT "PollVote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "public"."Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;
