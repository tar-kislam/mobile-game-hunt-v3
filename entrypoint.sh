#!/bin/sh
set -e
# SECURITY: Exit on any error, don't continue if setup fails
# Dizinler ve izinler
mkdir -p /app/.next/cache /app/public/uploads

# SECURITY: Verify directories were created before changing ownership
if [ ! -d "/app/.next/cache" ] || [ ! -d "/app/public/uploads" ]; then
  echo "ERROR: Failed to create required directories"
  exit 1
fi

# SECURITY: Change ownership with error checking
if ! chown -R 1001:1001 /app/.next /app/public/uploads; then
  echo "WARNING: Failed to change ownership, but continuing..."
fi

if ! chmod -R u+rwX,g+rwX /app/.next /app/public/uploads; then
  echo "WARNING: Failed to change permissions, but continuing..."
fi

# SECURITY: Verify we can switch to non-root user
if ! id -u nextjs > /dev/null 2>&1; then
  echo "ERROR: nextjs user does not exist"
  exit 1
fi

# nextjs kullanıcısı ile başlat
exec su-exec nextjs:nodejs node server.js