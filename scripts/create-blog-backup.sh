#!/bin/bash

# Database Backup Script for Blog Rollback
# This script creates a backup of the database before blog removal

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if DATABASE_URL is set
check_database_url() {
    if [ -z "$DATABASE_URL" ]; then
        error "DATABASE_URL environment variable not set"
        echo "Please set DATABASE_URL before running this script"
        echo "Example: export DATABASE_URL='postgresql://user:password@localhost:5432/database'"
        exit 1
    fi
    success "DATABASE_URL is set"
}

# Create backup directory
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        log "Created backup directory: $BACKUP_DIR"
    fi
}

# Create full database backup
create_full_backup() {
    local backup_file="$BACKUP_DIR/full_db_backup_$TIMESTAMP.sql"
    
    log "Creating full database backup..."
    log "Backup file: $backup_file"
    
    pg_dump "$DATABASE_URL" > "$backup_file"
    
    if [ $? -eq 0 ]; then
        success "Full database backup created: $backup_file"
        
        # Get file size
        local file_size=$(du -h "$backup_file" | cut -f1)
        log "Backup size: $file_size"
        
        # Create symlink to latest backup
        ln -sf "$backup_file" "$BACKUP_DIR/latest_full_backup.sql"
        success "Latest backup symlink created"
    else
        error "Failed to create database backup"
        exit 1
    fi
}

# Create blog-specific backup
create_blog_backup() {
    local backup_file="$BACKUP_DIR/blog_tables_backup_$TIMESTAMP.sql"
    
    log "Creating blog-specific backup..."
    log "Backup file: $backup_file"
    
    # Create SQL script to backup only blog-related tables
    cat > "$backup_file" << 'EOF'
-- Blog Tables Backup
-- This script backs up only blog-related tables and data

-- Backup BlogPost table
SELECT '-- BlogPost table data' as comment;
\copy (SELECT * FROM "BlogPost") TO STDOUT WITH CSV HEADER;

-- Backup BlogStatus enum (if it exists)
SELECT '-- BlogStatus enum values' as comment;
SELECT unnest(enum_range(NULL::"BlogStatus")) as blog_status_values;

-- Backup any blog-related indexes
SELECT '-- Blog-related indexes' as comment;
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'BlogPost' OR indexname LIKE '%blog%';

-- Backup foreign key constraints
SELECT '-- Blog-related foreign keys' as comment;
SELECT conname, conrelid::regclass, confrelid::regclass, confkey
FROM pg_constraint 
WHERE conrelid::regclass::text = 'BlogPost' 
AND contype = 'f';
EOF

    # Execute the backup script
    psql "$DATABASE_URL" -f "$backup_file" > "$backup_file" 2>&1
    
    if [ $? -eq 0 ]; then
        success "Blog-specific backup created: $backup_file"
        
        # Create symlink to latest blog backup
        ln -sf "$backup_file" "$BACKUP_DIR/latest_blog_backup.sql"
        success "Latest blog backup symlink created"
    else
        warning "Blog-specific backup may have failed (tables might not exist)"
    fi
}

# Verify backup integrity
verify_backup() {
    local backup_file="$BACKUP_DIR/full_db_backup_$TIMESTAMP.sql"
    
    log "Verifying backup integrity..."
    
    # Check if backup file exists and is not empty
    if [ ! -s "$backup_file" ]; then
        error "Backup file is empty or doesn't exist"
        exit 1
    fi
    
    # Check if backup contains expected content
    if grep -q "CREATE TABLE" "$backup_file"; then
        success "Backup contains table definitions"
    else
        warning "Backup may not contain table definitions"
    fi
    
    if grep -q "BlogPost" "$backup_file"; then
        success "Backup contains BlogPost table"
    else
        warning "Backup does not contain BlogPost table (may not exist)"
    fi
    
    success "Backup verification completed"
}

# Create backup metadata
create_metadata() {
    local metadata_file="$BACKUP_DIR/backup_metadata_$TIMESTAMP.json"
    
    log "Creating backup metadata..."
    
    cat > "$metadata_file" << EOF
{
  "timestamp": "$TIMESTAMP",
  "backup_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "database_url": "$(echo $DATABASE_URL | sed 's/:[^:]*@/:***@/')",
  "backup_type": "pre_blog_removal",
  "files": {
    "full_backup": "full_db_backup_$TIMESTAMP.sql",
    "blog_backup": "blog_tables_backup_$TIMESTAMP.sql"
  },
  "git_info": {
    "commit": "$(git rev-parse HEAD 2>/dev/null || echo 'N/A')",
    "branch": "$(git branch --show-current 2>/dev/null || echo 'N/A')",
    "status": "$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ') files changed"
  },
  "system_info": {
    "hostname": "$(hostname)",
    "user": "$(whoami)",
    "pwd": "$(pwd)"
  }
}
EOF

    success "Backup metadata created: $metadata_file"
}

# Clean up old backups
cleanup_old_backups() {
    local keep_days=30
    
    log "Cleaning up backups older than $keep_days days..."
    
    find "$BACKUP_DIR" -name "*.sql" -type f -mtime +$keep_days -delete 2>/dev/null || true
    find "$BACKUP_DIR" -name "backup_metadata_*.json" -type f -mtime +$keep_days -delete 2>/dev/null || true
    
    success "Old backups cleaned up"
}

# Main function
main() {
    log "Starting database backup for blog rollback preparation..."
    
    check_database_url
    create_backup_dir
    create_full_backup
    create_blog_backup
    verify_backup
    create_metadata
    cleanup_old_backups
    
    success "Database backup completed successfully!"
    log "Backup location: $BACKUP_DIR"
    log "Latest full backup: $BACKUP_DIR/latest_full_backup.sql"
    log "Latest blog backup: $BACKUP_DIR/latest_blog_backup.sql"
    
    echo ""
    echo "📋 Next Steps:"
    echo "1. Test the rollback procedure on staging environment"
    echo "2. Verify backup files are accessible and complete"
    echo "3. Store backup files in a secure location"
    echo "4. Update emergency contacts in rollback documentation"
    echo ""
    echo "🚨 Emergency Rollback Commands:"
    echo "Quick rollback:   ./scripts/emergency-blog-rollback.sh quick"
    echo "Full rollback:    ./scripts/emergency-blog-rollback.sh full"
    echo "Database rollback: ./scripts/emergency-blog-rollback.sh database"
}

# Help function
show_help() {
    echo "Database Backup Script for Blog Rollback"
    echo ""
    echo "Usage: $0"
    echo ""
    echo "This script creates a backup of the database before blog removal."
    echo "It creates both a full database backup and a blog-specific backup."
    echo ""
    echo "Environment Variables:"
    echo "  DATABASE_URL - Required. PostgreSQL connection string"
    echo ""
    echo "Output:"
    echo "  Backups are stored in: ./backups/"
    echo "  Full backup: full_db_backup_YYYYMMDD_HHMMSS.sql"
    echo "  Blog backup: blog_tables_backup_YYYYMMDD_HHMMSS.sql"
    echo "  Metadata: backup_metadata_YYYYMMDD_HHMMSS.json"
    echo ""
    echo "Example:"
    echo "  export DATABASE_URL='postgresql://user:pass@localhost:5432/db'"
    echo "  $0"
}

# Check for help flag
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_help
    exit 0
fi

# Run main function
main "$@"
