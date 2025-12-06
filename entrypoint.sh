#!/bin/sh
set -e
# SECURITY: Exit on any error, don't continue if setup fails
# Note: Using set -e (not -eu) to allow unset variables in fallback scenarios
# With no-new-privileges and cap_drop: ALL, chown/chmod and su-exec may not work
# This is expected and acceptable - the container will run as root in this case

# Create required directories
mkdir -p /app/.next/cache /app/public/uploads

# SECURITY: Verify directories were created
if [ ! -d "/app/.next/cache" ] || [ ! -d "/app/public/uploads" ]; then
  echo "ERROR: Failed to create required directories"
  exit 1
fi

# Try to change ownership (may fail with no-new-privileges, that's OK)
# With cap_drop: ALL, chown will fail but we continue anyway
chown -R 1001:1001 /app/.next /app/public/uploads 2>/dev/null || true
chmod -R u+rwX,g+rwX /app/.next /app/public/uploads 2>/dev/null || true

# Try to switch to non-root user (may fail with no-new-privileges, that's OK)
# If su-exec fails, we'll run as root (acceptable with security_opt: no-new-privileges)
# SECURITY: With no-new-privileges:true, running as root is safe because:
# - No privilege escalation is possible
# - Capabilities are dropped (cap_drop: ALL)
# - Container is isolated from host
# 
# With no-new-privileges and cap_drop: ALL, su-exec will likely fail.
# In that case, we run as root which is safe with these security settings.

# Test if su-exec can actually work (it will fail with no-new-privileges)
# Temporarily disable set -e to test su-exec without causing script exit
if command -v su-exec >/dev/null 2>&1; then
  # Temporarily disable set -e for this test
  set +e
  su-exec nextjs:nodejs true 2>/dev/null
  SU_EXEC_TEST=$?
  set -e
  
  if [ $SU_EXEC_TEST -eq 0 ]; then
    # su-exec works, use it
    exec su-exec nextjs:nodejs node server.js
  else
    # su-exec failed (expected with no-new-privileges), skip it
    echo "WARNING: su-exec test failed (expected with no-new-privileges), running as root"
  fi
fi

# Fallback: run as root (safe with no-new-privileges:true)
echo "INFO: Running as root (no-new-privileges is active, this is safe)"
exec node server.js