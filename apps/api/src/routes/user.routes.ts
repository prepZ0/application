import { Hono } from "hono";
import { authMiddleware, getUser, getSession } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";
import { resolveAndPersistOrgContext } from "../lib/session-org";

const userRoutes = new Hono();

// All routes require authentication
userRoutes.use("*", authMiddleware);

// GET /api/me - Get current user profile
userRoutes.get("/", async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
      401
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      phone: true,
      rollNumber: true,
      department: true,
      graduationYear: true,
      createdAt: true,
    },
  });

  if (!dbUser) {
    return c.json(
      { success: false, error: { code: "NOT_FOUND", message: "User not found" } },
      404
    );
  }

  return c.json({ success: true, data: dbUser });
});

// PUT /api/me - Update current user profile
userRoutes.put("/", async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
      401
    );
  }

  const body = await c.req.json();
  const { name, phone, rollNumber, department, graduationYear } = body;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(rollNumber !== undefined && { rollNumber }),
      ...(department !== undefined && { department }),
      ...(graduationYear !== undefined && { graduationYear }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      phone: true,
      rollNumber: true,
      department: true,
      graduationYear: true,
      createdAt: true,
    },
  });

  return c.json({ success: true, data: updated });
});

// POST /api/me/activate-org - Set active organization and persist context on session
userRoutes.post("/activate-org", async (c) => {
  const session = getSession(c);
  if (!session) {
    return c.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
      401
    );
  }

  const { organizationId } = await c.req.json();
  if (!organizationId || typeof organizationId !== "string") {
    return c.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "organizationId is required" } },
      400
    );
  }

  const context = await resolveAndPersistOrgContext(
    session.session.token,
    session.user.id,
    organizationId
  );

  if (!context) {
    return c.json(
      { success: false, error: { code: "FORBIDDEN", message: "You are not a member of this organization" } },
      403
    );
  }

  return c.json({ success: true, data: context });
});

// POST /api/me/refresh-org - Re-resolve org context from session's current activeOrganizationId
userRoutes.post("/refresh-org", async (c) => {
  const session = getSession(c);
  if (!session) {
    return c.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
      401
    );
  }

  const orgId = (session.session as any).activeOrganizationId;
  if (!orgId) {
    return c.json(
      { success: false, error: { code: "NOT_FOUND", message: "No active organization on this session" } },
      404
    );
  }

  const context = await resolveAndPersistOrgContext(
    session.session.token,
    session.user.id,
    orgId
  );

  if (!context) {
    return c.json(
      { success: false, error: { code: "FORBIDDEN", message: "Membership no longer exists" } },
      403
    );
  }

  return c.json({ success: true, data: context });
});

export { userRoutes };
