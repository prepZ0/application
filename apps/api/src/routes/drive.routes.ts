import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware, getSession } from "../middleware/auth.middleware";
import {
  requirePermission,
  requireCollegeMembership,
  getCollegeId,
} from "../middleware/rbac.middleware";
import { prisma } from "../lib/prisma";

export const driveRoutes = new Hono();

// Validation schemas
const createDriveSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  companyName: z.string().min(2).max(100),
  companyLogo: z.string().url().optional(),
  registrationStart: z.string().datetime(),
  registrationEnd: z.string().datetime(),
  driveStart: z.string().datetime(),
  driveEnd: z.string().datetime(),
  eligibleDepartments: z.array(z.string()).default([]),
  minCGPA: z.number().min(0).max(10).optional(),
  graduationYears: z.array(z.number()).default([]),
});

const updateDriveSchema = createDriveSchema.partial().extend({
  status: z
    .enum([
      "DRAFT",
      "REGISTRATION_OPEN",
      "REGISTRATION_CLOSED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ])
    .optional(),
});

/**
 * List drives for current college
 */
driveRoutes.get(
  "/",
  authMiddleware,
  requireCollegeMembership,
  async (c) => {
    const collegeId = getCollegeId(c);
    const { status, search } = c.req.query();

    const drives = await prisma.drive.findMany({
      where: {
        collegeId,
        ...(status && { status: status as any }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { companyName: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      select: {
        id: true,
        title: true,
        companyName: true,
        companyLogo: true,
        registrationStart: true,
        registrationEnd: true,
        driveStart: true,
        driveEnd: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            registrations: true,
            tests: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return c.json({ success: true, data: drives });
  }
);

/**
 * Get drive by ID
 */
driveRoutes.get(
  "/:id",
  authMiddleware,
  requireCollegeMembership,
  async (c) => {
    const { id } = c.req.param();
    const collegeId = getCollegeId(c);

    const drive = await prisma.drive.findFirst({
      where: { id, collegeId },
      include: {
        tests: {
          orderBy: { order: "asc" },
          include: {
            test: {
              select: {
                id: true,
                title: true,
                duration: true,
                totalMarks: true,
                status: true,
              },
            },
          },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!drive) {
      return c.json(
        { success: false, error: { code: "NOT_FOUND" } },
        404
      );
    }

    return c.json({ success: true, data: drive });
  }
);

/**
 * Create drive
 */
driveRoutes.post(
  "/",
  authMiddleware,
  requireCollegeMembership,
  requirePermission("drive", "create"),
  async (c) => {
    const body = await c.req.json();
    const validation = createDriveSchema.safeParse(body);

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

    const collegeId = getCollegeId(c);
    const data = validation.data;

    const drive = await prisma.drive.create({
      data: {
        ...data,
        registrationStart: new Date(data.registrationStart),
        registrationEnd: new Date(data.registrationEnd),
        driveStart: new Date(data.driveStart),
        driveEnd: new Date(data.driveEnd),
        collegeId: collegeId!,
      },
    });

    return c.json({ success: true, data: drive }, 201);
  }
);

/**
 * Update drive
 */
driveRoutes.put(
  "/:id",
  authMiddleware,
  requireCollegeMembership,
  requirePermission("drive", "update"),
  async (c) => {
    const { id } = c.req.param();
    const collegeId = getCollegeId(c);

    const body = await c.req.json();
    const validation = updateDriveSchema.safeParse(body);

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

    const existing = await prisma.drive.findFirst({
      where: { id, collegeId },
    });

    if (!existing) {
      return c.json(
        { success: false, error: { code: "NOT_FOUND" } },
        404
      );
    }

    const data = validation.data;

    const drive = await prisma.drive.update({
      where: { id },
      data: {
        ...data,
        ...(data.registrationStart && {
          registrationStart: new Date(data.registrationStart),
        }),
        ...(data.registrationEnd && {
          registrationEnd: new Date(data.registrationEnd),
        }),
        ...(data.driveStart && { driveStart: new Date(data.driveStart) }),
        ...(data.driveEnd && { driveEnd: new Date(data.driveEnd) }),
      },
    });

    return c.json({ success: true, data: drive });
  }
);

/**
 * Add test to drive
 */
driveRoutes.post(
  "/:id/tests",
  authMiddleware,
  requireCollegeMembership,
  requirePermission("drive", "update"),
  async (c) => {
    const { id } = c.req.param();
    const collegeId = getCollegeId(c);
    const body = await c.req.json();

    const { testId, order, isMandatory } = body;

    const [drive, test] = await Promise.all([
      prisma.drive.findFirst({ where: { id, collegeId } }),
      prisma.test.findFirst({ where: { id: testId, collegeId } }),
    ]);

    if (!drive || !test) {
      return c.json(
        { success: false, error: { code: "NOT_FOUND" } },
        404
      );
    }

    const driveTest = await prisma.driveTest.create({
      data: {
        driveId: id,
        testId,
        order: order ?? 0,
        isMandatory: isMandatory ?? true,
      },
      include: { test: true },
    });

    return c.json({ success: true, data: driveTest }, 201);
  }
);

/**
 * Register for drive (student)
 */
driveRoutes.post(
  "/:id/register",
  authMiddleware,
  requireCollegeMembership,
  async (c) => {
    const { id } = c.req.param();
    const session = getSession(c);
    const collegeId = getCollegeId(c);

    const drive = await prisma.drive.findFirst({
      where: {
        id,
        collegeId,
        status: "REGISTRATION_OPEN",
        registrationStart: { lte: new Date() },
        registrationEnd: { gte: new Date() },
      },
    });

    if (!drive) {
      return c.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Drive not found or registration closed" },
        },
        404
      );
    }

    // Check if already registered
    const existing = await prisma.driveRegistration.findUnique({
      where: {
        driveId_userId: {
          driveId: id,
          userId: session!.user.id,
        },
      },
    });

    if (existing) {
      return c.json(
        {
          success: false,
          error: { code: "ALREADY_EXISTS", message: "Already registered for this drive" },
        },
        409
      );
    }

    const body = await c.req.json();

    const registration = await prisma.driveRegistration.create({
      data: {
        driveId: id,
        userId: session!.user.id,
        cgpa: body.cgpa,
        resumeUrl: body.resumeUrl,
      },
    });

    return c.json({ success: true, data: registration }, 201);
  }
);

/**
 * Get candidates for drive (admin/recruiter)
 */
driveRoutes.get(
  "/:id/candidates",
  authMiddleware,
  requireCollegeMembership,
  requirePermission("drive", "read"),
  async (c) => {
    const { id } = c.req.param();
    const collegeId = getCollegeId(c);

    const drive = await prisma.drive.findFirst({
      where: { id, collegeId },
    });

    if (!drive) {
      return c.json(
        { success: false, error: { code: "NOT_FOUND" } },
        404
      );
    }

    const candidates = await prisma.driveRegistration.findMany({
      where: { driveId: id },
      include: {
        drive: {
          include: {
            tests: {
              include: { test: true },
            },
          },
        },
      },
    });

    // Get user details and test results for each candidate
    const candidatesWithDetails = await Promise.all(
      candidates.map(async (reg) => {
        const user = await prisma.user.findUnique({
          where: { id: reg.userId },
          select: {
            id: true,
            name: true,
            email: true,
            rollNumber: true,
            department: true,
            graduationYear: true,
          },
        });

        const testResults = await prisma.testAttempt.findMany({
          where: {
            userId: reg.userId,
            testId: { in: reg.drive.tests.map((t) => t.testId) },
          },
          select: {
            testId: true,
            status: true,
            totalScore: true,
            percentage: true,
            passed: true,
            test: {
              select: { title: true },
            },
          },
        });

        return {
          id: reg.id,
          status: reg.status,
          cgpa: reg.cgpa,
          resumeUrl: reg.resumeUrl,
          createdAt: reg.createdAt,
          user,
          testResults: testResults.map((tr) => ({
            testId: tr.testId,
            testTitle: tr.test.title,
            status: tr.status,
            score: tr.totalScore,
            percentage: tr.percentage,
            passed: tr.passed,
          })),
        };
      })
    );

    return c.json({ success: true, data: candidatesWithDetails });
  }
);

/**
 * Update candidate status
 */
driveRoutes.put(
  "/:id/candidates/:candidateId",
  authMiddleware,
  requireCollegeMembership,
  requirePermission("drive", "manage_registrations"),
  async (c) => {
    const { id, candidateId } = c.req.param();
    const collegeId = getCollegeId(c);
    const body = await c.req.json();

    const drive = await prisma.drive.findFirst({
      where: { id, collegeId },
    });

    if (!drive) {
      return c.json(
        { success: false, error: { code: "NOT_FOUND" } },
        404
      );
    }

    const registration = await prisma.driveRegistration.update({
      where: { id: candidateId },
      data: { status: body.status },
    });

    return c.json({ success: true, data: registration });
  }
);

/**
 * Delete drive
 */
driveRoutes.delete(
  "/:id",
  authMiddleware,
  requireCollegeMembership,
  requirePermission("drive", "delete"),
  async (c) => {
    const { id } = c.req.param();
    const collegeId = getCollegeId(c);

    const drive = await prisma.drive.findFirst({
      where: { id, collegeId },
    });

    if (!drive) {
      return c.json(
        { success: false, error: { code: "NOT_FOUND" } },
        404
      );
    }

    await prisma.drive.delete({ where: { id } });

    return c.json({ success: true, data: { deleted: true } });
  }
);
