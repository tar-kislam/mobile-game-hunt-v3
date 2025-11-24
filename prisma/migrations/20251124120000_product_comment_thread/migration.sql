-- Alter ProductComment to support threaded replies metadata
ALTER TABLE "ProductComment"
ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'visible';

-- Improve ProductComment indexes for pagination
CREATE INDEX IF NOT EXISTS "ProductComment_productId_createdAt_idx" ON "ProductComment"("productId", "createdAt");
CREATE INDEX IF NOT EXISTS "ProductComment_parentId_idx" ON "ProductComment"("parentId");
CREATE INDEX IF NOT EXISTS "ProductComment_status_idx" ON "ProductComment"("status");

-- Track per-user vote values
ALTER TABLE "CommentVote"
ADD COLUMN IF NOT EXISTS "value" INTEGER NOT NULL DEFAULT 1;

-- Add productId column to notifications for product comment alerts
ALTER TABLE "Notification"
ADD COLUMN IF NOT EXISTS "productId" TEXT;

CREATE INDEX IF NOT EXISTS "Notification_productId_idx" ON "Notification"("productId");

-- Product comment mention table
CREATE TABLE IF NOT EXISTS "ProductCommentMention" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "mentionedUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductCommentMention_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProductCommentMention_commentId_mentionedUserId_key"
    ON "ProductCommentMention"("commentId", "mentionedUserId");

CREATE INDEX IF NOT EXISTS "ProductCommentMention_commentId_idx"
    ON "ProductCommentMention"("commentId");

CREATE INDEX IF NOT EXISTS "ProductCommentMention_mentionedUserId_idx"
    ON "ProductCommentMention"("mentionedUserId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'ProductCommentMention_commentId_fkey'
  ) THEN
    ALTER TABLE "ProductCommentMention"
    ADD CONSTRAINT "ProductCommentMention_commentId_fkey"
    FOREIGN KEY ("commentId") REFERENCES "ProductComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'ProductCommentMention_mentionedUserId_fkey'
  ) THEN
    ALTER TABLE "ProductCommentMention"
    ADD CONSTRAINT "ProductCommentMention_mentionedUserId_fkey"
    FOREIGN KEY ("mentionedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

