import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware, getSession } from "../middleware/auth.middleware";
import { requireRole, requireCollegeMembership, getCollegeId } from "../middleware/rbac.middleware";
import { prisma } from "../lib/prisma";
import { generateSlug } from "@placementhub/utils";

export const collegeRoutes = new Hono();

// Validation schemas
const createCollegeSchema = z.object({
  name: z.string().min(3).max(100),
  slug: z.string().min(3).max(50).optional(),
  logo: z.string().url().optional(),
  address: z.string().optional(),
  website: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
});

const updateCollegeSchema = createCollegeSchema.partial();

/**
 * List all colleges (for super admin)
 */
collegeRoutes.get("/", authMiddleware, async (c) => {
  const session = getSession(c);
  const userRole = (session?.session as any)?.activeOrganizationRole;

  // For non-super-admins, only show their college
  if (userRole !== "super_admin") {
    const collegeId = (session?.session as any)?.activeOrganizationId;
    if (!collegeId) {
      return c.json({ success: true, data: [] });
    }

    const college = await prisma.organization.findUnique({
      where: { id: collegeId },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        address: true,
        website: true,
        contactEmail: true,
        isActive: true,
        createdAt: true,
      },
    });

    return c.json({ success: true, data: college ? [college] : [] });
  }

  // Super admin can see all colleges
  const colleges = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      address: true,
      website: true,
      contactEmail: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          members: true,
          tests: true,
          drives: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return c.json({ success: true, data: colleges });
});

/**
 * Get college by ID
 */
collegeRoutes.get("/:id", authMiddleware, async (c) => {
  const { id } = c.req.param();

  const college = await prisma.organization.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      address: true,
      website: true,
      contactEmail: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          members: true,
          tests: true,
          drives: true,
        },
      },
    },
  });

  if (!college) {
    return c.json(
      { success: false, error: { code: "NOT_FOUND", message: "College not found" } },
      404
    );
  }

  return c.json({ success: true, data: college });
});

/**
 * Create college (super admin only - for now manual)
 * In production, this would be restricted to super admins
 */
collegeRoutes.post("/", authMiddleware, async (c) => {
  const body = await c.req.json();
  const validation = createCollegeSchema.safeParse(body);

  if (!validation.success) {
    return c.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          details: validation.error.flatten().fieldErrors,
        },
      },
      400
    );
  }

  const { name, logo, address, website, contactEmail } = validation.data;
  const slug = validation.data.slug || generateSlug(name);

  // Check if slug already exists
  const existing = await prisma.organization.findUnique({
    where: { slug },
  });

  if (existing) {
    return c.json(
      {
        success: false,
        error: { code: "ALREADY_EXISTS", message: "A college with this slug already exists" },
      },
      409
    );
  }

  const session = getSession(c);

  const college = await prisma.organization.create({
    data: {
      name,
      slug,
      logo,
      address,
      website,
      contactEmail,
      // Add creator as owner
      members: {
        create: {
          userId: session!.user.id,
          role: "owner",
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      address: true,
      website: true,
      contactEmail: true,
      isActive: true,
      createdAt: true,
    },
  });

  return c.json({ success: true, data: college }, 201);
});

/**
 * Update college
 */
collegeRoutes.put(
  "/:id",
  authMiddleware,
  requireCollegeMembership,
  requireRole("owner", "admin"),
  async (c) => {
    const { id } = c.req.param();
    const collegeId = getCollegeId(c);

    // Ensure user can only update their own college
    if (id !== collegeId) {
      return c.json(
        { success: false, error: { code: "FORBIDDEN", message: "Cannot update other colleges" } },
        403
      );
    }

    const body = await c.req.json();
    const validation = updateCollegeSchema.safeParse(body);

    if (!validation.success) {
      return c.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: validation.error.flatten().fieldErrors,
          },
        },
        400
      );
    }

    const college = await prisma.organization.update({
      where: { id },
      data: validation.data,
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        address: true,
        website: true,
        contactEmail: true,
        isActive: true,
      },
    });

    return c.json({ success: true, data: college });
  }
);

/**
 * List college members
 */
collegeRoutes.get(
  "/:id/members",
  authMiddleware,
  requireCollegeMembership,
  async (c) => {
    const { id } = c.req.param();
    const collegeId = getCollegeId(c);

    if (id !== collegeId) {
      return c.json(
        { success: false, error: { code: "FORBIDDEN" } },
        403
      );
    }

    const members = await prisma.member.findMany({
      where: { organizationId: id },
      select: {
        id: true,
        role: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            rollNumber: true,
            department: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return c.json({ success: true, data: members });
  }
);
