-- CreateEnum
CREATE TYPE "public"."BlogStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "public"."BlogPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" JSONB NOT NULL,
    "authorId" TEXT NOT NULL,
    "status" "public"."BlogStatus" NOT NULL DEFAULT 'DRAFT',
    "coverImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "public"."BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_slug_idx" ON "public"."BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_status_idx" ON "public"."BlogPost"("status");

-- CreateIndex
CREATE INDEX "BlogPost_createdAt_idx" ON "public"."BlogPost"("createdAt");

-- CreateIndex
CREATE INDEX "BlogPost_authorId_idx" ON "public"."BlogPost"("authorId");

-- AddForeignKey
ALTER TABLE "public"."BlogPost" ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
