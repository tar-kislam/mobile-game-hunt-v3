#!/bin/bash

# Blog Migration Test Script
# This script tests the blog table drop migration in a staging environment

set -e  # Exit on any error

echo "🧪 Testing Blog Migration in Staging Environment"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "SUCCESS" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "WARNING" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    elif [ "$status" = "ERROR" ]; then
        echo -e "${RED}❌ $message${NC}"
    else
        echo -e "ℹ️  $message"
    fi
}

# Check if we're in the right directory
if [ ! -f "prisma/schema.prisma" ]; then
    print_status "ERROR" "Not in project root directory. Please run from project root."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
    print_status "ERROR" "No .env file found. Please create one with DATABASE_URL."
    exit 1
fi

print_status "INFO" "Starting blog migration test..."

# Step 1: Verify current state
echo ""
print_status "INFO" "Step 1: Verifying current database state"

# Check if BlogPost table exists
if npx prisma db execute --stdin <<< "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'BlogPost';" 2>/dev/null | grep -q "BlogPost"; then
    print_status "SUCCESS" "BlogPost table exists (as expected)"
else
    print_status "WARNING" "BlogPost table not found - may already be dropped"
fi

# Check if BlogStatus enum exists
if npx prisma db execute --stdin <<< "SELECT typname FROM pg_type WHERE typname = 'BlogStatus';" 2>/dev/null | grep -q "BlogStatus"; then
    print_status "SUCCESS" "BlogStatus enum exists (as expected)"
else
    print_status "WARNING" "BlogStatus enum not found - may already be dropped"
fi

# Step 2: Verify no application references
echo ""
print_status "INFO" "Step 2: Verifying no application references to blog tables"

# Check for blog references in code
if grep -r "BlogPost\|BlogStatus" src/ 2>/dev/null | grep -v "README\|\.md"; then
    print_status "ERROR" "Found blog references in source code!"
    exit 1
else
    print_status "SUCCESS" "No blog references found in source code"
fi

# Check for blog references in Prisma schema
if grep -q "BlogPost\|BlogStatus" prisma/schema.prisma; then
    print_status "ERROR" "Found blog references in Prisma schema!"
    exit 1
else
    print_status "SUCCESS" "No blog references found in Prisma schema"
fi

# Step 3: Test the migration
echo ""
print_status "INFO" "Step 3: Testing the migration"

# Create a backup of current migration
cp prisma/migrations/20250120000000_drop_blog_tables/migration.sql prisma/migrations/20250120000000_drop_blog_tables/migration.sql.backup

# Run the migration
if npx prisma migrate deploy; then
    print_status "SUCCESS" "Migration applied successfully"
else
    print_status "ERROR" "Migration failed!"
    exit 1
fi

# Step 4: Verify migration results
echo ""
print_status "INFO" "Step 4: Verifying migration results"

# Check if BlogPost table is gone
if npx prisma db execute --stdin <<< "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'BlogPost';" 2>/dev/null | grep -q "BlogPost"; then
    print_status "ERROR" "BlogPost table still exists after migration!"
    exit 1
else
    print_status "SUCCESS" "BlogPost table successfully dropped"
fi

# Check if BlogStatus enum is gone
if npx prisma db execute --stdin <<< "SELECT typname FROM pg_type WHERE typname = 'BlogStatus';" 2>/dev/null | grep -q "BlogStatus"; then
    print_status "ERROR" "BlogStatus enum still exists after migration!"
    exit 1
else
    print_status "SUCCESS" "BlogStatus enum successfully dropped"
fi

# Step 5: Test application functionality
echo ""
print_status "INFO" "Step 5: Testing application functionality"

# Generate Prisma client
if npx prisma generate; then
    print_status "SUCCESS" "Prisma client generated successfully"
else
    print_status "ERROR" "Failed to generate Prisma client"
    exit 1
fi

# Test if application builds
if npm run build > /dev/null 2>&1; then
    print_status "SUCCESS" "Application builds successfully"
else
    print_status "ERROR" "Application build failed"
    exit 1
fi

# Step 6: Cleanup and summary
echo ""
print_status "INFO" "Step 6: Cleanup and summary"

# Restore backup
mv prisma/migrations/20250120000000_drop_blog_tables/migration.sql.backup prisma/migrations/20250120000000_drop_blog_tables/migration.sql

print_status "SUCCESS" "Blog migration test completed successfully!"
echo ""
echo "📋 Test Summary:"
echo "  ✅ BlogPost table dropped"
echo "  ✅ BlogStatus enum dropped"
echo "  ✅ No application references found"
echo "  ✅ Application builds successfully"
echo "  ✅ Prisma client generates correctly"
echo ""
print_status "SUCCESS" "Migration is ready for production deployment!"
echo ""
echo "🚀 Next steps:"
echo "  1. Create database backup"
echo "  2. Run migration in production: npx prisma migrate deploy"
echo "  3. Monitor application logs"
echo "  4. Verify all systems operational"
