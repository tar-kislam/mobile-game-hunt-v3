#!/bin/sh
set -eu

echo "[entrypoint] starting as: $(id)"

# Güvenlik: root olarak çalışmayı kesinlikle engelle
if [ "$(id -u)" -eq 0 ]; then
  echo "ERROR: Container is running as root. This is not allowed."
  echo "Fix: set docker-compose.yml -> app.user: \"1001:1001\" and Dockerfile -> USER 1001:1001"
  exit 1
fi

# Gerekli dizinler (read_only + tmpfs/volume kombinasyonunda çalışır)
mkdir -p /app/.next/cache /app/public/uploads 2>/dev/null || true

# Yazılabilirlik smoke test (fail etmesin, sadece log)
touch /app/.next/cache/.writable_test 2>/dev/null || true
rm -f /app/.next/cache/.writable_test 2>/dev/null || true

touch /app/public/uploads/.writable_test 2>/dev/null || true
rm -f /app/public/uploads/.writable_test 2>/dev/null || true

# Next standalone
if [ -f "/app/server.js" ]; then
  exec node /app/server.js
fi

# Fallback
if [ -f "server.js" ]; then
  exec node server.js
fi

echo "ERROR: server.js not found"
ls -lah /app || true
exit 1