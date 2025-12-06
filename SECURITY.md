# Security Hardening Guide

This document outlines security measures implemented in MobileGameHunt and recommendations for maintaining a secure production environment.

## Overview

This application has been hardened against common security vulnerabilities, particularly:
- **Command Injection (RCE)** - Prevention of remote code execution via shell commands
- **Path Traversal** - Protection against directory traversal attacks
- **Input Validation** - Comprehensive validation of all user inputs
- **File Upload Security** - Safe handling of file uploads with type and size validation

## Code Security Measures

### 1. Command Injection Prevention

**Status**: ✅ **No dangerous patterns found**

- **No `child_process` usage**: The codebase does not use `child_process.exec()`, `execSync()`, or `spawn()` with shell enabled
- **CRON jobs**: Use `node-cron` library (safe, no shell execution)
- **File operations**: Use Node.js `fs` APIs, not shell commands

**ESLint Rules Added**:
- `no-eval`: Prevents `eval()` usage
- `no-implied-eval`: Prevents `setTimeout/setInterval` with strings
- `no-restricted-imports`: Warns on `child_process` imports
- Custom rules warn on `exec()` and `execSync()` usage

**If you need to add shell commands in the future**:
1. **NEVER** use `exec()` or `execSync()` with user input
2. Use `spawn()` with `shell: false` and argument arrays
3. Validate all inputs with whitelists (enums, regex patterns)
4. Add a comment explaining why shell is necessary and how inputs are sanitized

### 2. Path Traversal Prevention

**Status**: ✅ **All file operations hardened**

All file path operations now include:
- Path resolution verification to ensure files stay within intended directories
- Fixed base directories (no user input in directory paths)
- Filename sanitization (removes dangerous characters)

**Protected Routes**:
- `/api/upload` - File upload endpoint
- `/api/upload/from-url` - Remote image download
- `/api/user/update` - User avatar upload
- `/api/presskit/generate` - Press kit ZIP generation

**Example Pattern**:
```typescript
// SECURITY: Verify the resolved path is still within uploadsDir (prevent path traversal)
const resolvedPath = path.resolve(filePath)
const resolvedDir = path.resolve(uploadsDir)
if (!resolvedPath.startsWith(resolvedDir)) {
  return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
}
```

### 3. Input Validation

**Status**: ✅ **Comprehensive validation implemented**

- **Zod schemas**: All API routes use Zod for input validation
- **File type validation**: Whitelist of allowed MIME types
- **File size limits**: Maximum 10MB for images, 5MB for user avatars
- **URL validation**: Strict protocol checking (http/https only)
- **Base64 validation**: MIME type validation for data URLs

**Protected Inputs**:
- File uploads (type, size, content validation)
- User-provided URLs (protocol, domain validation)
- Form data (Zod schemas)
- Path parameters (slug validation, ID validation)

### 4. File Upload Security

**Status**: ✅ **Secure file handling**

- **Type validation**: Only JPEG, PNG, WEBP allowed
- **Size limits**: 10MB max for general uploads, 5MB for avatars
- **Filename sanitization**: Removes dangerous characters, uses timestamps + UUIDs
- **Path validation**: Prevents path traversal attacks
- **Content validation**: Validates actual file content, not just extension

## Docker/Runtime Hardening Recommendations

### Current Status

The application runs in Docker with:
- ✅ Non-root user (`nextjs:nodejs`, UID 1001)
- ✅ Multi-stage build (minimal runtime image)
- ✅ Alpine Linux base (smaller attack surface)

### Recommended Additional Hardening

**1. Remove unnecessary tools from runtime image**

The Dockerfile should NOT install:
- `curl`, `wget` (use Node.js `fetch` instead)
- `bash` (use `sh` only if needed)
- `python`, `perl` (not needed for Node.js app)

**Current Dockerfile** (lines 8, 42):
```dockerfile
RUN apk add --no-cache libc6-compat  # ✅ Safe, needed for Node.js
RUN apk add --no-cache su-exec        # ✅ Safe, needed for user switching
```

**2. Add Docker security options**

Update `docker-compose.yml` for the `app` service:

```yaml
app:
  # ... existing config ...
  security_opt:
    - no-new-privileges:true
  cap_drop:
    - ALL
  read_only: true
  tmpfs:
    - /tmp
    - /app/.next/cache
  volumes:
    - app_uploads:/app/public/uploads:rw  # Only writable volume needed
```

**3. Network isolation**

Ensure containers only communicate on the `app-network`:
- ✅ Already configured in `docker-compose.yml`
- ✅ Nginx reverse proxy handles external traffic
- ✅ Database and Redis are not exposed externally

**4. Health checks**

Current health checks use Node.js inline scripts (safe):
```yaml
healthcheck:
  test: ["CMD-SHELL", "node -e \"require('http').get('http://127.0.0.1:3000/api/healthz', r => process.exit(r.statusCode===200?0:1)).on('error', () => process.exit(1))\""]
```

**Alternative (even safer)**: Use a dedicated health check script:
```dockerfile
# In Dockerfile
COPY healthcheck.js /healthcheck.js
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "/healthcheck.js"]
```

## API Route Security

### Authentication & Authorization

- ✅ All sensitive routes require authentication (`getServerSession`)
- ✅ Role-based access control for admin/editor functions
- ✅ User ownership validation for resource modifications

### Rate Limiting

- ✅ Rate limiting implemented for sensitive endpoints
- ✅ Redis-based rate limiting for distributed systems

### Input Sanitization

- ✅ All user inputs validated with Zod schemas
- ✅ SQL injection prevention via Prisma ORM (parameterized queries)
- ✅ XSS prevention via React's built-in escaping
- ✅ CSRF protection via NextAuth

## Monitoring & Incident Response

### Logging

- ✅ Structured logging for security events
- ✅ Error logging without exposing sensitive data
- ✅ Request logging for audit trails

### Recommended Monitoring

1. **Monitor for suspicious patterns**:
   - Multiple failed authentication attempts
   - Unusual file upload patterns
   - Requests to non-existent endpoints
   - High error rates from specific IPs

2. **Alert on**:
   - Command execution attempts (should not occur)
   - Path traversal attempts (should be blocked)
   - Unauthorized access attempts
   - File upload anomalies

### Incident Response

If you see logs indicating command injection attempts:
1. **Immediately** review container logs for successful execution
2. Check for new files in `/app/public/uploads` or unexpected directories
3. Review recent database changes
4. Rotate all secrets (database passwords, API keys, etc.)
5. Review access logs for the attack vector
6. Consider rotating the container image

## Security Checklist

Before deploying to production:

- [ ] All environment variables are set and secure
- [ ] Database credentials are strong and unique
- [ ] `NEXTAUTH_SECRET` is a strong random value
- [ ] Docker image is built from clean source
- [ ] No sensitive data in logs
- [ ] Rate limiting is enabled
- [ ] SSL/TLS is configured (via Nginx)
- [ ] Firewall rules restrict access to necessary ports only
- [ ] Regular security updates are applied to base images
- [ ] Backups are configured and tested

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public issue
2. Contact the maintainers privately
3. Provide detailed information about the vulnerability
4. Allow time for a fix before public disclosure

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Docker Security](https://docs.docker.com/engine/security/)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)

---

**Last Updated**: 2025-01-27
**Security Review Status**: ✅ Hardened against command injection and path traversal

