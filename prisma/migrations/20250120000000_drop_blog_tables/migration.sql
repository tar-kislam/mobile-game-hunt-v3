-- DropBlogTables
-- This migration drops all blog-related tables and enums
-- WARNING: This will permanently delete all blog data!

-- Drop the BlogPost table
DROP TABLE IF EXISTS "BlogPost" CASCADE;

-- Drop the BlogStatus enum
DROP TYPE IF EXISTS "BlogStatus" CASCADE;

-- Note: The blogPosts relation was already removed from the User model
-- in the previous schema changes, so no foreign key constraints need to be dropped
