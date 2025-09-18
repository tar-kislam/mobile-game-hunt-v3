# Blog Tables Drop Migration

## Overview
This migration permanently removes all blog-related database tables and enums from the application.

## What This Migration Does
- Drops the `BlogPost` table and all its data
- Drops the `BlogStatus` enum
- Removes all blog-related database constraints

## ⚠️ WARNING
**This migration will permanently delete all blog data!** 
- All blog posts will be lost
- All blog metadata will be lost
- This action cannot be undone

## When to Run This Migration
Only run this migration when you are certain that:
1. All blog functionality has been removed from the application
2. No blog data needs to be preserved
3. The application is no longer using any blog-related database tables

## How to Run
```bash
# Generate the migration (if not already done)
npx prisma migrate dev --name drop_blog_tables

# Apply the migration to production (when ready)
npx prisma migrate deploy
```

## Rollback
This migration cannot be easily rolled back as it permanently deletes data.
If you need to restore blog functionality, you would need to:
1. Restore the BlogPost model in schema.prisma
2. Restore the BlogStatus enum
3. Recreate the database tables
4. Restore data from backups (if available)

## Related Changes
This migration is part of the blog removal process that includes:
- ✅ Feature flag system (BLOG_ENABLED=false)
- ✅ Frontend blog pages removal
- ✅ Blog API routes removal
- ✅ Blog components removal
- ✅ Prisma model removal
- 🔄 Database table drop (this migration)
