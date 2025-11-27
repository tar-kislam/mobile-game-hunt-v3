CREATE TABLE "public"."UserActivityEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "pageType" TEXT,
    "referrer" TEXT,
    "durationSeconds" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,
    "country" TEXT,
    CONSTRAINT "UserActivityEvent_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "public"."UserActivityEvent"
ADD CONSTRAINT "UserActivityEvent_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "public"."User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "idx_user_activity_user_createdAt" ON "public"."UserActivityEvent"("userId", "createdAt");
CREATE INDEX "idx_user_activity_session_createdAt" ON "public"."UserActivityEvent"("sessionId", "createdAt");
CREATE INDEX "idx_user_activity_pageType_createdAt" ON "public"."UserActivityEvent"("pageType", "createdAt");
