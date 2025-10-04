# Username Generation for NextAuth

This document explains the automatic username generation system implemented for Google and GitHub OAuth sign-ins.

## Overview

When users sign in via Google or GitHub OAuth, the system automatically generates a unique username based on their profile name. This username is stored in the database and made available in the session.

## Implementation Details

### 1. Username Generation Logic

The username generation follows these rules:

1. **Convert to lowercase**: "Tarik Islam" → "tarik islam"
2. **Replace spaces with hyphens**: "tarik islam" → "tarik-islam"
3. **Remove special characters**: "Jean-Pierre" → "jean-pierre"
4. **Ensure it starts with a letter**: "123user" → "user"
5. **Handle collisions**: If username exists, append random 4-digit number

### 2. Examples

| Original Name | Generated Username |
|---------------|-------------------|
| "Tarik Islam" | "tarik-islam" |
| "María García" | "maria-garcia" |
| "Jean-Pierre Dubois" | "jean-pierre-dubois" |
| "O'Connor" | "oconnor" |
| "Smith-Wilson" | "smith-wilson" |

### 3. Collision Handling

If a username already exists in the database:
- Append a random 4-digit number: "tarik-islam-4821"
- If still not unique, try again with a different number
- Fallback to timestamp-based suffix if needed

## Files Modified

### 1. `/src/lib/usernameUtils.ts` (New)
Contains utility functions:
- `generateUniqueUsername(name: string)`: Main function to generate unique usernames
- `isUsernameAvailable(username: string)`: Check if username is available
- `sanitizeUsername(username: string)`: Sanitize username according to rules

### 2. `/src/lib/auth.ts` (Modified)
Updated NextAuth configuration:
- Added username generation in `signIn` callback
- Handles both Google and GitHub OAuth providers
- Updates existing users without usernames
- Sets username for new users during account creation

### 3. `/src/types/next-auth.d.ts` (Already existed)
Type definitions already included username field in Session and User interfaces.

## Database Schema

The User model already includes:
```prisma
model User {
  username String? @unique
  // ... other fields
}
```

## API Endpoints

### Test Endpoint: `/api/test/username`

**POST** with different actions:

1. **Generate username**:
```json
{
  "name": "Tarik Islam",
  "action": "generate"
}
```

2. **Check availability**:
```json
{
  "name": "tarik-islam",
  "action": "check"
}
```

3. **Sanitize username**:
```json
{
  "name": "Tarik Islam",
  "action": "sanitize"
}
```

## Testing

### Manual Testing
1. Sign in with Google/GitHub
2. Check if username is generated and stored
3. Verify username appears in session

### Automated Testing
Run the test script:
```bash
npx tsx scripts/test-username-generation.ts
```

## Error Handling

- If username generation fails, a fallback username is created
- Sign-in is never blocked due to username generation errors
- All errors are logged for debugging

## Security Considerations

- Usernames are sanitized to prevent injection attacks
- Database queries use parameterized statements
- Username uniqueness is enforced at database level

## Future Enhancements

1. **Username Customization**: Allow users to change their generated username
2. **Reserved Words**: Block common reserved usernames (admin, root, etc.)
3. **Username Validation**: Add client-side validation for username changes
4. **Bulk Username Generation**: Tool to generate usernames for existing users

## Troubleshooting

### Common Issues

1. **Username not generated**: Check NextAuth logs for errors
2. **Duplicate usernames**: Verify database unique constraint is working
3. **Special characters**: Ensure sanitization is working correctly

### Debugging

Enable NextAuth debug mode:
```bash
NEXTAUTH_DEBUG=true npm run dev
```

Check logs for username generation messages:
```
[NextAuth] Generated username for new Google user: tarik-islam
[NextAuth] Updated username for existing user user@example.com: tarik-islam
```
