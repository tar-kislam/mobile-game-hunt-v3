/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_categoryId_fkey";

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "categoryId",
ADD COLUMN     "appStoreUrl" TEXT,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "platforms" TEXT[],
ADD COLUMN     "playStoreUrl" TEXT,
ADD COLUMN     "socialLinks" JSONB,
ADD COLUMN     "video" TEXT;

-- DropTable
DROP TABLE "public"."Category";

-- CreateTable
CREATE TABLE "public"."CommentVote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommentVote_userId_commentId_key" ON "public"."CommentVote"("userId", "commentId");

-- AddForeignKey
ALTER TABLE "public"."CommentVote" ADD CONSTRAINT "CommentVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentVote" ADD CONSTRAINT "CommentVote_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."Comment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
