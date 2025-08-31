# 🚀 Deployment Guide - Mobile Game Hunt

## Overview

This guide covers deployment options for the Mobile Game Hunt application, optimized for production with Docker, NGINX, SSL, and monitoring.

## 🐳 Local Development with Docker

### Quick Start

```bash
# Clone the repository
git clone https://github.com/tar-kislam/Mobile-Game-Hunt.git
cd Mobile-Game-Hunt

# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Run database migrations
docker-compose exec app npm run db:migrate
docker-compose exec app npm run db:seed
```

**Services Available:**
- **Application**: http://localhost:3000
- **Database**: postgresql://postgres:password@localhost:5432/mobile_game_hunt_dev
- **PgAdmin**: http://localhost:8080 (admin@mobilegamehunt.com / admin)
- **Redis**: redis://localhost:6379

## 🏢 Hetzner Production Deployment

### Prerequisites

1. **Hetzner Cloud Server** (recommended: CPX21 or higher)
2. **Domain name** pointing to your server
3. **SMTP credentials** for email functionality
4. **OAuth app credentials** (Google, GitHub)

### Step 1: Server Setup

```bash
# SSH into your Hetzner server
ssh root@your-server-ip

# Run the automated setup script
curl -sSL https://raw.githubusercontent.com/tar-kislam/Mobile-Game-Hunt/main/deploy/hetzner-setup.sh | bash
```

### Step 2: Configuration

```bash
cd /opt/mobile-game-hunt

# Edit environment variables
nano .env
```

**Required Environment Variables:**
```env
# Domain Configuration
DOMAIN="yourdomain.com"
SSL_EMAIL="admin@yourdomain.com"

# Database
POSTGRES_PASSWORD="your-secure-database-password"

# NextAuth.js
NEXTAUTH_SECRET="your-super-secret-nextauth-key-32-chars-minimum"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
GITHUB_CLIENT_ID="your-github-oauth-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-client-secret"

# Email Configuration
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"
```

### Step 3: SSL Setup

```bash
# Set up SSL certificate with Let's Encrypt
./deploy/ssl-setup.sh
```

### Step 4: Launch Application

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 5: Database Setup

```bash
# Run migrations
docker-compose exec app npx prisma migrate deploy

# Seed database
docker-compose exec app npm run db:seed
```

## ☁️ Vercel Deployment (Preview/Staging)

### Setup

1. **Connect Repository** to Vercel
2. **Configure Environment Variables** in Vercel dashboard:

```env
NEXTAUTH_URL=https://your-vercel-app.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret
DATABASE_URL=postgresql://user:pass@host:5432/db
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

3. **Deploy**: Vercel will automatically deploy on git push

### Database for Vercel

Use **Supabase** or **PlanetScale** for managed PostgreSQL:

```env
# Supabase
DATABASE_URL="postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"

# PlanetScale
DATABASE_URL="mysql://[username]:[password]@[host]/[database]?sslaccept=strict"
```

## 📊 Monitoring & Health Checks

### Health Check Endpoints

- **Application Health**: `/api/health`
- **Database Status**: Included in health check
- **System Metrics**: Memory, CPU, uptime

### Monitoring Script

```bash
# Run health check
./deploy/monitoring.sh

# View real-time logs
docker-compose logs -f app

# System resource usage
docker stats
```

### Log Management

**Log Locations:**
- Application logs: `docker-compose logs app`
- NGINX logs: `docker-compose logs nginx`
- Database logs: `docker-compose logs postgres`

**Log Rotation:**
Automatically configured with logrotate (30 days retention)

## 🔧 Performance Optimization

### Lighthouse Score Optimization

The application is optimized for **90+ Lighthouse scores**:

#### Performance (90+)
- ✅ Next.js Image optimization with WebP/AVIF
- ✅ Static asset compression (gzip)
- ✅ Resource preloading and prefetching
- ✅ Bundle optimization and code splitting
- ✅ CDN-ready static assets

#### Accessibility (95+)
- ✅ Semantic HTML structure
- ✅ Proper ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Color contrast compliance
- ✅ Screen reader compatibility

#### Best Practices (95+)
- ✅ HTTPS enforced
- ✅ Security headers configured
- ✅ CSP (Content Security Policy)
- ✅ No mixed content warnings
- ✅ Modern image formats

#### SEO (90+)
- ✅ Meta tags and Open Graph
- ✅ Structured data markup
- ✅ Sitemap.xml generation
- ✅ Robots.txt configuration
- ✅ Semantic URL structure

### Database Optimization

**Connection Pooling:**
```typescript
// Optimized Prisma configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})
```

**Query Optimization:**
- Selective field queries (`select`)
- Proper indexing on frequently queried fields
- Pagination for large datasets
- Connection pooling
- Query result caching

## 🔒 Security Configuration

### SSL/TLS
- **Let's Encrypt** certificates (auto-renewal)
- **TLS 1.2/1.3** only
- **HSTS** headers
- **Perfect Forward Secrecy**

### Security Headers
```nginx
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: origin-when-cross-origin
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000
```

### Rate Limiting
- **API endpoints**: 10 requests/second
- **Auth endpoints**: 5 requests/minute
- **File uploads**: 10MB max size

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check database status
docker-compose exec postgres pg_isready -U postgres

# Restart database
docker-compose restart postgres
```

#### 2. SSL Certificate Issues
```bash
# Check certificate status
docker-compose run --rm certbot certificates

# Renew certificate
docker-compose run --rm certbot renew
```

#### 3. Application Won't Start
```bash
# Check logs
docker-compose logs app

# Rebuild application
docker-compose build app
docker-compose up -d app
```

#### 4. High Memory Usage
```bash
# Check resource usage
docker stats

# Restart services
docker-compose restart
```

### Emergency Commands

```bash
# Stop all services
docker-compose down

# Full system restart
docker-compose down && docker-compose up -d

# Reset database (⚠️ DATA LOSS)
docker-compose down -v
docker-compose up -d
```

## 📈 Scaling

### Horizontal Scaling

For high traffic, consider:

1. **Load Balancer** (Hetzner Load Balancer)
2. **Multiple App Instances**
3. **Database Read Replicas**
4. **Redis Cluster**
5. **CDN** (Cloudflare)

### Resource Requirements

**Minimum (Development):**
- 2 CPU cores
- 4GB RAM
- 20GB SSD

**Recommended (Production):**
- 4 CPU cores
- 8GB RAM
- 80GB SSD
- Automated backups

**High Traffic (1000+ concurrent users):**
- 8+ CPU cores
- 16GB+ RAM
- 160GB+ SSD
- Load balancer
- Database clustering

## 🎯 Performance Targets

- **Page Load Time**: < 2 seconds
- **Time to Interactive**: < 3 seconds
- **Lighthouse Performance**: 90+
- **Database Query Time**: < 100ms average
- **API Response Time**: < 200ms average
- **Uptime**: 99.9%

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose logs`
2. Run health check: `./deploy/monitoring.sh`
3. Review this documentation
4. Open GitHub issue with logs and configuration
