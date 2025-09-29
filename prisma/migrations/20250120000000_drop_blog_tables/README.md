# Blog Tables Drop Migration (Destructive)

## Overview
This migration permanently removes all blog-related database tables, indexes, and enums from the application.

## What This Migration Does

### Tables Dropped:
- `BlogPost` - Contains all blog posts and their metadata

### Indexes Dropped:
- `BlogPost_authorId_idx` - Index on author foreign key
- `BlogPost_createdAt_idx` - Index on creation timestamp
- `BlogPost_slug_idx` - Index on unique slug field
- `BlogPost_status_idx` - Index on blog status

### Enums Dropped:
- `BlogStatus` - Enum containing DRAFT, PUBLISHED, ARCHIVED values

### Foreign Key Constraints:
- Automatically handled by CASCADE operations
- No manual constraint dropping needed

## ⚠️ CRITICAL WARNING
**This migration will permanently delete all blog data!** 
- All blog posts will be lost
- All blog metadata will be lost
- All blog indexes will be removed
- This action cannot be undone

## Pre-Migration Checklist
Before running this migration, verify:

- [ ] All blog functionality has been removed from the application
- [ ] Feature flag `BLOG_ENABLED=false` is set
- [ ] No blog API endpoints are accessible
- [ ] No blog pages are accessible
- [ ] No blog components are in use
- [ ] No Prisma queries reference blog tables
- [ ] Application has been tested without blog functionality
- [ ] Database backup has been created (if data needs to be preserved)

## Migration Steps

### 1. Drop Indexes
```sql
DROP INDEX IF EXISTS "BlogPost_authorId_idx" CASCADE;
DROP INDEX IF EXISTS "BlogPost_createdAt_idx" CASCADE;
DROP INDEX IF EXISTS "BlogPost_slug_idx" CASCADE;
DROP INDEX IF EXISTS "BlogPost_status_idx" CASCADE;
```

### 2. Drop Tables
```sql
DROP TABLE IF EXISTS "BlogPost" CASCADE;
```

### 3. Drop Enums
```sql
DROP TYPE IF EXISTS "BlogStatus" CASCADE;
```

## How to Run

### Development/Staging
```bash
# Apply the migration
npx prisma migrate dev --name drop_blog_tables

# Verify the migration was applied
npx prisma migrate status
```

### Production
```bash
# Apply the migration to production
npx prisma migrate deploy

# Verify the migration was applied
npx prisma migrate status
```

## Verification

After running the migration, verify that:

1. **BlogPost table is gone:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'BlogPost';
   -- Should return no rows
   ```

2. **BlogStatus enum is gone:**
   ```sql
   SELECT typname FROM pg_type WHERE typname = 'BlogStatus';
   -- Should return no rows
   ```

3. **Application still works:**
   - Start the application
   - Verify no database errors
   - Test core functionality

## Rollback

This migration cannot be easily rolled back as it permanently deletes data.

If you need to restore blog functionality, you would need to:

1. Restore the BlogPost model in `schema.prisma`
2. Restore the BlogStatus enum
3. Recreate the database tables and indexes
4. Restore data from backups (if available)
5. Re-implement blog functionality

## Related Changes

This migration is part of the complete blog removal process:

- ✅ **Part 1**: Feature flag system (`BLOG_ENABLED=false`)
- ✅ **Part 2**: Frontend blog pages removal
- ✅ **Part 3**: Blog API routes removal  
- ✅ **Part 4**: Blog components removal
- ✅ **Part 5**: Prisma model removal
- 🔄 **Part 6**: Database table drop (this migration)

## Testing

### Staging Environment
1. Run this migration in staging first
2. Test all application functionality
3. Verify no database errors
4. Confirm blog data is completely removed

### Production Environment
1. Create database backup
2. Run migration during maintenance window
3. Monitor application logs
4. Verify all systems operational

## Support

If you encounter issues:
1. Check application logs for database errors
2. Verify Prisma client is regenerated: `npx prisma generate`
3. Check database connection and permissions
4. Review migration history: `npx prisma migrate status`
