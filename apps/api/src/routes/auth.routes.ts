import { Hono } from "hono";
import { authMiddleware, getSession } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";

/**
 * Auth routes
 *
 * Note: Most auth routes are handled by Better Auth automatically at /auth/*
 * These are additional custom auth-related endpoints
 */
export const authRoutes = new Hono();

/**
 * Get current user profile
 */
authRoutes.get("/me", authMiddleware, async (c) => {
  const session = getSession(c);

  if (!session) {
    return c.json({ success: false, error: { code: "UNAUTHORIZED" } }, 401);
  }

  // Fetch full user details
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      phone: true,
      rollNumber: true,
      department: true,
      graduationYear: true,
      createdAt: true,
      members: {
        select: {
          role: true,
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return c.json({ success: false, error: { code: "NOT_FOUND" } }, 404);
  }

  return c.json({
    success: true,
    data: {
      ...user,
      memberships: user.members.map((m) => ({
        role: m.role,
        college: m.organization,
      })),
    },
  });
});

/**
 * Update current user profile
 */
authRoutes.put("/me", authMiddleware, async (c) => {
  const session = getSession(c);

  if (!session) {
    return c.json({ success: false, error: { code: "UNAUTHORIZED" } }, 401);
  }

  const body = await c.req.json();
  const { name, phone, rollNumber, department, graduationYear, image } = body;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: name ?? undefined,
      phone: phone ?? undefined,
      rollNumber: rollNumber ?? undefined,
      department: department ?? undefined,
      graduationYear: graduationYear ?? undefined,
      image: image ?? undefined,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      rollNumber: true,
      department: true,
      graduationYear: true,
      image: true,
    },
  });

  return c.json({ success: true, data: user });
});

/**
 * Get active test session status
 */
authRoutes.get("/test-session", authMiddleware, async (c) => {
  const session = getSession(c);

  if (!session) {
    return c.json({ success: false, error: { code: "UNAUTHORIZED" } }, 401);
  }

  // Check for active test session
  const activeSession = await prisma.session.findFirst({
    where: {
      userId: session.user.id,
      isTestLocked: true,
      activeTestAttemptId: { not: null },
      expiresAt: { gt: new Date() },
    },
    select: {
      activeTestAttemptId: true,
    },
  });

  if (!activeSession?.activeTestAttemptId) {
    return c.json({
      success: true,
      data: { hasActiveTest: false },
    });
  }

  // Get test attempt details
  const attempt = await prisma.testAttempt.findUnique({
    where: { id: activeSession.activeTestAttemptId },
    select: {
      id: true,
      testId: true,
      startedAt: true,
      endTime: true,
      status: true,
      test: {
        select: {
          id: true,
          title: true,
          duration: true,
        },
      },
    },
  });

  return c.json({
    success: true,
    data: {
      hasActiveTest: true,
      attempt,
    },
  });
});
