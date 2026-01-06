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
# Prisma client
RUN npx prisma generate
# Build
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ----------------------
# runner: prod imaj
# ----------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Build çıktısını kopyala (standalone)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Prisma dosyaları
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# Metadata için
COPY --from=builder /app/package.json ./package.json

# Gerekli klasörleri oluştur
RUN mkdir -p /app/.next/cache /app/public/uploads

# İzinleri build sırasında ayarla (runtime root'a ihtiyaç kalmasın)
RUN chown -R 1001:1001 /app \
 && chmod -R u=rwX,g=rX,o=rX /app \
 && chmod -R u=rwX,g=rwX,o=rX /app/public/uploads /app/.next/cache

# EntryPoint betiğini kopyala ve çalıştırılabilir yap
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
 && chown 1001:1001 /entrypoint.sh

EXPOSE 3000

# Healthcheck: liveness -> /api/healthz
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/api/healthz', r => process.exit(r.statusCode===200?0:1)).on('error', () => process.exit(1))"

# Artık non-root çalış
USER 1001:1001

ENTRYPOINT ["/entrypoint.sh"]