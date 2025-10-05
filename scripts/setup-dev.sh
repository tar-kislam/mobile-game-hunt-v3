#!/bin/bash

# Mobile Game Hunt - Development Setup Script
# This script ensures proper initialization without duplicate seeding

set -e

echo "🚀 Starting Mobile Game Hunt development setup..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if services are running
echo "📋 Checking if database services are running..."
if ! docker ps | grep -q "mobile-game-hunt-db-dev"; then
    echo "🐘 Starting database services..."
    docker compose -f docker-compose.dev.yml up -d
    echo "⏳ Waiting for database to be ready..."
    sleep 10
else
    echo "✅ Database services already running"
fi

# Run database migrations
echo "🔄 Running database migrations..."
docker compose -f docker-compose.dev.yml exec postgres psql -U postgres -d mobile_game_hunt_dev -c "SELECT 1;" > /dev/null 2>&1 || {
    echo "❌ Database not ready, waiting..."
    sleep 5
}

# Push schema (this will create tables if they don't exist)
echo "📊 Pushing database schema..."
npm run db:push

# Seed database (only if empty)
echo "🌱 Seeding database (if needed)..."
npm run db:seed

# Initialize badge system (only if not already initialized)
echo "🏆 Initializing badge system (if needed)..."
npm run init:badges

echo "✅ Development setup completed successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Run 'npm run dev' to start the development server"
echo "   2. Visit http://localhost:3000"
echo "   3. Use pgAdmin at http://localhost:8080 (admin@mobilegamehunt.com / admin)"
echo ""
echo "🔧 Available commands:"
echo "   - npm run dev          # Start development server"
echo "   - npm run db:studio    # Open Prisma Studio"
echo "   - npm run db:seed      # Re-seed database (if needed)"
echo "   - npm run init:badges  # Re-initialize badge system (if needed)"
