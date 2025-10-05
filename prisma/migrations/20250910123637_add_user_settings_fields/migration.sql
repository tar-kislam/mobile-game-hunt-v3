-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "marketingOptIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true;
