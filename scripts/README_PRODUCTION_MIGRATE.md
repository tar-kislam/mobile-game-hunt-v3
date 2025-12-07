# Production Migration - Hızlı Başlangıç

## 🚀 Hızlı Kullanım

```bash
# 1. Environment variable'ı set edin
export DATABASE_URL="postgresql://user:password@host:5432/database"

# 2. Script'i çalıştırın
./scripts/production-migrate.sh
```

## 📝 Örnek Senaryolar

### İlk Kullanım (Backup ile)
```bash
export DATABASE_URL="your_production_db_url"
./scripts/production-migrate.sh
```

### Test Modu (Dry Run)
```bash
./scripts/production-migrate.sh --dry-run
```

### Backup Olmadan (Sadece Migration)
```bash
./scripts/production-migrate.sh --skip-backup
```

## ⚠️ Önemli

- **Her zaman backup alın!** (Script otomatik yapar)
- **Staging'de test edin** önce
- **Maintenance window** planlayın
- **Monitoring** yapın

## 📚 Detaylı Rehber

Tam detaylı rehber için: `docs/PRODUCTION_MIGRATION_GUIDE.md`

## 🔄 Rollback

Backup'tan geri yükleme:
```bash
gunzip backups/prod_backup_*.sql.gz
psql $DATABASE_URL < backups/prod_backup_*.sql
```

## ✅ Checklist

- [ ] DATABASE_URL set edildi
- [ ] Backup alındı
- [ ] Migration'lar uygulandı
- [ ] Prisma client generate edildi
- [ ] Application test edildi
