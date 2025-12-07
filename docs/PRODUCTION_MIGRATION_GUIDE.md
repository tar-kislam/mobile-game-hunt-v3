# Production Migration Guide

Bu rehber, production ortamında güvenli bir şekilde database migration'larını uygulamak için hazırlanmıştır.

## 🎯 Genel Bakış

Production migration script'i (`scripts/production-migrate.sh`), bekleyen migration'ları güvenli bir şekilde uygular. Script şu özelliklere sahiptir:

- ✅ Otomatik database backup
- ✅ Migration durumu kontrolü
- ✅ Dry-run modu (test için)
- ✅ Detaylı logging
- ✅ Rollback bilgisi
- ✅ Verification adımları

## 📋 Ön Gereksinimler

### 1. Environment Variables
```bash
export DATABASE_URL="postgresql://user:password@host:5432/database"
```

### 2. Gerekli Araçlar
- Node.js ve npm (Prisma CLI için)
- PostgreSQL client tools (`pg_dump`, `psql`) - backup için
- Bash shell

### 3. Dosya İzinleri
```bash
chmod +x scripts/production-migrate.sh
```

## 🚀 Kullanım

### Standart Kullanım (Backup ile)
```bash
cd /path/to/project
export DATABASE_URL="your_production_database_url"
./scripts/production-migrate.sh
```

### Dry Run (Test Modu)
Migration'ları uygulamadan önce ne yapılacağını görmek için:
```bash
./scripts/production-migrate.sh --dry-run
```

### Backup Olmadan (Sadece Migration)
⚠️ **Dikkat**: Sadece backup'ınız zaten alındıysa kullanın!
```bash
./scripts/production-migrate.sh --skip-backup
```

## 📝 Adım Adım Süreç

### 1. Pre-Flight Kontrolleri
Script otomatik olarak şunları kontrol eder:
- `DATABASE_URL` environment variable'ı set edilmiş mi?
- Prisma CLI mevcut mu?
- PostgreSQL client tools kurulu mu?

### 2. Backup Oluşturma
- Otomatik database backup oluşturulur
- Backup `backups/` dizinine kaydedilir
- Backup otomatik olarak sıkıştırılır (gzip)
- En son backup'a symlink oluşturulur

### 3. Migration Durumu Kontrolü
- Mevcut migration durumu kontrol edilir
- Bekleyen migration'lar tespit edilir
- Eğer database güncel ise, işlem sonlandırılır

### 4. Migration Uygulama
- Bekleyen migration'lar uygulanır
- Her adım loglanır
- Hata durumunda işlem durdurulur

### 5. Prisma Client Generation
- Prisma client yeniden generate edilir
- Yeni tablolar ve modeller için type'lar oluşturulur

### 6. Verification
- Migration'ların başarıyla uygulandığı doğrulanır
- Yeni tabloların varlığı kontrol edilir

## 📊 Log Dosyaları

Tüm işlemler `backups/migration_YYYYMMDD_HHMMSS.log` dosyasına loglanır.

Log dosyası şunları içerir:
- Tüm komut çıktıları
- Hata mesajları
- Backup bilgileri
- Migration durumu

## 🔄 Rollback İşlemi

Eğer bir sorun yaşanırsa, backup'tan geri yükleme yapabilirsiniz:

```bash
# 1. Uygulamayı durdurun
docker-compose down
# veya
pm2 stop all

# 2. Backup'ı açın
cd backups
gunzip prod_backup_YYYYMMDD_HHMMSS.sql.gz

# 3. Database'i geri yükleyin
psql $DATABASE_URL < prod_backup_YYYYMMDD_HHMMSS.sql

# 4. Prisma client'ı yeniden generate edin
cd ..
npx prisma generate

# 5. Uygulamayı yeniden başlatın
docker-compose up -d
# veya
pm2 start all
```

## ⚠️ Önemli Notlar

### Production'da Migration Yapmadan Önce

1. **Maintenance Window Planlayın**
   - Kullanıcılara bilgi verin
   - Uygun zamanı seçin (düşük trafik)

2. **Staging'de Test Edin**
   - Önce staging ortamında test edin
   - Tüm migration'ların çalıştığından emin olun

3. **Backup Doğrulayın**
   - Backup'ın başarıyla oluşturulduğunu kontrol edin
   - Backup dosyasının erişilebilir olduğundan emin olun

4. **Monitoring Hazırlayın**
   - Application logs'u izleyin
   - Database connection'ları kontrol edin
   - Error rate'leri takip edin

### Migration Sonrası

1. **Application Test**
   - Uygulamanın çalıştığını doğrulayın
   - Kritik feature'ları test edin
   - API endpoint'lerini kontrol edin

2. **Monitoring**
   - İlk 1 saat boyunca dikkatli izleyin
   - Error log'larını kontrol edin
   - Performance metriklerini takip edin

3. **Verification**
   - Yeni tabloların oluşturulduğunu doğrulayın
   - Index'lerin doğru şekilde oluşturulduğunu kontrol edin
   - Foreign key constraint'lerin çalıştığını test edin

## 🐛 Sorun Giderme

### Migration Başarısız Olursa

```bash
# 1. Log dosyasını kontrol edin
tail -100 backups/migration_*.log

# 2. Migration durumunu kontrol edin
npx prisma migrate status

# 3. Database connection'ı test edin
npx prisma db execute --stdin <<< "SELECT 1;"

# 4. Gerekirse rollback yapın (yukarıdaki rollback adımlarına bakın)
```

### Prisma Client Generation Başarısız Olursa

```bash
# Manuel olarak generate edin
npx prisma generate

# Eğer hala sorun varsa, Prisma cache'ini temizleyin
rm -rf node_modules/.prisma
npx prisma generate
```

### Backup Oluşturulamazsa

```bash
# PostgreSQL client tools'u kontrol edin
which pg_dump

# DATABASE_URL'in doğru olduğundan emin olun
echo $DATABASE_URL

# Manuel backup deneyin
pg_dump $DATABASE_URL > manual_backup.sql
```

## 📅 Mevcut Migration'lar

Bu migration script'i şu migration'ları uygular:

1. **20251124153000_add_post_comment_parent_fields**
   - Post comment parent field'larını ekler

2. **20251127131000_add_newsletter_source**
   - Newsletter source field'ını ekler

3. **20251127132000_add_user_activity_event**
   - UserActivityEvent tablosunu oluşturur (analytics için)

4. **20251127135000_recover_analytics**
   - Analytics recovery migration'ı

## ✅ Checklist

Migration öncesi:
- [ ] Staging'de test edildi
- [ ] Maintenance window planlandı
- [ ] Kullanıcılara bilgi verildi
- [ ] DATABASE_URL doğru set edildi
- [ ] Backup alındı (script otomatik yapacak)
- [ ] Monitoring hazır

Migration sırasında:
- [ ] Script başarıyla çalıştı
- [ ] Backup oluşturuldu
- [ ] Migration'lar uygulandı
- [ ] Prisma client generate edildi
- [ ] Verification başarılı

Migration sonrası:
- [ ] Application çalışıyor
- [ ] Kritik feature'lar test edildi
- [ ] Log'lar temiz
- [ ] Performance normal
- [ ] 1 saat boyunca monitoring yapıldı

## 📞 Destek

Sorun yaşarsanız:
1. Log dosyasını kontrol edin: `backups/migration_*.log`
2. Migration durumunu kontrol edin: `npx prisma migrate status`
3. Gerekirse rollback yapın
4. Development team ile iletişime geçin

---

**Son Güncelleme**: 2025-01-XX
**Script**: `scripts/production-migrate.sh`
**Backup Dizini**: `backups/`
