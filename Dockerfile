# Multi-stage Dockerfile for production
FROM node:18-alpine AS base

# ----------------------
# deps: yalnızca prod bağımlılıkları
# ----------------------
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# ----------------------
# builder: kodu derle (Next standalone)
# ----------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set memory limits for build
ENV NODE_OPTIONS="--max-old-space-size=1024"

# Prisma client
RUN npx prisma generate

# Build with memory optimization
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ----------------------
# runner: prod imaj
# ----------------------
FROM base AS runner
# Root başlayıp entrypoint'te izinleri düzelteceğiz
USER root
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root user + su-exec + curl for healthcheck
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs \
 && apk add --no-cache su-exec curl

# Build çıktısını kopyala (standalone)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Prisma dosyaları
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# Metadata için
COPY --from=builder /app/package.json ./package.json

# Gerekli klasörleri oluştur (runtime'da entrypoint tekrar chown yapacak)
RUN mkdir -p /app/.next/cache /app/public/uploads

# EntryPoint: izinleri düzelt, sonra nextjs user ile server.js
COPY <<'SH' /entrypoint.sh
#!/bin/sh
set -e
# Dizinler ve izinler
mkdir -p /app/.next/cache /app/public/uploads
chown -R 1001:1001 /app/.next /app/public/uploads || true
chmod -R u+rwX,g+rwX     /app/.next /app/public/uploads || true
# nextjs kullanıcısı ile başlat
exec su-exec nextjs:nodejs node server.js
SH
RUN chmod +x /entrypoint.sh

EXPOSE 3000

# Healthcheck: liveness -> /api/healthz
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://127.0.0.1:3000/api/healthz || exit 1

ENTRYPOINT ["/entrypoint.sh"]
