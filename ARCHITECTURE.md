# PlacementHub - College Placement Platform Architecture

## Overview

PlacementHub is a HackerEarth-like platform designed specifically for college placement drives. This document outlines the complete architecture, including monorepo structure, service boundaries, database schema, authentication setup, and deployment strategy.

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14+ (App Router) |
| Backend | TypeScript (Node.js) |
| API Deployment | Vercel Functions (separate project) |
| Database | Supabase (PostgreSQL) |
| ORM | Prisma |
| Authentication | Better Auth with Prisma Adapter |
| Code Execution | Piston (self-hosted) |
| Real-time | Supabase Realtime |
| Monorepo Tool | Turborepo |

---

## 1. Monorepo Folder Structure

```
/placementhub
├── apps/
│   ├── web/                          # Next.js Frontend (Vercel Project 1)
│   │   ├── app/
│   │   │   ├── (auth)/               # Auth pages (login, register, etc.)
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── forgot-password/
│   │   │   ├── (dashboard)/          # Protected dashboard routes
│   │   │   │   ├── student/
│   │   │   │   │   ├── drives/
│   │   │   │   │   ├── tests/
│   │   │   │   │   └── results/
│   │   │   │   ├── admin/            # College admin dashboard
│   │   │   │   │   ├── tests/
│   │   │   │   │   ├── questions/
│   │   │   │   │   ├── drives/
│   │   │   │   │   └── analytics/
│   │   │   │   ├── recruiter/
│   │   │   │   │   ├── drives/
│   │   │   │   │   └── candidates/
│   │   │   │   └── super-admin/
│   │   │   ├── (test-environment)/   # Isolated test-taking environment
│   │   │   │   └── test/[testId]/
│   │   │   ├── api/
│   │   │   │   └── auth/[...all]/    # Better Auth route handler
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── ui/                   # Shadcn/UI components
│   │   │   ├── test/                 # Test-taking components
│   │   │   │   ├── code-editor.tsx
│   │   │   │   ├── mcq-question.tsx
│   │   │   │   ├── test-timer.tsx
│   │   │   │   └── proctoring-monitor.tsx
│   │   │   ├── dashboard/
│   │   │   └── common/
│   │   ├── lib/
│   │   │   ├── auth-client.ts        # Better Auth client
│   │   │   ├── api-client.ts         # API service client
│   │   │   └── utils.ts
│   │   ├── hooks/
│   │   ├── styles/
│   │   ├── public/
│   │   ├── next.config.js
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vercel.json
│   │
│   └── api/                          # API Backend (Vercel Project 2)
│       ├── src/
│       │   ├── index.ts              # Main entry point (Hono/Express)
│       │   ├── lib/
│       │   │   ├── auth.ts           # Better Auth server instance
│       │   │   ├── prisma.ts         # Prisma client singleton
│       │   │   └── piston.ts         # Piston client wrapper
│       │   ├── services/             # Service layer (business logic)
│       │   │   ├── auth/
│       │   │   │   ├── index.ts
│       │   │   │   └── session-lock.ts
│       │   │   ├── test/
│       │   │   │   ├── index.ts
│       │   │   │   ├── test.service.ts
│       │   │   │   └── question.service.ts
│       │   │   ├── execution/
│       │   │   │   ├── index.ts
│       │   │   │   ├── executor.service.ts
│       │   │   │   └── queue.service.ts
│       │   │   ├── college/
│       │   │   │   ├── index.ts
│       │   │   │   └── college.service.ts
│       │   │   ├── drive/
│       │   │   │   ├── index.ts
│       │   │   │   └── drive.service.ts
│       │   │   └── submission/
│       │   │       ├── index.ts
│       │   │       └── submission.service.ts
│       │   ├── routes/               # API route handlers
│       │   │   ├── auth.routes.ts
│       │   │   ├── test.routes.ts
│       │   │   ├── question.routes.ts
│       │   │   ├── execution.routes.ts
│       │   │   ├── college.routes.ts
│       │   │   ├── drive.routes.ts
│       │   │   └── submission.routes.ts
│       │   ├── middleware/
│       │   │   ├── auth.middleware.ts
│       │   │   ├── rbac.middleware.ts
│       │   │   ├── rate-limit.middleware.ts
│       │   │   └── test-session.middleware.ts
│       │   ├── utils/
│       │   │   ├── errors.ts
│       │   │   └── validators.ts
│       │   └── types/
│       │       └── index.ts
│       ├── api/                      # Vercel Functions entry points
│       │   ├── index.ts              # Catch-all API route
│       │   └── [[...route]].ts       # Dynamic route handler
│       ├── package.json
│       ├── tsconfig.json
│       └── vercel.json
│
├── packages/
│   ├── database/                     # Prisma schema & client
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   ├── index.ts              # Exports Prisma client
│   │   │   └── client.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── shared-types/                 # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── user.types.ts
│   │   │   ├── test.types.ts
│   │   │   ├── question.types.ts
│   │   │   ├── submission.types.ts
│   │   │   ├── college.types.ts
│   │   │   ├── drive.types.ts
│   │   │   └── api.types.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── utils/                        # Shared utilities
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── date.ts
│   │   │   ├── validation.ts
│   │   │   └── constants.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── auth/                         # Better Auth shared config
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── config.ts             # Shared auth configuration
│   │   │   ├── permissions.ts        # RBAC definitions
│   │   │   └── types.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── piston-client/                # Piston API wrapper
│       ├── src/
│       │   ├── index.ts
│       │   ├── client.ts
│       │   ├── types.ts
│       │   └── languages.ts
│       ├── package.json
│       └── tsconfig.json
│
├── infrastructure/
│   ├── docker/
│   │   ├── docker-compose.yml        # Local dev (Piston + services)
│   │   ├── docker-compose.piston.yml # Piston only
│   │   └── Dockerfile.piston
│   ├── scripts/
│   │   ├── setup.sh
│   │   ├── seed-db.sh
│   │   └── deploy.sh
│   └── terraform/                    # If needed for Piston hosting
│       └── piston/
│
├── docs/
│   ├── api/                          # API documentation
│   ├── architecture/
│   └── deployment/
│
├── turbo.json                        # Turborepo configuration
├── package.json                      # Root package.json
├── pnpm-workspace.yaml               # PNPM workspace config
├── .env.example
├── .gitignore
└── README.md
```

---

## 2. Service Boundaries

### Service Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                         │
│                    (Web Browser / Mobile App)                               │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
┌───────────────────────────────┐   ┌─────────────────────────────────────────┐
│     NEXT.JS FRONTEND          │   │            API GATEWAY                   │
│     (Vercel Project 1)        │   │         (Vercel Project 2)              │
│                               │   │                                         │
│  - SSR/SSG Pages              │   │  ┌─────────────────────────────────┐   │
│  - React Components           │   │  │        Auth Service             │   │
│  - Better Auth Client         │   │  │  - Better Auth Server           │   │
│  - API Client                 │   │  │  - Session Management           │   │
│                               │   │  │  - RBAC Enforcement             │   │
│  /api/auth/* (Auth only)      │   │  │  - Test Session Lock            │   │
└───────────────────────────────┘   │  └─────────────────────────────────┘   │
                                    │                                         │
                                    │  ┌─────────────────────────────────┐   │
                                    │  │        College Service          │   │
                                    │  │  - College CRUD                 │   │
                                    │  │  - Multi-tenant Isolation       │   │
                                    │  │  - Admin Management             │   │
                                    │  └─────────────────────────────────┘   │
                                    │                                         │
                                    │  ┌─────────────────────────────────┐   │
                                    │  │         Test Service            │   │
                                    │  │  - Test CRUD                    │   │
                                    │  │  - Question Management          │   │
                                    │  │  - Test Configuration           │   │
                                    │  └─────────────────────────────────┘   │
                                    │                                         │
                                    │  ┌─────────────────────────────────┐   │
                                    │  │        Drive Service            │   │
                                    │  │  - Placement Drive CRUD         │   │
                                    │  │  - Student Registration         │   │
                                    │  │  - Recruiter Access             │   │
                                    │  └─────────────────────────────────┘   │
                                    │                                         │
                                    │  ┌─────────────────────────────────┐   │
                                    │  │      Submission Service         │   │
                                    │  │  - Answer Submission            │   │
                                    │  │  - Auto-grading (MCQ)           │   │
                                    │  │  - Results Calculation          │   │
                                    │  └─────────────────────────────────┘   │
                                    │                                         │
                                    │  ┌─────────────────────────────────┐   │
                                    │  │      Execution Service          │   │
                                    │  │  - Piston Integration           │   │
                                    │  │  - Queue Management             │   │
                                    │  │  - Test Case Validation         │   │
                                    │  └─────────────────────────────────┘   │
                                    └─────────────────────────────────────────┘
                                                        │
                                                        ▼
                                    ┌─────────────────────────────────────────┐
                                    │              SUPABASE                   │
                                    │  - PostgreSQL Database                  │
                                    │  - Realtime Subscriptions               │
                                    │  - Storage (if needed)                  │
                                    └─────────────────────────────────────────┘
                                                        │
                                    ┌───────────────────┴───────────────────┐
                                    │                                       │
                                    ▼                                       ▼
                    ┌───────────────────────────┐       ┌───────────────────────────┐
                    │     PISTON ENGINE         │       │   REDIS (Optional)        │
                    │   (Self-hosted/Cloud)     │       │   - Execution Queue       │
                    │                           │       │   - Rate Limiting         │
                    │   - Code Execution        │       │   - Session Cache         │
                    │   - Sandboxing            │       └───────────────────────────┘
                    │   - Multi-language        │
                    └───────────────────────────┘
```

### Service Definitions

#### 1. Auth Service
**Responsibility**: User authentication, authorization, and session management

| Feature | Implementation |
|---------|----------------|
| User Registration | Email/password with Better Auth |
| Login/Logout | Session-based with cookies |
| RBAC | Organization plugin + custom roles |
| Multi-tenancy | College as Organization |
| Test Session Lock | Single-device enforcement during tests |
| Password Reset | Email-based flow |

**Key Endpoints**:
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login
- `POST /api/auth/sign-out` - User logout
- `GET /api/auth/session` - Get current session
- `POST /api/auth/test-session/lock` - Lock to single device for test

---

#### 2. College Service
**Responsibility**: Multi-tenant college/organization management

| Feature | Implementation |
|---------|----------------|
| College CRUD | Super admin creates colleges |
| Admin Assignment | Organization owner/admin roles |
| Tenant Isolation | All queries scoped by collegeId |
| Settings | College-specific configurations |

**Key Endpoints**:
- `POST /api/colleges` - Create college (super admin)
- `GET /api/colleges` - List colleges
- `GET /api/colleges/:id` - Get college details
- `PUT /api/colleges/:id` - Update college
- `POST /api/colleges/:id/admins` - Add admin to college

---

#### 3. Test Service
**Responsibility**: Test and question management

| Feature | Implementation |
|---------|----------------|
| Test CRUD | Create, update, delete tests |
| Question Types | MCQ + Coding questions |
| Test Config | Duration, passing score, proctoring settings |
| Question Bank | Reusable question pool |
| Test Versions | Draft vs Published states |

**Key Endpoints**:
- `POST /api/tests` - Create test
- `GET /api/tests` - List tests (scoped by college)
- `GET /api/tests/:id` - Get test with questions
- `PUT /api/tests/:id` - Update test
- `POST /api/tests/:id/questions` - Add question to test
- `POST /api/tests/:id/publish` - Publish test

---

#### 4. Drive Service
**Responsibility**: Placement drive and campaign management

| Feature | Implementation |
|---------|----------------|
| Drive CRUD | Create placement drives |
| Test Assignment | Link tests to drives |
| Student Registration | Students register for drives |
| Recruiter Access | Invite recruiters to view results |
| Scheduling | Drive start/end times |

**Key Endpoints**:
- `POST /api/drives` - Create drive
- `GET /api/drives` - List drives
- `POST /api/drives/:id/register` - Student registers
- `POST /api/drives/:id/recruiters` - Add recruiter
- `GET /api/drives/:id/candidates` - Get registered candidates

---

#### 5. Submission Service
**Responsibility**: Answer submission and result calculation

| Feature | Implementation |
|---------|----------------|
| MCQ Submission | Store selected answers |
| Code Submission | Store code + trigger execution |
| Auto-grading | Grade MCQs automatically |
| Results | Calculate scores, percentiles |
| Progress | Track test completion |

**Key Endpoints**:
- `POST /api/submissions` - Submit answer
- `GET /api/submissions/:testAttemptId` - Get all submissions for attempt
- `POST /api/submissions/:id/run` - Run code (without grading)
- `POST /api/submissions/:id/submit` - Final code submission
- `GET /api/results/:testAttemptId` - Get results

---

#### 6. Execution Service
**Responsibility**: Code execution via Piston

| Feature | Implementation |
|---------|----------------|
| Code Execution | Send to Piston API |
| Test Case Validation | Run against test cases |
| Queue Management | Handle concurrent submissions |
| Timeout Handling | Enforce execution limits |
| Output Capture | Capture stdout, stderr |

**Key Endpoints**:
- `POST /api/execute` - Execute code (returns output)
- `POST /api/execute/validate` - Run against test cases
- `GET /api/execute/languages` - List supported languages
- `GET /api/execute/status/:jobId` - Get execution status

---

## 3. Database Schema (Prisma)

```prisma
// packages/database/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/client"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // For Supabase
}

// ============================================
// BETTER AUTH REQUIRED TABLES
// ============================================

model User {
  id              String    @id @default(cuid())
  name            String
  email           String    @unique
  emailVerified   Boolean   @default(false)
  image           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Custom fields
  phone           String?
  rollNumber      String?   // For students
  department      String?
  graduationYear  Int?

  // Relations
  sessions        Session[]
  accounts        Account[]

  // Organization relations (Better Auth)
  members         Member[]
  invitations     Invitation[]

  // Application relations
  testAttempts    TestAttempt[]
  createdTests    Test[]          @relation("TestCreator")
  createdQuestions Question[]     @relation("QuestionCreator")

  @@map("user")
}

model Session {
  id             String    @id @default(cuid())
  expiresAt      DateTime
  token          String    @unique
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  ipAddress      String?
  userAgent      String?

  userId         String
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Custom: Test session lock
  activeTestAttemptId String?   @unique
  isTestLocked        Boolean   @default(false)

  @@map("session")
}

model Account {
  id                    String    @id @default(cuid())
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@map("account")
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@map("verification")
}

// ============================================
// BETTER AUTH ORGANIZATION TABLES
// ============================================

model Organization {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  logo        String?
  createdAt   DateTime  @default(now())
  metadata    String?   // JSON string for additional data

  // This represents a College
  // Custom college fields
  address     String?
  website     String?
  contactEmail String?
  isActive    Boolean   @default(true)

  members     Member[]
  invitations Invitation[]

  // Application relations
  tests       Test[]
  drives      Drive[]
  questions   Question[]

  @@map("organization")
}

model Member {
  id             String       @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  userId         String
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  role           String       // 'owner', 'admin', 'member', 'recruiter'
  createdAt      DateTime     @default(now())

  @@unique([organizationId, userId])
  @@map("member")
}

model Invitation {
  id             String       @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  email          String
  role           String
  status         String       @default("pending") // pending, accepted, rejected, expired
  expiresAt      DateTime
  inviterId      String
  inviter        User         @relation(fields: [inviterId], references: [id], onDelete: Cascade)
  createdAt      DateTime     @default(now())

  @@map("invitation")
}

// ============================================
// APPLICATION TABLES
// ============================================

// Test Management
model Test {
  id              String       @id @default(cuid())
  title           String
  description     String?
  instructions    String?      // HTML/Markdown

  // Configuration
  duration        Int          // in minutes
  passingScore    Int          @default(50) // percentage
  totalMarks      Int          @default(100)
  shuffleQuestions Boolean     @default(false)
  showResults     Boolean      @default(true) // Show results to student after test

  // Proctoring settings
  enableProctoring    Boolean  @default(false)
  fullScreenRequired  Boolean  @default(true)
  tabSwitchLimit      Int      @default(3)

  // Status
  status          TestStatus   @default(DRAFT)
  publishedAt     DateTime?

  // Relations
  collegeId       String
  college         Organization @relation(fields: [collegeId], references: [id], onDelete: Cascade)

  creatorId       String
  creator         User         @relation("TestCreator", fields: [creatorId], references: [id])

  questions       TestQuestion[]
  driveTests      DriveTest[]
  attempts        TestAttempt[]

  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@index([collegeId])
  @@map("test")
}

enum TestStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

// Question Bank
model Question {
  id              String       @id @default(cuid())
  type            QuestionType
  title           String       // Question title/summary
  content         String       // Full question text (HTML/Markdown)
  marks           Int          @default(1)
  difficulty      Difficulty   @default(MEDIUM)
  tags            String[]     // For categorization

  // MCQ specific
  options         Json?        // Array of {id, text, isCorrect}

  // Coding specific
  starterCode     Json?        // {language: code} mapping
  solution        String?      // Reference solution
  testCases       Json?        // Array of {input, expectedOutput, isHidden, points}
  constraints     String?      // Time/space constraints text
  allowedLanguages String[]    @default(["python", "java", "cpp", "c"])

  // Execution limits
  timeLimit       Int          @default(2)  // seconds
  memoryLimit     Int          @default(256) // MB

  // Relations
  collegeId       String
  college         Organization @relation(fields: [collegeId], references: [id], onDelete: Cascade)

  creatorId       String
  creator         User         @relation("QuestionCreator", fields: [creatorId], references: [id])

  tests           TestQuestion[]
  submissions     Submission[]

  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@index([collegeId, type])
  @@map("question")
}

enum QuestionType {
  MCQ
  CODING
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

// Junction: Test <-> Question (with order)
model TestQuestion {
  id          String   @id @default(cuid())
  testId      String
  test        Test     @relation(fields: [testId], references: [id], onDelete: Cascade)
  questionId  String
  question    Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  order       Int      // Question order in test

  // Override marks for this test if needed
  overrideMarks Int?

  @@unique([testId, questionId])
  @@index([testId, order])
  @@map("test_question")
}

// Placement Drives
model Drive {
  id              String       @id @default(cuid())
  title           String
  description     String?
  companyName     String
  companyLogo     String?

  // Scheduling
  registrationStart DateTime
  registrationEnd   DateTime
  driveStart        DateTime
  driveEnd          DateTime

  // Eligibility
  eligibleDepartments String[]
  minCGPA             Float?
  graduationYears     Int[]

  // Status
  status          DriveStatus  @default(DRAFT)

  // Relations
  collegeId       String
  college         Organization @relation(fields: [collegeId], references: [id], onDelete: Cascade)

  tests           DriveTest[]
  registrations   DriveRegistration[]
  recruiters      DriveRecruiter[]

  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@index([collegeId, status])
  @@map("drive")
}

enum DriveStatus {
  DRAFT
  REGISTRATION_OPEN
  REGISTRATION_CLOSED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

// Junction: Drive <-> Test
model DriveTest {
  id          String   @id @default(cuid())
  driveId     String
  drive       Drive    @relation(fields: [driveId], references: [id], onDelete: Cascade)
  testId      String
  test        Test     @relation(fields: [testId], references: [id], onDelete: Cascade)
  order       Int      // Test order in drive
  isMandatory Boolean  @default(true)

  @@unique([driveId, testId])
  @@map("drive_test")
}

// Student registration for drives
model DriveRegistration {
  id          String   @id @default(cuid())
  driveId     String
  drive       Drive    @relation(fields: [driveId], references: [id], onDelete: Cascade)
  userId      String

  // Student details at time of registration
  cgpa        Float?
  resumeUrl   String?

  status      RegistrationStatus @default(REGISTERED)

  createdAt   DateTime @default(now())

  @@unique([driveId, userId])
  @@map("drive_registration")
}

enum RegistrationStatus {
  REGISTERED
  SHORTLISTED
  REJECTED
  SELECTED
  NOT_SELECTED
}

// Recruiter access to drives
model DriveRecruiter {
  id          String   @id @default(cuid())
  driveId     String
  drive       Drive    @relation(fields: [driveId], references: [id], onDelete: Cascade)
  email       String
  accessToken String   @unique @default(cuid()) // For magic link access
  expiresAt   DateTime

  createdAt   DateTime @default(now())

  @@unique([driveId, email])
  @@map("drive_recruiter")
}

// Test Attempts
model TestAttempt {
  id              String       @id @default(cuid())
  testId          String
  test            Test         @relation(fields: [testId], references: [id], onDelete: Cascade)
  userId          String
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Timing
  startedAt       DateTime     @default(now())
  submittedAt     DateTime?
  endTime         DateTime     // Calculated: startedAt + duration

  // Status
  status          AttemptStatus @default(IN_PROGRESS)

  // Results (populated after submission)
  totalScore      Float?
  percentage      Float?
  passed          Boolean?

  // Proctoring data
  tabSwitchCount  Int          @default(0)
  warnings        Json?        // Array of warning events

  submissions     Submission[]

  @@unique([testId, userId]) // One attempt per test per user
  @@index([testId, status])
  @@map("test_attempt")
}

enum AttemptStatus {
  IN_PROGRESS
  SUBMITTED
  AUTO_SUBMITTED  // Time ran out
  TERMINATED      // Admin terminated
  GRADED
}

// Individual question submissions
model Submission {
  id              String       @id @default(cuid())
  testAttemptId   String
  testAttempt     TestAttempt  @relation(fields: [testAttemptId], references: [id], onDelete: Cascade)
  questionId      String
  question        Question     @relation(fields: [questionId], references: [id], onDelete: Cascade)

  // MCQ answer
  selectedOption  String?      // Option ID

  // Coding answer
  code            String?
  language        String?

  // Execution results (for coding)
  executionResults Json?       // Array of test case results

  // Grading
  isCorrect       Boolean?
  score           Float?       // Marks obtained
  gradedAt        DateTime?

  // Timestamps
  submittedAt     DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@unique([testAttemptId, questionId])
  @@index([testAttemptId])
  @@map("submission")
}

// Code Execution Log (for debugging/analytics)
model ExecutionLog {
  id              String   @id @default(cuid())
  submissionId    String?
  userId          String

  // Request
  language        String
  code            String
  stdin           String?

  // Response
  stdout          String?
  stderr          String?
  exitCode        Int?
  executionTime   Float?   // seconds
  memoryUsed      Int?     // bytes

  // Status
  status          ExecutionStatus
  errorMessage    String?

  createdAt       DateTime @default(now())

  @@index([userId, createdAt])
  @@map("execution_log")
}

enum ExecutionStatus {
  SUCCESS
  COMPILATION_ERROR
  RUNTIME_ERROR
  TIMEOUT
  MEMORY_LIMIT
  SYSTEM_ERROR
}
```

---

## 4. Better Auth Configuration

### Package: `packages/auth/src/config.ts`

```typescript
// packages/auth/src/config.ts
import { createAccessControl } from "better-auth/plugins/access";

// Define custom permissions for the platform
export const accessControl = createAccessControl({
  // Test permissions
  test: ["create", "read", "update", "delete", "publish"],

  // Question permissions
  question: ["create", "read", "update", "delete"],

  // Drive permissions
  drive: ["create", "read", "update", "delete", "manage_registrations"],

  // Results permissions
  results: ["read", "export"],

  // College settings
  settings: ["read", "update"],
});

// Define roles with their permissions
export const roles = {
  // Super admin - platform owner
  superAdmin: accessControl.newRole({
    test: ["create", "read", "update", "delete", "publish"],
    question: ["create", "read", "update", "delete"],
    drive: ["create", "read", "update", "delete", "manage_registrations"],
    results: ["read", "export"],
    settings: ["read", "update"],
  }),

  // College admin - manages their college
  collegeAdmin: accessControl.newRole({
    test: ["create", "read", "update", "delete", "publish"],
    question: ["create", "read", "update", "delete"],
    drive: ["create", "read", "update", "delete", "manage_registrations"],
    results: ["read", "export"],
    settings: ["read", "update"],
  }),

  // Recruiter - view-only access to drive results
  recruiter: accessControl.newRole({
    drive: ["read"],
    results: ["read", "export"],
  }),

  // Student - can only take tests
  student: accessControl.newRole({
    test: ["read"],
    drive: ["read"],
    results: ["read"],
  }),
};

// Role hierarchy for display
export const roleHierarchy = {
  super_admin: { label: "Super Admin", level: 100 },
  owner: { label: "College Owner", level: 90 },
  admin: { label: "College Admin", level: 80 },
  recruiter: { label: "Recruiter", level: 50 },
  member: { label: "Student", level: 10 },
};
```

### API Auth Instance: `apps/api/src/lib/auth.ts`

```typescript
// apps/api/src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { prisma } from "./prisma";
import { accessControl, roles } from "@placementhub/auth";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Base URL for the API
  baseURL: process.env.API_URL,

  // Secret for signing tokens
  secret: process.env.BETTER_AUTH_SECRET,

  // Email + Password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      // Integrate with your email service
      console.log(`Password reset for ${user.email}: ${url}`);
      // await sendEmail(user.email, 'Password Reset', url);
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  // User fields configuration
  user: {
    additionalFields: {
      phone: { type: "string", required: false },
      rollNumber: { type: "string", required: false },
      department: { type: "string", required: false },
      graduationYear: { type: "number", required: false },
    },
  },

  // Plugins
  plugins: [
    // Organization plugin for multi-tenancy (Colleges)
    organization({
      // Custom role configuration
      ac: accessControl,
      roles: {
        owner: roles.collegeAdmin,
        admin: roles.collegeAdmin,
        member: roles.student,
        recruiter: roles.recruiter,
      },

      // Allow only super admins to create organizations (colleges)
      allowUserToCreateOrganization: async (user) => {
        // Check if user is super admin
        // This would be stored in user metadata or a separate table
        return false; // Disable by default, super admin creates via API
      },

      // Invitation email handler
      sendInvitationEmail: async ({ invitation, organization, inviter }) => {
        const inviteUrl = `${process.env.FRONTEND_URL}/invite/${invitation.id}`;
        console.log(`Invitation to ${invitation.email} for ${organization.name}: ${inviteUrl}`);
        // await sendEmail(invitation.email, 'Organization Invitation', inviteUrl);
      },
    }),
  ],

  // Callbacks for custom logic
  callbacks: {
    // Add college context to session
    session: async ({ session, user }) => {
      // Fetch user's active organization membership
      const membership = await prisma.member.findFirst({
        where: { userId: user.id },
        include: { organization: true },
      });

      return {
        ...session,
        user: {
          ...session.user,
          activeCollegeId: membership?.organizationId,
          activeCollegeName: membership?.organization.name,
          collegeRole: membership?.role,
        },
      };
    },
  },
});

// Type exports
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session["user"];
```

### Test Session Lock Middleware: `apps/api/src/middleware/test-session.middleware.ts`

```typescript
// apps/api/src/middleware/test-session.middleware.ts
import { Context, Next } from "hono";
import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";

/**
 * Middleware to enforce single-device test sessions
 *
 * When a student starts a test:
 * 1. Lock their session to that device
 * 2. Invalidate all other sessions
 * 3. Prevent new logins during test
 */
export async function testSessionLockMiddleware(c: Context, next: Next) {
  const session = c.get("session");

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Check if user has an active locked test session
  const lockedSession = await prisma.session.findFirst({
    where: {
      userId: session.user.id,
      isTestLocked: true,
      activeTestAttemptId: { not: null },
    },
  });

  // If there's a locked session and it's not this one, deny access
  if (lockedSession && lockedSession.id !== session.id) {
    return c.json({
      error: "Test in progress on another device",
      message: "You have an active test session on another device. Complete or submit the test to continue.",
    }, 403);
  }

  await next();
}

/**
 * Lock session to single device when starting a test
 */
export async function lockSessionForTest(
  userId: string,
  sessionId: string,
  testAttemptId: string
) {
  // First, revoke all other sessions for this user
  await prisma.session.updateMany({
    where: {
      userId,
      id: { not: sessionId },
    },
    data: {
      expiresAt: new Date(), // Expire immediately
    },
  });

  // Then lock the current session
  await prisma.session.update({
    where: { id: sessionId },
    data: {
      isTestLocked: true,
      activeTestAttemptId: testAttemptId,
    },
  });
}

/**
 * Unlock session after test completion
 */
export async function unlockSessionAfterTest(sessionId: string) {
  await prisma.session.update({
    where: { id: sessionId },
    data: {
      isTestLocked: false,
      activeTestAttemptId: null,
    },
  });
}
```

### Frontend Auth Client: `apps/web/lib/auth-client.ts`

```typescript
// apps/web/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  plugins: [
    organizationClient(),
  ],
});

// Export hooks and utilities
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  organization,
} = authClient;

// Type for extended session
export type ExtendedSession = {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string;
    activeCollegeId?: string;
    activeCollegeName?: string;
    collegeRole?: string;
  };
};
```

---

## 5. Vercel Deployment Strategy

### Architecture Decision: Two Separate Vercel Projects

```
┌─────────────────────────────────────────────────────────────────┐
│                      VERCEL PLATFORM                            │
├─────────────────────────────┬───────────────────────────────────┤
│   PROJECT 1: WEB            │   PROJECT 2: API                  │
│   (placementhub-web)        │   (placementhub-api)              │
├─────────────────────────────┼───────────────────────────────────┤
│   Source: apps/web          │   Source: apps/api                │
│   Framework: Next.js        │   Framework: Other (Hono)         │
│   Domain: app.placementhub  │   Domain: api.placementhub        │
│                             │                                   │
│   Contains:                 │   Contains:                       │
│   - SSR Pages               │   - All API routes                │
│   - React Components        │   - Better Auth server            │
│   - /api/auth/* (proxy)     │   - Business logic                │
│   - Static assets           │   - Piston integration            │
└─────────────────────────────┴───────────────────────────────────┘
```

### Why Separate Projects?

| Aspect | Benefit |
|--------|---------|
| **Independent Scaling** | API can scale independently during peak test times |
| **Independent Deployments** | Deploy API fixes without redeploying frontend |
| **Clearer Boundaries** | Forces proper API contracts |
| **Different Runtimes** | Optimize each for their use case |
| **Cost Optimization** | Pay for what you use per project |

### Project 1: Web (Next.js Frontend)

**vercel.json**: `apps/web/vercel.json`
```json
{
  "framework": "nextjs",
  "buildCommand": "cd ../.. && pnpm turbo build --filter=web",
  "installCommand": "cd ../.. && pnpm install",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api_url"
  },
  "rewrites": [
    {
      "source": "/api/auth/:path*",
      "destination": "https://api.placementhub.com/auth/:path*"
    }
  ]
}
```

**next.config.js**: `apps/web/next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@placementhub/shared-types",
    "@placementhub/utils",
    "@placementhub/auth",
  ],

  async rewrites() {
    return [
      // Proxy auth requests to API
      {
        source: '/api/auth/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/auth/:path*`,
      },
    ];
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Project 2: API (Hono on Vercel Functions)

**vercel.json**: `apps/api/vercel.json`
```json
{
  "version": 2,
  "framework": null,
  "buildCommand": "cd ../.. && pnpm turbo build --filter=api",
  "installCommand": "cd ../.. && pnpm install",
  "outputDirectory": "dist",
  "functions": {
    "api/index.ts": {
      "runtime": "nodejs20.x",
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/api/index.ts"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "DIRECT_URL": "@direct_url",
    "BETTER_AUTH_SECRET": "@better_auth_secret",
    "PISTON_URL": "@piston_url"
  }
}
```

**API Entry Point**: `apps/api/api/index.ts`
```typescript
// apps/api/api/index.ts
import { handle } from "hono/vercel";
import { app } from "../src/index";

// Export for Vercel
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
export const OPTIONS = handle(app);
```

**Main Hono App**: `apps/api/src/index.ts`
```typescript
// apps/api/src/index.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./lib/auth";
import { authRoutes } from "./routes/auth.routes";
import { testRoutes } from "./routes/test.routes";
import { questionRoutes } from "./routes/question.routes";
import { driveRoutes } from "./routes/drive.routes";
import { executionRoutes } from "./routes/execution.routes";
import { submissionRoutes } from "./routes/submission.routes";
import { collegeRoutes } from "./routes/college.routes";

const app = new Hono();

// Global middleware
app.use("*", logger());
app.use("*", cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Better Auth handler
app.on(["GET", "POST"], "/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// API routes
app.route("/api/colleges", collegeRoutes);
app.route("/api/tests", testRoutes);
app.route("/api/questions", questionRoutes);
app.route("/api/drives", driveRoutes);
app.route("/api/execute", executionRoutes);
app.route("/api/submissions", submissionRoutes);

export { app };
```

### Environment Variables Setup

**Development** (`.env.local`):
```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# apps/api/.env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/placementhub"
DIRECT_URL="postgresql://postgres:password@localhost:5432/placementhub"
BETTER_AUTH_SECRET="your-32-character-secret-here"
BETTER_AUTH_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"
PISTON_URL="http://localhost:2000"
```

**Vercel Environment Variables** (via Dashboard or CLI):
```bash
# Project: placementhub-web
vercel env add NEXT_PUBLIC_API_URL production
# Value: https://api.placementhub.com

# Project: placementhub-api
vercel env add DATABASE_URL production
# Value: your-supabase-connection-string

vercel env add BETTER_AUTH_SECRET production
# Value: openssl rand -base64 32
```

### Monorepo Configuration

**turbo.json** (root):
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "type-check": {
      "dependsOn": ["^build"]
    },
    "db:generate": {
      "cache": false
    },
    "db:push": {
      "cache": false
    }
  }
}
```

**pnpm-workspace.yaml** (root):
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**Root package.json**:
```json
{
  "name": "placementhub",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "type-check": "turbo type-check",
    "db:generate": "turbo db:generate",
    "db:push": "turbo db:push",
    "db:studio": "pnpm --filter database db:studio"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.0.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

---

## 6. Piston Integration

### Self-Hosted vs API Decision Matrix

| Factor | Self-Hosted | Public API |
|--------|-------------|------------|
| **Cost** | Server costs (~$20-50/mo for small scale) | Free (rate limited) |
| **Rate Limit** | Unlimited | 5 req/sec |
| **Latency** | Lower (same region) | Variable |
| **Control** | Full (languages, limits) | None |
| **Maintenance** | Required | None |
| **Recommendation** | Production | Development/Testing |

### Recommended: Self-Hosted on Render/Railway/DigitalOcean

Since Vercel Functions cannot run Docker (needed for Piston), you need a separate service.

### Piston Client Package: `packages/piston-client/src/client.ts`

```typescript
// packages/piston-client/src/client.ts

export interface ExecuteRequest {
  language: string;
  version: string;
  code: string;
  stdin?: string;
  args?: string[];
  compileTimeout?: number;
  runTimeout?: number;
  compileMemoryLimit?: number;
  runMemoryLimit?: number;
}

export interface ExecuteResponse {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
  compile?: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
}

export interface Runtime {
  language: string;
  version: string;
  aliases: string[];
  runtime?: string;
}

export class PistonClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.PISTON_URL || "https://emkc.org/api/v2/piston";
  }

  /**
   * Get available runtimes
   */
  async getRuntimes(): Promise<Runtime[]> {
    const response = await fetch(`${this.baseUrl}/runtimes`);
    if (!response.ok) {
      throw new Error(`Failed to fetch runtimes: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Execute code
   */
  async execute(request: ExecuteRequest): Promise<ExecuteResponse> {
    const payload = {
      language: request.language,
      version: request.version,
      files: [
        {
          name: this.getFileName(request.language),
          content: request.code,
        },
      ],
      stdin: request.stdin || "",
      args: request.args || [],
      compile_timeout: request.compileTimeout || 10000,
      run_timeout: request.runTimeout || 3000,
      compile_memory_limit: request.compileMemoryLimit || -1,
      run_memory_limit: request.runMemoryLimit || -1,
    };

    const response = await fetch(`${this.baseUrl}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Execution failed: ${error}`);
    }

    return response.json();
  }

  /**
   * Execute code against test cases
   */
  async executeWithTestCases(
    request: Omit<ExecuteRequest, "stdin">,
    testCases: Array<{ input: string; expectedOutput: string; points: number }>
  ): Promise<{
    results: Array<{
      passed: boolean;
      input: string;
      expectedOutput: string;
      actualOutput: string;
      points: number;
      error?: string;
    }>;
    totalScore: number;
    maxScore: number;
  }> {
    const results = [];
    let totalScore = 0;
    let maxScore = 0;

    for (const testCase of testCases) {
      maxScore += testCase.points;

      try {
        const response = await this.execute({
          ...request,
          stdin: testCase.input,
        });

        const actualOutput = response.run.stdout.trim();
        const expectedOutput = testCase.expectedOutput.trim();
        const passed = actualOutput === expectedOutput;

        if (passed) {
          totalScore += testCase.points;
        }

        results.push({
          passed,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput,
          points: passed ? testCase.points : 0,
          error: response.run.stderr || undefined,
        });
      } catch (error) {
        results.push({
          passed: false,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: "",
          points: 0,
          error: error instanceof Error ? error.message : "Execution failed",
        });
      }
    }

    return { results, totalScore, maxScore };
  }

  private getFileName(language: string): string {
    const extensions: Record<string, string> = {
      python: "main.py",
      java: "Main.java",
      cpp: "main.cpp",
      c: "main.c",
      javascript: "main.js",
      typescript: "main.ts",
    };
    return extensions[language] || "main.txt";
  }
}

// Singleton instance
let pistonClient: PistonClient | null = null;

export function getPistonClient(): PistonClient {
  if (!pistonClient) {
    pistonClient = new PistonClient();
  }
  return pistonClient;
}
```

### Language Configuration: `packages/piston-client/src/languages.ts`

```typescript
// packages/piston-client/src/languages.ts

export interface LanguageConfig {
  id: string;
  name: string;
  version: string;
  monacoId: string;      // For Monaco Editor
  fileExtension: string;
  starterCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    id: "python",
    name: "Python",
    version: "3.10.0",
    monacoId: "python",
    fileExtension: "py",
    starterCode: `# Write your solution here
def solution():
    pass

# Read input
if __name__ == "__main__":
    solution()
`,
  },
  {
    id: "java",
    name: "Java",
    version: "15.0.2",
    monacoId: "java",
    fileExtension: "java",
    starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // Write your solution here

    }
}
`,
  },
  {
    id: "cpp",
    name: "C++",
    version: "10.2.0",
    monacoId: "cpp",
    fileExtension: "cpp",
    starterCode: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    // Write your solution here

    return 0;
}
`,
  },
  {
    id: "c",
    name: "C",
    version: "10.2.0",
    monacoId: "c",
    fileExtension: "c",
    starterCode: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Write your solution here

    return 0;
}
`,
  },
];

export function getLanguageConfig(languageId: string): LanguageConfig | undefined {
  return SUPPORTED_LANGUAGES.find((lang) => lang.id === languageId);
}

export function getLanguageVersion(languageId: string): string {
  const config = getLanguageConfig(languageId);
  return config?.version || "*";
}
```

### Execution Service: `apps/api/src/services/execution/executor.service.ts`

```typescript
// apps/api/src/services/execution/executor.service.ts
import { getPistonClient, getLanguageVersion } from "@placementhub/piston-client";
import { prisma } from "../../lib/prisma";
import { ExecutionStatus } from "@prisma/client";

interface ExecuteCodeParams {
  userId: string;
  code: string;
  language: string;
  stdin?: string;
  submissionId?: string;
}

interface ExecuteWithTestCasesParams extends Omit<ExecuteCodeParams, "stdin"> {
  testCases: Array<{
    input: string;
    expectedOutput: string;
    isHidden: boolean;
    points: number;
  }>;
}

export class ExecutorService {
  private piston = getPistonClient();

  /**
   * Execute code without test cases (for "Run" button)
   */
  async executeCode({ userId, code, language, stdin, submissionId }: ExecuteCodeParams) {
    const startTime = Date.now();

    try {
      const result = await this.piston.execute({
        language,
        version: getLanguageVersion(language),
        code,
        stdin,
        runTimeout: 5000, // 5 seconds for practice runs
      });

      // Log execution
      await this.logExecution({
        userId,
        submissionId,
        language,
        code,
        stdin,
        stdout: result.run.stdout,
        stderr: result.run.stderr,
        exitCode: result.run.code,
        executionTime: (Date.now() - startTime) / 1000,
        status: result.run.code === 0 ? "SUCCESS" : "RUNTIME_ERROR",
      });

      return {
        success: result.run.code === 0,
        stdout: result.run.stdout,
        stderr: result.run.stderr,
        exitCode: result.run.code,
        executionTime: (Date.now() - startTime) / 1000,
      };
    } catch (error) {
      await this.logExecution({
        userId,
        submissionId,
        language,
        code,
        stdin,
        status: "SYSTEM_ERROR",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });

      throw error;
    }
  }

  /**
   * Execute code against test cases (for submission grading)
   */
  async executeWithTestCases({
    userId,
    code,
    language,
    testCases,
    submissionId,
  }: ExecuteWithTestCasesParams) {
    const results = await this.piston.executeWithTestCases(
      {
        language,
        version: getLanguageVersion(language),
        code,
        runTimeout: 3000, // 3 seconds per test case
      },
      testCases.map((tc) => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        points: tc.points,
      }))
    );

    // Return results, hiding input/output for hidden test cases
    return {
      results: results.results.map((r, i) => ({
        passed: r.passed,
        points: r.points,
        // Only show details for visible test cases
        ...(testCases[i].isHidden
          ? {}
          : {
              input: r.input,
              expectedOutput: r.expectedOutput,
              actualOutput: r.actualOutput,
              error: r.error,
            }),
      })),
      totalScore: results.totalScore,
      maxScore: results.maxScore,
      percentage: (results.totalScore / results.maxScore) * 100,
    };
  }

  private async logExecution(data: {
    userId: string;
    submissionId?: string;
    language: string;
    code: string;
    stdin?: string;
    stdout?: string;
    stderr?: string;
    exitCode?: number;
    executionTime?: number;
    memoryUsed?: number;
    status: ExecutionStatus | string;
    errorMessage?: string;
  }) {
    await prisma.executionLog.create({
      data: {
        userId: data.userId,
        submissionId: data.submissionId,
        language: data.language,
        code: data.code,
        stdin: data.stdin,
        stdout: data.stdout,
        stderr: data.stderr,
        exitCode: data.exitCode,
        executionTime: data.executionTime,
        memoryUsed: data.memoryUsed,
        status: data.status as ExecutionStatus,
        errorMessage: data.errorMessage,
      },
    });
  }
}

export const executorService = new ExecutorService();
```

### Docker Compose for Local Piston: `infrastructure/docker/docker-compose.piston.yml`

```yaml
# infrastructure/docker/docker-compose.piston.yml
version: "3.8"

services:
  piston:
    image: ghcr.io/engineer-man/piston
    container_name: piston
    privileged: true
    restart: unless-stopped
    ports:
      - "2000:2000"
    volumes:
      - piston_packages:/piston/packages
    environment:
      - PISTON_LIMIT_OUTPUT=65536
      - PISTON_LIMIT_TIMEOUT=10000
      - PISTON_LIMIT_MEMORY=536870912  # 512MB
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:2000/api/v2/runtimes"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  piston_packages:
```

### Concurrent Submission Handling

For handling concurrent submissions at scale, implement a queue system.

**Using BullMQ (Redis-backed)**: `apps/api/src/services/execution/queue.service.ts`

```typescript
// apps/api/src/services/execution/queue.service.ts
// Note: This is for future scaling. For 2 colleges, direct execution is fine.

import { Queue, Worker, Job } from "bullmq";
import { executorService } from "./executor.service";
import { prisma } from "../../lib/prisma";

const QUEUE_NAME = "code-execution";

// Create queue
export const executionQueue = new Queue(QUEUE_NAME, {
  connection: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Job payload type
interface ExecutionJob {
  submissionId: string;
  userId: string;
  questionId: string;
  code: string;
  language: string;
}

// Add job to queue
export async function queueExecution(data: ExecutionJob) {
  const job = await executionQueue.add("execute", data, {
    priority: 1, // Can prioritize certain executions
  });
  return job.id;
}

// Worker to process jobs
export function startExecutionWorker() {
  const worker = new Worker<ExecutionJob>(
    QUEUE_NAME,
    async (job: Job<ExecutionJob>) => {
      const { submissionId, userId, questionId, code, language } = job.data;

      // Fetch question test cases
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        select: { testCases: true },
      });

      if (!question?.testCases) {
        throw new Error("Question not found or has no test cases");
      }

      const testCases = question.testCases as Array<{
        input: string;
        expectedOutput: string;
        isHidden: boolean;
        points: number;
      }>;

      // Execute
      const results = await executorService.executeWithTestCases({
        userId,
        code,
        language,
        testCases,
        submissionId,
      });

      // Update submission with results
      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          executionResults: results,
          isCorrect: results.percentage === 100,
          score: results.totalScore,
          gradedAt: new Date(),
        },
      });

      return results;
    },
    {
      connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
      },
      concurrency: 5, // Process 5 jobs concurrently
    }
  );

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
  });

  return worker;
}
```

---

## 7. Data Flow Diagrams

### Flow 1: Student Taking a Test

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     STUDENT TAKES A TEST                                  │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Student │────▶│   Next.js   │────▶│   API       │────▶│  Database   │
│ Browser │     │   Frontend  │     │   Server    │     │  (Supabase) │
└─────────┘     └─────────────┘     └─────────────┘     └─────────────┘

Step-by-Step Flow:

1. START TEST
   Student ──▶ Click "Start Test"
         └──▶ Frontend: POST /api/tests/:id/start
                  └──▶ API: Validate eligibility
                       │   - Check registration
                       │   - Check time window
                       │   - Check no existing attempt
                       └──▶ DB: Create TestAttempt
                            │   - status: IN_PROGRESS
                            │   - startedAt: now()
                            │   - endTime: now() + duration
                            └──▶ API: Lock session (single device)
                                 └──▶ Return: questions + attemptId

2. LOAD TEST ENVIRONMENT
   Frontend ──▶ Enter fullscreen mode
            └──▶ Start timer
            └──▶ Initialize proctoring (if enabled)
            └──▶ Render questions

3. ANSWER MCQ
   Student ──▶ Select option
         └──▶ Frontend: POST /api/submissions
                  └──▶ API: Validate attempt is active
                       └──▶ DB: Upsert Submission
                            │   - selectedOption: optionId
                            │   - submittedAt: now()
                            └──▶ Return: success

4. ANSWER CODING QUESTION
   Student ──▶ Write code
         └──▶ Click "Run" (test with custom input)
                  └──▶ Frontend: POST /api/execute
                       └──▶ API: Execute on Piston
                            └──▶ Return: stdout/stderr

   Student ──▶ Click "Submit"
         └──▶ Frontend: POST /api/submissions/:id/submit
                  └──▶ API: Save code
                       └──▶ DB: Update Submission
                       └──▶ API: Queue for grading
                            └──▶ Piston: Run against test cases
                                 └──▶ DB: Update with results

5. SUBMIT TEST
   Student ──▶ Click "Submit Test" OR Timer expires
         └──▶ Frontend: POST /api/tests/:attemptId/submit
                  └──▶ API: Calculate final score
                       │   - Grade all MCQs
                       │   - Sum coding scores
                       └──▶ DB: Update TestAttempt
                            │   - status: SUBMITTED
                            │   - totalScore
                            │   - percentage
                            │   - passed
                            └──▶ API: Unlock session
                                 └──▶ Return: results (if showResults)
```

### Flow 2: Code Submission and Execution

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    CODE SUBMISSION & EXECUTION                            │
└──────────────────────────────────────────────────────────────────────────┘

                                    ┌─────────────────┐
                                    │  Redis Queue    │
                                    │  (for scaling)  │
                                    └────────┬────────┘
                                             │
┌─────────┐     ┌───────────┐     ┌──────────┴─────────┐     ┌─────────┐
│ Student │────▶│   API     │────▶│  Execution Service │────▶│ Piston  │
└─────────┘     └───────────┘     └────────────────────┘     └─────────┘

Detailed Execution Flow:

1. CODE SUBMISSION
   ┌─────────────────────────────────────────────────────────────┐
   │ POST /api/submissions/:id/submit                            │
   │ Body: { code: "...", language: "python" }                   │
   └─────────────────────────────────────────────────────────────┘
                              │
                              ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ API Validation                                              │
   │ - Verify test attempt is active                             │
   │ - Verify question exists                                    │
   │ - Verify language is allowed                                │
   │ - Check submission limit (if any)                           │
   └─────────────────────────────────────────────────────────────┘
                              │
                              ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ Save Submission                                             │
   │ - Store code in Submission table                            │
   │ - Set status to PENDING                                     │
   └─────────────────────────────────────────────────────────────┘
                              │
                              ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ Execution Service                                           │
   │                                                             │
   │ For each test case:                                         │
   │   ┌─────────────────────────────────────────────────────┐  │
   │   │ POST to Piston /execute                             │  │
   │   │ {                                                   │  │
   │   │   language: "python",                               │  │
   │   │   version: "3.10.0",                                │  │
   │   │   files: [{ content: code }],                       │  │
   │   │   stdin: testCase.input,                            │  │
   │   │   run_timeout: 3000                                 │  │
   │   │ }                                                   │  │
   │   └─────────────────────────────────────────────────────┘  │
   │                              │                              │
   │                              ▼                              │
   │   ┌─────────────────────────────────────────────────────┐  │
   │   │ Compare Output                                      │  │
   │   │ actualOutput.trim() === expectedOutput.trim()       │  │
   │   │ → passed: true/false                                │  │
   │   │ → points: earned/0                                  │  │
   │   └─────────────────────────────────────────────────────┘  │
   └─────────────────────────────────────────────────────────────┘
                              │
                              ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ Store Results                                               │
   │ - Update Submission with executionResults                   │
   │ - Calculate score                                           │
   │ - Log execution metrics                                     │
   └─────────────────────────────────────────────────────────────┘
                              │
                              ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ Response to Client                                          │
   │ {                                                           │
   │   "results": [                                              │
   │     { "passed": true, "input": "5", "expected": "25" },     │
   │     { "passed": true },  // Hidden test case                │
   │     { "passed": false, "error": "Time Limit Exceeded" }     │
   │   ],                                                        │
   │   "totalScore": 20,                                         │
   │   "maxScore": 30,                                           │
   │   "percentage": 66.67                                       │
   │ }                                                           │
   └─────────────────────────────────────────────────────────────┘
```

### Flow 3: Test Creation by Admin

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     ADMIN CREATES A TEST                                  │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Admin  │────▶│   Next.js   │────▶│   API       │────▶│  Database   │
│ Browser │     │   Dashboard │     │   Server    │     │  (Supabase) │
└─────────┘     └─────────────┘     └─────────────┘     └─────────────┘

Step-by-Step Flow:

1. CREATE TEST
   Admin ──▶ Navigate to Tests → Create New
        └──▶ Frontend: Form with title, duration, settings
             └──▶ POST /api/tests
                  │   Body: {
                  │     title: "Campus Placement Round 1",
                  │     duration: 60,
                  │     passingScore: 50,
                  │     ...settings
                  │   }
                  └──▶ API: Validate admin permissions
                       │   - Check collegeRole === 'admin' || 'owner'
                       │   - Check collegeId matches
                       └──▶ DB: Create Test
                            │   - status: DRAFT
                            │   - creatorId: adminId
                            │   - collegeId: admin's college
                            └──▶ Return: testId

2. ADD QUESTIONS
   Admin ──▶ Click "Add Question"
        └──▶ Choose: "Create New" or "From Question Bank"

   2a. Create New MCQ:
       ──▶ Frontend: MCQ form
            └──▶ POST /api/questions
                 │   Body: {
                 │     type: "MCQ",
                 │     title: "What is OOP?",
                 │     content: "...",
                 │     options: [
                 │       { id: "a", text: "...", isCorrect: false },
                 │       { id: "b", text: "...", isCorrect: true },
                 │     ],
                 │     marks: 2
                 │   }
                 └──▶ DB: Create Question
                      └──▶ POST /api/tests/:id/questions
                           │   Body: { questionId, order: 1 }
                           └──▶ DB: Create TestQuestion junction

   2b. Create New Coding Question:
       ──▶ Frontend: Coding question form
            └──▶ POST /api/questions
                 │   Body: {
                 │     type: "CODING",
                 │     title: "Two Sum",
                 │     content: "Given an array...",
                 │     starterCode: { python: "...", java: "..." },
                 │     testCases: [
                 │       { input: "1 2 3\n5", expectedOutput: "0 2", isHidden: false, points: 5 },
                 │       { input: "...", expectedOutput: "...", isHidden: true, points: 10 },
                 │     ],
                 │     timeLimit: 2,
                 │     memoryLimit: 256
                 │   }
                 └──▶ DB: Create Question + TestQuestion

   2c. From Question Bank:
       ──▶ GET /api/questions?collegeId=xxx
            └──▶ Select existing questions
                 └──▶ POST /api/tests/:id/questions
                      │   Body: { questionIds: [...], orders: [...] }
                      └──▶ DB: Create TestQuestion junctions

3. CONFIGURE SETTINGS
   Admin ──▶ Update proctoring, shuffle, result visibility
        └──▶ PUT /api/tests/:id
             └──▶ DB: Update Test settings

4. PREVIEW TEST
   Admin ──▶ Click "Preview"
        └──▶ Frontend: Render test in preview mode
             │   - All questions visible
             │   - Timer disabled
             │   - Can't submit

5. PUBLISH TEST
   Admin ──▶ Click "Publish"
        └──▶ POST /api/tests/:id/publish
             └──▶ API: Validation
                  │   - At least 1 question
                  │   - Total marks > 0
                  │   - Valid duration
                  └──▶ DB: Update Test
                       │   - status: PUBLISHED
                       │   - publishedAt: now()
                       └──▶ Return: success

6. ASSIGN TO DRIVE
   Admin ──▶ Navigate to Drives → Select Drive
        └──▶ POST /api/drives/:driveId/tests
             │   Body: { testId, order: 1, isMandatory: true }
             └──▶ DB: Create DriveTest junction
```

---

## 8. Scalability Considerations

### Current Scale (2 Colleges)

For 2 colleges with moderate usage:

| Component | Approach |
|-----------|----------|
| API | Single Vercel project, standard functions |
| Database | Supabase Free/Pro tier |
| Piston | Single self-hosted instance |
| Redis | Not needed initially |

### Future Scale (10+ Colleges, 1000+ concurrent users)

| Component | Scaling Approach |
|-----------|------------------|
| API | Multiple Vercel projects by service |
| Database | Supabase Pro with read replicas |
| Piston | Kubernetes cluster with auto-scaling |
| Queue | Redis + BullMQ for execution jobs |
| Cache | Redis for session/test caching |
| CDN | Vercel Edge for static content |

### Bottleneck Analysis

```
Potential Bottlenecks & Solutions:

1. CODE EXECUTION (Most Critical)
   ┌─────────────────────────────────────────────────────────────┐
   │ Problem: Piston is single-threaded per request              │
   │                                                             │
   │ Solution: Horizontal scaling                                │
   │ - Multiple Piston containers behind load balancer           │
   │ - Queue-based processing with BullMQ                        │
   │ - Separate "Run" vs "Submit" queues with different          │
   │   priorities                                                │
   └─────────────────────────────────────────────────────────────┘

2. DATABASE CONNECTIONS
   ┌─────────────────────────────────────────────────────────────┐
   │ Problem: Vercel Functions = many cold starts = many         │
   │          connections                                        │
   │                                                             │
   │ Solution: Connection pooling                                │
   │ - Use Supabase's built-in pooler (Supavisor)               │
   │ - Configure Prisma for serverless                           │
   │   datasource db {                                           │
   │     url = env("DATABASE_URL")      // Pooled               │
   │     directUrl = env("DIRECT_URL")  // Direct for migrations│
   │   }                                                         │
   └─────────────────────────────────────────────────────────────┘

3. REAL-TIME UPDATES
   ┌─────────────────────────────────────────────────────────────┐
   │ Problem: Live leaderboards, proctoring alerts               │
   │                                                             │
   │ Solution: Supabase Realtime                                 │
   │ - Subscribe to TestAttempt changes                          │
   │ - Broadcast proctoring events                               │
   │ - No additional infrastructure needed                       │
   └─────────────────────────────────────────────────────────────┘

4. SESSION MANAGEMENT
   ┌─────────────────────────────────────────────────────────────┐
   │ Problem: Session validation on every request                │
   │                                                             │
   │ Solution: Better Auth cookie cache + Redis                  │
   │ - Enable cookieCache in Better Auth config                  │
   │ - Cache validated sessions in Redis                         │
   │ - 5-minute TTL for session cache                            │
   └─────────────────────────────────────────────────────────────┘
```

---

## 9. Security Considerations

### Authentication Security

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. BETTER AUTH BUILT-IN                                        │
│     ├── CSRF protection                                         │
│     ├── Secure session cookies (HttpOnly, SameSite)             │
│     ├── Password hashing (bcrypt)                               │
│     └── Rate limiting on auth endpoints                         │
│                                                                 │
│  2. API LAYER                                                   │
│     ├── CORS whitelist (frontend domain only)                   │
│     ├── Request validation (Zod schemas)                        │
│     ├── RBAC middleware on all routes                           │
│     └── Rate limiting per user/IP                               │
│                                                                 │
│  3. DATABASE LAYER                                              │
│     ├── Row Level Security (RLS) in Supabase                    │
│     ├── College-scoped queries                                  │
│     └── Prepared statements (Prisma)                            │
│                                                                 │
│  4. CODE EXECUTION                                              │
│     ├── Piston sandboxing (containers, namespaces)              │
│     ├── Resource limits (CPU, memory, time)                     │
│     ├── Network disabled                                        │
│     └── No persistent storage                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Test-Taking Security

```typescript
// Anti-cheat measures implemented:

1. Single Device Lock
   - On test start, lock session to current device
   - Invalidate all other sessions
   - Prevent new logins during test

2. Tab Switch Detection
   - Monitor visibility change events
   - Track switch count
   - Auto-submit on limit breach

3. Fullscreen Enforcement
   - Require fullscreen mode
   - Warn on exit
   - Log violations

4. Copy-Paste Restriction
   - Disable right-click
   - Intercept Ctrl+C/V in test area
   - Allow in code editor only

5. Time Integrity
   - Server-side timer (endTime stored in DB)
   - Auto-submit when endTime reached
   - No client-side timer manipulation
```

---

## 10. Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for Piston)
- Supabase account

### Initial Setup

```bash
# Clone repository
git clone https://github.com/your-org/placementhub.git
cd placementhub

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env
# Edit .env with your values

# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Start Piston (local)
docker-compose -f infrastructure/docker/docker-compose.piston.yml up -d

# Start development servers
pnpm dev
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy web (from apps/web)
cd apps/web
vercel --prod

# Deploy API (from apps/api)
cd ../api
vercel --prod

# Link environment variables in Vercel dashboard
```

---

## Summary

This architecture provides:

1. **Clear Separation**: Frontend and API are independently deployable
2. **Multi-tenancy**: College-based isolation using Better Auth organizations
3. **Scalable Execution**: Piston integration with queue support for growth
4. **Secure Testing**: Session locking, proctoring, and anti-cheat measures
5. **Type Safety**: Shared types across the entire monorepo
6. **Developer Experience**: Turborepo for fast builds, Prisma for type-safe DB access

Start with the basic setup for 2 colleges, then scale individual components as needed.
