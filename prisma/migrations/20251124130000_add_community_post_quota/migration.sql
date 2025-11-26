-- Add daily community post quota fields to User
ALTER TABLE "User"
  ADD COLUMN "communityDailyPostCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "communityLastPostDate" TIMESTAMP(3);




