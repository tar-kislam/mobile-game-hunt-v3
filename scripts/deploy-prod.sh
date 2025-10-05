#!/bin/bash

# Mobile Game Hunt - Production Deployment Script
# This script handles production deployment without automatic seeding

set -e

echo "🚀 Starting Mobile Game Hunt production deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Build the application
echo "🔨 Building production image..."
docker compose build app

# Start services (without seeding)
echo "🐘 Starting production services..."
docker compose up -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 15

# Run database migrations
echo "📊 Running database migrations..."
docker compose run --rm app npx prisma migrate deploy

# Seed database (only if empty)
echo "🌱 Seeding database (if needed)..."
docker compose run --rm app npm run db:seed

# Initialize badge system (only if needed)
echo "🏆 Initializing badge system (if needed)..."
docker compose run --rm app npm run init:badges

# Start the application
echo "🚀 Starting application..."
docker compose up -d app

# Wait for application to be ready
echo "⏳ Waiting for application to be ready..."
sleep 10

# Check application health
echo "🔍 Checking application health..."
if curl -f http://localhost:3000/api/healthz > /dev/null 2>&1; then
    echo "✅ Application is healthy and running!"
    echo ""
    echo "🌐 Application is available at:"
    echo "   - http://localhost:3000"
    echo ""
    echo "📊 Database management:"
    echo "   - pgAdmin: http://localhost:8080 (admin@mobilegamehunt.com / admin)"
    echo ""
    echo "🔧 Management commands:"
    echo "   - docker compose logs app          # View application logs"
    echo "   - docker compose exec app npm run db:seed    # Re-seed database"
    echo "   - docker compose exec app npm run init:badges # Re-initialize badges"
    echo "   - docker compose down              # Stop all services"
else
    echo "❌ Application health check failed!"
    echo "📋 Check logs with: docker compose logs app"
    exit 1
fi
