import { Context, Next } from "hono";
import { prisma } from "../lib/prisma";
import { getSession } from "./auth.middleware";

/**
 * Test session lock middleware
 *
 * Enforces single-device test sessions:
 * - When a student starts a test, their session is locked to that device
 * - All other sessions are invalidated
 * - New logins are prevented during the test
 */
export async function testSessionLockMiddleware(c: Context, next: Next) {
  const session = getSession(c);

  if (!session) {
    return c.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      },
      401
    );
  }

  // Check if user has an active locked test session on another device
  const lockedSession = await prisma.session.findFirst({
    where: {
      userId: session.user.id,
      isTestLocked: true,
      activeTestAttemptId: { not: null },
      expiresAt: { gt: new Date() },
    },
  });

  // If there's a locked session and it's not this one, deny access
  if (lockedSession && lockedSession.id !== session.session.id) {
    return c.json(
      {
        success: false,
        error: {
          code: "TEST_LOCKED_ANOTHER_DEVICE",
          message:
            "You have an active test session on another device. Please complete or submit the test to continue.",
        },
      },
      403
    );
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
): Promise<void> {
  // First, expire all other sessions for this user
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
export async function unlockSessionAfterTest(sessionId: string): Promise<void> {
  await prisma.session.update({
    where: { id: sessionId },
    data: {
      isTestLocked: false,
      activeTestAttemptId: null,
    },
  });
}

/**
 * Check if user has an active test session
 */
export async function hasActiveTestSession(userId: string): Promise<{
  hasActive: boolean;
  testAttemptId?: string;
}> {
  const lockedSession = await prisma.session.findFirst({
    where: {
      userId,
      isTestLocked: true,
      activeTestAttemptId: { not: null },
      expiresAt: { gt: new Date() },
    },
    select: {
      activeTestAttemptId: true,
    },
  });

  return {
    hasActive: !!lockedSession,
    testAttemptId: lockedSession?.activeTestAttemptId ?? undefined,
  };
}
