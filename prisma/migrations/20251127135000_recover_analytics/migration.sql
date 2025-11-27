-- Ensure newsletter source column exists even if previous migration failed
ALTER TABLE "public"."NewsletterSubscription"
ADD COLUMN IF NOT EXISTS "source" TEXT DEFAULT 'newsletter';

UPDATE "public"."NewsletterSubscription"
SET "source" = 'newsletter'
WHERE "source" IS NULL;

ALTER TABLE "public"."NewsletterSubscription"
ALTER COLUMN "source" SET NOT NULL;

-- Ensure user activity event table exists
CREATE TABLE IF NOT EXISTS "public"."UserActivityEvent" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "pageType" TEXT,
    "referrer" TEXT,
    "durationSeconds" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,
    "country" TEXT
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'UserActivityEvent_userId_fkey'
  ) THEN
    ALTER TABLE "public"."UserActivityEvent"
    ADD CONSTRAINT "UserActivityEvent_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "public"."User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_user_activity_user_createdAt"
  ON "public"."UserActivityEvent"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_user_activity_session_createdAt"
  ON "public"."UserActivityEvent"("sessionId", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_user_activity_pageType_createdAt"
  ON "public"."UserActivityEvent"("pageType", "createdAt");
