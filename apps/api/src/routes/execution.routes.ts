import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware, getSession } from "../middleware/auth.middleware";
import { executionRateLimit } from "../middleware/rate-limit.middleware";
import { getPistonClient } from "../lib/piston";
import { prisma } from "../lib/prisma";
import {
  SUPPORTED_LANGUAGES,
  isLanguageSupported,
  getLanguageVersion,
} from "@placementhub/piston-client";
import { EXECUTION_LIMITS } from "@placementhub/utils";

export const executionRoutes = new Hono();

// Validation schemas
const executeSchema = z.object({
  language: z.string(),
  code: z.string().max(EXECUTION_LIMITS.MAX_CODE_SIZE),
  stdin: z.string().optional(),
});

const executeWithTestsSchema = z.object({
  language: z.string(),
  code: z.string().max(EXECUTION_LIMITS.MAX_CODE_SIZE),
  questionId: z.string(),
});

/**
 * Get supported languages
 */
executionRoutes.get("/languages", async (c) => {
  return c.json({
    success: true,
    data: SUPPORTED_LANGUAGES.map((lang) => ({
      id: lang.id,
      name: lang.name,
      version: lang.version,
      monacoId: lang.monacoId,
      fileExtension: lang.fileExtension,
    })),
  });
});

/**
 * Execute code (for "Run" button - custom input)
 */
executionRoutes.post(
  "/",
  authMiddleware,
  executionRateLimit,
  async (c) => {
    const body = await c.req.json();
    const validation = executeSchema.safeParse(body);

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

    const { language, code, stdin } = validation.data;

    // Validate language
    if (!isLanguageSupported(language)) {
      return c.json(
        {
          success: false,
          error: {
            code: "UNSUPPORTED_LANGUAGE",
            message: `Language "${language}" is not supported`,
          },
        },
        400
      );
    }

    const session = getSession(c);
    const piston = getPistonClient();

    try {
      const result = await piston.execute({
        language,
        version: getLanguageVersion(language),
        code,
        stdin,
        runTimeout: EXECUTION_LIMITS.DEFAULT_TIMEOUT,
      });

      // Log execution
      await prisma.executionLog.create({
        data: {
          userId: session!.user.id,
          language,
          code,
          stdin,
          stdout: result.stdout,
          stderr: result.stderr,
          exitCode: result.exitCode,
          executionTime: result.executionTime,
          status: result.success ? "SUCCESS" : "RUNTIME_ERROR",
        },
      });

      return c.json({
        success: true,
        data: {
          success: result.success,
          stdout: result.stdout,
          stderr: result.stderr,
          exitCode: result.exitCode,
          executionTime: result.executionTime,
          compile: result.compile,
        },
      });
    } catch (error) {
      console.error("[Execution] Error:", error);

      await prisma.executionLog.create({
        data: {
          userId: session!.user.id,
          language,
          code,
          stdin,
          status: "SYSTEM_ERROR",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        },
      });

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
 * Execute code against test cases (for submission validation)
 */
executionRoutes.post(
  "/validate",
  authMiddleware,
  executionRateLimit,
  async (c) => {
    const body = await c.req.json();
    const validation = executeWithTestsSchema.safeParse(body);

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

    const { language, code, questionId } = validation.data;

    // Validate language
    if (!isLanguageSupported(language)) {
      return c.json(
        {
          success: false,
          error: {
            code: "UNSUPPORTED_LANGUAGE",
            message: `Language "${language}" is not supported`,
          },
        },
        400
      );
    }

    // Get question with test cases
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        type: true,
        testCases: true,
        timeLimit: true,
        allowedLanguages: true,
      },
    });

    if (!question || question.type !== "CODING") {
      return c.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Coding question not found" },
        },
        404
      );
    }

    // Check if language is allowed for this question
    if (!question.allowedLanguages.includes(language)) {
      return c.json(
        {
          success: false,
          error: {
            code: "UNSUPPORTED_LANGUAGE",
            message: `Language "${language}" is not allowed for this question`,
          },
        },
        400
      );
    }

    const testCases = question.testCases as Array<{
      id: string;
      input: string;
      expectedOutput: string;
      isHidden: boolean;
      points: number;
    }>;

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

      // Return results, hiding details for hidden test cases
      return c.json({
        success: true,
        data: {
          results: results.results.map((r, i) => ({
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
      });
    } catch (error) {
      console.error("[Execution] Validation error:", error);
      return c.json(
        {
          success: false,
          error: {
            code: "EXECUTION_ERROR",
            message: "Failed to validate code",
          },
        },
        500
      );
    }
  }
);

/**
 * Check Piston health
 */
executionRoutes.get("/health", async (c) => {
  try {
    const piston = getPistonClient();
    const runtimes = await piston.getRuntimes();
    return c.json({
      success: true,
      data: {
        status: "healthy",
        runtimeCount: runtimes.length,
      },
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Piston service is unavailable",
        },
      },
      503
    );
  }
});
