# Mobile Game Hunt v1

A Product Hunt-inspired platform for discovering and showcasing the best mobile games. Built with Next.js, TypeScript, Prisma, and NextAuth.js.

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: TailwindCSS + Shadcn/ui
- **Forms**: React Hook Form + Zod validation

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   └── auth/           # Authentication pages
├── components/         # React components
│   └── ui/            # Shadcn/ui components
├── lib/               # Utility functions
│   ├── auth.ts        # NextAuth configuration
│   ├── prisma.ts      # Prisma client
│   └── utils.ts       # General utilities
├── styles/            # Global styles
└── types/             # TypeScript definitions
docs/                  # Project documentation
prisma/               # Database schema
```

## 🛠️ Setup Instructions

### 1. Environment Variables

Copy the example environment file and configure your variables:

```bash
cp .env.example .env
```

Update `.env` with your PostgreSQL database URL and authentication secrets:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/mobile_game_hunt_db"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or run migrations (for production)
npm run db:migrate
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## 🗄️ Database Schema

The application includes the following main models:

- **User**: User accounts with authentication
- **Product**: Mobile games submitted by users
- **Category**: Game categories/tags
- **Vote**: User votes on products
- **Comment**: Comments and discussions
- **Notification**: User notifications

See `docs/database.md` for detailed schema information.

## 🔐 Authentication

NextAuth.js is configured with:

- **Credentials**: Email/password authentication
- **OAuth**: Google and GitHub providers (configure in `.env`)
- **Database**: PostgreSQL session storage

## 🎨 UI Components

Built with Shadcn/ui components:

- Forms and inputs
- Buttons and cards
- Notifications (Sonner)
- And more...

## 📖 Documentation

- [Product Requirements](docs/prd.md)
- [System Architecture](docs/architecture.md)
- [Frontend Guide](docs/frontend.md)
- [Database Schema](docs/database.md)

## 🚢 Deployment

The application is ready to deploy on:

- **Vercel** (recommended for Next.js)
- **Railway** (for PostgreSQL)
- **Supabase** (for PostgreSQL)

Make sure to configure environment variables in your deployment platform.

## 📄 License

This project is for educational and demonstration purposes.