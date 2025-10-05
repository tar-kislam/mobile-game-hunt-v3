# Mobile Game Hunt - Setup Guide

## 🚀 Quick Start (Recommended)

### Option 1: Automated Setup Script

```bash
# 1. Start services and initialize everything
./scripts/setup-dev.sh

# 2. Start development server
npm run dev
```

This will:
- Start PostgreSQL and Redis containers
- Run database migrations
- Seed database (only if empty)
- Initialize badge system (only if needed)
- Start the development server

### Option 2: Manual Setup (Using Docker)

1. **Install Docker Desktop** if you haven't already
2. **Start PostgreSQL with Docker**:
   ```bash
   docker run --name mobile-game-hunt-db \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=mobile_game_hunt \
     -p 5432:5432 \
     -d postgres:15
   ```

3. **Create your `.env.local` file**:
   ```bash
   # Create the file
   touch .env.local
   ```
   
   Add this content to `.env.local`:
   ```env
   # Database
   DATABASE_URL="postgresql://postgres:password@localhost:5432/mobile_game_hunt"
   
   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"
   
   # OAuth Providers (optional - you can add these later)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   
   # Email Provider (optional - for magic links)
   EMAIL_SERVER_HOST="smtp.gmail.com"
   EMAIL_SERVER_PORT="587"
   EMAIL_SERVER_USER="your-email@gmail.com"
   EMAIL_SERVER_PASSWORD="your-app-password"
   EMAIL_FROM="your-email@gmail.com"
   ```

4. **Run database setup**:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

### Option 2: Using Prisma Postgres (Cloud)

1. **Create a free Prisma Postgres database**:
   ```bash
   npx prisma postgres
   ```
   Follow the prompts to create your database.

2. **Update your `.env.local`** with the provided DATABASE_URL

3. **Run the setup**:
   ```bash
   npm run db:migrate
   npm run db:seed
   npm run dev
   ```

### Option 3: Using Local PostgreSQL Installation

1. **Install PostgreSQL** on your system
2. **Create database**:
   ```sql
   createdb mobile_game_hunt
   ```
3. **Update `.env.local`** with your local credentials
4. **Run setup commands**

## 🧪 Testing the Setup

### Login Credentials
- **User 1**: john@example.com / password123
- **User 2**: jane@example.com / password123  
- **Admin**: admin@example.com / password123

### Available Commands
```bash
npm run dev          # Start development server
npm run db:studio    # Open Prisma Studio (database GUI)
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed with dummy data
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 🎯 What's Included

### Authentication
- ✅ NextAuth.js with JWT strategy
- ✅ Email (magic link), Google, GitHub, Credentials providers
- ✅ Protected routes with middleware
- ✅ Role-based access (USER/ADMIN)

### Database
- ✅ PostgreSQL with Prisma ORM
- ✅ User authentication models
- ✅ Product hunt app models (Product, Vote, Comment, Category)
- ✅ Seed data included

### Frontend
- ✅ Next.js 15 with App Router
- ✅ TypeScript strict mode
- ✅ TailwindCSS v4
- ✅ Shadcn/ui components
- ✅ Absolute imports (`@/` paths)

### Development Tools
- ✅ ESLint + Prettier
- ✅ Turbopack for fast development
- ✅ Hot reloading

## 🛠️ Troubleshooting

### Database Connection Issues
If you see `P1001` errors, your database isn't running:
1. Check if Docker container is running: `docker ps`
2. Restart container: `docker restart mobile-game-hunt-db`
3. Verify DATABASE_URL in `.env.local`

### OAuth Setup (Optional)
To enable Google/GitHub login:
1. **Google**: Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **GitHub**: Go to GitHub Settings > Developer settings > OAuth Apps
3. Add your credentials to `.env.local`

### Email Provider Setup (Optional)
For magic link authentication:
1. Use Gmail App Password or SMTP service
2. Update email settings in `.env.local`

## 📚 Next Steps

1. **Customize the UI** with Shadcn components
2. **Add more features** to the product hunt app
3. **Deploy** to Vercel or your preferred platform
4. **Set up CI/CD** with GitHub Actions

## 🔗 Useful Links

- [Prisma Studio](http://localhost:5555) (when running `npm run db:studio`)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com)
