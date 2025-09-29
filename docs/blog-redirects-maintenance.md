# Blog Redirects Maintenance Guide

## Overview
This document tracks the maintenance of blog URL redirects implemented as part of the blog feature removal.

## Redirect Configuration

### Current Redirects (Active)
- **Source**: `/blog`
- **Destination**: `/`
- **Type**: 301 Permanent Redirect
- **Status**: ✅ Active

- **Source**: `/blog/:slug*`
- **Destination**: `/`
- **Type**: 301 Permanent Redirect
- **Status**: ✅ Active

### Implementation Details
- **Configuration File**: `next.config.ts`
- **Redirect Method**: Next.js `redirects()` function
- **HTTP Status**: 308 (Next.js permanent redirect)
- **Query Parameters**: Preserved during redirect

## Testing Results

### ✅ Verified Working Redirects
1. **Basic blog URL**: `/blog` → `/`
2. **Blog post URL**: `/blog/some-blog-post` → `/`
3. **Nested paths**: `/blog/nested/path/test` → `/`
4. **Query parameters**: `/blog?query=test&param=value` → `/?query=test&param=value`
5. **Special characters**: `/blog/test-post-with-special-chars-123` → `/`
6. **Trailing slash**: `/blog/` → `/blog` → `/`

### ✅ Error Handling Verified
- No 500 errors on any blog URLs
- All redirects return proper HTTP status codes
- Query parameters preserved correctly
- Special characters handled properly

## Maintenance Schedule

### Active Period
- **Start Date**: September 18, 2025
- **Minimum Duration**: 90 days (until December 17, 2025)
- **Recommended Duration**: 6 months (until March 18, 2026)

### Monitoring
- **Check Frequency**: Monthly
- **Monitoring Method**: Automated testing
- **Alert Conditions**: 
  - Redirects returning 500 errors
  - Redirects returning 404 errors
  - Redirects not preserving query parameters

## Removal Timeline

### Phase 1: Active Redirects (Current)
- **Duration**: 90+ days
- **Purpose**: Allow search engines and users to update bookmarks
- **Status**: ✅ Active

### Phase 2: Evaluation (After 90 days)
- **Check**: Search engine indexing status
- **Check**: User bookmark updates
- **Check**: External link updates
- **Decision**: Continue or remove redirects

### Phase 3: Optional Removal (After 6 months)
- **Condition**: If no significant traffic to blog URLs
- **Action**: Remove redirects from `next.config.ts`
- **Backup**: Keep redirects if external links still exist

## Testing Commands

### Manual Testing
```bash
# Test basic blog redirect
curl -I http://localhost:3000/blog

# Test blog post redirect
curl -I http://localhost:3000/blog/some-post

# Test with query parameters
curl -I "http://localhost:3000/blog?param=value"

# Test nested paths
curl -I http://localhost:3000/blog/nested/path
```

### Expected Results
- **Status Code**: 308 Permanent Redirect
- **Location Header**: `/` (or `/?query=params`)
- **No Errors**: No 500 or 404 responses

## Configuration Details

### Next.js Configuration
```typescript
// next.config.ts
async redirects() {
  return [
    // Permanent 301 redirects for blog routes (keep active for 90+ days)
    {
      source: '/blog',
      destination: '/',
      permanent: true,
    },
    {
      source: '/blog/:slug*',
      destination: '/',
      permanent: true,
    },
  ]
}
```

### HTTP Status Codes
- **Next.js `permanent: true`**: Returns HTTP 308 (Permanent Redirect)
- **Browser Behavior**: Caches redirect permanently
- **SEO Impact**: Search engines update their indexes

## Related Documentation
- [Blog Migration Production Guide](./blog-migration-production-guide.md)
- [Database Migration README](../prisma/migrations/20250120000000_drop_blog_tables/README.md)

## Last Updated
- **Date**: September 18, 2025
- **Version**: 1.0
- **Status**: Active
