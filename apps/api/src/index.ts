import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { auth } from "./lib/auth";
import { authRoutes } from "./routes/auth.routes";
import { collegeRoutes } from "./routes/college.routes";
import { testRoutes } from "./routes/test.routes";
import { questionRoutes } from "./routes/question.routes";
import { driveRoutes } from "./routes/drive.routes";
import { executionRoutes } from "./routes/execution.routes";
import { submissionRoutes } from "./routes/submission.routes";

// Create Hono app
const app = new Hono();

// Global middleware
app.use("*", logger());
app.use("*", secureHeaders());
app.use(
  "*",
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Health check endpoint
app.get("/", (c) => {
  return c.json({
    name: "PlacementHub API",
    version: "0.0.1",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// Better Auth handler - handles all /api/auth/* routes
app.on(["GET", "POST"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// API routes
app.route("/api/colleges", collegeRoutes);
app.route("/api/tests", testRoutes);
app.route("/api/questions", questionRoutes);
app.route("/api/drives", driveRoutes);
app.route("/api/execute", executionRoutes);
app.route("/api/submissions", submissionRoutes);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: `Route ${c.req.path} not found`,
      },
    },
    404
  );
});

// Global error handler
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message:
          process.env.NODE_ENV === "development"
            ? err.message
            : "An unexpected error occurred",
      },
    },
    500
  );
});

// Export for local development
export { app };

// Default export for Bun
export default {
  port: process.env.PORT || 3001,
  fetch: app.fetch,
};
