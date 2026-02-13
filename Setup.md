How to Start This Application

This is a PlacementHub monorepo with a Next.js frontend and Bun + Hono API backend.

---

Quick Start

# 1. Install dependencies

bun install

# 2. Copy environment file

cp .env.example .env

# 3. Configure your .env file (see below)

# 4. Setup database

bun run db:generate  
 bun run db:push

# 5. Start the app

bun run dev

Access:

- Frontend: http://localhost:3000
- API: http://localhost:3001

---

Environment Variables You Need

Create a .env file with these values:

Database (Supabase PostgreSQL) - Required

DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"  
 DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"  
 Get these from your Supabase project settings → Database → Connection string

Authentication - Required

BETTER_AUTH_SECRET="your-super-secret-key-at-least-32-characters"  
 BETTER_AUTH_URL="http://localhost:3001"  
 Generate secret with: openssl rand -base64 32

API URLs - Required

API_URL="http://localhost:3001"  
 FRONTEND_URL="http://localhost:3000"  
 NEXT_PUBLIC_API_URL="http://localhost:3001"  
 NEXT_PUBLIC_APP_URL="http://localhost:3000"  
 NODE_ENV="development"

Code Execution (Optional)

PISTON_URL="http://localhost:2000"  
 Use https://emkc.org/api/v2/piston if you don't want to run Docker locally.

---

Database Commands  
 ┌─────────────────────┬─────────────────────────┐  
 │ Command │ Purpose │  
 ├─────────────────────┼─────────────────────────┤  
 │ bun run db:generate │ Generate Prisma client │  
 ├─────────────────────┼─────────────────────────┤  
 │ bun run db:push │ Push schema to database │  
 ├─────────────────────┼─────────────────────────┤  
 │ bun run db:migrate │ Run migrations │  
 ├─────────────────────┼─────────────────────────┤  
 │ bun run db:studio │ Open database GUI │  
 ├─────────────────────┼─────────────────────────┤  
 │ bun run db:seed │ Seed initial data │  
 └─────────────────────┴─────────────────────────┘
