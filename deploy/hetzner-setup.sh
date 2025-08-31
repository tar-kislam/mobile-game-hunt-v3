#!/bin/bash

# Hetzner Server Setup Script for Mobile Game Hunt
# Run this script on your Hetzner server to set up the environment

set -e

echo "🚀 Setting up Mobile Game Hunt on Hetzner..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Docker and Docker Compose
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker $USER

# Install Docker Compose
echo "🔧 Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install additional tools
echo "🛠️ Installing additional tools..."
apt install -y curl wget git htop unzip

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /opt/mobile-game-hunt
cd /opt/mobile-game-hunt

# Clone repository (you'll need to replace with your actual repo)
echo "📥 Cloning repository..."
git clone https://github.com/tar-kislam/Mobile-Game-Hunt.git .

# Create data directories
echo "📂 Creating data directories..."
mkdir -p data/postgres
mkdir -p data/redis
mkdir -p logs
mkdir -p ssl

# Set up environment variables
echo "⚙️ Setting up environment variables..."
if [ ! -f .env ]; then
    cp .env.hetzner .env
    echo "⚠️  Please edit .env file with your actual values:"
    echo "   - Domain name"
    echo "   - Database password"
    echo "   - NextAuth secret"
    echo "   - OAuth credentials"
    echo "   - Email configuration"
fi

# Set permissions
echo "🔐 Setting permissions..."
chown -R $USER:$USER /opt/mobile-game-hunt
chmod +x deploy/*.sh

# Set up log rotation
echo "📊 Setting up log rotation..."
cat > /etc/logrotate.d/mobile-game-hunt << EOF
/opt/mobile-game-hunt/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    sharedscripts
    postrotate
        docker-compose -f /opt/mobile-game-hunt/docker-compose.yml exec nginx nginx -s reload
    endscript
}
EOF

# Set up systemd service for auto-start
echo "🔄 Setting up systemd service..."
cat > /etc/systemd/system/mobile-game-hunt.service << EOF
[Unit]
Description=Mobile Game Hunt Application
Requires=docker.service
After=docker.service

[Service]
Type=forking
Restart=always
RestartSec=10
User=$USER
Group=$USER
WorkingDirectory=/opt/mobile-game-hunt
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable mobile-game-hunt

# Set up firewall
echo "🔥 Configuring firewall..."
ufw --force enable
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp

# Set up SSL certificate (Let's Encrypt)
echo "🔒 Setting up SSL certificate..."
echo "Run the following commands after updating your .env file:"
echo "1. Update DOMAIN and SSL_EMAIL in .env"
echo "2. Run: docker-compose up certbot"
echo "3. Update nginx.conf with your domain"
echo "4. Run: docker-compose up -d"

# Final instructions
echo ""
echo "✅ Setup complete! Next steps:"
echo "1. Edit /opt/mobile-game-hunt/.env with your configuration"
echo "2. Run: cd /opt/mobile-game-hunt && ./deploy/ssl-setup.sh"
echo "3. Run: docker-compose up -d"
echo "4. Check status: docker-compose ps"
echo ""
echo "🌐 Your app will be available at: https://yourdomain.com"
echo "💾 Database admin: http://yourdomain.com:8080 (if pgadmin is enabled)"
echo ""
echo "📊 Monitoring:"
echo "   - Health check: https://yourdomain.com/api/health"
echo "   - Logs: docker-compose logs -f"
echo "   - System logs: /opt/mobile-game-hunt/logs/"
