/*
  Warnings:

  - You are about to drop the column `isRead` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `postId` on the `Notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Notification" DROP COLUMN "isRead",
DROP COLUMN "postId",
ADD COLUMN     "read" BOOLEAN NOT NULL DEFAULT false;
