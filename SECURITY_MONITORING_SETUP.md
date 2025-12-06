# Güvenlik İzleme ve Uyarı Sistemi Kurulum Rehberi

Bu rehber, MobileGameHunt uygulaması için güvenlik izleme ve uyarı sisteminin nasıl kurulacağını açıklar.

## 📋 İçindekiler

1. [Sistem Bileşenleri](#sistem-bileşenleri)
2. [Kurulum Adımları](#kurulum-adımları)
3. [Yapılandırma](#yapılandırma)
4. [Kullanım](#kullanım)
5. [Docker Log Monitoring](#docker-log-monitoring)
6. [Gelişmiş İzleme (Opsiyonel)](#gelişmiş-izleme-opsiyonel)

## 🎯 Sistem Bileşenleri

### 1. Security Monitor (`src/lib/security-monitor.ts`)
- Güvenlik olaylarını loglar
- E-posta uyarıları gönderir
- Olay sayacı ve eşik yönetimi
- Son olayları görüntüleme API'leri

### 2. Email Alerting (`src/lib/email.ts`)
- Güvenlik uyarı e-postaları gönderir
- Severity bazlı renkli HTML şablonları
- SMTP üzerinden gönderim

### 3. API Route Integration
- Kritik endpoint'lere güvenlik loglama entegrasyonu
- Otomatik olay tespiti ve loglama

## 🚀 Kurulum Adımları

### Adım 1: Environment Variables

`.env` dosyanıza aşağıdaki değişkenleri ekleyin:

```bash
# Mevcut SMTP ayarlarınız (zaten varsa)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=security@mobilegamehunt.com

# Güvenlik uyarıları için e-posta adresi
# Eğer belirtilmezse, SMTP_FROM kullanılır
SECURITY_ALERT_EMAIL=admin@mobilegamehunt.com

# İsteğe bağlı: Slack webhook (gelecekte eklenebilir)
# SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Adım 2: API Route'lara Entegrasyon

Güvenlik loglama, kritik endpoint'lere otomatik olarak entegre edilmiştir:

- ✅ `/api/upload` - Path traversal koruması
- ✅ `/api/upload/from-url` - Path traversal koruması
- ✅ `/api/user/update` - Path traversal koruması
- ✅ `/api/presskit/generate` - Path traversal koruması

**Yeni endpoint'lere manuel entegrasyon:**

```typescript
import { logSecurityEvent, extractIp, extractUserAgent } from '@/lib/security-monitor'

// Örnek: Şüpheli dosya yükleme tespiti
if (suspiciousCondition) {
  await logSecurityEvent({
    type: 'SUSPICIOUS_FILE_UPLOAD',
    severity: 'medium',
    message: 'Suspicious file upload detected',
    details: { fileType: file.type, fileSize: file.size },
    ip: extractIp(request),
    userAgent: extractUserAgent(request),
    path: '/api/upload',
  })
}
```

### Adım 3: Docker Compose'u Güncelleme (Opsiyonel)

Log monitoring için Docker Compose'a log aggregation ekleyebilirsiniz:

```yaml
# docker-compose.yml'e ekleyin
services:
  # ... mevcut servisler ...
  
  # Log aggregation (opsiyonel - gelişmiş izleme için)
  # loki:
  #   image: grafana/loki:latest
  #   container_name: mobile-game-hunt-loki
  #   volumes:
  #     - loki_data:/loki
  #   networks:
  #     - app-network
  #   command: -config.file=/etc/loki/local-config.yaml
```

## ⚙️ Yapılandırma

### Alert Eşikleri

`src/lib/security-monitor.ts` dosyasında eşikleri özelleştirebilirsiniz:

```typescript
const ALERT_THRESHOLDS = {
  critical: 1,    // Kritik olaylar için hemen uyarı
  high: 3,        // 5 dakikada 3 yüksek seviye olay
  medium: 10,     // 15 dakikada 10 orta seviye olay
}
```

### Event Types

Desteklenen güvenlik olay tipleri:

- `COMMAND_INJECTION_ATTEMPT` - Komut enjeksiyonu denemesi
- `PATH_TRAVERSAL_ATTEMPT` - Path traversal denemesi
- `UNAUTHORIZED_ACCESS` - Yetkisiz erişim
- `RATE_LIMIT_EXCEEDED` - Rate limit aşımı
- `SUSPICIOUS_FILE_UPLOAD` - Şüpheli dosya yükleme
- `INVALID_INPUT` - Geçersiz input
- `AUTHENTICATION_FAILURE` - Kimlik doğrulama hatası
- `PRIVILEGE_ESCALATION_ATTEMPT` - Yetki yükseltme denemesi
- `SQL_INJECTION_ATTEMPT` - SQL enjeksiyonu denemesi
- `XSS_ATTEMPT` - XSS denemesi

## 📊 Kullanım

### Manuel Loglama

API route'larınızda güvenlik olaylarını loglayın:

```typescript
import { logSecurityEvent, extractIp, extractUserAgent } from '@/lib/security-monitor'

// Örnek: Yetkisiz erişim denemesi
if (!authorized) {
  await logSecurityEvent({
    type: 'UNAUTHORIZED_ACCESS',
    severity: 'high',
    message: 'Unauthorized access attempt to admin endpoint',
    details: { endpoint: '/api/admin/users', userId: session?.user?.id },
    ip: extractIp(request),
    userAgent: extractUserAgent(request),
    path: request.url,
    userId: session?.user?.id,
  })
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Son Olayları Görüntüleme

Admin panelinde son güvenlik olaylarını görüntülemek için:

```typescript
import { getRecentSecurityEvents, getSecurityEventsByType } from '@/lib/security-monitor'

// Son 50 olay
const events = getRecentSecurityEvents(50)

// Belirli bir tipte olaylar
const pathTraversalEvents = getSecurityEventsByType('PATH_TRAVERSAL_ATTEMPT')
```

## 🐳 Docker Log Monitoring

### Temel Log İzleme

Docker container loglarını izlemek için:

```bash
# Tüm servislerin logları
docker compose logs -f

# Sadece app container logları
docker compose logs -f app

# Sadece güvenlik olayları
docker compose logs -f app | grep "\[SECURITY\]"

# Kritik ve yüksek seviye olaylar
docker compose logs -f app | grep -E "\[SECURITY\]\[(CRITICAL|HIGH)\]"
```

### Log Rotation

Mevcut log rotation yapılandırması (`deploy/hetzner-setup.sh`):

```bash
# Log dosyaları otomatik olarak rotate edilir
# /opt/mobile-game-hunt/logs/*.log
# Günlük rotate, 30 gün saklama
```

### Log Analizi Script'i

`scripts/analyze-security-logs.sh` oluşturun:

```bash
#!/bin/bash
# Güvenlik loglarını analiz eder

echo "🔍 Security Event Analysis"
echo "=========================="
echo ""

# Son 24 saatteki kritik olaylar
echo "📊 Critical Events (Last 24h):"
docker compose logs --since 24h app | grep "\[SECURITY\]\[CRITICAL\]" | wc -l

# En çok saldırı yapan IP'ler
echo ""
echo "🌐 Top Attacking IPs:"
docker compose logs --since 24h app | grep "\[SECURITY\]" | grep -oP 'ip:\K[^\s,]+' | sort | uniq -c | sort -rn | head -10

# Olay tiplerine göre dağılım
echo ""
echo "📈 Event Type Distribution:"
docker compose logs --since 24h app | grep "\[SECURITY\]" | grep -oP '\[SECURITY\]\[.*?\]: \K[^:]+' | sort | uniq -c | sort -rn
```

## 🔔 Gelişmiş İzleme (Opsiyonel)

### 1. Prometheus + Grafana

Metrik toplama ve görselleştirme için:

```yaml
# docker-compose.yml'e ekleyin
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - app-network

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - app-network
    depends_on:
      - prometheus
```

### 2. Sentry Integration

Hata takibi için Sentry ekleyebilirsiniz:

```bash
npm install @sentry/nextjs
```

### 3. Slack Webhook

Slack'e uyarı göndermek için `src/lib/security-monitor.ts`'e ekleyin:

```typescript
async function sendSlackAlert(event: SecurityEvent): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 Security Alert: ${event.type}`,
      attachments: [{
        color: event.severity === 'critical' ? 'danger' : 'warning',
        fields: [
          { title: 'Severity', value: event.severity, short: true },
          { title: 'Message', value: event.message, short: false },
          { title: 'IP', value: event.ip || 'unknown', short: true },
          { title: 'Path', value: event.path || 'unknown', short: true },
        ],
      }],
    }),
  })
}
```

## 📧 E-posta Uyarı Örnekleri

### Kritik Olay
- **Anında gönderilir**
- Kırmızı renkli şablon
- Tüm detaylar dahil

### Yüksek Seviye Olay
- 5 dakikada 3 olay sonrası gönderilir
- Turuncu renkli şablon
- Toplu olay sayısı gösterilir

### Orta Seviye Olay
- 15 dakikada 10 olay sonrası gönderilir
- Sarı renkli şablon
- Toplu olay sayısı gösterilir

## ✅ Test Etme

### 1. Test E-postası Gönderme

```typescript
// Test endpoint'i oluşturun (sadece development'ta)
// src/app/api/admin/test-security-alert/route.ts
import { logSecurityEvent } from '@/lib/security-monitor'

export async function GET() {
  await logSecurityEvent({
    type: 'PATH_TRAVERSAL_ATTEMPT',
    severity: 'high',
    message: 'Test security alert',
    details: { test: true },
    ip: '127.0.0.1',
    path: '/api/test',
  })
  return Response.json({ ok: true })
}
```

### 2. Log Kontrolü

```bash
# Log'ları kontrol edin
docker compose logs app | grep "\[SECURITY\]"

# E-posta gönderimini kontrol edin
docker compose logs app | grep "\[SECURITY\]\[EMAIL\]"
```

## 🎯 Best Practices

1. **Production'da Test Endpoint'lerini Kaldırın**
   - Test endpoint'leri sadece development'ta kullanın

2. **E-posta Rate Limiting**
   - Çok fazla e-posta gönderilmesini önlemek için eşikleri ayarlayın

3. **Log Retention**
   - Log dosyalarını düzenli olarak temizleyin
   - Önemli olayları veritabanına kaydedin (opsiyonel)

4. **Monitoring Dashboard**
   - Admin panelinde güvenlik olaylarını görüntüleyin
   - Real-time monitoring için WebSocket kullanın (opsiyonel)

## 🔧 Troubleshooting

### E-postalar Gönderilmiyor

1. SMTP ayarlarını kontrol edin:
```bash
docker compose logs app | grep "\[EMAIL\]"
```

2. Environment variables'ı kontrol edin:
```bash
docker compose exec app env | grep SMTP
```

### Çok Fazla Uyarı

Eşikleri artırın:
```typescript
const ALERT_THRESHOLDS = {
  critical: 1,
  high: 5,      // 3'ten 5'e çıkarın
  medium: 20,   // 10'dan 20'ye çıkarın
}
```

### Log Dosyaları Çok Büyük

Log rotation'ı kontrol edin:
```bash
# Log dosyalarının boyutunu kontrol edin
du -sh /opt/mobile-game-hunt/logs/

# Log rotation çalışıyor mu?
ls -lh /opt/mobile-game-hunt/logs/
```

## 📚 Ek Kaynaklar

- [SECURITY.md](./SECURITY.md) - Genel güvenlik rehberi
- [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md) - Güvenlik denetim raporu
- [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) - Docker deployment rehberi

---

**Son Güncelleme**: 2025-01-27  
**Durum**: ✅ Production Ready

