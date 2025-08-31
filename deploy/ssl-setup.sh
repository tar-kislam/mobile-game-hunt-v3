#!/bin/bash

# SSL Certificate Setup for Let's Encrypt
# Run this after updating your .env file with correct domain

set -e

echo "🔒 Setting up SSL certificate with Let's Encrypt..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
else
    echo "❌ .env file not found! Please create it first."
    exit 1
fi

# Validate required variables
if [ -z "$DOMAIN" ] || [ -z "$SSL_EMAIL" ]; then
    echo "❌ DOMAIN and SSL_EMAIL must be set in .env file"
    exit 1
fi

echo "📧 Using email: $SSL_EMAIL"
echo "🌐 Setting up SSL for domain: $DOMAIN"

# Update nginx configuration with actual domain
echo "⚙️ Updating nginx configuration..."
sed -i "s/yourdomain.com/$DOMAIN/g" nginx/nginx.conf

# Create initial certificate (staging first)
echo "🧪 Getting staging certificate first..."
docker-compose up -d postgres redis app
sleep 10

# Get staging certificate
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $SSL_EMAIL \
    --agree-tos \
    --no-eff-email \
    --staging \
    -d $DOMAIN

if [ $? -eq 0 ]; then
    echo "✅ Staging certificate obtained successfully!"
    
    # Get production certificate
    echo "🔒 Getting production certificate..."
    docker-compose run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email $SSL_EMAIL \
        --agree-tos \
        --no-eff-email \
        --force-renewal \
        -d $DOMAIN
    
    if [ $? -eq 0 ]; then
        echo "✅ Production certificate obtained successfully!"
        
        # Start nginx with SSL
        echo "🚀 Starting nginx with SSL..."
        docker-compose up -d nginx
        
        # Set up certificate renewal cron job
        echo "⏰ Setting up certificate renewal..."
        (crontab -l 2>/dev/null; echo "0 3 * * * cd /opt/mobile-game-hunt && docker-compose run --rm certbot renew --quiet && docker-compose exec nginx nginx -s reload") | crontab -
        
        echo ""
        echo "✅ SSL setup complete!"
        echo "🌐 Your site should now be available at: https://$DOMAIN"
        echo "🔄 Certificate will auto-renew daily at 3 AM"
        
    else
        echo "❌ Failed to get production certificate"
        exit 1
    fi
else
    echo "❌ Failed to get staging certificate"
    exit 1
fi
