# 🐳 Docker Compose Kullanım Rehberi

## Docker Compose Nedir?

Docker Compose, birden fazla Docker container'ını tek bir komutla yönetmenizi sağlayan bir araçtır. Bu projede veritabanı, Redis ve uygulama gibi servisleri birlikte çalıştırmak için kullanıyoruz.

## 📋 Kurulu Servisler

### Development Ortamı (`docker-compose.dev.yml`)

1. **PostgreSQL Database** (Port: 5432)
   - Database: `mobile_game_hunt_dev`
   - Username: `postgres`
   - Password: `password`

2. **Redis** (Port: 6379)
   - Session ve cache için

3. **PgAdmin** (Port: 8080)
   - Veritabanı yönetim arayüzü
   - Login: `admin@mobilegamehunt.com`
   - Password: `admin`

## 🚀 Temel Komutlar

### Development Ortamını Başlatma
```bash
# Tüm servisleri arka planda başlat
docker compose -f docker-compose.dev.yml up -d

# Servislerin durumunu kontrol et
docker compose -f docker-compose.dev.yml ps

# Logları izle
docker compose -f docker-compose.dev.yml logs -f
```

### Servisleri Durdurma
```bash
# Tüm servisleri durdur
docker compose -f docker-compose.dev.yml down

# Servisleri durdur ve volume'ları da sil (tüm veri kaybolur!)
docker compose -f docker-compose.dev.yml down -v
```

### Veritabanı İşlemleri
```bash
# Migration çalıştır
DATABASE_URL="postgresql://postgres:password@localhost:5432/mobile_game_hunt_dev" npx prisma migrate dev

# Veritabanını seed et
DATABASE_URL="postgresql://postgres:password@localhost:5432/mobile_game_hunt_dev" npm run db:seed

# Prisma Studio'yu aç
DATABASE_URL="postgresql://postgres:password@localhost:5432/mobile_game_hunt_dev" npx prisma studio
```

## 🔧 Yararlı Komutlar

### Container'ları İzleme
```bash
# Çalışan container'ları listele
docker ps

# Tüm container'ları listele (durmuş olanlar dahil)
docker ps -a

# Resource kullanımını izle
docker stats
```

### Logları İnceleme
```bash
# Belirli bir servisin loglarını izle
docker compose -f docker-compose.dev.yml logs postgres
docker compose -f docker-compose.dev.yml logs redis

# Son 50 satırı göster
docker compose -f docker-compose.dev.yml logs --tail=50 postgres
```

### Container İçine Bağlanma
```bash
# PostgreSQL container'ına bağlan
docker compose -f docker-compose.dev.yml exec postgres psql -U postgres -d mobile_game_hunt_dev

# Redis container'ına bağlan
docker compose -f docker-compose.dev.yml exec redis redis-cli
```

## 🌐 Erişim Adresleri

- **Uygulama**: http://localhost:3000
- **PgAdmin**: http://localhost:8080
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 🔄 Production Ortamı

Production için `docker-compose.yml` dosyasını kullanın:

```bash
# Production ortamını başlat
docker compose up -d

# SSL sertifikası kur
./deploy/ssl-setup.sh

# Sistem durumunu kontrol et
./deploy/monitoring.sh
```

## ⚠️ Sorun Giderme

### Port Çakışması
Eğer port kullanımda hatası alırsanız:

```bash
# Hangi process'in portu kullandığını kontrol et
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :8080  # PgAdmin

# Çakışan container'ları durdur
docker stop container_name
```

### Veritabanı Bağlantı Sorunu
```bash
# Container'ın çalıştığını kontrol et
docker compose -f docker-compose.dev.yml ps

# Veritabanı loglarını kontrol et
docker compose -f docker-compose.dev.yml logs postgres

# Container'ı yeniden başlat
docker compose -f docker-compose.dev.yml restart postgres
```

### Volume Temizleme
```bash
# Kullanılmayan volume'ları temizle
docker volume prune

# Belirli volume'u sil
docker volume rm mobile-game-hunt-v1-new_postgres_dev_data
```

## 📊 Monitoring

### Health Check
```bash
# Uygulama health check
curl http://localhost:3000/api/health

# PostgreSQL bağlantısı
docker compose -f docker-compose.dev.yml exec postgres pg_isready -U postgres
```

### Performance
```bash
# Container resource kullanımı
docker stats --no-stream

# Disk kullanımı
docker system df
```

## 🚀 Hızlı Kurulum

Yeni bir ortamda projeyi hızlıca kurmak için:

```bash
# 1. Servisleri başlat
docker compose -f docker-compose.dev.yml up -d

# 2. Veritabanını kur
DATABASE_URL="postgresql://postgres:password@localhost:5432/mobile_game_hunt_dev" npx prisma migrate dev

# 3. Test verilerini ekle
DATABASE_URL="postgresql://postgres:password@localhost:5432/mobile_game_hunt_dev" npm run db:seed

# 4. Uygulamayı başlat
npm run dev
```

## 📝 Notlar

- Development ortamında veriler container'lar durdurulduğunda kaybolmaz (volume kullanıyor)
- PgAdmin'e ilk girişte PostgreSQL server'ı manuel olarak eklemeniz gerekebilir
- Production ortamında SSL sertifikaları otomatik olarak yenilenir
- Loglar otomatik olarak rotate edilir (30 gün)

Bu rehber Docker Compose'u projenizdeki tüm servislerle birlikte kullanmanıza yardımcı olacaktır! 🎉
