import { Context, Next } from "hono";
import { getSession } from "./auth.middleware";
import { canPerform, isHigherRole } from "@placementhub/auth";

type Resource = "test" | "question" | "drive" | "results" | "settings" | "members";
type Action = string;

/**
 * Role-based access control middleware factory
 *
 * Creates middleware that checks if user has permission to perform action on resource
 */
export function requirePermission(resource: Resource, action: Action) {
  return async (c: Context, next: Next) => {
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

    const userRole = (session.session as any).activeOrganizationRole;

    if (!userRole) {
      return c.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You are not a member of any college",
          },
        },
        403
      );
    }

    // Check permission
    if (!canPerform(userRole, resource, action)) {
      return c.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: `You don't have permission to ${action} ${resource}`,
          },
        },
        403
      );
    }

    await next();
  };
}

/**
 * Require specific roles middleware
 */
export function requireRole(...allowedRoles: string[]) {
  return async (c: Context, next: Next) => {
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

    const userRole = (session.session as any).activeOrganizationRole;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return c.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: `This action requires one of these roles: ${allowedRoles.join(", ")}`,
          },
        },
        403
      );
    }

    await next();
  };
}

/**
 * Require college membership middleware
 *
 * Ensures user belongs to a college
 */
export async function requireCollegeMembership(c: Context, next: Next) {
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

  const collegeId = (session.session as any).activeOrganizationId;

  if (!collegeId) {
    return c.json(
      {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You must be a member of a college to perform this action",
        },
      },
      403
    );
  }

  // Attach collegeId to context for easy access
  c.set("collegeId", collegeId);

  await next();
}

/**
 * Get college ID from context
 */
export function getCollegeId(c: Context): string | undefined {
  return c.get("collegeId") as string | undefined;
}

/**
 * Ensure user can only access their own college's data
 */
export function requireSameCollege(requestCollegeId: string) {
  return async (c: Context, next: Next) => {
    const session = getSession(c);
    const userCollegeId = (session?.session as any)?.activeOrganizationId;

    if (userCollegeId !== requestCollegeId) {
      return c.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You can only access data from your own college",
          },
        },
        403
      );
    }

    await next();
  };
}
