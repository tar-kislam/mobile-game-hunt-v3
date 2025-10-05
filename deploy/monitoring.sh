#!/bin/bash

# Monitoring and Health Check Script for Mobile Game Hunt
# Run this script to check the health of your application

set -e

echo "📊 Mobile Game Hunt - System Health Check"
echo "========================================"

# Function to check service health
check_service() {
    local service_name=$1
    local container_name=$2
    
    if docker ps --format "table {{.Names}}" | grep -q "^$container_name$"; then
        echo "✅ $service_name: Running"
        return 0
    else
        echo "❌ $service_name: Not Running"
        return 1
    fi
}

# Function to check URL health
check_url() {
    local url=$1
    local service_name=$2
    
    if curl -f -s -o /dev/null "$url"; then
        echo "✅ $service_name: Healthy"
        return 0
    else
        echo "❌ $service_name: Unhealthy"
        return 1
    fi
}

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

echo ""
echo "🐳 Container Status:"
echo "-------------------"
check_service "PostgreSQL" "mobile-game-hunt-db"
check_service "Redis" "mobile-game-hunt-redis"
check_service "Application" "mobile-game-hunt-app"
check_service "Nginx" "mobile-game-hunt-nginx"

echo ""
echo "🌐 Service Health Checks:"
echo "------------------------"
check_url "http://localhost:3000/api/health" "Application Health"
check_url "https://${DOMAIN:-localhost}/api/health" "Public Health Check"

echo ""
echo "💾 Database Status:"
echo "------------------"
DB_STATUS=$(docker-compose exec -T postgres pg_isready -U postgres 2>/dev/null || echo "Failed")
if [ "$DB_STATUS" = "postgres:5432 - accepting connections" ]; then
    echo "✅ Database: Connected"
else
    echo "❌ Database: Connection Failed"
fi

echo ""
echo "📈 Resource Usage:"
echo "-----------------"
echo "Memory Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep mobile-game-hunt

echo ""
echo "💿 Disk Usage:"
df -h /opt/mobile-game-hunt 2>/dev/null || df -h /

echo ""
echo "📋 Recent Logs (last 10 lines):"
echo "-------------------------------"
docker-compose logs --tail=10 app

echo ""
echo "🔍 SSL Certificate Status:"
echo "-------------------------"
if [ ! -z "$DOMAIN" ]; then
    CERT_EXPIRY=$(docker-compose exec -T certbot certbot certificates 2>/dev/null | grep -A1 "$DOMAIN" | grep "Expiry Date" | cut -d':' -f2- | xargs || echo "Certificate not found")
    if [ "$CERT_EXPIRY" != "Certificate not found" ]; then
        echo "✅ SSL Certificate expires: $CERT_EXPIRY"
    else
        echo "❌ SSL Certificate: Not found"
    fi
else
    echo "ℹ️  Domain not configured in .env"
fi

echo ""
echo "📊 Summary:"
echo "----------"
RUNNING_CONTAINERS=$(docker ps --format "table {{.Names}}" | grep -c mobile-game-hunt || echo "0")
echo "Running containers: $RUNNING_CONTAINERS/4"

if [ $RUNNING_CONTAINERS -eq 4 ]; then
    echo "🎉 All systems operational!"
    exit 0
else
    echo "⚠️  Some services are down. Check the logs above."
    exit 1
fi
