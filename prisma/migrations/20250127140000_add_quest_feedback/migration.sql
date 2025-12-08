-- CreateTable
CREATE TABLE IF NOT EXISTS "QuestFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "gameId" TEXT,
    "gameTitle" TEXT,
    "matchRank" INTEGER,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "QuestFeedback_userId_idx" ON "QuestFeedback"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "QuestFeedback_gameId_idx" ON "QuestFeedback"("gameId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "QuestFeedback_reason_idx" ON "QuestFeedback"("reason");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "QuestFeedback_createdAt_idx" ON "QuestFeedback"("createdAt");

-- AddForeignKey
ALTER TABLE "QuestFeedback" ADD CONSTRAINT "QuestFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

