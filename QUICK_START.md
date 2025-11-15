# 🚀 Hızlı Başlangıç Kılavuzu

## Docker Kurulumu (Gerekli)

### Seçenek 1: Colima (Lightweight - Önerilen)

1. **Homebrew'u kurun** (eğer yoksa):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. **PATH'e ekleyin** (Apple Silicon Mac için):
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
eval "$(/opt/homebrew/bin/brew shellenv)"
```

3. **Docker'ı kurun ve başlatın**:
```bash
cd /Users/tarik/Desktop/mobile-game-hunt-v3
./setup-docker.sh
```

### Seçenek 2: Docker Desktop

[Docker Desktop'u indirip kurun](https://www.docker.com/products/docker-desktop/)

## Projeyi Başlatma

Docker kurulumundan sonra:

```bash
# 1. Development veritabanlarını başlat
docker-compose -f docker-compose.dev.yml up -d

# 2. Prisma client'ı oluştur
npm run db:generate

# 3. Veritabanı migration'larını çalıştır
npm run db:migrate

# 4. (Opsiyonel) Seed data ekle
npm run db:seed

# 5. Development server'ı başlat
npm run dev
```

## Erişim

- **Uygulama**: http://localhost:3000
- **PgAdmin** (Database GUI): http://localhost:8080
  - Email: admin@mobilegamehunt.com
  - Şifre: admin

## Test Kullanıcıları

- **Admin**: admin@example.com / password123
- **User 1**: john@example.com / password123
- **User 2**: jane@example.com / password123

## Yardımcı Komutlar

```bash
# Docker container'ları durdur
docker-compose -f docker-compose.dev.yml down

# Prisma Studio'yu aç (Database GUI)
npm run db:studio

# Logları görüntüle
docker-compose -f docker-compose.dev.yml logs -f
```


