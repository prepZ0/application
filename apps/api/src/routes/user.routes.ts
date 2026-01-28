import { Hono } from "hono";
import { authMiddleware, getUser } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";

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

export { userRoutes };
