-- AlterTable
ALTER TABLE "PostComment"
ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'visible';

-- CreateTable
CREATE TABLE IF NOT EXISTS "CommentMention" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "mentionedUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentMention_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Notification"
ADD COLUMN IF NOT EXISTS "postId" TEXT,
ADD COLUMN IF NOT EXISTS "commentId" TEXT,
ADD COLUMN IF NOT EXISTS "actorId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PostComment_isDeleted_idx" ON "PostComment"("isDeleted");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PostComment_status_idx" ON "PostComment"("status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CommentMention_commentId_mentionedUserId_key" ON "CommentMention"("commentId", "mentionedUserId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CommentMention_commentId_idx" ON "CommentMention"("commentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CommentMention_mentionedUserId_idx" ON "CommentMention"("mentionedUserId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Notification_postId_idx" ON "Notification"("postId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Notification_commentId_idx" ON "Notification"("commentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Notification_actorId_idx" ON "Notification"("actorId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Notification_type_idx" ON "Notification"("type");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'CommentMention_commentId_fkey'
  ) THEN
    ALTER TABLE "CommentMention"
    ADD CONSTRAINT "CommentMention_commentId_fkey"
    FOREIGN KEY ("commentId") REFERENCES "PostComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'CommentMention_mentionedUserId_fkey'
  ) THEN
    ALTER TABLE "CommentMention"
    ADD CONSTRAINT "CommentMention_mentionedUserId_fkey"
    FOREIGN KEY ("mentionedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

