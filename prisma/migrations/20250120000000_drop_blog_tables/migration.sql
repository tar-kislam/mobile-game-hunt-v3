-- DropBlogTables
-- This migration drops all blog-related tables, indexes, and enums
-- WARNING: This will permanently delete all blog data!

-- Step 1: Drop foreign key constraints (if any exist)
-- Note: Prisma handles foreign keys automatically, but we'll be explicit

-- Step 2: Drop indexes on BlogPost table
DROP INDEX IF EXISTS "BlogPost_authorId_idx" CASCADE;
DROP INDEX IF EXISTS "BlogPost_createdAt_idx" CASCADE;
DROP INDEX IF EXISTS "BlogPost_slug_idx" CASCADE;
DROP INDEX IF EXISTS "BlogPost_status_idx" CASCADE;

-- Step 3: Drop the BlogPost table
DROP TABLE IF EXISTS "BlogPost" CASCADE;

-- Step 4: Drop the BlogStatus enum
DROP TYPE IF EXISTS "BlogStatus" CASCADE;

-- Verification queries (commented out - uncomment to verify)
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'BlogPost';
-- SELECT typname FROM pg_type WHERE typname = 'BlogStatus';
