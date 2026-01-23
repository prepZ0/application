import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware, getSession } from "../middleware/auth.middleware";
import {
  requirePermission,
  requireCollegeMembership,
  getCollegeId,
} from "../middleware/rbac.middleware";
import {
  testSessionLockMiddleware,
  lockSessionForTest,
  unlockSessionAfterTest,
} from "../middleware/test-session.middleware";
import { prisma } from "../lib/prisma";
import { addMinutes } from "@placementhub/utils";

export const testRoutes = new Hono();

// Validation schemas
const createTestSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  instructions: z.string().optional(),
  duration: z.number().min(5).max(240),
  passingScore: z.number().min(0).max(100).default(50),
  totalMarks: z.number().min(1).default(100),
  shuffleQuestions: z.boolean().default(false),
  showResults: z.boolean().default(true),
  enableProctoring: z.boolean().default(false),
  fullScreenRequired: z.boolean().default(true),
  tabSwitchLimit: z.number().min(0).max(10).default(3),
});

const updateTestSchema = createTestSchema.partial();

/**
 * List tests for current college
 */
testRoutes.get(
  "/",
  authMiddleware,
  requireCollegeMembership,
  async (c) => {
    const collegeId = getCollegeId(c);
    const { status, search } = c.req.query();

    const tests = await prisma.test.findMany({
      where: {
        collegeId,
        ...(status && { status: status as any }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      select: {
        id: true,
        title: true,
        description: true,
        duration: true,
        totalMarks: true,
        passingScore: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return c.json({ success: true, data: tests });
  }
);

/**
 * Get test by ID
 */
testRoutes.get(
  "/:id",
  authMiddleware,
  requireCollegeMembership,
  async (c) => {
    const { id } = c.req.param();
    const collegeId = getCollegeId(c);

    const test = await prisma.test.findFirst({
      where: { id, collegeId },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: {
            question: {
              select: {
                id: true,
                type: true,
                title: true,
                content: true,
                marks: true,
                difficulty: true,
                options: true,
                starterCode: true,
                constraints: true,
                allowedLanguages: true,
                timeLimit: true,
                memoryLimit: true,
                // Don't include testCases or solution for students
              },
            },
          },
        },
        creator: {
          select: { id: true, name: true },
        },
      },
    });

    if (!test) {
      return c.json(
        { success: false, error: { code: "NOT_FOUND", message: "Test not found" } },
        404
      );
    }

    return c.json({ success: true, data: test });
  }
);

/**
 * Create test
 */
testRoutes.post(
  "/",
  authMiddleware,
  requireCollegeMembership,
  requirePermission("test", "create"),
  async (c) => {
    const body = await c.req.json();
    const validation = createTestSchema.safeParse(body);

    if (!validation.success) {
      return c.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            details: validation.error.flatten().fieldErrors,
          },
        },
        400
      );
    }

    const session = getSession(c);
    const collegeId = getCollegeId(c);

    const test = await prisma.test.create({
      data: {
        ...validation.data,
        collegeId: collegeId!,
        creatorId: session!.user.id,
      },
    });

    return c.json({ success: true, data: test }, 201);
  }
);

/**
 * Update test
 */
testRoutes.put(
  "/:id",
  authMiddleware,
  requireCollegeMembership,
  requirePermission("test", "update"),
  async (c) => {
    const { id } = c.req.param();
    const collegeId = getCollegeId(c);

    const body = await c.req.json();
    const validation = updateTestSchema.safeParse(body);

    if (!validation.success) {
      return c.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            details: validation.error.flatten().fieldErrors,
          },
        },
        400
      );
    }

    // Verify test belongs to college
    const existing = await prisma.test.findFirst({
      where: { id, collegeId },
    });

    if (!existing) {
      return c.json(
        { success: false, error: { code: "NOT_FOUND" } },
        404
      );
    }

    const test = await prisma.test.update({
      where: { id },
      data: validation.data,
    });

    return c.json({ success: true, data: test });
  }
);

/**
 * Publish test
 */
testRoutes.post(
  "/:id/publish",
  authMiddleware,
  requireCollegeMembership,
  requirePermission("test", "publish"),
  async (c) => {
    const { id } = c.req.param();
    const collegeId = getCollegeId(c);

    const test = await prisma.test.findFirst({
      where: { id, collegeId },
      include: { _count: { select: { questions: true } } },
    });

    if (!test) {
      return c.json(
        { success: false, error: { code: "NOT_FOUND" } },
        404
      );
    }

    if (test._count.questions === 0) {
      return c.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Cannot publish test without questions",
          },
        },
        400
      );
    }

    const updated = await prisma.test.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    return c.json({ success: true, data: updated });
  }
);

/**
 * Add question to test
 */
testRoutes.post(
  "/:id/questions",
  authMiddleware,
  requireCollegeMembership,
  requirePermission("test", "update"),
  async (c) => {
    const { id } = c.req.param();
    const collegeId = getCollegeId(c);
    const body = await c.req.json();

    const { questionId, order, overrideMarks } = body;

    // Verify test and question belong to same college
    const [test, question] = await Promise.all([
      prisma.test.findFirst({ where: { id, collegeId } }),
      prisma.question.findFirst({ where: { id: questionId, collegeId } }),
    ]);

    if (!test || !question) {
      return c.json(
        { success: false, error: { code: "NOT_FOUND" } },
        404
      );
    }

    const testQuestion = await prisma.testQuestion.create({
      data: {
        testId: id,
        questionId,
        order: order ?? 0,
        overrideMarks,
      },
      include: {
        question: true,
      },
    });

    return c.json({ success: true, data: testQuestion }, 201);
  }
);

/**
 * Start test attempt
 */
testRoutes.post(
  "/:id/start",
  authMiddleware,
  requireCollegeMembership,
  testSessionLockMiddleware,
  async (c) => {
    const { id } = c.req.param();
    const session = getSession(c);
    const collegeId = getCollegeId(c);

    // Check test exists and is published
    const test = await prisma.test.findFirst({
      where: { id, collegeId, status: "PUBLISHED" },
    });

    if (!test) {
      return c.json(
        { success: false, error: { code: "NOT_FOUND", message: "Test not found or not available" } },
        404
      );
    }

    // Check if user already attempted this test
    const existingAttempt = await prisma.testAttempt.findUnique({
      where: {
        testId_userId: {
          testId: id,
          userId: session!.user.id,
        },
      },
    });

    if (existingAttempt) {
      if (existingAttempt.status === "IN_PROGRESS") {
        // Resume existing attempt
        return c.json({
          success: true,
          data: existingAttempt,
          message: "Resuming existing attempt",
        });
      }
      return c.json(
        {
          success: false,
          error: { code: "ALREADY_EXISTS", message: "You have already attempted this test" },
        },
        409
      );
    }

    // Create new attempt
    const now = new Date();
    const endTime = addMinutes(now, test.duration);

    const attempt = await prisma.testAttempt.create({
      data: {
        testId: id,
        userId: session!.user.id,
        startedAt: now,
        endTime,
        status: "IN_PROGRESS",
      },
    });

    // Lock session to this device
    await lockSessionForTest(session!.user.id, session!.session.id, attempt.id);

    return c.json({ success: true, data: attempt }, 201);
  }
);

/**
 * Submit test
 */
testRoutes.post(
  "/:id/submit",
  authMiddleware,
  requireCollegeMembership,
  async (c) => {
    const { id } = c.req.param();
    const session = getSession(c);

    const attempt = await prisma.testAttempt.findUnique({
      where: {
        testId_userId: {
          testId: id,
          userId: session!.user.id,
        },
      },
      include: {
        submissions: {
          include: {
            question: true,
          },
        },
        test: true,
      },
    });

    if (!attempt || attempt.status !== "IN_PROGRESS") {
      return c.json(
        { success: false, error: { code: "NOT_FOUND", message: "No active test attempt found" } },
        404
      );
    }

    // Calculate score
    let totalScore = 0;
    for (const submission of attempt.submissions) {
      if (submission.isCorrect) {
        totalScore += submission.score || 0;
      }
    }

    const percentage = (totalScore / attempt.test.totalMarks) * 100;
    const passed = percentage >= attempt.test.passingScore;

    // Update attempt
    const updated = await prisma.testAttempt.update({
      where: { id: attempt.id },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        totalScore,
        percentage,
        passed,
      },
    });

    // Unlock session
    await unlockSessionAfterTest(session!.session.id);

    return c.json({
      success: true,
      data: {
        ...updated,
        showResults: attempt.test.showResults,
      },
    });
  }
);

/**
 * Delete test
 */
testRoutes.delete(
  "/:id",
  authMiddleware,
  requireCollegeMembership,
  requirePermission("test", "delete"),
  async (c) => {
    const { id } = c.req.param();
    const collegeId = getCollegeId(c);

    const test = await prisma.test.findFirst({
      where: { id, collegeId },
    });

    if (!test) {
      return c.json(
        { success: false, error: { code: "NOT_FOUND" } },
        404
      );
    }

    await prisma.test.delete({ where: { id } });

    return c.json({ success: true, data: { deleted: true } });
  }
);
