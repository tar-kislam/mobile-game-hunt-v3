# Database Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mobile_game_hunt"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Email Provider (for magic links)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"
```

## Database Commands

Once you have a PostgreSQL database running and the environment variables set up:

```bash
# Generate Prisma client
npm run db:generate

# Run database migration
npm run db:migrate

# Seed the database with dummy data
npm run db:seed

# Open Prisma Studio to view/edit data
npm run db:studio
```

## Dummy Data

The seed script creates:
- 2 categories (Mobile Games, Utilities)
- 3 users (including 1 admin)
- 3 products
- 6 votes
- 4 comments

All users have the password: `password123`

## Login Credentials

- **Regular User 1**: john@example.com / password123
- **Regular User 2**: jane@example.com / password123  
- **Admin User**: admin@example.com / password123
