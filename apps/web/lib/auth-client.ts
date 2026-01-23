import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

/**
 * Better Auth client for the frontend
 *
 * Provides hooks and utilities for authentication:
 * - useSession() - Get current session
 * - signIn() - Sign in with email/password
 * - signUp() - Register new user
 * - signOut() - Sign out
 * - organization - Organization/college management
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  plugins: [organizationClient()],
});

// Destructure for easier imports
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  organization,
} = authClient;

// Types
export type Session = typeof authClient.$Infer.Session;
export type User = Session["user"];

// Extended session type with college info
export interface ExtendedUser extends User {
  activeCollegeId?: string;
  activeCollegeName?: string;
  activeCollegeSlug?: string;
  collegeRole?: string;
}

export interface ExtendedSession extends Session {
  user: ExtendedUser;
}
