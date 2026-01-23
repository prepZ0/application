import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware, getSession } from "../middleware/auth.middleware";
import { requireCollegeMembership } from "../middleware/rbac.middleware";
import { prisma } from "../lib/prisma";
import { getPistonClient } from "../lib/piston";
import { getLanguageVersion } from "@placementhub/piston-client";

export const submissionRoutes = new Hono();

// Validation schemas
const submitMcqSchema = z.object({
  questionId: z.string(),
  selectedOption: z.string(),
});

const submitCodeSchema = z.object({
  questionId: z.string(),
  code: z.string(),
  language: z.string(),
});

/**
 * Submit MCQ answer
 */
submissionRoutes.post(
  "/mcq",
  authMiddleware,
  requireCollegeMembership,
  async (c) => {
    const body = await c.req.json();
    const validation = submitMcqSchema.safeParse(body);

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

    const { questionId, selectedOption } = validation.data;
    const session = getSession(c);

    // Find active test attempt
    const attempt = await prisma.testAttempt.findFirst({
      where: {
        userId: session!.user.id,
        status: "IN_PROGRESS",
        endTime: { gt: new Date() },
      },
      include: {
        test: {
          include: {
            questions: {
              where: { questionId },
              include: { question: true },
            },
          },
        },
      },
    });

    if (!attempt) {
      return c.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "No active test attempt found" },
        },
        404
      );
    }

    const testQuestion = attempt.test.questions[0];
    if (!testQuestion || testQuestion.question.type !== "MCQ") {
      return c.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Question not found in this test" },
        },
        404
      );
    }

    const question = testQuestion.question;
    const options = question.options as Array<{ id: string; text: string; isCorrect: boolean }>;
    const selectedOpt = options.find((o) => o.id === selectedOption);
    const isCorrect = selectedOpt?.isCorrect ?? false;
    const marks = testQuestion.overrideMarks ?? question.marks;

    // Upsert submission
    const submission = await prisma.submission.upsert({
      where: {
        testAttemptId_questionId: {
          testAttemptId: attempt.id,
          questionId,
        },
      },
      create: {
        testAttemptId: attempt.id,
        questionId,
        selectedOption,
        isCorrect,
        score: isCorrect ? marks : 0,
        gradedAt: new Date(),
      },
      update: {
        selectedOption,
        isCorrect,
        score: isCorrect ? marks : 0,
        gradedAt: new Date(),
      },
    });

    return c.json({ success: true, data: submission });
  }
);

/**
 * Submit code (save without grading)
 */
submissionRoutes.post(
  "/code",
  authMiddleware,
  requireCollegeMembership,
  async (c) => {
    const body = await c.req.json();
    const validation = submitCodeSchema.safeParse(body);

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

    const { questionId, code, language } = validation.data;
    const session = getSession(c);

    // Find active test attempt
    const attempt = await prisma.testAttempt.findFirst({
      where: {
        userId: session!.user.id,
        status: "IN_PROGRESS",
        endTime: { gt: new Date() },
      },
      include: {
        test: {
          include: {
            questions: {
              where: { questionId },
              include: { question: true },
            },
          },
        },
      },
    });

    if (!attempt) {
      return c.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "No active test attempt found" },
        },
        404
      );
    }

    const testQuestion = attempt.test.questions[0];
    if (!testQuestion || testQuestion.question.type !== "CODING") {
      return c.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Coding question not found in this test" },
        },
        404
      );
    }

    // Save submission without grading
    const submission = await prisma.submission.upsert({
      where: {
        testAttemptId_questionId: {
          testAttemptId: attempt.id,
          questionId,
        },
      },
      create: {
        testAttemptId: attempt.id,
        questionId,
        code,
        language,
      },
      update: {
        code,
        language,
      },
    });

    return c.json({ success: true, data: submission });
  }
);

/**
 * Submit and grade code
 */
submissionRoutes.post(
  "/code/submit",
  authMiddleware,
  requireCollegeMembership,
  async (c) => {
    const body = await c.req.json();
    const validation = submitCodeSchema.safeParse(body);

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

    const { questionId, code, language } = validation.data;
    const session = getSession(c);

    // Find active test attempt
    const attempt = await prisma.testAttempt.findFirst({
      where: {
        userId: session!.user.id,
        status: "IN_PROGRESS",
        endTime: { gt: new Date() },
      },
      include: {
        test: {
          include: {
            questions: {
              where: { questionId },
              include: { question: true },
            },
          },
        },
      },
    });

    if (!attempt) {
      return c.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "No active test attempt found" },
        },
        404
      );
    }

    const testQuestion = attempt.test.questions[0];
    if (!testQuestion || testQuestion.question.type !== "CODING") {
      return c.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Coding question not found" },
        },
        404
      );
    }

    const question = testQuestion.question;
    const testCases = question.testCases as Array<{
      id: string;
      input: string;
      expectedOutput: string;
      isHidden: boolean;
      points: number;
    }>;

    // Execute against test cases
    const piston = getPistonClient();

    try {
      const results = await piston.executeWithTestCases(
        {
          language,
          version: getLanguageVersion(language),
          code,
          runTimeout: (question.timeLimit || 2) * 1000,
        },
        testCases
      );

      // Calculate score
      const marks = testQuestion.overrideMarks ?? question.marks;
      const score = (results.percentage / 100) * marks;
      const isCorrect = results.allPassed;

      // Save submission with results
      const submission = await prisma.submission.upsert({
        where: {
          testAttemptId_questionId: {
            testAttemptId: attempt.id,
            questionId,
          },
        },
        create: {
          testAttemptId: attempt.id,
          questionId,
          code,
          language,
          executionResults: results,
          isCorrect,
          score,
          gradedAt: new Date(),
        },
        update: {
          code,
          language,
          executionResults: results,
          isCorrect,
          score,
          gradedAt: new Date(),
        },
      });

      // Return results with hidden test cases masked
      return c.json({
        success: true,
        data: {
          submission,
          results: {
            testCases: results.results.map((r, i) => ({
              passed: r.passed,
              points: r.points,
              ...(testCases[i].isHidden
                ? { isHidden: true }
                : {
                    input: r.input,
                    expectedOutput: r.expectedOutput,
                    actualOutput: r.actualOutput,
                    error: r.error,
                  }),
            })),
            totalScore: results.totalScore,
            maxScore: results.maxScore,
            percentage: results.percentage,
            allPassed: results.allPassed,
          },
        },
      });
    } catch (error) {
      console.error("[Submission] Execution error:", error);
      return c.json(
        {
          success: false,
          error: {
            code: "EXECUTION_ERROR",
            message: "Failed to execute code",
          },
        },
        500
      );
    }
  }
);

/**
 * Get submissions for a test attempt
 */
submissionRoutes.get(
  "/attempt/:attemptId",
  authMiddleware,
  async (c) => {
    const { attemptId } = c.req.param();
    const session = getSession(c);

    const attempt = await prisma.testAttempt.findFirst({
      where: {
        id: attemptId,
        userId: session!.user.id,
      },
    });

    if (!attempt) {
      return c.json(
        { success: false, error: { code: "NOT_FOUND" } },
        404
      );
    }

    const submissions = await prisma.submission.findMany({
      where: { testAttemptId: attemptId },
      select: {
        id: true,
        questionId: true,
        selectedOption: true,
        code: true,
        language: true,
        isCorrect: true,
        score: true,
        submittedAt: true,
      },
    });

    return c.json({ success: true, data: submissions });
  }
);

/**
 * Get results for a completed test
 */
submissionRoutes.get(
  "/results/:attemptId",
  authMiddleware,
  async (c) => {
    const { attemptId } = c.req.param();
    const session = getSession(c);

    const attempt = await prisma.testAttempt.findFirst({
      where: {
        id: attemptId,
        userId: session!.user.id,
        status: { in: ["SUBMITTED", "AUTO_SUBMITTED", "GRADED"] },
      },
      include: {
        test: {
          select: {
            id: true,
            title: true,
            totalMarks: true,
            passingScore: true,
            showResults: true,
          },
        },
        submissions: {
          include: {
            question: {
              select: {
                id: true,
                title: true,
                type: true,
                marks: true,
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      return c.json(
        { success: false, error: { code: "NOT_FOUND" } },
        404
      );
    }

    if (!attempt.test.showResults) {
      return c.json({
        success: true,
        data: {
          attemptId: attempt.id,
          testId: attempt.testId,
          testTitle: attempt.test.title,
          status: attempt.status,
          message: "Results are not available for this test",
        },
      });
    }

    return c.json({
      success: true,
      data: {
        attemptId: attempt.id,
        testId: attempt.testId,
        testTitle: attempt.test.title,
        totalScore: attempt.totalScore,
        maxScore: attempt.test.totalMarks,
        percentage: attempt.percentage,
        passed: attempt.passed,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        questionResults: attempt.submissions.map((sub) => ({
          questionId: sub.questionId,
          questionTitle: sub.question.title,
          type: sub.question.type,
          score: sub.score,
          maxScore: sub.question.marks,
          isCorrect: sub.isCorrect,
        })),
      },
    });
  }
);
