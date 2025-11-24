-- Ensure PostComment has hierarchical + moderation columns
ALTER TABLE "public"."PostComment" ADD COLUMN IF NOT EXISTS "parentId" TEXT;
ALTER TABLE "public"."PostComment" ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."PostComment" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'visible';

-- Indexes matching Prisma schema hints
CREATE INDEX IF NOT EXISTS "PostComment_postId_createdAt_idx" ON "public"."PostComment"("postId", "createdAt");
CREATE INDEX IF NOT EXISTS "PostComment_parentId_idx" ON "public"."PostComment"("parentId");
CREATE INDEX IF NOT EXISTS "PostComment_userId_createdAt_idx" ON "public"."PostComment"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "PostComment_isDeleted_idx" ON "public"."PostComment"("isDeleted");
CREATE INDEX IF NOT EXISTS "PostComment_status_idx" ON "public"."PostComment"("status");

-- Parent/child relation
DO $$
BEGIN
  ALTER TABLE "public"."PostComment"
    ADD CONSTRAINT "PostComment_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "public"."PostComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END$$;

-- Mention table used by community comments
CREATE TABLE IF NOT EXISTS "public"."CommentMention" (
  "id" TEXT NOT NULL,
  "commentId" TEXT NOT NULL,
  "mentionedUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CommentMention_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CommentMention_commentId_mentionedUserId_key"
  ON "public"."CommentMention"("commentId", "mentionedUserId");
CREATE INDEX IF NOT EXISTS "CommentMention_commentId_idx" ON "public"."CommentMention"("commentId");
CREATE INDEX IF NOT EXISTS "CommentMention_mentionedUserId_idx" ON "public"."CommentMention"("mentionedUserId");

DO $$
BEGIN
  ALTER TABLE "public"."CommentMention"
    ADD CONSTRAINT "CommentMention_commentId_fkey"
    FOREIGN KEY ("commentId") REFERENCES "public"."PostComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END$$;

DO $$
BEGIN
  ALTER TABLE "public"."CommentMention"
    ADD CONSTRAINT "CommentMention_mentionedUserId_fkey"
    FOREIGN KEY ("mentionedUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END$$;

