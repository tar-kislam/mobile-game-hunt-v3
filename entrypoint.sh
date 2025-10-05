#!/bin/sh
set -e
# Dizinler ve izinler
mkdir -p /app/.next/cache /app/public/uploads
chown -R 1001:1001 /app/.next /app/public/uploads || true
chmod -R u+rwX,g+rwX /app/.next /app/public/uploads || true
# nextjs kullanıcısı ile başlat
exec su-exec nextjs:nodejs node server.js


