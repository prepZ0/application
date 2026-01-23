import { z } from "zod";

/**
 * Common validation schemas
 */

export const emailSchema = z.string().email("Invalid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const slugSchema = z
  .string()
  .min(3, "Slug must be at least 3 characters")
  .max(50, "Slug must be at most 50 characters")
  .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens");

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
  .optional();

export const urlSchema = z.string().url("Invalid URL").optional();

export const cgpaSchema = z
  .number()
  .min(0, "CGPA cannot be negative")
  .max(10, "CGPA cannot exceed 10")
  .optional();

export const yearSchema = z
  .number()
  .int()
  .min(2000)
  .max(2100);

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * ID schema (CUID format)
 */
export const idSchema = z.string().cuid();

/**
 * Common validation functions
 */
export function isValidEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

export function isValidPassword(password: string): boolean {
  return passwordSchema.safeParse(password).success;
}

export function isValidSlug(slug: string): boolean {
  return slugSchema.safeParse(slug).success;
}

/**
 * Generate a URL-safe slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
