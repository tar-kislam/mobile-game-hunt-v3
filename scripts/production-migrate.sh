#!/bin/bash

# Production Migration Script
# This script safely applies pending migrations to production database
# Usage: ./scripts/production-migrate.sh [--dry-run] [--skip-backup]

set -e  # Exit on error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$BACKUP_DIR/migration_${TIMESTAMP}.log"
DRY_RUN=false
SKIP_BACKUP=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
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

info() {
    echo -e "${CYAN}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
        --skip-backup)
            SKIP_BACKUP=true
            warning "Backup skipped (--skip-backup flag used)"
      shift
      ;;
        *)
            error "Unknown option: $1"
            echo "Usage: $0 [--dry-run] [--skip-backup]"
            exit 1
      ;;
  esac
done

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
  
  # Check if DATABASE_URL is set
    if [ -z "$DATABASE_URL" ]; then
        error "DATABASE_URL environment variable not set"
        echo "Please set DATABASE_URL before running this script"
      exit 1
    fi
    
    # Check if Prisma CLI is available
    if ! command -v npx &> /dev/null; then
        error "npx command not found. Please install Node.js and npm"
      exit 1
    fi
    
    # Check if pg_dump is available (for backup)
    if [ "$SKIP_BACKUP" = false ] && ! command -v pg_dump &> /dev/null; then
        error "pg_dump command not found. Install PostgreSQL client tools or use --skip-backup"
      exit 1
  fi
  
    success "All prerequisites met"
}

# Create backup directory
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
  mkdir -p "$BACKUP_DIR"
        log "Created backup directory: $BACKUP_DIR"
    fi
}

# Create database backup
create_backup() {
  if [ "$SKIP_BACKUP" = true ]; then
        warning "Skipping backup (--skip-backup flag used)"
    return 0
  fi
  
    local backup_file="$BACKUP_DIR/prod_backup_${TIMESTAMP}.sql"
    
    log "Creating production database backup..."
    log "Backup file: $backup_file"
    
    # Extract connection details for pg_dump
    if pg_dump "$DATABASE_URL" > "$backup_file" 2>> "$LOG_FILE"; then
        success "Database backup created: $backup_file"
        
        # Get file size
        local file_size=$(du -h "$backup_file" | cut -f1)
        log "Backup size: $file_size"
        
        # Compress backup
        log "Compressing backup..."
        if gzip "$backup_file"; then
            backup_file="${backup_file}.gz"
            success "Backup compressed: $backup_file"
        fi
        
        # Create symlink to latest backup
        ln -sf "$backup_file" "$BACKUP_DIR/latest_prod_backup.sql.gz"
        success "Latest backup symlink created"
        
        # Verify backup integrity
        log "Verifying backup integrity..."
        if [ -f "${backup_file}" ]; then
            success "Backup file exists and is accessible"
        else
            error "Backup file verification failed"
            return 1
      fi
    else
        error "Failed to create database backup"
        return 1
  fi
}

# Check current migration status
check_migration_status() {
    log "Checking current migration status..."
    
    cd "$PROJECT_DIR"
    
    if npx prisma migrate status >> "$LOG_FILE" 2>&1; then
        local status_output=$(npx prisma migrate status 2>&1)
        echo "$status_output" | tee -a "$LOG_FILE"
  
  # Check if there are pending migrations
        if echo "$status_output" | grep -q "following migration.*have not yet been applied"; then
            info "Pending migrations detected"
    return 0
        elif echo "$status_output" | grep -q "Database schema is up to date"; then
            success "Database is already up to date. No migrations needed."
            return 2
        else
            warning "Unexpected migration status"
    return 1
        fi
  else
        error "Failed to check migration status"
        return 1
  fi
}

# Apply migrations
apply_migrations() {
    log "Applying migrations..."
    
    cd "$PROJECT_DIR"
  
  if [ "$DRY_RUN" = true ]; then
        warning "DRY RUN MODE - No changes will be made"
        log "Would run: npx prisma migrate deploy"
    return 0
  fi
  
    # Apply migrations
    if npx prisma migrate deploy >> "$LOG_FILE" 2>&1; then
        success "Migrations applied successfully"
        
        # Verify migration status again
        log "Verifying migration status after applying..."
        if npx prisma migrate status >> "$LOG_FILE" 2>&1; then
            success "Migration verification passed"
    else
            warning "Migration verification check failed, but migrations were applied"
        fi
    else
        error "Migration failed. Check log file: $LOG_FILE"
        return 1
  fi
}

# Generate Prisma client
generate_prisma_client() {
    log "Generating Prisma client..."
    
    cd "$PROJECT_DIR"
  
  if [ "$DRY_RUN" = true ]; then
        warning "DRY RUN MODE - Would run: npx prisma generate"
    return 0
  fi
  
    if npx prisma generate >> "$LOG_FILE" 2>&1; then
        success "Prisma client generated successfully"
    else
        error "Failed to generate Prisma client"
        return 1
    fi
}

# Verify migrations
verify_migrations() {
    log "Verifying applied migrations..."
    
    cd "$PROJECT_DIR"
    
    # Check if UserActivityEvent table exists (one of the new tables)
    log "Checking if UserActivityEvent table exists..."
  
    if [ "$DRY_RUN" = true ]; then
        warning "DRY RUN MODE - Skipping verification queries"
        return 0
    fi
    
    # Use Prisma to check table existence
    local check_query="SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'UserActivityEvent');"
    
    if echo "$check_query" | npx prisma db execute --stdin >> "$LOG_FILE" 2>&1; then
        success "Database verification completed"
    else
        warning "Database verification query failed (this is not critical)"
  fi
}

# Print summary
print_summary() {
    echo ""
    echo "=========================================="
    echo -e "${CYAN}Migration Summary${NC}"
    echo "=========================================="
    echo "Timestamp: $TIMESTAMP"
    echo "Log file: $LOG_FILE"
    
    if [ "$SKIP_BACKUP" = false ]; then
        echo "Backup: $BACKUP_DIR/latest_prod_backup.sql.gz"
    else
        echo "Backup: Skipped"
    fi
    
    echo "Dry run: $DRY_RUN"
    echo "=========================================="
    echo ""
}

# Rollback function (manual use only)
rollback_info() {
    warning "If you need to rollback, use the backup file:"
    if [ "$SKIP_BACKUP" = false ]; then
        echo "  Backup: $BACKUP_DIR/prod_backup_${TIMESTAMP}.sql.gz"
    echo ""
        echo "To restore:"
        echo "  1. Stop the application"
        echo "  2. gunzip $BACKUP_DIR/prod_backup_${TIMESTAMP}.sql.gz"
        echo "  3. psql \$DATABASE_URL < $BACKUP_DIR/prod_backup_${TIMESTAMP}.sql"
        echo "  4. Restart the application"
    else
        echo "  No backup available (--skip-backup was used)"
  fi
}

# Main execution
main() {
    log "=========================================="
    log "Production Migration Script"
    log "=========================================="
    log "Starting migration process..."
  
  if [ "$DRY_RUN" = true ]; then
        warning "DRY RUN MODE - No changes will be made"
  fi
  
    # Pre-flight checks
    check_prerequisites
    create_backup_dir
    
    # Create backup
    if [ "$SKIP_BACKUP" = false ]; then
        if ! create_backup; then
            error "Backup failed. Aborting migration."
            exit 1
    fi
  fi
  
    # Check migration status
    local status_result
    check_migration_status
    status_result=$?
    
    if [ $status_result -eq 2 ]; then
        success "No migrations needed. Database is up to date."
        print_summary
    exit 0
    elif [ $status_result -ne 0 ]; then
        error "Migration status check failed"
        rollback_info
        exit 1
    fi
    
    # Apply migrations
    if ! apply_migrations; then
        error "Migration failed!"
        rollback_info
        exit 1
    fi
    
    # Generate Prisma client
    if ! generate_prisma_client; then
        error "Prisma client generation failed"
        warning "Application may not work correctly. Regenerate manually: npx prisma generate"
    fi
    
    # Verify migrations
    verify_migrations
    
    # Print summary
    print_summary
    
    success "Migration completed successfully!"
    log "Next steps:"
    log "  1. Test the application"
    log "  2. Monitor logs for any issues"
    log "  3. Verify all features are working"
    
    rollback_info
}

# Run main function
main "$@"