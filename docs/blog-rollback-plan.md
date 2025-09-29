# Blog Feature Rollback Plan

## Overview
This document provides comprehensive rollback procedures for the blog feature removal. If issues arise after deployment, follow these steps to restore blog functionality.

## Emergency Contact Information
- **Primary Developer**: [Your Name]
- **Database Admin**: [DB Admin Name]
- **DevOps Team**: [DevOps Contact]
- **Emergency Hotline**: [Emergency Contact]

## Rollback Scenarios

### Scenario 1: Quick Feature Flag Rollback (Recommended First Step)
**Use when**: Blog pages are needed immediately but database is intact
**Time to restore**: 2-5 minutes
**Risk level**: Low

#### Steps:
1. **Update Environment Variable**
   ```bash
   # In production environment
   export BLOG_ENABLED=true
   
   # Or update .env.local/.env.production
   echo "BLOG_ENABLED=true" >> .env.local
   ```

2. **Restart Application**
   ```bash
   # For Docker deployments
   docker-compose restart app
   
   # For PM2 deployments
   pm2 restart mobile-game-hunt
   
   # For Vercel deployments
   # Redeploy with updated environment variable
   ```

3. **Verify Restoration**
   ```bash
   curl -I https://yourdomain.com/blog
   # Should return 200 OK instead of 404
   ```

### Scenario 2: Git Branch Rollback
**Use when**: Code changes need to be reverted
**Time to restore**: 10-15 minutes
**Risk level**: Medium

#### Steps:
1. **Create Emergency Branch**
   ```bash
   git checkout main
   git checkout -b emergency/blog-restore-$(date +%Y%m%d-%H%M%S)
   ```

2. **Revert to Pre-Removal Commit**
   ```bash
   # Find the commit before blog removal started
   git log --oneline --grep="blog" | head -5
   
   # Revert to the commit before blog removal
   git revert <commit-hash> --no-edit
   ```

3. **Restore Blog Files**
   ```bash
   # Restore deleted blog files from git history
   git checkout HEAD~1 -- src/app/(main)/blog/
   git checkout HEAD~1 -- src/app/api/blog/
   git checkout HEAD~1 -- src/components/BlogDetail.tsx
   git checkout HEAD~1 -- src/components/RichTextRenderer.tsx
   ```

4. **Update Configuration**
   ```bash
   # Restore blog navigation in header
   git checkout HEAD~1 -- src/components/layout/header.tsx
   
   # Remove blog redirects from next.config.ts
   git checkout HEAD~1 -- next.config.ts
   ```

5. **Deploy Emergency Branch**
   ```bash
   git push origin emergency/blog-restore-$(date +%Y%m%d-%H%M%S)
   # Deploy this branch to production
   ```

### Scenario 3: Database Rollback
**Use when**: Blog data needs to be restored
**Time to restore**: 30-60 minutes
**Risk level**: High

#### Pre-Rollback Checklist:
- [ ] Confirm database backup exists
- [ ] Verify backup contains blog tables
- [ ] Test restore procedure on staging environment
- [ ] Notify all stakeholders of downtime

#### Steps:
1. **Stop Application**
   ```bash
   # Stop all application instances
   docker-compose down
   # or
   pm2 stop all
   ```

2. **Create Current Database Backup**
   ```bash
   pg_dump $DATABASE_URL > backup_before_rollback_$(date +%Y%m%d_%H%M%S).sql
   ```

3. **Restore Blog Tables**
   ```bash
   # Restore from pre-removal backup
   psql $DATABASE_URL < backup_with_blog_tables.sql
   ```

4. **Update Prisma Schema**
   ```bash
   # Restore blog models in schema.prisma
   git checkout HEAD~1 -- prisma/schema.prisma
   ```

5. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

6. **Restart Application**
   ```bash
   docker-compose up -d
   # or
   pm2 start all
   ```

## Rollback Decision Tree

```
Issue Detected
├── Blog pages return 404?
│   ├── Yes → Use Scenario 1 (Feature Flag Rollback)
│   └── No → Continue to next check
├── Blog functionality completely broken?
│   ├── Yes → Use Scenario 2 (Git Branch Rollback)
│   └── No → Continue to next check
├── Blog data missing or corrupted?
│   ├── Yes → Use Scenario 3 (Database Rollback)
│   └── No → Investigate specific issue
└── All systems working?
    └── Yes → Monitor and document issue
```

## Testing Rollback Procedures

### Pre-Production Testing
1. **Test Feature Flag Rollback**
   ```bash
   # On staging environment
   export BLOG_ENABLED=false
   # Verify blog pages return 404
   export BLOG_ENABLED=true
   # Verify blog pages return 200
   ```

2. **Test Git Rollback**
   ```bash
   # Create test branch
   git checkout -b test/blog-rollback
   # Apply blog removal changes
   # Test rollback procedure
   # Clean up test branch
   ```

3. **Test Database Rollback**
   ```bash
   # On staging database
   # Create backup with blog tables
   # Remove blog tables
   # Test restore procedure
   ```

## Monitoring and Alerts

### Key Metrics to Monitor
- **Blog page response codes**: Should be 404 when disabled
- **Database query errors**: Related to missing blog tables
- **Application error rates**: Unusual spikes after deployment
- **User complaints**: Reports of missing blog functionality

### Alert Thresholds
- Blog page 500 errors > 10/minute
- Database connection errors > 5/minute
- Application crash rate > 1%

## Communication Plan

### Internal Team Notification
- **Immediate**: Slack #engineering-alerts
- **Within 1 hour**: Email to dev team
- **Within 4 hours**: Post-mortem meeting scheduled

### User Communication
- **Immediate**: Status page update
- **Within 30 minutes**: Social media announcement
- **Within 2 hours**: Email to newsletter subscribers

## Post-Rollback Actions

### Immediate (0-2 hours)
1. Verify all systems are operational
2. Monitor error rates and user feedback
3. Document what went wrong
4. Communicate status to stakeholders

### Short-term (2-24 hours)
1. Conduct root cause analysis
2. Implement fixes for identified issues
3. Update rollback procedures based on learnings
4. Plan re-deployment strategy

### Long-term (1-7 days)
1. Complete post-mortem report
2. Update documentation and procedures
3. Implement additional monitoring
4. Schedule follow-up review

## Emergency Contacts

### Development Team
- **Lead Developer**: [Name] - [Phone] - [Email]
- **Backend Developer**: [Name] - [Phone] - [Email]
- **DevOps Engineer**: [Name] - [Phone] - [Email]

### External Services
- **Database Hosting**: [Provider] - [Support Contact]
- **CDN Provider**: [Provider] - [Support Contact]
- **Monitoring Service**: [Provider] - [Support Contact]

## Rollback Checklist

### Before Starting Rollback
- [ ] Confirm issue severity and impact
- [ ] Notify stakeholders of planned rollback
- [ ] Create backup of current state
- [ ] Document current system state

### During Rollback
- [ ] Follow rollback procedure step by step
- [ ] Test each step before proceeding
- [ ] Monitor system health continuously
- [ ] Communicate progress to team

### After Rollback
- [ ] Verify all systems are operational
- [ ] Monitor for 30 minutes minimum
- [ ] Document rollback results
- [ ] Schedule follow-up actions

## Prevention Measures

### Future Deployments
1. **Staged Rollout**: Deploy to small percentage of users first
2. **Feature Flags**: Use feature flags for all major changes
3. **Database Migrations**: Always test migrations on staging first
4. **Monitoring**: Implement comprehensive monitoring before deployment

### Documentation Updates
1. **Keep this rollback plan updated**
2. **Document all changes made during rollback**
3. **Update runbooks based on rollback experience**
4. **Share learnings with the team**

---

**Last Updated**: [Current Date]
**Next Review**: [Date + 3 months]
**Document Owner**: [Your Name]
