import { Context, Next } from "hono";
import { auth } from "../lib/auth";

/**
 * Authentication middleware
 *
 * Validates the session and attaches user info to context
 */
export async function authMiddleware(c: Context, next: Next) {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

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

    // Attach session to context
    c.set("session", session);
    c.set("user", session.user);

    await next();
  } catch (error) {
    console.error("[Auth Middleware] Error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid or expired session",
        },
      },
      401
    );
  }
}

/**
 * Optional auth middleware
 *
 * Validates session if present, but allows unauthenticated requests
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (session) {
      c.set("session", session);
      c.set("user", session.user);
    }

    await next();
  } catch (error) {
    // Ignore auth errors for optional auth
    await next();
  }
}

/**
 * Get session from context (type-safe helper)
 */
export function getSession(c: Context) {
  return c.get("session") as typeof auth.$Infer.Session | undefined;
}

/**
 * Get user from context (type-safe helper)
 */
export function getUser(c: Context) {
  return c.get("user") as typeof auth.$Infer.Session["user"] | undefined;
}
