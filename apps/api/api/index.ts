import { handle } from "hono/vercel";
import { app } from "../src/index";

// Vercel serverless function handlers
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
export const OPTIONS = handle(app);
