import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware, getSession } from "../middleware/auth.middleware";
import {
  requirePermission,
  requireCollegeMembership,
  getCollegeId,
} from "../middleware/rbac.middleware";
import { prisma } from "../lib/prisma";

export const questionRoutes = new Hono();

// Validation schemas
const mcqOptionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1),
  isCorrect: z.boolean(),
});

const testCaseSchema = z.object({
  id: z.string().optional(),
  input: z.string(),
  expectedOutput: z.string(),
  isHidden: z.boolean().default(false),
  points: z.number().min(1).default(1),
});

const createMcqSchema = z.object({
  type: z.literal("MCQ"),
  title: z.string().min(3).max(200),
  content: z.string().min(10),
  marks: z.number().min(1).max(100).default(1),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  tags: z.array(z.string()).default([]),
  options: z.array(mcqOptionSchema).min(2).max(6),
});

const createCodingSchema = z.object({
  type: z.literal("CODING"),
  title: z.string().min(3).max(200),
  content: z.string().min(10),
  marks: z.number().min(1).max(100).default(10),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  tags: z.array(z.string()).default([]),
  starterCode: z.record(z.string()).optional(),
  solution: z.string().optional(),
  testCases: z.array(testCaseSchema).min(1).max(20),
  constraints: z.string().optional(),
  allowedLanguages: z.array(z.string()).default(["python", "java", "cpp", "c"]),
  timeLimit: z.number().min(1).max(30).default(2),
  memoryLimit: z.number().min(32).max(512).default(256),
});

const createQuestionSchema = z.discriminatedUnion("type", [
  createMcqSchema,
  createCodingSchema,
]);

/**
 * List questions for current college
 */
questionRoutes.get(
  "/",
  authMiddleware,
  requireCollegeMembership,
  async (c) => {
    const collegeId = getCollegeId(c);
    const { type, difficulty, search, tags } = c.req.query();

    const questions = await prisma.question.findMany({
      where: {
        collegeId,
        ...(type && { type: type as any }),
        ...(difficulty && { difficulty: difficulty as any }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
          ],
        }),
        ...(tags && { tags: { hasSome: tags.split(",") } }),
      },
      select: {
        id: true,
        type: true,
        title: true,
        marks: true,
        difficulty: true,
        tags: true,
        createdAt: true,
        creator: {
          select: { id: true, name: true },
        },
        _count: {
          select: { tests: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return c.json({ success: true, data: questions });
  }
);

/**
 * Get question by ID
 */
questionRoutes.get(
  "/:id",
  authMiddleware,
  requireCollegeMembership,
  async (c) => {
    const { id } = c.req.param();
    const collegeId = getCollegeId(c);
    const session = getSession(c);
    const userRole = (session?.session as any)?.activeOrganizationRole;

    const question = await prisma.question.findFirst({
      where: { id, collegeId },
      include: {
        creator: {
          select: { id: true, name: true },
        },
      },
    });

    if (!question) {
      return c.json(
        { success: false, error: { code: "NOT_FOUND" } },
        404
      );
    }

    // Hide solution and hidden test cases from students
    if (userRole === "member") {
      const { solution, testCases, ...safeQuestion } = question;
      const visibleTestCases = (testCases as any[])?.filter((tc) => !tc.isHidden) || [];
      return c.json({
        success: true,
        data: {
          ...safeQuestion,
          testCases: visibleTestCases,
        },
      });
    }

    return c.json({ success: true, data: question });
  }
);

/**
 * Create question
 */
questionRoutes.post(
  "/",
  authMiddleware,
  requireCollegeMembership,
  requirePermission("question", "create"),
  async (c) => {
    const body = await c.req.json();
    const validation = createQuestionSchema.safeParse(body);

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
    const data = validation.data;

    // Validate MCQ has at least one correct answer
    if (data.type === "MCQ") {
      const hasCorrect = data.options.some((opt) => opt.isCorrect);
      if (!hasCorrect) {
        return c.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "MCQ must have at least one correct option",
            },
          },
          400
        );
      }
    }

    const question = await prisma.question.create({
      data: {
        type: data.type,
        title: data.title,
        content: data.content,
        marks: data.marks,
        difficulty: data.difficulty,
        tags: data.tags,
        collegeId: collegeId!,
        creatorId: session!.user.id,
        ...(data.type === "MCQ" && {
          options: data.options.map((opt, idx) => ({
            id: opt.id || `opt_${idx}`,
            text: opt.text,
            isCorrect: opt.isCorrect,
          })),
        }),
        ...(data.type === "CODING" && {
          starterCode: data.starterCode,
          solution: data.solution,
          testCases: data.testCases.map((tc, idx) => ({
            id: tc.id || `tc_${idx}`,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: tc.isHidden,
            points: tc.points,
          })),
          constraints: data.constraints,
          allowedLanguages: data.allowedLanguages,
          timeLimit: data.timeLimit,
          memoryLimit: data.memoryLimit,
        }),
      },
    });

    return c.json({ success: true, data: question }, 201);
  }
);

/**
 * Update question
 */
questionRoutes.put(
  "/:id",
  authMiddleware,
  requireCollegeMembership,
  requirePermission("question", "update"),
  async (c) => {
    const { id } = c.req.param();
    const collegeId = getCollegeId(c);

    const existing = await prisma.question.findFirst({
      where: { id, collegeId },
    });

    if (!existing) {
      return c.json(
        { success: false, error: { code: "NOT_FOUND" } },
        404
      );
    }

    const body = await c.req.json();

    // Partial update - only update provided fields
    const question = await prisma.question.update({
      where: { id },
      data: {
        title: body.title,
        content: body.content,
        marks: body.marks,
        difficulty: body.difficulty,
        tags: body.tags,
        options: body.options,
        starterCode: body.starterCode,
        solution: body.solution,
        testCases: body.testCases,
        constraints: body.constraints,
        allowedLanguages: body.allowedLanguages,
        timeLimit: body.timeLimit,
        memoryLimit: body.memoryLimit,
      },
    });

    return c.json({ success: true, data: question });
  }
);

/**
 * Delete question
 */
questionRoutes.delete(
  "/:id",
  authMiddleware,
  requireCollegeMembership,
  requirePermission("question", "delete"),
  async (c) => {
    const { id } = c.req.param();
    const collegeId = getCollegeId(c);

    const question = await prisma.question.findFirst({
      where: { id, collegeId },
      include: { _count: { select: { tests: true } } },
    });

    if (!question) {
      return c.json(
        { success: false, error: { code: "NOT_FOUND" } },
        404
      );
    }

    if (question._count.tests > 0) {
      return c.json(
        {
          success: false,
          error: {
            code: "CONFLICT",
            message: "Cannot delete question that is used in tests",
          },
        },
        409
      );
    }

    await prisma.question.delete({ where: { id } });

    return c.json({ success: true, data: { deleted: true } });
  }
);
