# 🚨 EMERGENCY BLOG ROLLBACK - QUICK REFERENCE

## ⚡ IMMEDIATE ACTIONS (2-5 minutes)

### 1. Quick Feature Flag Rollback
```bash
# Set BLOG_ENABLED to true
echo "BLOG_ENABLED=true" >> .env.local

# Restart application
docker-compose restart app
# OR
pm2 restart mobile-game-hunt
```

### 2. Test Rollback
```bash
curl -I https://yourdomain.com/blog
# Should return 200 OK
```

## 🔧 FULL ROLLBACK (10-15 minutes)

### 1. Run Emergency Script
```bash
./scripts/emergency-blog-rollback.sh full
```

### 2. Deploy Emergency Branch
```bash
git push origin emergency/blog-restore-$(date +%Y%m%d-%H%M%S)
# Deploy this branch to production
```

## 🗄️ DATABASE ROLLBACK (30-60 minutes)

### 1. Stop Application
```bash
docker-compose down
# OR
pm2 stop all
```

### 2. Restore Database
```bash
psql $DATABASE_URL < backups/db_backup_YYYYMMDD_HHMMSS.sql
```

### 3. Update Schema & Restart
```bash
git checkout HEAD~1 -- prisma/schema.prisma
npx prisma migrate deploy
npx prisma generate
docker-compose up -d
```

## 📞 EMERGENCY CONTACTS

- **Lead Developer**: [Your Name] - [Phone]
- **DevOps**: [DevOps Name] - [Phone]
- **Database Admin**: [DB Admin] - [Phone]

## 🔍 VERIFICATION CHECKLIST

- [ ] Blog pages return 200 OK
- [ ] Blog API endpoints respond
- [ ] Editorial dashboard shows blog section
- [ ] Database contains blog tables
- [ ] No 500 errors in logs

## 📋 DECISION TREE

```
Issue Detected
├── Blog pages 404? → Quick Feature Flag Rollback
├── Blog broken? → Full Git Rollback  
├── Data missing? → Database Rollback
└── All working? → Monitor & Document
```

## 🚨 CRITICAL NOTES

- **ALWAYS** create backup before rollback
- **TEST** rollback on staging first if possible
- **COMMUNICATE** with team during rollback
- **DOCUMENT** what went wrong for post-mortem

---

**Last Updated**: [Current Date]
**Emergency Script**: `./scripts/emergency-blog-rollback.sh`
**Full Documentation**: `docs/blog-rollback-plan.md`
