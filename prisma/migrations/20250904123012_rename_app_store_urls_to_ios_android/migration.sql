/*
  Warnings:

  - You are about to drop the column `appStoreUrl` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `playStoreUrl` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "appStoreUrl",
DROP COLUMN "playStoreUrl",
ADD COLUMN     "androidUrl" TEXT,
ADD COLUMN     "iosUrl" TEXT;
