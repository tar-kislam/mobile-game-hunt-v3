#!/bin/bash

# Emergency Blog Rollback Script
# Usage: ./emergency-blog-rollback.sh [quick|full|database]

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="/tmp/blog-rollback-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Function to check if we're in the right directory
check_environment() {
    log "Checking environment..."
    
    if [ ! -f "$PROJECT_DIR/package.json" ]; then
        error "Not in project root directory. Please run from project root."
        exit 1
    fi
    
    if [ ! -f "$PROJECT_DIR/.env.local" ] && [ ! -f "$PROJECT_DIR/.env" ]; then
        error "No environment file found. Please ensure .env.local or .env exists."
        exit 1
    fi
    
    success "Environment check passed"
}

# Function to create backup
create_backup() {
    local backup_type="$1"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    
    log "Creating backup for $backup_type rollback..."
    
    # Create backup directory
    mkdir -p "$PROJECT_DIR/backups"
    
    case "$backup_type" in
        "quick")
            # Backup current environment file
            cp "$PROJECT_DIR/.env.local" "$PROJECT_DIR/backups/.env.local.backup.$timestamp" 2>/dev/null || true
            cp "$PROJECT_DIR/.env" "$PROJECT_DIR/backups/.env.backup.$timestamp" 2>/dev/null || true
            ;;
        "full")
            # Backup current git state
            git stash push -m "Emergency backup before rollback $timestamp"
            git tag "backup-before-rollback-$timestamp"
            ;;
        "database")
            # Backup database
            if [ -n "$DATABASE_URL" ]; then
                pg_dump "$DATABASE_URL" > "$PROJECT_DIR/backups/db_backup_$timestamp.sql"
                success "Database backup created: db_backup_$timestamp.sql"
            else
                warning "DATABASE_URL not set, skipping database backup"
            fi
            ;;
    esac
    
    success "Backup created for $backup_type rollback"
}

# Quick rollback using feature flag
quick_rollback() {
    log "Starting quick rollback using BLOG_ENABLED feature flag..."
    
    # Check if BLOG_ENABLED is already true
    if grep -q "BLOG_ENABLED=true" "$PROJECT_DIR/.env.local" 2>/dev/null || grep -q "BLOG_ENABLED=true" "$PROJECT_DIR/.env" 2>/dev/null; then
        warning "BLOG_ENABLED is already set to true"
        return 0
    fi
    
    # Set BLOG_ENABLED to true
    if [ -f "$PROJECT_DIR/.env.local" ]; then
        if grep -q "BLOG_ENABLED" "$PROJECT_DIR/.env.local"; then
            sed -i.bak 's/BLOG_ENABLED=false/BLOG_ENABLED=true/' "$PROJECT_DIR/.env.local"
        else
            echo "BLOG_ENABLED=true" >> "$PROJECT_DIR/.env.local"
        fi
    elif [ -f "$PROJECT_DIR/.env" ]; then
        if grep -q "BLOG_ENABLED" "$PROJECT_DIR/.env"; then
            sed -i.bak 's/BLOG_ENABLED=false/BLOG_ENABLED=true/' "$PROJECT_DIR/.env"
        else
            echo "BLOG_ENABLED=true" >> "$PROJECT_DIR/.env"
        fi
    else
        error "No environment file found to update"
        return 1
    fi
    
    success "BLOG_ENABLED set to true"
    
    # Restart application if possible
    if command -v docker-compose &> /dev/null && [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
        log "Restarting Docker containers..."
        docker-compose restart app
    elif command -v pm2 &> /dev/null; then
        log "Restarting PM2 processes..."
        pm2 restart mobile-game-hunt
    else
        warning "Please restart your application manually to apply the environment change"
    fi
    
    # Test the rollback
    sleep 5
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/blog | grep -q "200"; then
        success "Quick rollback successful! Blog pages are now accessible."
    else
        warning "Blog pages may not be accessible yet. Please check manually."
    fi
}

# Full rollback using git
full_rollback() {
    log "Starting full rollback using git..."
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Not in a git repository"
        return 1
    fi
    
    # Find the commit before blog removal
    local pre_blog_removal_commit
    pre_blog_removal_commit=$(git log --oneline --grep="blog" --grep="Blog" | head -5 | tail -1 | cut -d' ' -f1)
    
    if [ -z "$pre_blog_removal_commit" ]; then
        error "Could not find commit before blog removal"
        return 1
    fi
    
    log "Found pre-blog-removal commit: $pre_blog_removal_commit"
    
    # Create emergency branch
    local emergency_branch="emergency/blog-restore-$(date +%Y%m%d-%H%M%S)"
    git checkout -b "$emergency_branch"
    
    # Restore blog files
    log "Restoring blog files..."
    
    # List of files to restore (adjust based on your actual blog files)
    local blog_files=(
        "src/app/(main)/blog/"
        "src/app/api/blog/"
        "src/components/BlogDetail.tsx"
        "src/components/RichTextRenderer.tsx"
    )
    
    for file in "${blog_files[@]}"; do
        if git show "$pre_blog_removal_commit:$file" > /dev/null 2>&1; then
            git checkout "$pre_blog_removal_commit" -- "$file"
            log "Restored: $file"
        else
            warning "File not found in commit: $file"
        fi
    done
    
    # Restore configuration files
    git checkout "$pre_blog_removal_commit" -- src/components/layout/header.tsx
    git checkout "$pre_blog_removal_commit" -- next.config.ts
    
    # Commit the rollback
    git add .
    git commit -m "Emergency rollback: Restore blog functionality"
    
    success "Full rollback completed. Emergency branch created: $emergency_branch"
    warning "Please deploy the emergency branch to production"
}

# Database rollback
database_rollback() {
    log "Starting database rollback..."
    
    if [ -z "$DATABASE_URL" ]; then
        error "DATABASE_URL environment variable not set"
        return 1
    fi
    
    # Check if backup exists
    local latest_backup
    latest_backup=$(ls -t "$PROJECT_DIR/backups"/db_backup_*.sql 2>/dev/null | head -1)
    
    if [ -z "$latest_backup" ]; then
        error "No database backup found in $PROJECT_DIR/backups/"
        return 1
    fi
    
    log "Using backup: $latest_backup"
    
    # Restore database
    log "Restoring database from backup..."
    psql "$DATABASE_URL" < "$latest_backup"
    
    # Update Prisma schema
    log "Updating Prisma schema..."
    git checkout HEAD~1 -- prisma/schema.prisma
    
    # Run migrations
    log "Running Prisma migrations..."
    npx prisma migrate deploy
    npx prisma generate
    
    success "Database rollback completed"
}

# Main function
main() {
    local rollback_type="${1:-quick}"
    
    log "Starting emergency blog rollback: $rollback_type"
    log "Log file: $LOG_FILE"
    
    check_environment
    create_backup "$rollback_type"
    
    case "$rollback_type" in
        "quick")
            quick_rollback
            ;;
        "full")
            full_rollback
            ;;
        "database")
            database_rollback
            ;;
        *)
            error "Invalid rollback type. Use: quick, full, or database"
            echo "Usage: $0 [quick|full|database]"
            exit 1
            ;;
    esac
    
    success "Rollback completed successfully!"
    log "Check the log file for details: $LOG_FILE"
}

# Help function
show_help() {
    echo "Emergency Blog Rollback Script"
    echo ""
    echo "Usage: $0 [rollback_type]"
    echo ""
    echo "Rollback Types:"
    echo "  quick     - Quick rollback using BLOG_ENABLED feature flag (recommended first step)"
    echo "  full      - Full rollback using git to restore blog files"
    echo "  database  - Database rollback to restore blog tables"
    echo ""
    echo "Examples:"
    echo "  $0 quick      # Quick feature flag rollback"
    echo "  $0 full       # Full git rollback"
    echo "  $0 database   # Database rollback"
    echo ""
    echo "Environment Variables:"
    echo "  DATABASE_URL - Required for database rollback"
    echo ""
    echo "Logs are saved to: /tmp/blog-rollback-YYYYMMDD-HHMMSS.log"
}

# Check for help flag
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_help
    exit 0
fi

# Run main function
main "$@"
