-- AlterTable
ALTER TABLE "public"."Notification" ADD COLUMN     "icon" TEXT,
ADD COLUMN     "link" TEXT,
ADD COLUMN     "meta" JSONB,
ADD COLUMN     "title" TEXT;

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "public"."Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "public"."Notification"("userId", "read");
