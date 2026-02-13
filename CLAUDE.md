# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What Is This

PlacementHub — a multi-tenant college placement platform. Colleges (organizations) manage placement drives, create tests (MCQ + coding), and students take proctored tests with sandboxed code execution.

## Monorepo Structure

Bun workspaces + Turborepo. All packages use `@placementhub/*` workspace aliases.

| Path | What | Runtime |
|------|------|---------|
| `apps/web` | Next.js 15 (App Router) + React 19 frontend | Node |
| `apps/api` | Hono REST API | Bun |
| `packages/auth` | Better Auth config, RBAC roles & permissions | Shared |
| `packages/database` | Prisma schema, client singleton, migrations | Shared |
| `packages/piston-client` | Piston code execution API wrapper | Shared |
| `packages/shared-types` | TypeScript interfaces for all domain models | Shared |
| `packages/utils` | Validators, date helpers, constants | Shared |

## Commands

```bash
# Install
bun install

# Dev (all apps concurrently)
bun run dev

# Dev single app
bun run dev:web          # Next.js on :3000
bun run dev:api          # Hono on :3001

# Build
bun run build            # all
bun run build:web
bun run build:api

# Database (Prisma)
bun run db:generate      # generate Prisma client
bun run db:push          # push schema to DB (no migration)
bun run db:migrate       # run migrations
bun run db:studio        # open Prisma Studio GUI
bun run db:seed          # seed data

# Lint & types
bun run lint
bun run type-check
bun run format           # prettier

# Piston (code execution engine, Docker)
bun run piston:start
bun run piston:stop
```

## Architecture Details

### Authentication & Multi-Tenancy

Uses **Better Auth** with the organization plugin. Colleges are organizations. Key flow:
- `packages/auth/src/permissions.ts` defines RBAC: roles (super_admin, owner, admin, recruiter, member) and permission statements (test, question, drive, results, settings, members)
- `apps/api/src/lib/auth.ts` initializes the server-side auth with Prisma adapter
- `apps/web/lib/auth-client.ts` provides client-side hooks (`useSession`, etc.)
- `apps/api/src/middleware/rbac.middleware.ts` enforces permissions on API routes
- Sessions track `activeOrganizationId` — the currently selected college context

### API Routing

`apps/api/src/index.ts` registers all route groups on the Hono app:
- `/api/auth/*` → Better Auth handler (proxied from Next.js via rewrites)
- `/api/colleges`, `/api/tests`, `/api/questions`, `/api/drives`, `/api/execute`, `/api/submissions`, `/api/me`

Next.js rewrites in `apps/web/next.config.js` proxy `/api/*` requests from the frontend to the Hono API, so the frontend calls its own origin and cookies flow correctly.

### Frontend Route Groups (App Router)

- `(auth)/` — login, register, forgot-password (unauthenticated)
- `(dashboard)/` — protected, role-based layouts per role: `admin/`, `student/`, `recruiter/`, `super-admin/`, `profile/`, `pending/`
- `(test-environment)/test/[testId]` — isolated test-taking UI (fullscreen, proctored)
- `dashboard/` — main landing after login

### Test Session Lock

When a student starts a test, all other sessions for that user are invalidated and the current session is locked to the test attempt (`isTestLocked` + `activeTestAttemptId` on Session). This prevents multi-device cheating. Enforced by `apps/api/src/middleware/test-session.middleware.ts`.

### Code Execution

Coding questions are executed via Piston (self-hosted Docker or public API). `packages/piston-client` wraps the API. Supports Python, Java, C++, C, JavaScript, TypeScript. Execution is logged to `ExecutionLog` with stdout/stderr/exit code/time/memory.

### Database

PostgreSQL on Supabase. Prisma 6 ORM. Schema at `packages/database/prisma/schema.prisma`. Key models:
- **Auth layer**: User, Session, Account, Verification, Organization, Member, Invitation
- **Test system**: Test (DRAFT/PUBLISHED/ARCHIVED), Question (MCQ/CODING), TestQuestion (junction with ordering)
- **Drives**: Drive (placement campaigns with eligibility criteria), DriveTest, DriveRegistration, DriveRecruiter
- **Submissions**: TestAttempt (tracks progress + proctoring data), Submission (per-question answer), ExecutionLog

### UI Stack

Shadcn/ui components (Radix UI primitives), Tailwind CSS, Lucide icons, Monaco Editor for code editing.

## Environment Variables

Required in `.env` (see `.env.example`):
- `DATABASE_URL` / `DIRECT_URL` — Supabase PostgreSQL (pooled / direct)
- `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` — auth config
- `API_URL` / `FRONTEND_URL` — server-side URLs
- `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_APP_URL` — client-side URLs
- `PISTON_URL` — code execution endpoint (optional, defaults to Docker on `:2000`)
