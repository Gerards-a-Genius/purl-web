# Security Documentation

## Overview

This document outlines the security measures implemented in the Purl web application to protect user data and ensure safe operation.

## Authentication

### Supabase Auth Integration

- **Provider**: Supabase Auth with email/password authentication
- **Session Management**: JWT-based sessions with automatic token refresh
- **Middleware Protection**: Next.js middleware (`src/middleware.ts`) protects routes:
  - Protected routes: `/projects`, `/learn` - require authentication
  - Auth routes: `/login`, `/register` - redirect authenticated users away
  - Session refresh on every request via `supabase.auth.getUser()`

### Protected Routes

| Route Pattern | Protection Level | Notes |
|---------------|------------------|-------|
| `/projects/*` | Authenticated | User projects and tracking |
| `/learn/*` | Authenticated | Learning resources |
| `/library/*` | Public | Pattern library (read-only) |
| `/api/patterns/*` | Public | Public pattern search API |

## Database Security

### Row Level Security (RLS)

All user data tables have RLS enabled with strict policies:

#### Projects Table
```sql
-- Users can only access their own projects
USING (auth.uid() = user_id)
```

#### Steps Table
```sql
-- Access controlled via project ownership
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = steps.project_id
    AND p.user_id = auth.uid()
  )
)
```

#### Pattern Annotations Table
```sql
-- Access controlled via project ownership
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = pattern_annotations.project_id
    AND p.user_id = auth.uid()
  )
)
```

#### User Favorites Table
```sql
-- Users can only manage their own favorites
USING (auth.uid() = user_id)
```

#### Techniques Table
```sql
-- Public knowledge base
FOR SELECT USING (true)
-- Authenticated users can contribute
FOR INSERT/UPDATE TO authenticated
```

### Data Scoping

All API queries include user ID filtering:
- `getProjects(userId)` - `.eq('user_id', userId)`
- `getProjectById(projectId)` - RLS enforces ownership
- `createProject(userId, ...)` - `user_id: userId` in insert

## Storage Security

### Patterns Bucket

- **Bucket**: `patterns`
- **Access**: User-scoped folders (`{userId}/{filename}`)
- **File Size Limit**: 50MB
- **Allowed MIME Types**:
  - `application/pdf`
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `image/gif`

### Storage Policies

```sql
-- Users can only access files in their own folder
(storage.foldername(name))[1] = auth.uid()::text
```

### Client-Side Validation (`src/lib/api/storage.ts`)

```typescript
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const allowedTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
```

## Edge Function Security

### Authentication

All Edge Functions verify JWT authentication:

```typescript
const authHeader = req.headers.get('Authorization');
if (!authHeader) {
  return new Response(
    JSON.stringify({ error: 'Missing authorization header' }),
    { status: 401 }
  );
}

const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
if (userError || !user) {
  return new Response(
    JSON.stringify({ error: 'Invalid or expired session' }),
    { status: 401 }
  );
}
```

### Configuration (`supabase/config.toml`)

```toml
[functions."parse-pattern"]
verify_jwt = true

[functions."sos-assist"]
verify_jwt = true

[functions."contextual-help"]
verify_jwt = true

[functions."generate-steps"]
verify_jwt = true
```

## API Security

### Public API Endpoints

Pattern library endpoints are intentionally public (read-only):
- `GET /api/patterns/search` - Search patterns
- `GET /api/patterns/[id]` - Get pattern details
- `GET /api/patterns/stats` - Repository statistics
- `GET /api/patterns/techniques` - List techniques
- `GET /api/patterns/[id]/similar` - Find similar patterns

These endpoints:
- Only expose public pattern library data
- No write operations
- No user-specific data
- Server-side filtering with input validation

### Input Validation

- Query parameters are validated and typed
- Numeric inputs are parsed with `parseInt()` with defaults
- Enum values are checked before use
- File types and sizes are validated before upload

## Rate Limiting Considerations

### Current Implementation

Rate limiting is handled at infrastructure level:
- Supabase enforces default rate limits
- Vercel provides DDoS protection

### Recommendations for Production

1. **API Rate Limiting**: Consider adding rate limiting middleware
2. **Edge Function Limits**: Monitor Supabase Edge Function invocations
3. **Storage Quotas**: Monitor per-user storage usage

## Security Headers

Next.js configuration should include:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Data Privacy

### User Data Isolation

- User data is never exposed to other users
- RLS policies enforce ownership at database level
- Storage policies enforce folder-level isolation
- API queries include user ID checks

### Data Retention

- User data is cascade deleted when account is deleted
- Pattern annotations are deleted with projects
- Steps are deleted with projects

## Security Testing

### Unit Tests

Security-focused tests are located in:
- `src/lib/api/projects.test.ts` - API data scoping tests
- `src/lib/api/storage.test.ts` - File validation tests

### Manual Testing Checklist

- [ ] Unauthenticated access to protected routes redirects to login
- [ ] Users cannot access other users' projects
- [ ] File uploads reject invalid MIME types
- [ ] File uploads reject oversized files
- [ ] Edge Functions reject requests without valid JWT
- [ ] Storage operations respect folder boundaries

## Vulnerability Reporting

If you discover a security vulnerability, please:
1. **Do not** create a public GitHub issue
2. Email security concerns to the maintainers
3. Include detailed steps to reproduce
4. Allow reasonable time for fixes before disclosure

## Security Updates

This document was last updated: January 2025

Changes to security measures should be documented here with dates.
