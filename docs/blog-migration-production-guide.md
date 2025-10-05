# Blog Migration Production Deployment Guide

## Overview
This guide provides step-by-step instructions for safely deploying the blog table drop migration to production.

## Pre-Deployment Checklist

### 1. Environment Verification
- [ ] Staging environment tested successfully
- [ ] All blog functionality confirmed removed
- [ ] Feature flag `BLOG_ENABLED=false` verified
- [ ] No blog API endpoints accessible
- [ ] Application builds and runs without errors

### 2. Database Backup
- [ ] Full database backup created
- [ ] Backup verified and tested
- [ ] Backup stored in secure location
- [ ] Rollback plan documented

### 3. Application State
- [ ] All blog-related code removed
- [ ] No Prisma queries reference blog tables
- [ ] Prisma schema updated
- [ ] Migration files ready

## Deployment Steps

### Step 1: Maintenance Window
```bash
# Schedule maintenance window
# Notify users of brief downtime
# Prepare rollback plan
```

### Step 2: Pre-Deployment Verification
```bash
# Verify current state
npx prisma migrate status

# Check for any pending migrations
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma

# Verify no blog references
grep -r "BlogPost\|BlogStatus" src/ || echo "No blog references found"
```

### Step 3: Database Backup
```bash
# Create full database backup
pg_dump $DATABASE_URL > backup_before_blog_migration_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
pg_restore --list backup_before_blog_migration_*.sql
```

### Step 4: Deploy Migration
```bash
# Apply the migration
npx prisma migrate deploy

# Verify migration applied
npx prisma migrate status
```

### Step 5: Post-Deployment Verification
```bash
# Verify tables are dropped
npx prisma db execute --stdin <<< "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'BlogPost';"

# Verify enums are dropped
npx prisma db execute --stdin <<< "SELECT typname FROM pg_type WHERE typname = 'BlogStatus';"

# Generate Prisma client
npx prisma generate

# Test application
npm run build
```

### Step 6: Application Testing
```bash
# Start application
npm start

# Test core functionality:
# - User authentication
# - Product submission
# - Community features
# - Admin dashboard
# - API endpoints
```

## Rollback Procedure

If issues occur after migration:

### 1. Immediate Rollback
```bash
# Stop application
# Restore database from backup
pg_restore --clean --if-exists backup_before_blog_migration_*.sql

# Restart application
npm start
```

### 2. Code Rollback
```bash
# Revert to previous commit
git revert <migration-commit-hash>

# Restore Prisma schema
git checkout HEAD~1 -- prisma/schema.prisma

# Regenerate Prisma client
npx prisma generate
```

## Monitoring

### During Deployment
- Monitor application logs
- Check database connection
- Verify API responses
- Test user authentication

### Post-Deployment
- Monitor error rates
- Check performance metrics
- Verify all features working
- Monitor for 24 hours

## Troubleshooting

### Common Issues

#### 1. Migration Fails
```bash
# Check migration status
npx prisma migrate status

# Check database logs
# Verify database permissions
# Check for locked tables
```

#### 2. Application Errors
```bash
# Check Prisma client
npx prisma generate

# Verify schema
npx prisma validate

# Check application logs
```

#### 3. Database Connection Issues
```bash
# Test database connection
npx prisma db execute --stdin <<< "SELECT 1;"

# Check environment variables
echo $DATABASE_URL

# Verify database is running
```

## Success Criteria

Migration is successful when:

- [ ] BlogPost table completely removed
- [ ] BlogStatus enum completely removed
- [ ] Application starts without errors
- [ ] All core functionality works
- [ ] No database errors in logs
- [ ] Performance metrics normal

## Post-Deployment Tasks

### 1. Cleanup
```bash
# Remove backup files (after 30 days)
# Update documentation
# Notify team of successful deployment
```

### 2. Monitoring
```bash
# Monitor for 48 hours
# Check error rates
# Verify performance
# Document any issues
```

## Support Contacts

- **Database Admin**: [Contact Info]
- **DevOps Team**: [Contact Info]
- **Application Team**: [Contact Info]

## Emergency Contacts

- **On-call Engineer**: [Contact Info]
- **Database Team Lead**: [Contact Info]

---

**⚠️ IMPORTANT**: This migration permanently deletes blog data. Ensure all stakeholders are aware and have approved the deployment.
